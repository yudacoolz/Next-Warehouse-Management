import { z } from "zod";

/* ---------- Warehouse ---------- */
export const warehouseSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(50),
  name: z.string().trim().min(1, "Name is required").max(150),
  address: z.string().trim().min(1, "Address is required").max(500),
});
export const updateWarehouseSchema = warehouseSchema.partial();

/* ---------- Zone ---------- */
export const zoneSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(50),
  name: z.string().trim().min(1, "Name is required").max(150),
  warehouse_id: z.string().uuid("Invalid warehouse"),
});
export const updateZoneSchema = zoneSchema.partial();

/* ---------- Location ---------- */
export const locationSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(50),
  barcode_location: z.string().trim().min(1, "Barcode is required").max(100),
  name: z.string().trim().min(1, "Name is required").max(150),
  address: z.string().trim().min(1, "Address is required").max(500),
  warehouse_id: z.string().uuid("Invalid warehouse"),
  zone_id: z.string().uuid("Invalid zone"),
});
export const updateLocationSchema = locationSchema.partial();
