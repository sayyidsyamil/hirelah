import { NextRequest, NextResponse } from 'next/server';

const SIMILARITY_API = 'https://c047-34-87-122-249.ngrok-free.app/similarity';

// Flatten JSON resume to plain text by joining key-values, ignoring braces and arrays
function flattenResumeToText(resume: any): string {
  const lines: string[] = [];

  if (resume.name) lines.push(`Name: ${resume.name}`);
  if (resume.email) lines.push(`Email: ${resume.email}`);
  if (resume.location) lines.push(`Location: ${resume.location}`);
  if (resume.role_applied) lines.push(`Role applied: ${resume.role_applied}`);
  if (resume.role && resume.role !== resume.role_applied) lines.push(`Role: ${resume.role}`);
  if (resume.summary) lines.push(`Summary: ${resume.summary}`);
  if (resume.employment_type) lines.push(`Employment Type: ${resume.employment_type}`);
  if (resume.location_preference) lines.push(`Location Preference: ${resume.location_preference}`);

  if (Array.isArray(resume.education)) {
    lines.push('Education:');
    resume.education.forEach((edu: any) => {
      const honors = Array.isArray(edu.honors) ? edu.honors.join(', ') : '';
      lines.push(
        `- ${edu.institution || ''}, ${edu.degree || ''} ${edu.field || ''}, ${edu.end_year || ''}, CGPA: ${edu.cgpa || ''}, Honors: ${honors}`
      );
    });
  }

  if (resume.skills) {
    const allSkills: string[] = [];
    if (Array.isArray(resume.skills.soft_skills)) {
      allSkills.push(...resume.skills.soft_skills);
    }
    if (Array.isArray(resume.skills.languages)) {
      allSkills.push(...resume.skills.languages);
    }
    if (Array.isArray(resume.skills.frameworks_libraries)) {
      allSkills.push(...resume.skills.frameworks_libraries);
    }
    if (Array.isArray(resume.skills.tools_platforms)) {
      allSkills.push(...resume.skills.tools_platforms);
    }
    if (Array.isArray(resume.skills.APIs)) {
      allSkills.push(...resume.skills.APIs);
    }

    if (allSkills.length > 0) {
      lines.push('Skills: ' + allSkills.join(' '));
    }
  }

  if (Array.isArray(resume.experience)) {
    lines.push('Experience:');
    resume.experience.forEach((exp: any) => {
      lines.push(
        `- ${exp.company || ''}, ${exp.title || ''}, ${exp.start_date || ''} - ${exp.end_date || ''}`
      );
    });
  }

  if (Array.isArray(resume.awards)) {
    const awards = resume.awards.map((a: any) => a.title).filter(Boolean);
    if (awards.length) lines.push('Awards: ' + awards.join(', '));
  }

  // Join all lines with newlines to form the final text block
  return lines.join('\n');
}

async function getSimilarityPercent(
  query: string,
  resume: string,
  job?: string
): Promise<number> {
  try {
    // If job not provided, fallback to query
    const payload = { query, resume, job: job || query };

    const res = await fetch(SIMILARITY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Similarity API response error:', errorText);
      throw new Error('Similarity API backend is not set up or returned an error.');
    }

    const data = await res.json();

    if (typeof data.similarity_score === 'number') {
      // API returns 0-1 range, convert to 0-100 percentage
      return data.similarity_score * 100;
    }

    console.error('Unexpected similarity API response format:', data);
    return 0;
  } catch (err: any) {
    console.error('Similarity API failed:', err);
    throw new Error(err.message || 'Similarity API failed due to an unknown error.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, candidates, job } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }
    if (!Array.isArray(candidates)) {
      return NextResponse.json({ error: 'Candidates must be an array' }, { status: 400 });
    }

    const queryText = query.toLowerCase();

    // Limit candidates to max 20 to prevent overload
    const limitedCandidates = candidates.slice(0, 20);

    const scored = await Promise.all(
      limitedCandidates.map(async (candidate) => {
        if (typeof candidate !== 'object' || !candidate) {
          return { ...candidate, match: 0 };
        }

        // Flatten candidate JSON to lowercase text
        const candidateText = flattenResumeToText(candidate).toLowerCase();

        console.log('Comparing query:', queryText, '... with candidate:', candidate.name);

        // Pass job text dynamically if provided
        const similarityPercent = await getSimilarityPercent(queryText, candidateText, job);

        // Ensure match is not negative
        return { ...candidate, match: Math.max(0, Math.round(similarityPercent)) };
      })
    );

    // Sort candidates by descending similarity score
    scored.sort((a, b) => b.match - a.match);

    return NextResponse.json(scored);
  } catch (err: any) {
    console.error('API route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
