import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, createPartFromUri, Type } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames

export const runtime = 'nodejs'; // must be nodejs for fs and buffer

const TALENT_POOL_PATH = path.resolve('./lib/talent-pool.json');

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Only PDF uploads are supported' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Convert file to Blob (Node.js 18+ supports Blob natively)
  // @ts-ignore
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = new Blob([buffer], { type: 'application/pdf' });

  // Gemini SDK
  const ai = new GoogleGenAI({ apiKey });

  // Upload the file
  const uploaded = await ai.files.upload({
    file: blob,
    config: { displayName: 'resume.pdf' },
  });

  if (!uploaded.name) {
    return NextResponse.json({ error: 'File upload failed: missing file name' }, { status: 500 });
  }

  // Wait for processing
  let getFile = await ai.files.get({ name: uploaded.name as string });
  while (getFile.state === 'PROCESSING') {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    getFile = await ai.files.get({ name: uploaded.name as string });
  }
  if (getFile.state === 'FAILED') {
    return NextResponse.json({ error: 'File processing failed' }, { status: 500 });
  }

  // Prepare the prompt and file part
  const content: any[] = [
    `Reply in simple pure text. not markdown no need bolt text etc. just plain text. You are an expert Malaysian HR AI. Analyze this candidate's resume (PDF attached). Extract and return a detailed JSON object with the following fields: name, email, location, phone, linkedin, role_applied, summary, education (array), skills (object), certifications (array), projects (array), experience (array), leadership (array), awards (array), keywords (array), languages (array), personality (object), analysis (markdown allowed), img (string). For the 'personality' field, infer and predict the most likely MBTI personality type(s) for the candidate, and provide a short explanation for each, based on their writing, achievements, and self-presentation in the resume. For the 'img' field, leave it blank (it will be filled with the user's Clerk profile picture later). Do not include any text outside the JSON.`,
  ];
  if (getFile.uri && getFile.mimeType) {
    const fileContent = createPartFromUri(getFile.uri, getFile.mimeType);
    content.push(fileContent);
  }

  // Structured output config (same as your original code)
  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        location: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        role_applied: { type: Type.STRING },
        summary: { type: Type.STRING },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              field: { type: Type.STRING },
              start_year: { type: Type.STRING },
              end_year: { type: Type.STRING },
              cgpa: { type: Type.STRING },
              honors: { type: Type.ARRAY, items: { type: Type.STRING } },
              qualification: { type: Type.STRING },
              grades: { type: Type.STRING },
            },
            propertyOrdering: [
              'institution', 'degree', 'field', 'start_year', 'end_year', 'cgpa', 'honors', 'qualification', 'grades'
            ],
          },
        },
        skills: {
          type: Type.OBJECT,
          properties: {
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks_libraries: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools_platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
            APIs: { type: Type.ARRAY, items: { type: Type.STRING } },
            soft_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          propertyOrdering: [
            'languages', 'frameworks_libraries', 'tools_platforms', 'APIs', 'soft_skills'
          ],
        },
        certifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              issuer: { type: Type.STRING },
              year: { type: Type.STRING },
            },
            propertyOrdering: ['title', 'issuer', 'year'],
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              year: { type: Type.STRING },
              role: { type: Type.STRING },
              impact: { type: Type.STRING },
              awards: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            propertyOrdering: [
              'title', 'description', 'technologies', 'year', 'role', 'impact', 'awards'
            ],
          },
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              title: { type: Type.STRING },
              start_date: { type: Type.STRING },
              end_date: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            propertyOrdering: [
              'company', 'title', 'start_date', 'end_date', 'duration', 'description', 'technologies'
            ],
          },
        },
        leadership: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              organization: { type: Type.STRING },
              year: { type: Type.STRING },
              start_year: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            propertyOrdering: [
              'role', 'organization', 'year', 'start_year', 'description'
            ],
          },
        },
        awards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              event: { type: Type.STRING },
              year: { type: Type.STRING },
              project: { type: Type.STRING },
              type: { type: Type.STRING },
            },
            propertyOrdering: [
              'title', 'event', 'year', 'project', 'type'
            ],
          },
        },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        languages: { type: Type.ARRAY, items: { type: Type.STRING } },
        personality: {
          type: Type.OBJECT,
          properties: {
            type1: { type: Type.STRING },
          },
          additionalProperties: { type: Type.STRING },
        },
        analysis: { type: Type.STRING },
      },
      propertyOrdering: [
        'name', 'email', 'location', 'phone', 'linkedin', 'role_applied', 'summary', 'education', 'skills', 'certifications', 'projects', 'experience', 'leadership', 'awards', 'keywords', 'languages', 'personality', 'analysis'
      ],
      required: [
        'name', 'email', 'location', 'role_applied', 'summary', 'education', 'skills', 'certifications', 'projects', 'experience', 'leadership', 'awards', 'keywords', 'languages', 'personality', 'analysis'
      ],
    },
  };

  // Generate content
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: content,
    config,
  });

  // Parse response JSON
  let aiJson: any;
  try {
    aiJson = typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
  } catch {
    aiJson = { analysis: response.text };
  }

  // Save the PDF file
  const resumesDir = path.join(process.cwd(), 'public', 'resumes');
  await fs.mkdir(resumesDir, { recursive: true }); // Ensure directory exists

  const filename = `${uuidv4()}.pdf`;
  const filePath = path.join(resumesDir, filename);
  await fs.writeFile(filePath, buffer); // Use the buffer from the uploaded file

  // Add the PDF URL to the AI analysis JSON
  aiJson.pdfUrl = `/resumes/${filename}`;
  aiJson.meeting_id = null;
  aiJson.status = null;
  aiJson.id = uuidv4(); // Add a unique ID to the candidate data

  // Read existing talent pool JSON file or initialize array
  let existingData: any[] = [];
  try {
    const fileContent = await fs.readFile(TALENT_POOL_PATH, 'utf8');
    existingData = JSON.parse(fileContent);
    if (!Array.isArray(existingData)) existingData = [];
  } catch (err) {
    // If file doesn't exist or parsing failed, start fresh
    existingData = [];
  }

  // Append new candidate data
  existingData.push(aiJson);

  // Write back to file
  try {
    await fs.writeFile(TALENT_POOL_PATH, JSON.stringify(existingData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write talent pool JSON file:', err);
    return NextResponse.json({ error: 'Failed to save candidate data' }, { status: 500 });
  }

  console.log('Gemini structured JSON appended to talent pool:', JSON.stringify(aiJson, null, 2));
  return NextResponse.json(aiJson);
}
