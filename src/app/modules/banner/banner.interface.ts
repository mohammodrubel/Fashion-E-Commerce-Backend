export type CreateBannerPayload = {
  collectionLabel?: string;
  heading: string;
  seasonYear?: string;
  discoverText?: string;
  backgroundColor?: string;
  isActive?: boolean | string;
};

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

export type BannerFiles = {
  desktopImage?: Express.Multer.File[];
  mobileImage?: Express.Multer.File[];
};
