"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { type ActionResponse, type Product } from "~/lib/types"; // Import your types

export async function getInventoryAction(): Promise<ActionResponse<Product[]>> {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const products = await db.product.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return { success: false, error: "Failed to load inventory" };
  }
}