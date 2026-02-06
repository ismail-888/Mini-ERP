
export function getActivePrice(product: Product) {
    const now = new Date();
    
    // فحص إذا كان هناك خصم فعال حالياً
    const isDiscountActive = 
      product.discountValue > 0 &&
      product.discountStartDate && 
      product.discountEndDate &&
      now >= product.discountStartDate && 
      now <= product.discountEndDate;
  
    if (!isDiscountActive) return product.salePriceUSD;
  
    if (product.discountType === "percentage") {
      return product.salePriceUSD - (product.salePriceUSD * (product.discountValue / 100));
    }
    
    return product.salePriceUSD - product.discountValue;
  }