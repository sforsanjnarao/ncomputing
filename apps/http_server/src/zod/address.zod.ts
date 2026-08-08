import { z } from "zod";

export const AddressSchema = z.object({
  fullName: z.string().min(2, "Please enter a full name."),
  fullAddress: z.string().min(5, "Please enter the address."),
  city: z.string().min(2, "Please enter the city."),
  state: z.string().min(2, "Please enter the state."),
  postalCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits."),
  country: z.string().min(2).default("India"),
});

export type AddressInput = z.infer<typeof AddressSchema>;
