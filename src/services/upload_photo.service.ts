import { PhotoType } from "@/types/photo.type";
import { supabase } from "@/lib/supabase";

// function path(
//   category: PhotoCategory,
//   type: PhotoType,
//   refId: string,
//   fileName: string,
// ) {
//   return `${category}/${refId}/${type}/${fileName}`;
// }

type UploadPhoto = {
  url: string;
  key: string;
  fileName: string;
  originalName: string;
  size: number;
};

const bucketName = process.env.BUCKET_NAME!;

class UploadServiceSupabase {
  async upload(
    file: File,
    refId: string,
    type: PhotoType,
  ): Promise<UploadPhoto> {
    const folder = `${refId}/${type}`;

    // sanitize file name
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const fileName = `${Date.now()}-${safeFileName}`;
    const filePath = `${folder}/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. check error
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        // upsert: false,
      });
    if (error) throw new Error(error.message);

    // 2. Succes ? -> generate url
    const { data } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // return Response.json({ url: data.publicUrl });

    return {
      url: data.publicUrl,
      key: filePath,
      fileName,
      originalName: file.name,
      size: file.size,
    };
  }

  async uploadMany(files: File[], refId: string) {
    const keys = await Promise.all(
      files.map((item) => this.upload(item, refId, PhotoType.GALLERY)),
    );

    return keys;
  }

  async deleteByType(type: PhotoType, refId: string, files: string[]) {
    const url = `${refId}/${type}`;
    const path = await Promise.all(files.map((item) => `${url}/${item}`));

    console.log("path : ", path);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(path);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // cocok untuk di Update Product API
  async deleteItemsInGallery(keys: string[]) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(keys);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // cocok untuk Delete Product
  async deleteByRefId(refId: string) {
    const types = [PhotoType.COVER, PhotoType.GALLERY];

    const allPaths: string[] = [];

    for (const type of types) {
      const folder = `${refId}/${type}`;

      const { data: files, error: ListError } = await supabase.storage
        .from(bucketName)
        .list(folder);
      // Output files : "[{name: img1.png, id : ...}, {name: img2.png, id : ...}]"

      if (ListError) {
        throw new Error(ListError.message);
      }

      const paths = files.map((item) => `${folder}/${item.name}`);
      //  Output Paths: `
      //  [Product123/COVER/img1.png, Product123/GALLERY/img2.png, Product123/GALLERY/img2.png]
      //   `

      allPaths.push(...paths);
    }

    if (allPaths.length === 0) {
      return [];
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(allPaths);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const uploadServiceSB = new UploadServiceSupabase();
