import { z } from "zod";
import { DIVISIONS, SIZES } from "@/lib/constants";

/** Bangladesh phone: 01XXXXXXXXX (11 digits). */
export const phoneSchema = z
  .string()
  .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladesh number (01XXXXXXXXX)");

const divisionNames = Object.keys(DIVISIONS) as [string, ...string[]];

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  phone: phoneSchema,
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  division: z.enum(divisionNames, { message: "Select a division" }),
  district: z.string().min(1, "Select a district"),
  address: z.string().min(10, "Address must be at least 10 characters").max(300),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const createOrderSchema = z
  .object({
    customer: customerSchema,
    items: z.array(orderItemSchema).min(1, "Cart is empty").max(20),
    paymentMethod: z.enum(["BKASH", "COD"]),
    bkashTxnId: z.string().optional(),
    couponCode: z.string().max(40).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (d) => d.paymentMethod !== "BKASH" || (d.bkashTxnId?.trim().length ?? 0) >= 4,
    { message: "bKash transaction ID is required", path: ["bkashTxnId"] },
  );

export const variantInputSchema = z.object({
  size: z.enum(SIZES as [string, ...string[]]),
  stock: z.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  nameBn: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  descriptionBn: z.string().max(2000).optional().or(z.literal("")),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullish(),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).max(6).default([]),
  variants: z.array(variantInputSchema).min(1, "Add at least one size"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(2).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().min(0),
  minSubtotal: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).nullish(),
  usageLimit: z.number().int().min(1).nullish(),
  active: z.boolean().default(true),
  expiresAt: z.string().datetime().nullish(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().max(300).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
