import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@yopmail.com",
      password_hash:
        "$2b$10$L7NQydIlwPhOdEd.mWVK1OK/V9HAghDaVnPrSYONNMA8SqrDKyvKy",
      full_name: "Admin",
      phone: "0123456789",
      avatar: "https://example.com/avatar.png",
      balance: 1000.0,
      referral_code: "REF123456",
      status: "active",
      level: "Gold",
    },
  });

  console.log("✅ User seeded:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
