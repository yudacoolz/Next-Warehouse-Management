import type { z } from "zod";
import type {
  warehouseSchema,
  updateWarehouseSchema,
  zoneSchema,
  updateZoneSchema,
  locationSchema,
  updateLocationSchema,
} from "@/validations/warehouse.schema";

/* ---------- Entities (match Prisma models) ---------- */
export type Warehouse = {
  warehouse_id: string;
  code: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Zone = {
  zone_id: string;
  code: string;
  name: string;
  warehouse_id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Location = {
  location_id: string;
  code: string;
  barcode_location: string;
  name: string;
  address: string;
  warehouse_id: string;
  zone_id: string;
  createdAt: Date;
  updatedAt: Date;
};

/* ---------- With relations ---------- */
export type WarehouseWithRelations = Warehouse & {
  zone: Zone[];
  location: Location[];
};
export type ZoneWithRelations = Zone & {
  warehouse: Warehouse;
  location: Location[];
};
export type LocationWithRelations = Location & {
  warehouse: Warehouse;
  zone: Zone;
};

/* ---------- Form / API input (inferred from Zod) ---------- */
export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;

export type ZoneInput = z.infer<typeof zoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;

export type LocationInput = z.infer<typeof locationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
