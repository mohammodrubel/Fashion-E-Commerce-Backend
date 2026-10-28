import net from 'net';
import dns from 'dns';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// This host has no usable IPv6 route, so Node's Happy Eyeballs (autoSelectFamily)
// races IPv4 and IPv6 connect attempts and intermittently times out picking the
// dead IPv6 path. Force plain IPv4-first resolution instead.
net.setDefaultAutoSelectFamily(false);
dns.setDefaultResultOrder('ipv4first');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export default prisma;
