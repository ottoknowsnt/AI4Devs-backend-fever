import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Verificar ambiente de ejecución
const isProd = process.env.NODE_ENV === 'production';

// Crear una instancia global de PrismaClient con configuración específica para cada ambiente
const prisma = new PrismaClient({
  log: isProd ? ['error'] : ['query', 'info', 'warn', 'error'],
});

// Manejadores para cerrar la conexión cuando la aplicación termina
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
