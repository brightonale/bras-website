'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';

export async function login(username: string, passwordAttempt: string) {
  const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { name: cleanUsername }
    });
  } catch (err) {
    console.error("Login DB error", err);
    return { error: 'Database connection failed.' };
  }

  if (!user || !(await bcrypt.compare(passwordAttempt, user.password))) {
    return { error: 'Invalid credentials.' };
  }

  const cookieStore = await cookies();
  
  // Set cookies
  cookieStore.set('bras_user_name', user.name, { httpOnly: true, path: '/' });
  cookieStore.set('bras_voting_name', user.votingName || user.name, { httpOnly: true, path: '/' });
  cookieStore.set('bras_user_role', user.role, { httpOnly: true, path: '/' });

  return { 
    success: true, 
    user: { 
      name: user.name, 
      votingName: user.votingName, 
      role: user.role, 
      mustChange: user.mustChange 
    } 
  };
}

export async function createAccount(username: string, passwordAttempt: string) {
  const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
  if (!cleanUsername) return { error: 'Username cannot be empty.' };

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { name: cleanUsername } });
  } catch (err) {
    console.error("CreateAccount DB error", err);
    return { error: 'Database connection failed.' };
  }
  if (existing) {
    return { error: 'Username is already taken.' };
  }

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: cleanUsername,
        password: await bcrypt.hash(passwordAttempt, 10),
        role: 'member', // Default to member to prevent privilege escalation
      }
    });
  } catch (err) {
    console.error("CreateAccount DB error", err);
    return { error: 'Database connection failed while creating user.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('bras_user_name', user.name, { httpOnly: true, path: '/' });
  cookieStore.set('bras_voting_name', user.votingName || user.name, { httpOnly: true, path: '/' });
  cookieStore.set('bras_user_role', user.role, { httpOnly: true, path: '/' });

  return { 
    success: true, 
    user: { 
      name: user.name, 
      votingName: user.votingName, 
      role: user.role, 
      mustChange: false 
    } 
  };
}

export async function claimVotingName(username: string, votingName: string) {
  try {
    const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
    
    const user = await prisma.user.update({
      where: { name: cleanUsername },
      data: { votingName }
    });

    const cookieStore = await cookies();
    cookieStore.set('bras_voting_name', user.votingName || user.name, { httpOnly: true, path: '/' });

    return { success: true, error: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to claim voting name.' };
  }
}

export async function changePassword(username: string, newPasswordAttempt: string) {
  try {
    const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
    
    await prisma.user.update({
      where: { name: cleanUsername },
      data: { password: await bcrypt.hash(newPasswordAttempt, 10), mustChange: false }
    });

    return { success: true, error: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' };
  }
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
