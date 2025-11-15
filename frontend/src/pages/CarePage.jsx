import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import ResultDisplay from "../components/ResultDisplay"; // or wherever you save the component

export default function CarePage() {
  const getQuestions = useAuthStore((state) => state.getQuestions);
  const submitAnswers = useAuthStore((state) => state.submitAnswers);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [stream, setStream] = useState(null);

  const navigate = useNavigate();

  // CAMERA REFS
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch questions on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getQuestions();
        setQuestions(data.questions);
      } catch (e) {
        console.error("Failed to load questions:", e);
        alert("Failed to load questions. Please try again later.");
        navigate("/dashboard");
      } finally {
        setQuestionsLoading(false);
      }
    }
    load();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start camera - FIXED FOR PREVIEW
  const startCamera = async () => {
    try {
      console.log("Requesting camera access...");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      console.log("Camera access granted, stream:", mediaStream);
      
      setStream(mediaStream);
      setCameraActive(true);
      
      // Small delay to ensure state updates
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);
      
    } catch (err) {
      console.error("Camera error:", err);
      alert(`Camera error: ${err.message}. Please allow camera permissions.`);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log("Track stopped:", track);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture image - REWRITTEN
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    console.log("Video dimensions:", video.videoWidth, video.videoHeight);

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("Video not ready. Please wait a moment and try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    console.log("Image captured, base64 length:", base64.length);
    
    setCapturedImage(base64);
    stopCamera();
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Handle answers
  const handleInput = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  // Check all questions answered
  const allAnswered =
    questions.length > 0 &&
    questions.every((_, i) => answers[i] && answers[i].trim() !== "");

  const handleSubmit = async () => {
    if (!capturedImage) {
      return alert("Please capture your photo before submitting.");
    }
    if (!allAnswered) {
      return alert("Please answer all questions before submitting.");
    }

    setLoading(true);

    try {
      const QAs = questions.map((q, index) => ({
        question: q,
        answer: answers[index] || "",
      }));

      const data = await submitAnswers(QAs, capturedImage);
      setResult(data);
    } catch (e) {
      console.error("Submit error:", e);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-[#0b0b0b] rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Emotional Assessment
          </h1>
          <p className="">
            Please answer all questions honestly and capture a clear photo of yourself.
          </p>
        </div>

        {/* Questions Section */}
        <div className="bg-[#0b0b0b] rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold  mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              1
            </div>
            Assessment Questions
          </h2>

          <div className="space-y-4">
            {questionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <p className=" text-center py-8">No questions available.</p>
            ) : (
              questions.map((q, index) => (
                <div
                  key={index}
                  className="bg-[#0b0b0b] p-5 rounded-xl border border-white/20 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium  mb-3">{q}</p>
                      <textarea
                        className=" w-full border-2 border-white/10 p-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
                        placeholder="Type your answer here..."
                        rows="3"
                        onChange={(e) => handleInput(index, e.target.value)}
                        value={answers[index] || ""}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-[#0b0b0b] rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold  mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              2
            </div>
            Capture Your Photo
          </h2>

          {!capturedImage && !cameraActive && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                <Camera className="w-10 h-10 text-purple-600" />
              </div>
              <p className=" mb-4">
                We need a clear photo of your face for emotional analysis
              </p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-4 border-indigo-200 bg-gray-900" style={{ minHeight: "400px" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: "100%", 
                    height: "auto",
                    minHeight: "400px",
                    objectFit: "cover"
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={captureImage}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Photo captured successfully!</span>
              </div>
              <div className="relative rounded-xl overflow-hidden border-4 border-green-200">
                <img
                  src={`data:image/jpeg;base64,${capturedImage}`}
                  alt="Captured"
                  className="w-full"
                  style={{ maxHeight: "500px", objectFit: "cover" }}
                />
              </div>
              <button
                onClick={retakePhoto}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Retake Photo
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="bg-[#0b0b0b] rounded-2xl shadow-lg p-6 mb-6">
          {(!allAnswered || !capturedImage) && (
            <div className="flex items-start gap-3 text-amber-700 bg-white/10 p-4 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Before submitting:</p>
                <ul className="list-disc list-inside space-y-1">
                  {!allAnswered && <li>Answer all questions</li>}
                  {!capturedImage && <li>Capture your photo</li>}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !allAnswered || !capturedImage}
            className={`w-full px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold text-lg transition-all shadow-lg ${
              loading || !allAnswered || !capturedImage
                ? "opacity-60 cursor-not-allowed"
                : " hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing your responses...
              </span>
            ) : (
              "Submit Assessment"
            )}
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <ResultDisplay result={result} />
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </div>
  );
}