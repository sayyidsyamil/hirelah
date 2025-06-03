import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'lib', 'talent-pool.json');

export async function GET(req: NextRequest, contextPromise: Promise<{ params: { token: string } }>) {
  const { params } = await contextPromise;
  const { token } = params;
  let arr = [];
  try {
    const file = await fs.readFile(DATA_PATH, 'utf-8');
    arr = JSON.parse(file);
  } catch {
    return NextResponse.json({ error: 'No interviews found' }, { status: 404 });
  }
  const interview = arr.find((i: any) => i.meeting_id === token);
  if (!interview) {
    return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  }
  return NextResponse.json(interview);
} 