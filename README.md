# Hirela AI
## AI-Powered Talent Acquisition System
### Case Study Category: 1 - AI-Powered Talent Acquisition System

## Team Members: (Please fill in names)

## 1. Introduction: Hirelah AI System Overview

Hirelah AI is a modern talent acquisition platform that implements AI-driven recruitment workflows using Google Gemini and Next.js. The name "Hire-lah" reflects its Southeast Asian focus, with "lah" being a common colloquialism in Malaysian and Singaporean English.

The system architecture is built around three key user journeys:

1. **Candidates** upload resumes that are analyzed by Gemini AI
2. **Recruiters** use semantic search to find relevant candidates 
3. **Interview process** is automated through an AI interviewer

Core technical components:
- **Frontend**: Next.js app with React and Tailwind CSS
- **AI Integration**: Google Gemini 2.0 Flash for resume analysis and chatbot
- **Backend**: FastAPI service for semantic matching using SentenceTransformer
- **Data Storage**: JSON-based storage in the filesystem for the prototype

## 2. System Architecture & Implementation Details

### 2.1 Resume Processing and AI Analysis

The core of the resume processing system is built around Google Gemini's AI capabilities:


The system:
1. Accepts PDF uploads from candidates
2. Uses Gemini 2.0 Flash to extract structured data
3. Enhances the data with personality type predictions and skill categorization
4. Stores the processed resume data in a JSON file for the talent pool

### 2.2 Semantic Search Implementation

The semantic matching capability is powered by a Python backend using SentenceTransformer:

```python
# Backend semantic search service
app = FastAPI()
model = SentenceTransformer("nathankim/fine_tuned_resume_matcher")

@app.post("/similarity")
def get_similarity(data: TextPair):
    emb = model.encode([data.resume, data.job], convert_to_tensor=True)
    score = util.pytorch_cos_sim(emb[0], emb[1]).item()
    return {"similarity_score": score}
```

The search workflow:
1. Recruiters enter natural language queries about skills or experience
2. The system flattens resume data to plain text representation
3. SentenceTransformer calculates semantic similarity scores
4. Results are ranked and returned with match percentages

## 3. Key System Components and Workflow

### 3.1 Resume Upload and AI Analysis Process

The resume upload and analysis process works through the following steps:

1. **File Upload**: The candidate uploads a PDF resume through the `/candidate/apply` page
2. **PDF Processing**: The resume is processed using the Google Gemini API:
   ```typescript
   // Upload file to Gemini
   const uploaded = await ai.files.upload({
     file: blob,
     config: { displayName: 'resume.pdf' },
   });
   
   // Wait for processing
   let getFile = await ai.files.get({ name: uploaded.name as string });
   while (getFile.state === 'PROCESSING') {
     await new Promise((resolve) => setTimeout(resolve, 2000));
     getFile = await ai.files.get({ name: uploaded.name as string });
   }
   ```

3. **Structured Data Extraction**: Gemini AI extracts structured data from the PDF into a detailed JSON schema
4. **Storage**: The PDF is saved to `/public/resumes/{uuid}.pdf` and the parsed data is added to the talent pool JSON file
5. **Candidate Record**: A unique ID is assigned to the candidate record for tracking

### 3.2 Recruiter Workflow and Semantic Search

The recruiter workflow is handled through the `/recruiter/talent-pool` interface:

1. **Talent Pool Display**: All candidates are loaded from `lib/talent-pool.json` 
2. **Semantic Search**: When a recruiter enters a query:
   ```typescript
   // Debounced semantic search
   useEffect(() => {
     if (searchTimeout.current) clearTimeout(searchTimeout.current);
     searchTimeout.current = setTimeout(async () => {
       if (!search.trim()) {
         setFiltered(allCandidates.map(c => ({ ...c, match: undefined })));
         return;
       }

       try {
         const res = await fetch("/api/semantic-search", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ query: currentQuery, candidates: allCandidates }),
         });
         const data = await res.json();
         if (Array.isArray(data)) {
           setFiltered(data);
         }
       } catch (error) {
         // Fallback to local filter if API fails
         // ...
       }
     }, 300);
   }, [search, allCandidates]);
   ```

3. **Text Processing**: 
   - Resume data is flattened to plain text using the `flattenResumeToText` function
   - The text is sent to a Python FastAPI backend for semantic similarity calculation
   - Results are ranked by match percentage

### 3.3 AI Interview Implementation

The interview system connects candidates with an AI interviewer:

1. **Interview Generation**: The recruiter can generate a unique interview link
2. **Interview URL**: The system creates a unique URL with a UUID token: `/interview/{token}`
3. **Real-time Interview**: The interview page provides:
   - Video/audio capture through the browser's MediaDevices API
   - Camera and microphone toggle controls
   - Text-based conversation interface for the interview questions and responses

## 4. Technical Implementation Details

### 4.1 Frontend Architecture

The frontend is built with Next.js and organized as follows:

1. **Landing Page** (`/app/page.tsx`): Entry point with paths for candidates and recruiters
2. **Candidate Flow**:
   - Resume upload page (`/app/candidate/apply/page.tsx`)
   - Form submission with PDF upload
   
3. **Recruiter Flow**:
   - Talent pool management (`/app/recruiter/talent-pool/page.tsx`)
   - Candidate filtering and search interface
   - AI chat interface for asking questions about candidates
   - Interview invitation generation

