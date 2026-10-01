import { z } from "zod";

export const movingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  product_id: z.string().uuid("Invalid product"),
  location_id: z.string().uuid("Invalid location"),
});
export const updateMovingSchema = movingSchema.partial();
