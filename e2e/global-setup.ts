import { execSync } from 'child_process';

async function globalSetup() {
  console.log('Resetting and seeding database...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('Database setup complete.');
}

export default globalSetup;
