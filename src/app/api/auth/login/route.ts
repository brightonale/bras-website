import { NextResponse } from 'next/server';
import membersData from '@/data/members.json';

const COMMITTEE_PASSWORD = "bras2025";
const MEMBER_PASSWORD = "realale2026";

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const cleanPassword = password.trim();

    // Check if the username is one of the 44 official members (case-insensitive)
    const validMember = membersData.find(m => m.name.toLowerCase() === trimmedName.toLowerCase());

    if (!validMember) {
      return NextResponse.json({ error: "Name not found in BRAS member list" }, { status: 401 });
    }

    if (cleanPassword === COMMITTEE_PASSWORD) {
      return NextResponse.json({
        success: true,
        name: validMember.name,
        role: "committee"
      });
    } else if (cleanPassword === MEMBER_PASSWORD) {
      return NextResponse.json({
        success: true,
        name: validMember.name,
        role: "member"
      });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
