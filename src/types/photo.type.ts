export const PhotoType = {
  COVER: "COVER",
  GALLERY: "GALLERY",
} as const;

export type PhotoType = (typeof PhotoType)[keyof typeof PhotoType];
