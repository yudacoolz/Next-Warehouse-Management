import { z } from "zod";

/* ---------- Product ---------- */
export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  kode_sku: z.string().trim().min(1, "SKU is required").max(100),
  barcode_product: z.string().trim().max(100).nullable().optional(),
  coverUrl: z
    .instanceof(File, {
      message: "please add cover",
    })
    .nullable()
    .optional(),
  galleryUrl: z
    .array(
      z.instanceof(File, {
        message: "please add least 1 image",
      }),
    )
    .default([]),
  location_id: z.string().uuid("Invalid location").nullable().optional(),
});
export const updateProductSchema = productSchema.partial();

/* ---------- Stock ---------- */
export const stockSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  product_id: z.string().uuid("Invalid product"),
});
export const updateStockSchema = stockSchema.partial();
