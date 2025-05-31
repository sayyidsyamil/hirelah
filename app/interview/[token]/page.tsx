"use client"

import { useEffect, useRef, useState } from "react"
// Removed useParams as token is no longer used
import { Video, VideoOff, Mic, MicOff, Play } from "lucide-react"

interface ChatMessage {
  role: "user" | "ai"
  text: string
  // audioBase64 is no longer needed as we don't process AI audio
}

// blobToBase64 function is removed as it's not needed

export default function VirtualInterviewPage() {
  // Removed token, mediaRecorderRef, audioChunksRef
  const videoRef = useRef<HTMLVideoElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  // interview state can be simplified or set to a placeholder if needed for conditional rendering
  const [interview, setInterview] = useState<any>({}) // Assuming interview always "exists" for UI demo
  const [loading, setLoading] = useState(false) // Start with loading false for UI demo
  const [started, setStarted] = useState(false)
  // 'recording' state now just for the visual badge, not actual MediaRecorder
  const [isRecordingVisual, setIsRecordingVisual] = useState(true) // To show "RECORDING" badge
  // Removed processing, lastAIAudio, audioError states

  const [chat, setChat] = useState<ChatMessage[]>([
    { role: "ai", text: "Hello! Welcome to your virtual interview for the AI Python Internship at Hilti. Let's begin. Can you tell me about your experience with Python and AI?" },
    { role: "user", text: "Certainly! I have a strong background in Python, having used it extensively for data analysis and machine learning projects. I've worked with libraries like TensorFlow and PyTorch for building and training models." },
    { role: "ai", text: "That's great to hear. Could you elaborate on a specific AI project where you applied your Python skills? Perhaps one where you faced a significant challenge and how you overcame it?" },
    { role: "user", text: "Absolutely. In a recent project, I developed a sentiment analysis model for customer feedback. The main challenge was dealing with imbalanced datasets and noisy text data. I addressed this by using advanced preprocessing techniques and experimenting with different sampling methods to balance the classes, which significantly improved the model's accuracy." },
  ])
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)

  // Removed useEffect for fetchInterview

  // useEffect to get user media (camera and mic)
  useEffect(() => {
    if (!started || !videoRef.current) return

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
          // Initially, ensure tracks match the camOn and micOn states
          s.getVideoTracks().forEach((track) => (track.enabled = camOn));
          s.getAudioTracks().forEach((track) => (track.enabled = micOn));
        }
      })
      .catch(error => {
        console.error("Error accessing media devices.", error)
        // You might want to set an error state here to inform the user
      })

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [started]) // Removed camOn, micOn from dependencies here to avoid re-fetching stream

  // Removed useEffect for lastAIAudio playback
  // Removed useEffect for MediaRecorder setup and audio processing

  const toggleCamera = () => {
    const newCamOn = !camOn;
    stream?.getVideoTracks().forEach((track) => (track.enabled = newCamOn))
    setCamOn(newCamOn)
  }

  const toggleMic = () => {
    const newMicOn = !micOn;
    stream?.getAudioTracks().forEach((track) => (track.enabled = newMicOn))
    setMicOn(newMicOn)
    // If you want the "RECORDING" badge to depend on the mic, you can adjust setIsRecordingVisual here.
    // For this example, it stays on visually regardless of mic state, as per original.
  }

  const handleStart = () => {
    setStarted(true)
    // By default, ensure camera and mic are enabled visually and on stream if stream exists
    // The useEffect for getUserMedia will handle enabling them based on initial camOn/micOn
  }

  if (loading) { // This screen will likely not show with loading set to false initially
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-700 font-medium text-lg">Preparing your interview...</p>
        </div>
      </div>
    )
  }

  // Simplified "interview not found" logic, assumes interview object is present for UI demo
  // if (!interview) { ... }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Start Screen Overlay */}
      {!started && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-md bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-3xl">🎯</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Ready to begin?</h1>
              <p className="text-base text-gray-600">
                Your virtual interview is about to start. Ensure your camera and microphone are working.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
            >
              <Play size={20} />
              Start Interview
            </button>
          </div>
        </div>
      )}

      {/* Main Interview Interface */}
      {started && (
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 relative bg-black rounded-lg overflow-hidden shadow-xl">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />

              {/* Non-interactive Overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {/* User Label */}
                <div className="absolute bottom-6 left-4">
                  <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-sm font-medium shadow">
                    You
                  </div>
                </div>

                {/* Recording Badge - stays if isRecordingVisual is true */}
                {isRecordingVisual && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 shadow">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>RECORDING</span>
                    </div>
                  </div>
                )}

                {/* AI Avatar */}
                <div className="absolute top-4 right-4 flex flex-col items-center space-y-1.5">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium shadow">
                    Maya AI
                  </div>
                </div>

                {/* Processing Indicator Removed */}
              </div>

              {/* Interactive Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md text-white rounded-xl p-2 shadow-xl">
                  <button
                    onClick={toggleCamera}
                    title={camOn ? "Turn camera off" : "Turn camera on"}
                    className={`p-3 rounded-lg transition-all duration-200 hover:bg-white/20 ${
                      camOn ? "text-white" : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {camOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button
                    onClick={toggleMic}
                    title={micOn ? "Mute microphone" : "Unmute microphone"}
                    className={`p-3 rounded-lg transition-all duration-200 hover:bg-white/20 ${
                      micOn ? "text-white" : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="w-80 lg:w-96 bg-white border-l border-gray-300 flex flex-col shadow-lg">
            {/* Header */}
            <div className="p-4 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
              <p className="text-sm text-gray-500 mt-1">Live transcript of your interview</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {/* Removed processing placeholder for user message */}
            </div>

            {/* Audio Error Removed */}
          </div>
        </div>
      )}
    </div>
  )
}