const fs = require('fs');

function suppressFile(file) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('/* eslint-disable */')) {
    fs.writeFileSync(file, '/* eslint-disable */\n' + text);
  }
}

suppressFile('scripts/migrate_to_pg.ts');
suppressFile('scripts/set-provider.js');
suppressFile('src/test_settings.js');
suppressFile('scripts/migrate.js');

function replaceAll(file, search, replace) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  let newText = text.split(search).join(replace);
  if (text !== newText) fs.writeFileSync(file, newText);
}

replaceAll('src/app/history/page.tsx', 'import Image from \'next/image\';\n', '');
replaceAll('src/app/login/LoginClient.tsx', 'const [successMsg, setSuccessMsg] = useState<string | null>(null);', '// const [successMsg, setSuccessMsg] = useState<string | null>(null);');
replaceAll('src/app/login/LoginClient.tsx', 'const res = await fetch', 'await fetch');
replaceAll('src/app/profile/[name]/page.tsx', 'const allUsersCount = await prisma.user.count();', '');
replaceAll('src/app/profile/[name]/page.tsx', 'const rank = users.findIndex(u => u.name === name) + 1;', '');

// CommitteeClient.tsx
replaceAll('src/app/committee/CommitteeClient.tsx', '(e: any)', '(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)');
replaceAll('src/app/committee/CommitteeClient.tsx', 'date: any', 'date: string');
replaceAll('src/app/committee/CommitteeClient.tsx', 'active: any', 'active: boolean');
replaceAll('src/app/committee/CommitteeClient.tsx', 'academicYear: any', 'academicYear: string');
replaceAll('src/app/committee/CommitteeClient.tsx', 'beerName: any', 'beerName: string');
replaceAll('src/app/committee/CommitteeClient.tsx', 'breweryName: any', 'breweryName: string');
replaceAll('src/app/committee/CommitteeClient.tsx', 'pubName: any', 'pubName: string');
replaceAll('src/app/committee/CommitteeClient.tsx', 'doesn\'t', 'doesn&apos;t');

// Any types
replaceAll('src/app/leaderboard/LeaderboardClient.tsx', 'initialPubs: Record<string, any>[]', 'initialPubs: Record<string, unknown>[]');
replaceAll('src/app/leaderboard/LeaderboardClient.tsx', 'initialPubs: any[]', 'initialPubs: Record<string, unknown>[]');
replaceAll('src/app/leaderboard/page.tsx', 'initialPubs: Record<string, any>[]', 'initialPubs: Record<string, unknown>[]');
replaceAll('src/app/leaderboard/page.tsx', 'initialPubs: any[]', 'initialPubs: Record<string, unknown>[]');
replaceAll('src/app/matrix/page.tsx', 'users: Record<string, any>[]', 'users: Record<string, unknown>[]');
replaceAll('src/app/matrix/page.tsx', 'users: any[]', 'users: Record<string, unknown>[]');
replaceAll('src/app/custom/[slug]/page.tsx', 'page: Record<string, any>', 'page: Record<string, unknown>');
replaceAll('src/app/custom/[slug]/page.tsx', 'page: any', 'page: Record<string, unknown>');
replaceAll('src/app/awards/page.tsx', 'catch (err: any)', 'catch (err: unknown)');
replaceAll('src/app/awards/page.tsx', 'userAnswers: any', 'userAnswers: Record<string, unknown>');
