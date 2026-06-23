/**
 * Seeds the database with a demo user and ~90 days of realistic usage data.
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@netwatch.app";
const DEMO_PASSWORD = "demo12345";

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Deterministic pseudo-random usage so seed data is reproducible. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "Demo User",
      settings: {
        create: {
          billingCycleDay: 1,
          usageUnit: "GB",
          quotaGb: 1000,
          theme: "SYSTEM",
          browserNotifications: true,
          inAppNotifications: true,
          notifyThresholds: [50, 80, 90, 100],
        },
      },
    },
  });

  console.log(`Upserted user ${user.email} (${user.id})`);

  const today = startOfUtcDay(new Date());
  const days = 90;
  const records: {
    userId: string;
    date: Date;
    uploadGb: number;
    downloadGb: number;
    provider: string;
  }[] = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);

    const dayOfWeek = date.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseDownload = isWeekend ? 14 : 9;
    const baseUpload = isWeekend ? 2.5 : 1.6;

    const noise = pseudoRandom(i * 13.37);
    const downloadGb = Math.round((baseDownload + noise * 6) * 100) / 100;
    const uploadGb =
      Math.round((baseUpload + pseudoRandom(i * 7.77) * 1.5) * 100) / 100;

    records.push({
      userId: user.id,
      date,
      uploadGb,
      downloadGb,
      provider: "Comcast Xfinity",
    });
  }

  await prisma.usageRecord.deleteMany({ where: { userId: user.id } });
  await prisma.usageRecord.createMany({ data: records });

  console.log(`Inserted ${records.length} usage records`);
  console.log("Seed complete.");
  console.log(`Demo login -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
