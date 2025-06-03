"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import Image from "next/image";


const content = [
  {
    title: "AI-Powered Resume Analysis",
    description:
      "Candidates upload their resumes, which our AI instantly scans to create a comprehensive ATS profile. This includes not only skills and experience but also personality insights, giving recruiters a holistic view of each applicant.",
    image: "/image-1.png",
  },
  {
    title: "Smart Talent Pool Search",
    description:
      "Once processed, candidates enter a dynamic talent pool. Hiring managers can perform semantic searches, finding the best matches based on skills, experience, and even personality traits, with a clear percentage match score.",
    image: "/image-2.png",
  },
  {
    title: "AI Virtual Interviews",
    description:
      "Streamline your interview process. Hiring managers can easily set up AI-powered virtual interviews that include real-time transcription, allowing for efficient review and analysis of candidate responses.",
    image: "/image-3.png",
  },
];
export function StickyScrollRevealDemo() {
  return (
    <div className="w-full py-10">
      <StickyScroll content={content} contentClassName="h-[20rem]" />
    </div>
  );
}
