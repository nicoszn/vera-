import { PrismaClient } from '../../../prisma/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Initialize a connection pool matching PostgreSQL standards
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Pass the adapter directly to PrismaClient as mandated by Prisma 7 runtime architecture
export const prisma = new PrismaClient({ adapter });
