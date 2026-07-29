import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../prisma/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Global caching preventing connection pooling starvation under serverless cold-start invocations
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}
prisma = globalForPrisma.prisma;

export async function POST(req: Request) {
  try {
    const { objective } = await req.json();
    if (!objective) return NextResponse.json({ error: "Objective missing" }, { status: 400 });

    const task = await prisma.agentTask.create({
      data: { objective, status: "PENDING" },
    });

    return NextResponse.json({ taskId: task.id, status: task.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
