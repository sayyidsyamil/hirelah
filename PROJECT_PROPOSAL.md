# Team GEMINI

## Hirelah AI

### Case Study Category: 1 - AI-Powered Talent Acquisition System

### Team Members:
- Member 1 name
- Member 2 name
- Member 3 name
- Member 4 name

## 1. Introduction

Hirelah AI is a modern talent acquisition platform that transforms traditional recruitment workflows through advanced AI capabilities. The name "Hire-lah" reflects our Southeast Asian focus, incorporating the common colloquialism "lah" used in Malaysian and Singaporean English.

Our platform addresses key inefficiencies in the talent acquisition process by leveraging artificial intelligence to analyze resumes, identify suitable candidates through semantic search, and automate the interview process.

### Key Features:
- AI-powered resume analysis with personality insights and skill categorization
- Semantic search that understands the meaning behind recruiter queries
- Automated interview system with video/audio integration
- Interactive AI chatbot for candidate questions and analysis

### Technologies:
- Google Gemini 2.0 Flash for advanced AI text analysis and structure extraction
- Next.js full-stack application with React and Tailwind CSS frontend
- FastAPI Python service for semantic matching using SentenceTransformer
- Browser MediaDevices API for interview video and audio capture

## 2. Problem Statement

Traditional recruitment processes suffer from significant inefficiencies and biases that create frustration for both recruiters and job seekers:

### For Recruiters:
- Manual resume screening is time-consuming and error-prone
- Keyword-based searches often miss qualified candidates who use different terminology
- Initial interviews consume valuable time that could be spent on final-stage candidates
- Inconsistent evaluation criteria lead to biased hiring decisions

### For Candidates:
- Resumes are often filtered out by keyword-matching algorithms despite having relevant skills
- The application process provides limited feedback and transparency
- Interview experiences vary greatly between recruiters, creating inconsistency

According to LinkedIn research, recruiters spend an average of 7.4 seconds reviewing a resume, and 67% acknowledge the potential of AI to save time in the hiring process. However, existing solutions often operate as "black boxes," lacking transparency and contextual understanding.

## 3. Aim and Objectives

### Aim:
To create an AI-powered recruitment platform that significantly improves hiring efficiency, reduces bias, and enhances the candidate experience through intelligent data extraction, semantic search, and automated interviewing.

### Objectives:
1. **Develop an AI-driven resume analysis system** that extracts structured data and provides personality insights
   - Create a resume upload interface for candidates
   - Implement Google Gemini API integration for PDF processing
   - Define a structured JSON schema for consistent data extraction
   - Develop personality type prediction based on resume content

2. **Implement semantic search functionality** for efficient candidate matching
   - Build a Python backend with SentenceTransformer for semantic similarity calculation
   - Create an intuitive search interface for recruiters
   - Develop text processing to flatten resume data into searchable format
   - Implement match percentage ranking system

3. **Create an AI-powered interview system** with video and audio integration
   - Design a secure token-based interview link generation system
   - Implement browser MediaDevices API for video/audio capture
   - Develop an AI conversation interface for structured interviews
   - Create a system to store and analyze interview results

4. **Build an interactive AI chat interface** for candidate analysis
   - Develop a chat system for recruiters to ask questions about candidates
   - Integrate AI to analyze candidate resumes and provide relevant answers
   - Create a user-friendly interface for natural conversation flow

## 4. Methodology

### 4.1 Implementation

#### Prototype Development
1. **Research Phase**:
   - Evaluate existing recruitment platforms and identify pain points
   - Research available AI technologies for resume parsing and semantic matching
   - Design the database schema and system architecture

2. **Core Feature Implementation**:
   - Develop the resume upload and parsing functionality
   - Implement the semantic search backend using SentenceTransformer
   - Create the AI interview system with video capture capabilities
   - Build the recruiter interface with candidate management tools

3. **Testing & Refinement**:
   - Test AI resume parsing with diverse resume formats
   - Evaluate semantic search accuracy and improve matching algorithms
   - Conduct user testing for the interview experience
   - Iterate on the UI/UX based on feedback

### 4.2 Tech Stack

#### Frontend
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS with Shadcn/UI components
- **State Management**: React Hooks
- **Media Handling**: Browser MediaDevices API

