import type { OrderStatus, Size } from "@prisma/client";

export const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
];

export const ORDER_STATUSES: OrderStatus[] = [
  ...ORDER_STATUS_FLOW,
  "CANCELLED",
];

/** Flat delivery fee (BDT). Free above threshold. */
export const DELIVERY_FEE = 60;
export const FREE_DELIVERY_THRESHOLD = 3000;
export const MAX_CART_ITEMS = 20;

export function calcDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

/** Business contact */
export const BKASH_NUMBER = "01712-345678";
export const WHATSAPP_NUMBER = "8801712345678";
export const BUSINESS = {
  name: "NexVive",
  address: "Shop 12, New Market, Dhaka 1205",
  phone: "01712-345678",
  whatsapp: WHATSAPP_NUMBER,
};

export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Bangladesh divisions → districts (abbreviated set, sufficient for MVP). */
export const DIVISIONS: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Manikganj",
    "Munshiganj",
    "Narsingdi",
    "Faridpur",
  ],
  Chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Noakhali",
    "Bandarban",
    "Rangamati",
    "Khagrachhari",
  ],
  Rajshahi: [
    "Rajshahi",
    "Bogura",
    "Pabna",
    "Sirajganj",
    "Natore",
    "Naogaon",
    "Joypurhat",
    "Chapainawabganj",
  ],
  Khulna: [
    "Khulna",
    "Jashore",
    "Satkhira",
    "Bagerhat",
    "Kushtia",
    "Jhenaidah",
    "Magura",
    "Narail",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Barishal: [
    "Barishal",
    "Bhola",
    "Patuakhali",
    "Pirojpur",
    "Barguna",
    "Jhalokati",
  ],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Kurigram",
    "Gaibandha",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
    "Lalmonirhat",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export const DIVISION_NAMES = Object.keys(DIVISIONS);
