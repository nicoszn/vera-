import { PrismaClient as BaseClient } from '../../prisma/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Share exact runtime types directly out of our unified gateway point
export type { AgentTask } from '../../prisma/generated/prisma/index.js';

const globalForPrisma = globalThis as unknown as { prisma: BaseClient };

function createClient(): BaseClient {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new BaseClient({ adapter });
}

// Global caching for serverless environments (Vercel), standard reuse for containers (Railway)
export const db = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