4. **Interview System**:
   - Real-time interview page (`/app/interview/[token]/page.tsx`)
   - Camera and microphone controls
   - AI conversation interface

### 4.2 Backend Services

The backend functionality is primarily implemented through API routes:

1. **AI Analysis** (`/app/api/ai-analysis/route.ts`):
   - Handles PDF resume uploads
   - Processes documents with Google Gemini API
   - Extracts structured data using a predefined schema

2. **Semantic Search** (`/app/api/semantic-search/route.ts`):
   - Connects to a FastAPI Python backend
   - Flattens resume data into plain text
   - Calculates semantic similarity scores

3. **Candidate Chat** (`/app/api/candidate-chat/route.ts`):
   - Allows recruiters to ask questions about specific candidates
   - Uses AI to analyze resumes and provide relevant answers

4. **Interview Management** (`/app/api/interview/[token]/route.ts`):
   - Creates and retrieves interview sessions
   - Manages interview tokens and candidate assignments

### 4.3 Data Storage & Processing

The system uses a simple but effective data storage approach:

1. **Resume Storage**:
   - PDF files stored in `/public/resumes/` with UUID filenames
   - Accessible through direct URL paths

2. **Candidate Data**:
   - Structured JSON stored in `/lib/talent-pool.json`
   - Each candidate has a unique ID, resume data, and interview status

3. **Semantic Matching Backend**:
   - Python FastAPI service using SentenceTransformer
   - Pre-trained embedding model for resume-job matching
   - Returns similarity scores for ranking candidates

## 5. Implementation Thought Process and Decision Making

### 5.1 System Architecture Decisions

When designing Hirelah AI, several important architectural decisions were made:

1. **Next.js Frontend + Python Backend Split**
   - **Thought Process**: We needed to balance modern UI capabilities with ML performance
   - **Decision**: Next.js for the main application with a Python FastAPI service for semantic search
   - **Reasoning**: This approach leverages TypeScript/React's UI strengths while using Python's ML ecosystem

2. **Google Gemini Integration**
   - **Thought Process**: Needed advanced NLP capabilities to extract structured data from resumes
   - **Decision**: Integrate Google Gemini 2.0 Flash model with structured output
   - **Reasoning**: Gemini provides state-of-the-art document understanding with JSON output support

3. **Data Storage Approach**
   - **Thought Process**: For the prototype, needed simple yet effective data storage
   - **Decision**: File-based storage with JSON for candidate data and PDFs in the filesystem
   - **Reasoning**: Fast to implement and sufficient for demonstrating the concept

### 5.2 Implementation Challenges and Solutions

During implementation, several challenges were addressed:

1. **Resume Data Extraction**
   - **Challenge**: Extracting consistent structured data from diverse resume formats
   - **Solution**: Created a detailed schema for Gemini API with specific field definitions
   - **Result**: Consistent JSON output with personality analysis and skills categorization

2. **Semantic Search Accuracy**
   - **Challenge**: Making search results truly semantic rather than keyword-based
   - **Solution**: Implemented SentenceTransformer with a fine-tuned resume matching model
   - **Result**: Search results based on meaning rather than exact keyword matches

3. **Interview Experience**
   - **Challenge**: Creating a realistic, responsive virtual interview experience
   - **Solution**: Implemented MediaDevices API for camera/audio with real-time controls
   - **Result**: Interactive interview simulation with media toggles and conversation flow

## 6. User Flows and Interface

The interface is organized around three main user flows:

### 6.1 Candidate Journey
1. Access the landing page and select "I'm a Candidate"
2. Upload resume through the file input on `/candidate/apply`
3. Resume is processed by Gemini AI and structured data is extracted
4. Candidate receives interview invitation via email with unique token link
5. Complete AI-powered interview session with video and audio capture

### 6.2 Recruiter Journey
1. Access the landing page and select "I'm a Recruiter"
2. Browse talent pool on `/recruiter/talent-pool`
3. Use semantic search to filter candidates based on skills or experience
4. Preview candidate details, resume, and AI analysis
5. Ask questions about candidates via the AI chat interface
6. Generate and send interview invitations to promising candidates

### 6.3 Interview Process
1. Candidate accesses `/interview/{token}` URL
2. Media permissions are requested for camera and microphone
3. AI interviewer asks predefined questions based on the job role
4. Responses are captured and analyzed in real-time
5. Interview results are stored and made available to recruiters

## 7. Setup and Development Guide

### 7.1 Prerequisites
- Node.js 18.x or later
- Python 3.8+ (for semantic search backend)
- Google Gemini API key

### 7.2 Frontend Setup
1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create `.env.local` file with required environment variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### 7.3 Backend Setup
1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install Python dependencies
   ```bash
   pip install -r requirements.txt  # Or run the first cell in BACKENDSEMANTICSEARCH.ipynb
   ```

3. Run the semantic search service
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```
   Alternatively, run the Jupyter notebook cells in `BACKENDSEMANTICSEARCH.ipynb`

### 7.4 Technical Resources

- [Google Gemini API Documentation](https://ai.google.dev/gemini/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [SentenceTransformer Documentation](https://www.sbert.net/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

*This README provides a concise technical overview of the Hirelah AI system architecture and implementation details.*
