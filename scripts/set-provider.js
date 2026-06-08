/* eslint-disable */
const fs = /* eslint-disable-next-line @typescript-eslint/no-require-imports */ require('fs');
const path = /* eslint-disable-next-line @typescript-eslint/no-require-imports */ require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  console.log('Detected Postgres URL. Switching Prisma provider to postgresql...');
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
} else {
  console.log('No Postgres URL detected. Keeping SQLite provider.');
}
