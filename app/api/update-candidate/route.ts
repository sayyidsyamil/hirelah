import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const TALENT_POOL_PATH = path.resolve('./lib/talent-pool.json');

export async function POST(req: NextRequest) {
  console.log('Received request for /api/update-candidate');
  try {
    const { id, email, meeting_id, status } = await req.json();

    if (!meeting_id || !status || (!id && !email)) {
      console.error('Missing required fields in request body:', { id, email, meeting_id, status });
      return NextResponse.json({ error: 'Missing required fields: meeting_id, status, and either id or email' }, { status: 400 });
    }

    let existingData: any[] = [];
    try {
      const fileContent = await fs.readFile(TALENT_POOL_PATH, 'utf8');
      existingData = JSON.parse(fileContent);
      if (!Array.isArray(existingData)) existingData = [];
      console.log('Successfully read talent pool JSON file:', TALENT_POOL_PATH);
    } catch (err) {
      console.error('Failed to read talent pool JSON file:', err);
      return NextResponse.json({ error: 'Failed to read candidate data' }, { status: 500 });
    }

    let candidateIndex = -1;
    if (id) {
      candidateIndex = existingData.findIndex(c => c.id === id);
    }

    if (candidateIndex === -1 && email) {
      candidateIndex = existingData.findIndex(c => c.email === email);
      if (candidateIndex !== -1 && !existingData[candidateIndex].id) {
        // If found by email and no ID exists, assign the ID from the request
        existingData[candidateIndex].id = id;
      }
    }

    if (candidateIndex === -1) {
      console.error(`Candidate not found in talent pool by ID: ${id} or Email: ${email}`);
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    existingData[candidateIndex].meeting_id = meeting_id;
    existingData[candidateIndex].status = status;

    await fs.writeFile(TALENT_POOL_PATH, JSON.stringify(existingData, null, 2), 'utf8');
    console.log('Candidate data updated successfully:', { id, meeting_id, status });

    return NextResponse.json({ message: 'Candidate data updated successfully' });
  } catch (error) {
    console.error('Error updating candidate data:', error);
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}