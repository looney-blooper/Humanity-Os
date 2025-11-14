import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function CarePage() {
  const getQuestions = useAuthStore((state) => state.getQuestions);
  const submitAnswers = useAuthStore((state) => state.submitAnswers);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
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

  const handleInput = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const formattedAnswers = Object.keys(answers).map((qid) => ({
        question_id: qid,
        answer: answers[qid],
      }));

      const data = await submitAnswers(formattedAnswers, file);
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
          <div key={q.id} className="p-4 border rounded-lg">
            <p className="font-semibold mb-2">
              {index + 1}. {q.question}
            </p>

            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Type your answer..."
              onChange={(e) => handleInput(q.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* IMAGE UPLOAD */}
      <div className="mt-4">
        <label className="block font-semibold mb-1">Upload a Photo (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Submit"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Emotional Assessment</h2>

          {result.summary && (
            <p className="text-gray-700 mb-2">
              <strong>Summary:</strong> {result.summary}
            </p>
          )}

          {result.emotion && (
            <p className="text-gray-700 mb-1">
              <strong>Primary Emotion:</strong> {result.emotion}
            </p>
          )}

          {result.score && (
            <p className="text-gray-700 mb-1">
              <strong>Emotional Score:</strong> {result.score}/100
            </p>
          )}

          <pre className="text-xs text-gray-500 mt-4">
            Raw Data: {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
