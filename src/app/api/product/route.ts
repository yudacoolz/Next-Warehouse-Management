import { prisma } from "@/lib/prisma";
import { productSchema } from "@/validations/product.schema";
import { NextRequest, NextResponse } from "next/server";
import { uploadServiceSB } from "@/services/upload_photo.service";
import { PhotoType } from "@/types/photo.type";
import { ZodError } from "zod";
import { createMeta } from "@/utils/pagination.utils";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("page")) || 10;
  const skip = (page - 1) * limit;

  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
    });
    const meta = createMeta(page, limit, products.length);
    return NextResponse.json({ data: products, meta: meta });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  let productId: string | null = null;

  try {
    // ==========================================
    // 1. Get FormData
    // ==========================================

    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const kodeSku = formData.get("kode_sku");
    const barcodeProduct = formData.get("barcode_product");

    const cover = formData.get("coverUrl");
    const gallery = formData.getAll("galleryUrl");

    // ==========================================
    // 2. Validate
    // ==========================================

    const validateData = productSchema.parse({
      name,
      description,
      kode_sku: kodeSku,
      barcode_product: barcodeProduct,
      coverUrl: cover,
      galleryUrl: gallery,
    });

    // ==========================================
    // 3. Create Product
    // ==========================================

    const product = await prisma.product.create({
      data: {
        name: validateData.name,
        description: validateData.description,
        kode_sku: validateData.kode_sku,
        barcode_product: validateData.barcode_product,
      },
    });

    // Simpan ID supaya bisa digunakan di catch
    productId = product.id;

    // ==========================================
    // 4. Upload Cover
    // ==========================================

    if (cover && validateData.coverUrl) {
      // Upload file ke Supabase
      const coverKey = await uploadServiceSB.upload(
        validateData.coverUrl,
        product.id,
        PhotoType.COVER,
      );

      // Simpan URL ke Product
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          coverUrl: coverKey.url,
        },
      });

      // Simpan metadata photo
      await prisma.photo.create({
        data: {
          url: coverKey.url,
          key: coverKey.key,
          refId: product.id,
          fileName: coverKey.fileName,
          originalName: coverKey.originalName,
          size: coverKey.size,
          type: PhotoType.COVER,
        },
      });
    }

    // ==========================================
    // 5. Upload Gallery
    // ==========================================

    if (gallery.length > 0) {
      // Upload semua gallery ke Supabase
      const galleryKey = await uploadServiceSB.uploadMany(
        validateData.galleryUrl,
        product.id,
      );

      // Simpan gallery URL ke Product
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          galleryUrl: galleryKey.map((item) => item.url),
        },
      });

      // Simpan metadata gallery ke Photo
      await prisma.photo.createMany({
        data: galleryKey.map((item) => ({
          url: item.url,
          key: item.key,
          refId: product.id,
          fileName: item.fileName,
          originalName: item.originalName,
          size: item.size,
          type: PhotoType.GALLERY,
        })),
      });
    }

    // ==========================================
    // 6. SUCCESS
    // ==========================================

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (error) {
    // ==========================================
    // ERROR LOG
    // ==========================================

    console.error("Error creating product:", error);

    // ==========================================
    // 7. Zod Validation Error
    // ==========================================

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Invalid product data",
          errors: error.issues,
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // 8. CLEANUP
    // ==========================================

    if (productId) {
      try {
        // --------------------------------------
        // A. Delete files from Supabase
        // --------------------------------------

        await uploadServiceSB.deleteByRefId(productId);

        // --------------------------------------
        // B. Delete Photo records
        // --------------------------------------

        await prisma.photo.deleteMany({
          where: {
            refId: productId,
          },
        });

        // --------------------------------------
        // C. Delete Product
        // --------------------------------------

        await prisma.product.delete({
          where: {
            id: productId,
          },
        });
      } catch (cleanupError) {
        console.error(
          "Cleanup failed after product creation error:",
          cleanupError,
        );
      }
    }

    // ==========================================
    // 9. Return Error
    // ==========================================

    return NextResponse.json(
      {
        message: "Failed to create product",
      },
      {
        status: 500,
      },
    );
  }
}
