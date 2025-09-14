import { z } from 'zod';
import { id } from 'zod/locales';

export const leadFormSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10–15 digits'),
  city: z.string().min(1, 'City is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  bhk: z.string().optional().nullable(),
  purpose: z.string().min(1, 'Purpose is required'),
  budgetMin: z.number().int().nonnegative().optional(),
  budgetMax: z.number().int().nonnegative().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
  source: z.string().min(1, 'Source is required'),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) =>
    typeof data.budgetMin !== 'number' ||
    typeof data.budgetMax !== 'number' ||
    data.budgetMax >= data.budgetMin,
  {
    message: 'Budget max cannot be lower than budget min',
    path: ['budgetMax'],
  }
);

export type LeadFormSchemaType = z.infer<typeof leadFormSchema> & {
  id?: string;
  updatedAt?: string;
};

