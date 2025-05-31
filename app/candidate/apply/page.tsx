"use client";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

export default function CandidateUpload() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function processFile(file: File) {
    setLoading(true);
    setDone(false);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process resume");
      }

      const data = await res.json();
      console.log("API response:", data);

      setDone(true);
    } catch (err) {
      console.error("Error processing file", err);
      // Optionally, add some error UI here if you want
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(files: File[]) {
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-white max-w-md mx-auto text-center space-y-6">
      {!done ? (
        <>
          <h2 className="text-3xl font-bold text-gray-900">Upload Your Resume</h2>
          <p className="text-gray-500 text-lg">
            Let Hirelah analyze your skills and experience to find your perfect job match.
          </p>
          <div className="w-full">
            <Label htmlFor="resume" className="text-base text-gray-700 mb-2 block">
              Resume (PDF, DOCX)
            </Label>
            <FileUpload disabled={loading} onChange={handleFileUpload} />
          </div>

          {loading && (
            <div className="flex flex-col items-center space-y-2 mt-4">
              <svg
                className="animate-spin h-10 w-10 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="text-gray-600">Processing your resume...</p>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Thank you!</h2>
          <p className="text-gray-700 text-lg">
            Your resume has been uploaded and is being analyzed.
          </p>
        </div>
      )}
    </div>
  );
}
