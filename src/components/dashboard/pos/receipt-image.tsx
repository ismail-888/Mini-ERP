"use client";

import { useCallback } from "react";
import html2canvas from "html2canvas";

interface ReceiptImageProps {
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

export function useReceiptImage() {
  const generateReceiptImage = useCallback(async (data: ReceiptImageProps) => {
    const {
      invoiceNumber,
      timestamp,
      items,
      totalUSD,
      totalLBP,
      changeUSD,
      formatUSD,
      formatLBP,
      rate,
    } = data;

    // 1. Create a temporary iframe for isolation
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.width = "420px"; // Slightly larger to accommodate padding
    iframe.style.height = "1000px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    // Wait for iframe to load
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      throw new Error("Iframe document not accessible");
    }

    // 2. Build the HTML content inside the iframe
    // Note: We use inline styles exclusively to avoid any CSS bleed from the parent window
    doc.open();
    doc.write(`
      <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background-color: #ffffff;
            width: 380px; /* Target width for the receipt */
          }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div id="receipt-container" style="
          background-color: #ffffff;
          color: #000000;
          padding: 20px;
          border-radius: 10px;
          line-height: 1.5;
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 40px; margin-bottom: 10px;">🛍️</div>
            <h2 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase;">Luxury Boutique</h2>
            <p style="margin: 5px 0 0; color: #666666; font-size: 12px; letter-spacing: 1px;">OFFICIAL RECEIPT</p>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; color: #444444;">
            <span>Invoice</span>
            <span style="font-weight: bold; color: #000000;">#${invoiceNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; color: #444444;">
            <span>Date</span>
            <span>${timestamp}</span>
          </div>

          <div style="border-top: 2px dashed #eeeeee; margin-bottom: 15px;"></div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="color: #888888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="text-align: left; padding-bottom: 8px;">Item</th>
                <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px;">Price</th>
              </tr>
            </thead>
            <tbody style="font-size: 14px;">
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #f5f5f5;">
                  <td style="padding: 8px 0; font-weight: 500;">
                    ${item.name}
                  </td>
                  <td style="padding: 8px 0; text-align: center; color: #666666;">${item.quantity}</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatUSD(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="border-top: 2px solid #000000; margin-bottom: 15px;"></div>

          <div style="margin-bottom: 5px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 600;">
            <span>Total Amount</span>
            <span>${formatUSD(totalUSD)}</span>
          </div>
          
          <div style="margin-bottom: 15px; display: flex; justify-content: space-between; font-size: 14px; color: #2563eb; font-weight: 500;">
            <span>In LBP</span>
            <span>${formatLBP(totalUSD * rate)}</span>
          </div>

          ${changeUSD > 0 ? `
            <div style="background: #f0fdf4; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; color: #166534; font-size: 14px; font-weight: 600;">
              <span>Change Due</span>
              <span>${formatUSD(changeUSD)}</span>
            </div>
          ` : ''}

          <div style="margin-top: 30px; text-align: center; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
            *** Thank You ***
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    try {
      // 3. Generate the Blob (Image data)
      const element = doc.getElementById("receipt-container");
      if (!element) throw new Error("Receipt element not found");

      const canvas = await html2canvas(element as any, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      } as any);

      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) throw new Error("Failed to create image blob");

      const fileName = `Invoice-${data.invoiceNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // 2. CHECK: Is this a mobile device with Share capabilities?
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Invoice #${data.invoiceNumber}`,
            text: `Receipt from mousaheb for invoice #${data.invoiceNumber}`,
            files: [file],
          });
          return true; // Use the native mobile drawer
        } catch (_err) {
          // User cancelled share or feature failed, fallback to download
          console.log("Share cancelled or failed, falling back to download");
        }
      }

      // 3. FALLBACK: Standard Desktop Download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;

    } catch (error) {
      console.error("Image generation failed:", error);
      throw error;
    } finally {
      // 5. Cleanup
      document.body.removeChild(iframe);
    }
  }, []);

  return { generateReceiptImage };
}
