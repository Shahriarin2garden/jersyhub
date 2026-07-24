import { PrismaClient, type Size } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(t: string) {
  return t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

const IMG = (seed: string) =>
  `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&${seed}`;

const CATEGORIES = [
  { name: "Football", slug: "football", displayOrder: 1 },
  { name: "Cricket", slug: "cricket", displayOrder: 2 },
  { name: "Basketball", slug: "basketball", displayOrder: 3 },
  { name: "Custom", slug: "custom", displayOrder: 4 },
];

const PRODUCTS: {
  name: string;
  category: string;
  price: number;
  featured?: boolean;
  desc: string;
}[] = [
  { name: "Argentina Home 2024", category: "football", price: 1200, featured: true, desc: "Official-style Argentina home jersey. Breathable fabric, sublimated print." },
  { name: "Brazil Away 2024", category: "football", price: 1200, featured: true, desc: "Iconic Brazil away kit. Lightweight, moisture-wicking." },
  { name: "Real Madrid Home 2024", category: "football", price: 1350, featured: true, desc: "Los Blancos home jersey with club crest." },
  { name: "Barcelona Home 2024", category: "football", price: 1350, desc: "Blaugrana stripes, premium stitching." },
  { name: "Manchester City Home", category: "football", price: 1300, desc: "Sky blue Cityzens kit." },
  { name: "Bangladesh Cricket ODI", category: "cricket", price: 1100, featured: true, desc: "Tigers ODI jersey. Green & red, national pride." },
  { name: "India Cricket Home", category: "cricket", price: 1100, desc: "Men in Blue ODI jersey." },
  { name: "Pakistan Cricket 2024", category: "cricket", price: 1050, desc: "Green shaheens cricket kit." },
  { name: "Lakers Home #23", category: "basketball", price: 1400, featured: true, desc: "Purple & gold basketball jersey, mesh fabric." },
  { name: "Bulls Away #23", category: "basketball", price: 1400, desc: "Classic red away basketball jersey." },
  { name: "Warriors Home", category: "basketball", price: 1450, desc: "Dub Nation home jersey." },
  { name: "Custom Name & Number", category: "custom", price: 1500, desc: "Build your own — pick colors, add name and number." },
];

const CUSTOMERS = [
  { name: "Rahim Uddin", phone: "01711000001", division: "Dhaka", district: "Dhaka", address: "House 12, Road 5, Dhanmondi, Dhaka" },
  { name: "Karim Ahmed", phone: "01711000002", division: "Chattogram", district: "Chattogram", address: "45 Agrabad C/A, Chattogram" },
  { name: "Sadia Islam", phone: "01711000003", division: "Dhaka", district: "Gazipur", address: "Tongi bazar, Gazipur" },
  { name: "Tanvir Hasan", phone: "01711000004", division: "Rajshahi", district: "Bogura", address: "Sherpur road, Bogura" },
  { name: "Nusrat Jahan", phone: "01711000005", division: "Sylhet", district: "Sylhet", address: "Zindabazar, Sylhet" },
];

const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

function orderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = "JH-";
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

async function main() {
  console.log("Seeding…");

  // Admin
  const email = process.env.ADMIN_EMAIL ?? "admin@jersyhub.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name: "Store Admin" },
    create: { email, passwordHash, name: "Store Admin" },
  });
  console.log(`Admin: ${email}`);

  // Categories
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, displayOrder: c.displayOrder },
      create: { ...c, image: IMG(`cat=${c.slug}`) },
    });
    catMap.set(c.slug, row.id);
  }

  // Products + variants
  const createdProducts: { id: string; variantIds: string[]; price: number }[] = [];
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const product = await prisma.product.upsert({
      where: { slug },
      update: { price: p.price, featured: p.featured ?? false },
      create: {
        name: p.name,
        slug,
        description: p.desc,
        price: p.price,
        categoryId: catMap.get(p.category)!,
        images: [IMG(`p=${slug}-1`), IMG(`p=${slug}-2`)],
        status: "PUBLISHED",
        featured: p.featured ?? false,
        variants: {
          create: SIZES.map((size) => ({
            size,
            stock: 5 + Math.floor(Math.random() * 20),
          })),
        },
      },
      include: { variants: true },
    });
    createdProducts.push({
      id: product.id,
      variantIds: product.variants.map((v) => v.id),
      price: product.price,
    });
  }

  // Customers + one order each
  const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "PENDING"] as const;
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const c = CUSTOMERS[i];
    const customer = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    });

    const prod = createdProducts[i % createdProducts.length];
    const variant = prod.variantIds[0];
    const qty = 1 + (i % 2);
    const unitPrice = prod.price;
    const subtotal = unitPrice * qty;
    const deliveryFee = subtotal >= 3000 ? 0 : 60;
    const status = statuses[i];

    await prisma.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId: customer.id,
        status,
        paymentMethod: i % 2 === 0 ? "COD" : "BKASH",
        paymentStatus: status === "DELIVERED" ? "PAID" : "UNPAID",
        bkashTxnId: i % 2 === 0 ? null : `TXN${1000 + i}`,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        items: {
          create: [
            { productId: prod.id, variantId: variant, quantity: qty, unitPrice, totalPrice: subtotal },
          ],
        },
        statusHistory: {
          create: [{ status: "PENDING", note: "Order placed" }],
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
