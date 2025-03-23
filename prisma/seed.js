import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.create({
    data: {
      user_id: 1,
      total_price: 59.99,
    },
  });

  const document = await prisma.document.create({
    data: {
      title: "Advanced Mathematics",
      description: "Advanced topics in Mathematics",
      price: 29.99,
      user_id: 1,
      subject_id: 1,
      university_id: 1,
    },
  });

  await prisma.orderItem.create({
    data: {
      order_id: order.id,
      document_id: document.id,
      price: 29.99,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
