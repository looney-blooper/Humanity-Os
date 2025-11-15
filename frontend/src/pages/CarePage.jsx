import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function CarePage() {
  const getQuestions = useAuthStore((state) => state.getQuestions);
  const submitAnswers = useAuthStore((state) => state.submitAnswers);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
      }
    }
    load();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Cannot access camera. Please allow permissions.");
    }
  };

  // Capture image
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
    setCapturedImage(base64);

    // stop camera
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setCameraActive(false);
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

      const data = await submitAnswers(QAs, capturedImage); // ⚠ send base64 string directly
      setResult(data);
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-4">
      <h1 className="text-2xl font-bold mb-4">Emotional Assessment</h1>

      {/* QUESTIONS */}
      <div className="space-y-4">
        {questions.length === 0 && <p>Loading questions…</p>}

        {questions.map((q, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <p className="font-semibold mb-2">
              {index + 1}. {q}
            </p>

            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Type your answer..."
              onChange={(e) => handleInput(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* CAMERA */}
      <div className="mt-6">
        {!capturedImage && !cameraActive && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Open Camera
          </button>
        )}

        {cameraActive && (
          <div className="mt-4">
            <video ref={videoRef} autoPlay className="w-full rounded border" />
            <button
              onClick={captureImage}
              className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded"
            >
              Capture Photo
            </button>
          </div>
        )}

        {capturedImage && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Captured Image:</h3>
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Captured"
              className="w-full rounded border"
            />
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading || !allAnswered || !capturedImage}
        className={`mt-6 px-4 py-2 rounded text-white ${
          loading || !allAnswered || !capturedImage
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Analyzing..." : "Submit"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Emotional Assessment</h2>

          <pre className="text-xs text-gray-500 mt-4">
            Raw Data: {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
}
  