import type { z } from "zod";
import type {
  productSchema,
  updateProductSchema,
  stockSchema,
  updateStockSchema,
} from "@/validations/product.schema";
import type { Location } from "./warehouse.type";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  kode_sku: string;
  barcode_product: string | null;
  coverUrl: string | null;
  galleryUrl: string[];
  location_id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Stock = {
  stock_id: string;
  name: string;
  product_id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductWithRelations = Product & {
  location: Location;
  stock: Stock[];
};

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type StockInput = z.infer<typeof stockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
