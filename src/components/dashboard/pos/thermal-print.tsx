"use client";

import { useCallback } from "react";
import { toast } from "sonner";

interface ThermalReceiptProps {
  invoiceNumber: string;
  timestamp: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalUSD: number;
  totalLBP: number;
  changeUSD: number;
  formatUSD: (val: number) => string;
  formatLBP: (val: number) => string;
  rate: number;
}

export function useThermalPrinter() {
  const printReceipt = useCallback((data: ThermalReceiptProps) => {
    const {
      invoiceNumber,
    //   timestamp,
      items,
      totalUSD,
    //   totalLBP,
      changeUSD,
      formatUSD,
      formatLBP,
      rate,
    } = data;

    const thermalHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt #${invoiceNumber}</title>
          <style>
              /* 1. Reset everything to ensure exact printing */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact;
              }
              
              /* 2. Setup the physical paper size (80mm width) */
              /* 'auto' height is crucial for thermal rolls so it creates one long strip */
              @page {
                  size: 80mm auto; 
                  margin: 0mm; 
              }

              /* 3. Global settings */
              body {
                  font-family: 'Courier New', Courier, monospace;
                  width: 80mm;
                  margin: 0;
                  padding: 10px; /* Small padding inside the paper */
                  color: black;
                  background: white;
                  font-size: 13px; /* Slightly easier to read */
                  line-height: 1.2;
              }

              /* 4. Hide browser headers/footers (URL, Date, etc) */
              @media print {
                  @page { margin: 0; }
                  body { margin: 10px; }
              }

              .header { text-align: center; margin-bottom: 15px; }
              .logo { font-size: 24px; margin-bottom: 5px; }
              .store-name { font-weight: bold; font-size: 16px; text-transform: uppercase; }
              
              .divider { 
                  border-top: 1px dashed black; 
                  margin: 10px 0; 
              }

              .info-row {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
              }

              /* Table styling for items */
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { text-align: left; border-bottom: 1px solid black; font-size: 12px; padding-bottom: 2px; }
              td { padding-top: 4px; vertical-align: top; }
              
              .col-qty { width: 15%; }
              .col-item { width: 60%; }
              .col-price { width: 25%; text-align: right; }

              /* Totals Section */
              .totals { margin-top: 15px; }
              .total-row { 
                  display: flex; 
                  justify-content: space-between; 
                  font-weight: bold; 
                  font-size: 16px; 
                  margin-top: 5px;
              }
              .sub-row {
                  display: flex; 
                  justify-content: space-between; 
                  font-size: 14px;
              }

              .footer { 
                  text-align: center; 
                  margin-top: 20px; 
                  font-size: 12px; 
                  padding-bottom: 20px; /* Extra space at bottom for tearing */
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="logo">🛍️</div>
              <div class="store-name">MOUSAHEB STORE</div>
              <div style="font-size: 10px; margin-top:4px;">Beirut, Lebanon</div>
              <div style="font-size: 10px;">Tel: +961 03 000 000</div>
          </div>

          <div class="info-row">
              <span>Inv: <b>#${invoiceNumber}</b></span>
              <span>${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="info-row">
             <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>

          <div class="divider"></div>

          <table>
              <thead>
                  <tr>
                      <th class="col-qty">Qt</th>
                      <th class="col-item">Item</th>
                      <th class="col-price">Amt</th>
                  </tr>
              </thead>
              <tbody>
                  ${items.map((item) => `
                      <tr>
                          <td class="col-qty">${item.quantity}</td>
                          <td class="col-item">
                              ${item.name}
                              ${item.quantity > 1 ? `<div style="font-size:10px; color:#333">@${formatUSD(item.price)}</div>` : ''}
                          </td>
                          <td class="col-price">${formatUSD(item.price * item.quantity)}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals">
              <div class="total-row">
                  <span>TOTAL USD</span>
                  <span>${formatUSD(totalUSD)}</span>
              </div>
              <div class="sub-row">
                  <span>In L.L.</span>
                  <span>${formatLBP(totalUSD * rate)}</span>
              </div>
              
              ${changeUSD > 0 ? `
              <div style="margin-top: 10px; border-top: 1px dotted black; padding-top: 5px;"></div>
              <div class="sub-row">
                   <span>Change USD</span>
                   <span>${formatUSD(changeUSD)}</span>
              </div>
              ` : ''}
          </div>

          <div class="footer">
              <p>Thank you for visiting us!</p>
              <p style="font-size:10px; margin-top:5px;">Returns within 3 days with receipt</p>
          </div>
      </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0"; // Invisible
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(thermalHTML);
      doc.close();

      // Slightly longer timeout ensures styles are computed
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print failed", e);
          toast.error("Printing failed");
        } 
        
        // Remove iframe after 2 seconds to allow print dialog to engage
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 500);
    }
  }, []); // dependencies can stay empty if we trust args

  return { printReceipt };
}
