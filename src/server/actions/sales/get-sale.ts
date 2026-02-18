"use server";

import { db } from "~/server/db";
import { auth } from "~/server/auth";

export async function getSaleById(saleId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const sale = await db.sale.findUnique({
    where: { 
      id: saleId,
      userId: session.user.id // Security: Ensure user owns this sale
    },
    include: {
      items: true, // Fetch the items associated with this sale
    },
  });

  return sale;
}
