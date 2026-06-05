import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function GET() {
  try {
    let dbData = { customPages: [] as any[] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }
    
    // Return list of custom pages metadata (exclude heavy HTML content to save bandwidth if listing)
    const list = (dbData.customPages || []).map(p => ({
      title: p.title,
      slug: p.slug,
      dateString: p.dateString
    }));
    
    return NextResponse.json({ success: true, pages: list });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, slug, htmlContent, role } = await request.json();

    if (role !== 'committee') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!title || !slug || !htmlContent) {
      return NextResponse.json({ error: "Title, slug, and HTML content are required" }, { status: 400 });
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\-_]/g, '') // remove special characters
      .replace(/\s+/g, '-');        // replace spaces with hyphens

    if (!cleanSlug) {
      return NextResponse.json({ error: "Invalid URL slug" }, { status: 400 });
    }

    let dbData = { wordleWord: "MALTY", wordleHint: "", wordleScores: [], customPages: [] as any[], events: [] };
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        // fallback
      }
    }

    if (!dbData.customPages) {
      dbData.customPages = [];
    }

    const dateString = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const newPage = {
      title: title.trim(),
      slug: cleanSlug,
      htmlContent,
      dateString,
      timestamp: new Date().toISOString()
    };

    // Replace if page with the same slug already exists, otherwise push
    const existingIndex = dbData.customPages.findIndex(p => p.slug === cleanSlug);
    if (existingIndex > -1) {
      dbData.customPages[existingIndex] = newPage;
    } else {
      dbData.customPages.push(newPage);
    }

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

    return NextResponse.json({ success: true, page: { title: newPage.title, slug: newPage.slug } });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
