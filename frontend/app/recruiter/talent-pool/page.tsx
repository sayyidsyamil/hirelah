"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LucideSearch, LucideSlidersHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

type Candidate = {
  id: string | number;
  name: string;
  role?: string;
  avatar?: string;
  skills?: { soft_skills?: string[]; languages?: string[]; frameworks_libraries?: string[]; tools_platforms?: string[]; APIs?: string[] } | null | undefined;
  pdfUrl?: string;
  match?: number; // Match percentage from semantic search
  employment_type?: string;
  location_preference?: string;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    end_year: string;
    cgpa: string;
    honors: string[];
  }>;
  experience?: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    duration: string;
    description: string;
    technologies: string[];
  }>;
  meeting_id?: string | null; // New attribute
  status?: string | null; // New attribute
  [key: string]: any;
};

export default function TalentPool() {
  const [search, setSearch] = useState("");
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [inviteCandidate, setInviteCandidate] = useState<Candidate | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [filtered, setFiltered] = useState<Candidate[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Default email body
  const [emailBody, setEmailBody] = useState(
    "Dear [Candidate],\n\nWe are pleased to invite you to the next stage of our hiring process at Hirela AI. Please follow the instructions in this email to schedule your AI-powered interview.\n\nBest regards,\nThe Hirela AI Team"
  );

  // Load candidates JSON
  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await import("@/lib/talent-pool.json");
        const candidates = (data.default || data).map((c: any, index: number) => ({
          ...c,
          id: c.id || `candidate-${index}-${crypto.randomUUID()}`, // Ensure unique ID
          pdfUrl: c.pdfUrl || "/placeholder.pdf", // Placeholder PDF URL
        }));
        if (Array.isArray(candidates)) {
          setAllCandidates(candidates);
          setFiltered(candidates);
        } else {
          setAllCandidates([]);
          setFiltered([]);
          console.error("Candidates data is not an array");
        }
      } catch (err) {
        console.error("Failed to load candidate pool JSON", err);
        setAllCandidates([]);
        setFiltered([]);
      }
    }
    loadCandidates();
  }, []);

  // Debounced semantic search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!search.trim()) {
        setFiltered(allCandidates.map(c => ({ ...c, match: undefined }))); // Clear match for all candidates
        return;
      }

      const currentQuery = search.trim();
      try {
        const res = await fetch("/api/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: currentQuery, candidates: allCandidates }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setFiltered(data);
        } else {
          setFiltered([]);
        }
      } catch (error: any) {
        console.error("Semantic search failed:", error);
        if (error.message.includes("Similarity API backend is not set up")) {
          toast.error("Backend is not set up. Please set up the Similarity API backend.");
        }
        // Fallback to local filter if API fails or for initial load without search
        const lowerSearch = search.toLowerCase();
        setFiltered(
          allCandidates.filter(
            (c) =>
              (c.name?.toLowerCase().includes(lowerSearch) ?? false) ||
              (c.role?.toLowerCase().includes(lowerSearch) ?? false) ||
              (c.skills?.soft_skills && Array.isArray(c.skills.soft_skills) && c.skills.soft_skills.some((skill) => skill.toLowerCase().includes(lowerSearch)))
          ).map(c => ({ ...c, match: 0 })) // Set match to 0 for locally filtered items if API fails
        );
      }
    }, 300);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, allCandidates]);

  // Fetch AI analysis when candidate preview changes
  useEffect(() => {
    if (!previewCandidate) return;

    setAiLoading(true);
    setAiAnalysis(null);

    fetch("/api/ai-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsed: previewCandidate }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAiAnalysis(data.analysis ?? "No analysis available.");
      })
      .catch(() => setAiAnalysis("Failed to load AI analysis."))
      .finally(() => setAiLoading(false));
  }, [previewCandidate]);

  // Reset chat on candidate change
  useEffect(() => {
    if (previewCandidate) {
      setChatHistory([{ role: "system", content: "Ask any question about this candidate's resume!" }]);
      setChatInput("");
    }
  }, [previewCandidate]);

  async function handleChatSend() {
    if (!chatInput.trim() || !previewCandidate) return;

    const newHistory = [...chatHistory, { role: "user", content: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/candidate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: previewCandidate, history: newHistory }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.answer || "No answer." }]);
    } catch {
      setChatHistory([...newHistory, { role: "assistant", content: "Failed to get answer." }]);
    } finally {
      setChatLoading(false);
    }
  }


  async function handleInvite(candidate: Candidate | null) {
    if (!candidate || !candidate.id) return;

    const interviewId = uuidv4();
    const interviewStatus = "interview sent";
    const interviewUrl = `${window.location.origin}/interview/${interviewId}`;

    try {
      const res = await fetch("/api/update-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: candidate.id,
          email: candidate.email, // Add email to the request body
          meeting_id: interviewId,
          status: interviewStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Update the local state to reflect the change
      setAllCandidates(prevCandidates =>
        prevCandidates.map(c =>
          c.id === candidate.id ? { ...c, meeting_id: interviewId, status: interviewStatus } : c
        )
      );
      setFiltered(prevFiltered =>
        prevFiltered.map(c =>
          c.id === candidate.id ? { ...c, meeting_id: interviewId, status: interviewStatus } : c
        )
      );
      setPreviewCandidate(prevPreview =>
        prevPreview?.id === candidate.id ? { ...prevPreview, meeting_id: interviewId, status: interviewStatus } : prevPreview
      );


      toast.success("Email sent to candidate");
      await navigator.clipboard.writeText(interviewUrl);
      toast.info("Interview URL copied to clipboard!");

    } catch (error) {
      console.error("Failed to send invitation or update candidate:", error);
      toast.error("Failed to send invitation.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-gray-800 bg-gray-50">
      {/* Candidate Details Dialog */}
      <Dialog open={!!previewCandidate} onOpenChange={(open) => !open && setPreviewCandidate(null)}>
          <DialogContent className="max-w-7xl min-w-[80vw] max-h-[90vh] p-6 md:p-8 bg-white rounded-xl text-gray-800">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center w-full">
                <DialogTitle className="text-2xl font-bold text-gray-800">Candidate Details</DialogTitle>
                <Button onClick={() => setInviteCandidate(previewCandidate)} className="px-6 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white">Send Invitation</Button>
              </div>
              <DialogDescription className="text-md text-gray-600 mt-1">Resume and AI-powered Q&A</DialogDescription>
            </DialogHeader>

          {previewCandidate && (
            <div className="flex flex-col md:flex-row gap-6 w-full pt-4">
              {/* Resume PDF */}
              <div className="flex flex-col items-center justify-center w-full md:w-3/4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="font-semibold text-gray-700 mb-3">Submitted Resume (PDF)</div>
                {previewCandidate.pdfUrl ? (
                  <iframe
                    src={previewCandidate.pdfUrl}
                    title="Candidate Resume PDF"
                    className="w-full h-[50vh] border border-gray-300 rounded-md shadow-sm"
                  />
                ) : (
                  <div className="text-muted-foreground text-sm text-gray-500 h-[50vh] flex items-center justify-center">No PDF available for this candidate.</div>
                )}
              </div>

              {/* Chatbot */}
              <div className="flex flex-col h-[60vh] w-full md:w-1/4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="font-semibold text-gray-700 mb-3">Ask about this candidate</div>
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-md p-3 mb-3 border border-gray-200 text-sm text-gray-800 custom-scrollbar">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg max-w-[85%] ${
                          msg.role === "user" ? "bg-[#f6339a] text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.content}
                      </span>
                    </div>
                  ))}
                  {chatLoading && <div className="text-xs text-gray-500 mt-2">AI is thinking...</div>}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleChatSend();
                    }}
                    placeholder="Ask something..."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[#ad46ff] focus:border-[#ad46ff] bg-white text-gray-800"
                  />
                  <Button onClick={handleChatSend} disabled={chatLoading} className="px-4 py-2 rounded-md bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Invitation Dialog */}
      <Dialog open={!!inviteCandidate} onOpenChange={(open) => !open && setInviteCandidate(null)}>
          <DialogContent className="max-w-2xl p-6 bg-white rounded-xl text-gray-800">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">Send Interview Invitation</DialogTitle>
              <DialogDescription className="mt-1 text-gray-600">
                Customize the invitation email body below.
              </DialogDescription>
            </DialogHeader>

          <Textarea
            rows={10}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="my-6 border border-gray-300 rounded-md p-3 focus:ring-[#ad46ff] focus:border-[#ad46ff] bg-white text-gray-800"
          />

          <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setInviteCandidate(null)}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleInvite(inviteCandidate); // Pass the full candidate object
                setInviteCandidate(null);
              }}
              className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative w-full max-w-2xl mb-8 group">
        <div className="p-[2px] rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-sm transition-all duration-300 ease-in-out group-hover:shadow-md">
          <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10" size={20} />
          <Input
            type="search"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
            autoComplete="off"
            spellCheck={false}
          />
          
        </div>
      </div>

      {/* Candidate List */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 max-w-6xl w-full">
        {filtered.length === 0 && <p className="break-inside-avoid-column">No candidates found.</p>}
        {filtered.map((candidate) => (
          <div
            key={candidate.id}
            className="p-[2px] rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg group mb-6 break-inside-avoid-column"
          >
            <Card
              className="cursor-pointer bg-white rounded-xl"
              onClick={() => setPreviewCandidate(candidate)}
            >
              <CardContent className="flex flex-col p-5 text-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-purple-400 p-0.5">
                      {candidate.avatar ? (
                        <AvatarImage src={candidate.avatar} alt={candidate.name} className="rounded-full object-cover w-full h-full" />
                      ) : (
                        <div className="bg-gray-200 text-gray-700 w-full h-full flex items-center justify-center rounded-full text-2xl font-semibold">
                          {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{candidate.name || "Unknown Candidate"}</h3>
                    </div>
                  </div>
                  {candidate.match !== undefined && (
                    <div className="flex flex-col items-center text-purple-600 font-bold text-lg">
                      <span className="text-3xl">{candidate.match}%</span>
                      <span className="text-sm">Match</span>
                    </div>
                  )}
                </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.soft_skills && Array.isArray(candidate.skills.soft_skills) && candidate.skills.soft_skills.length > 0 && candidate.skills.soft_skills.map((skill, i) => (
                    <Badge key={`soft-${i}`} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills?.languages && Array.isArray(candidate.skills.languages) && candidate.skills.languages.length > 0 && candidate.skills.languages.map((skill, i) => (
                    <Badge key={`lang-${i}`} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills?.frameworks_libraries && Array.isArray(candidate.skills.frameworks_libraries) && candidate.skills.frameworks_libraries.length > 0 && candidate.skills.frameworks_libraries.map((skill, i) => (
                    <Badge key={`framework-${i}`} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills?.tools_platforms && Array.isArray(candidate.skills.tools_platforms) && candidate.skills.tools_platforms.length > 0 && candidate.skills.tools_platforms.map((skill, i) => (
                    <Badge key={`tool-${i}`} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills?.APIs && Array.isArray(candidate.skills.APIs) && candidate.skills.APIs.length > 0 && candidate.skills.APIs.map((skill, i) => (
                    <Badge key={`api-${i}`} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                  {(!candidate.skills || (
                    (!candidate.skills.soft_skills || candidate.skills.soft_skills.length === 0) &&
                    (!candidate.skills.languages || candidate.skills.languages.length === 0) &&
                    (!candidate.skills.frameworks_libraries || candidate.skills.frameworks_libraries.length === 0) &&
                    (!candidate.skills.tools_platforms || candidate.skills.tools_platforms.length === 0) &&
                    (!candidate.skills.APIs || candidate.skills.APIs.length === 0)
                  )) && (
                    <span className="text-sm text-gray-500 italic">No skills listed</span>
                  )}
                </div>
              </div>
            </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
