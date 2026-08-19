import env from "./env.js";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client.ts';

const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  connectionTimeoutMillis: 10000, // Extend wait time to 10s before timing out
  idleTimeoutMillis: 30000,       // Keep idle connections open for 30s
  max: 20                         // Ensure your pool size matches your needs
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma