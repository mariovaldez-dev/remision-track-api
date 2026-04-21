import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ask = (q: string): Promise<string> =>
  new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); res(a.trim()); });
  });

async function main() {
  console.log('\n🔐  Crear Super Admin\n');

  const nombre   = await ask('Nombre:     ');
  const apellido = await ask('Apellido:   ');
  const email    = await ask('Email:      ');
  const password = await ask('Contraseña: ');

  if (!nombre || !apellido || !email || password.length < 6) {
    console.error('\n❌  Todos los campos son requeridos y la contraseña debe tener mínimo 6 caracteres.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`\n❌  Ya existe un usuario con el email "${email}".`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { nombre, apellido, email, passwordHash, rol: 'SUPER_ADMIN', activo: true },
  });

  console.log(`\n✅  Super Admin creado exitosamente:`);
  console.log(`    Nombre: ${user.nombre} ${user.apellido}`);
  console.log(`    Email:  ${user.email}`);
  console.log(`    Rol:    ${user.rol}\n`);
}

main()
  .catch((e) => { console.error('\n❌  Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
