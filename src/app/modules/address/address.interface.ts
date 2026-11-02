export type CreateAddressPayload = {
  userId: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type UpdateAddressPayload = Partial<Omit<CreateAddressPayload, 'userId'>>;

export type AddressFilters = {
  searchTerm?: string;
  userId?: string;
};
