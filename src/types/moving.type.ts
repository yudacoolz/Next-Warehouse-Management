import type { z } from "zod";
import type {
  movingSchema,
  updateMovingSchema,
} from "@/validations/moving.schema";
import type { Product } from "./product.type";
import type { Location } from "./warehouse.type";

export type Moving = {
  moving_id: string;
  name: string;
  quantity: number;
  product_id: string;
  location_id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MovingWithRelations = Moving & {
  product: Product;
  location: Location;
};

// z.input = what the form holds (quantity may be a string), z.infer = parsed output
export type MovingFormValues = z.input<typeof movingSchema>;
export type MovingInput = z.infer<typeof movingSchema>;
export type UpdateMovingInput = z.infer<typeof updateMovingSchema>;
