import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'src/data/settings.json');

export async function GET() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.role !== 'committee') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    fs.writeFileSync(settingsPath, JSON.stringify({ features: body.features }, null, 2), 'utf8');
    return NextResponse.json({ success: true, features: body.features });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
