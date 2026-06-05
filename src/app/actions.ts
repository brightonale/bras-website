'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(username: string, passwordAttempt: string) {
  const user = await prisma.user.findUnique({
    where: { name: username.toLowerCase().replace(/\s+/g, '') }
  });

  if (!user || user.password !== passwordAttempt) {
    return { error: 'Invalid credentials.' };
  }

  const cookieStore = await cookies();
  
  // Set cookies
  cookieStore.set('bras_user_name', user.name, { httpOnly: true, path: '/' });
  cookieStore.set('bras_voting_name', user.votingName || user.name, { httpOnly: true, path: '/' });
  cookieStore.set('bras_user_role', user.role, { httpOnly: true, path: '/' });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('bras_user_name');
  cookieStore.delete('bras_voting_name');
  cookieStore.delete('bras_user_role');
  redirect('/');
}

export async function getSession() {
  const cookieStore = await cookies();
  const name = cookieStore.get('bras_user_name')?.value;
  const votingName = cookieStore.get('bras_voting_name')?.value;
  const role = cookieStore.get('bras_user_role')?.value;
  return { name, votingName, role, isLoggedIn: !!name };
}