#### Backend
- **API Routes**: Next.js API routes for core functionality
- **Python Service**: FastAPI for semantic matching
- **AI Integration**: Google Gemini 2.0 Flash API
- **Authentication**: (Planned: Clerk Authentication)

#### Database
- **Storage (Prototype)**: JSON files for talent pool data
- **File Storage**: Local filesystem for resume PDFs
- **(Future)**: MongoDB for scalable data storage

#### AI/ML
- **Resume Analysis**: Google Gemini 2.0 Flash
- **Semantic Search**: SentenceTransformer with fine-tuned resume matching model
- **Chat Interface**: Google Gemini API

#### Deployment
- **Frontend/API**: Vercel
- **Python Backend**: Fly.io or Railway

## 5. Potential Impact

### 5.1 Market Research & Competitive Advantage

The global recruitment software market is projected to grow from $2.58 billion in 2022 to $5.17 billion by 2029, at a CAGR of 10.4%. Within Southeast Asia, the talent acquisition market is experiencing particularly rapid growth as companies compete for skilled talent.

#### Existing Solutions:
- **Traditional ATS Systems** (Workday, Taleo): Offer basic keyword matching but lack semantic understanding
- **Modern Platforms** (Greenhouse, Lever): Provide better UX but limited AI capabilities
- **AI Recruitment Tools** (HireVue, Pymetrics): Focus on specific aspects of recruitment but don't offer comprehensive solutions

#### Hirelah AI's Unique Advantages:
1. **Comprehensive AI Analysis**: Unlike basic keyword extraction tools, our system provides deeper candidate insights including personality assessment and skill categorization
2. **True Semantic Matching**: Our solution understands conceptual similarities rather than just keyword matching, ensuring qualified candidates aren't overlooked
3. **End-to-End Integration**: We combine resume analysis, semantic search, and AI interviews in a single platform, streamlining the entire recruitment process

### 5.2 Target Users & Value Proposition

#### Primary Users: HR Professionals and Recruiters
- **Pain Points**: Time-consuming resume screening, inconsistent candidate evaluation, difficulty finding qualified candidates
- **Value Proposition**: Reduce screening time by 70%, increase quality of matches through semantic understanding, and standardize initial interviews
- **Usage**: Daily screening of applications, candidate discovery through semantic search, automated initial interviews

#### Secondary Users: Job Seekers
- **Pain Points**: Black-box resume screening, lack of feedback, inconsistent interview experiences
- **Value Proposition**: Fairer evaluation of skills and experience, standardized interview process, quicker application processing
- **Usage**: Resume submission, AI-powered interviews, receiving feedback

## 6. Prototype Interface (Appendix)

Our interface design focuses on intuitive workflows for both recruiters and candidates:

### Landing Page
- Split journey for candidates and recruiters
- Modern gradient design with clear call-to-action buttons
- Responsive layout for all devices

### Candidate Journey
- Simple resume upload interface
- Progress tracking during AI processing
- Video interview interface with camera/microphone controls

### Recruiter Dashboard
- Talent pool with AI-powered semantic search
- Candidate cards with match percentages
- Split-view resume viewer with AI analysis
- Chat interface for asking questions about candidates

### Interview System
- Token-based secure access
- Real-time video capture
- AI conversation interface with structured questions

*Note: Full wireframes and mockups are available in the attached Figma document.*

## 7. References

- LinkedIn Global Talent Trends 2023. LinkedIn. Retrieved from https://www.linkedin.com/business/talent/blog/talent-strategy/global-talent-trends
- Google Gemini AI Documentation (2024). Google AI. https://ai.google.dev/gemini/docs
- Reimers, N., & Gurevych, I. (2019). Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks. Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing. https://arxiv.org/abs/1908.10084
- ResumeScan Market Analysis (2023). Recruitment Software Market Size, Share & Trends Analysis Report. Grand View Research.
- Raghavan, M., & Barocas, S. (2019). Challenges for mitigating bias in algorithmic hiring. Brookings Institution.

---

*This proposal provides an overview of the Hirelah AI talent acquisition system. The prototype has been implemented with core functionalities as described in the methodology section.*
