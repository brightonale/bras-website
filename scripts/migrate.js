const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const COMMITTEE_MEMBERS = ['harry', 'takara', 'albie', 'max', 'harrison', 'sydney', 'james'];

async function run() {
  console.log('Starting migration...');
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    let changed = false;
    let data = {};

    // 1. Hash password if it's plaintext
    // bcrypt hashes start with $2b$ or $2a$, and are 60 chars long.
    if (!user.password.startsWith('$2') || user.password.length !== 60) {
      console.log(`Hashing password for ${user.name}`);
      data.password = await bcrypt.hash(user.password, 10);
      changed = true;
    }

    // 2. Fix roles
    const shouldBeCommittee = COMMITTEE_MEMBERS.includes(user.name);
    if (!shouldBeCommittee && user.role === 'committee') {
      console.log(`Downgrading ${user.name} to member`);
      data.role = 'member';
      changed = true;
    } else if (shouldBeCommittee && user.role !== 'committee') {
      console.log(`Upgrading ${user.name} to committee`);
      data.role = 'committee';
      changed = true;
    }

    if (changed) {
      await prisma.user.update({
        where: { id: user.id },
        data
      });
      console.log(`Updated user: ${user.name}`);
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
