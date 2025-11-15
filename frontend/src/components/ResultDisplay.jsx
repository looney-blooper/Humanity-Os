import { CheckCircle, AlertCircle, Brain, Heart, Lightbulb, TrendingUp, Smile, Frown, Meh, AlertTriangle } from "lucide-react";

export default function ResultDisplay({ result }) {
  if (!result) return null;

  // Check if it's an error response
  const isError = result.detail || result.error;

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-7 h-7 text-red-600" />
          Submission Error
        </h2>

        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Failed to Process</h3>
              <p className="text-red-700 text-sm">
                There was an issue processing your submission. Please try again.
              </p>
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
              View error details
            </summary>
            <pre className="text-xs text-red-600 mt-3 p-4 bg-white rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // Get sentiment icon
  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return null;
    const sentimentLower = sentiment.toLowerCase();
    if (sentimentLower.includes('positive') || sentimentLower.includes('happy')) {
      return <Smile className="w-6 h-6 text-green-600" />;
    } else if (sentimentLower.includes('negative') || sentimentLower.includes('sad')) {
      return <Frown className="w-6 h-6 text-red-600" />;
    }
    return <Meh className="w-6 h-6 text-yellow-600" />;
  };

  // Render nested object fields
  const renderObjectContent = (obj, parentKey = '') => {
    return Object.keys(obj).map((key) => {
      const value = obj[key];
      if (value === null || value === undefined) return null;

      const displayKey = key.replace(/_/g, ' ');

      return (
        <div key={`${parentKey}-${key}`} className="mb-4 last:mb-0">
          <h4 className="text-sm font-semibold text-gray-600 mb-2 capitalize">{displayKey}</h4>
          <div className="pl-3">
            {Array.isArray(value) ? (
              <ul className="space-y-2">
                {value.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span className="text-gray-700 flex-1">
                      {typeof item === "object" ? renderObjectContent(item, `${key}-${idx}`) : String(item)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : typeof value === "object" ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                {renderObjectContent(value, key)}
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{String(value)}</p>
            )}
          </div>
        </div>
      );
    });
  };

  // Get urgency color
  const getUrgencyColor = (level) => {
    if (!level) return 'gray';
    const levelLower = level.toLowerCase();
    if (levelLower === 'high' || levelLower === 'urgent') return 'red';
    if (levelLower === 'medium') return 'yellow';
    return 'green';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <CheckCircle className="w-7 h-7 text-green-600" />
        Assessment Complete
      </h2>

      <div className="space-y-4">
        {/* Success message */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <p className="text-gray-700 font-medium">
            Your emotional assessment has been successfully submitted and analyzed.
          </p>
        </div>

        {/* Facial Analysis (if exists) */}
        {(result.facial_emotion || result.facial_confidence) && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-sm">
            <h3 className="text-xl font-bold text-purple-900 mb-4">Facial Analysis</h3>
            <div className="space-y-3">
              {result.facial_emotion && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Facial Emotion</h4>
                  <p className="text-gray-800 text-base font-medium capitalize">{result.facial_emotion}</p>
                </div>
              )}
              {result.facial_confidence && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Facial Confidence</h4>
                  <p className="text-gray-800 text-base font-medium">{result.facial_confidence}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mood Assessment (object) */}
        {result.mood_assessment && typeof result.mood_assessment === 'object' && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-200 shadow-sm">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Mood Assessment
            </h3>
            <div className="bg-white p-5 rounded-lg">
              {renderObjectContent(result.mood_assessment)}
            </div>
          </div>
        )}

        {/* Response (object) */}
        {result.response && typeof result.response === 'object' && (
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200 shadow-sm">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Response
            </h3>
            <div className="space-y-4">
              {/* Empathetic Message */}
              {result.response.empathetic_message && (
                <div className="bg-white p-5 rounded-lg border-l-4 border-green-500">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Message</h4>
                  <p className="text-gray-700 leading-relaxed italic">{result.response.empathetic_message}</p>
                </div>
              )}

              {/* Recommendations */}
              {result.response.recommendations && Array.isArray(result.response.recommendations) && (
                <div className="bg-white p-5 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {result.response.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 flex-1 pt-0.5">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {result.response.resources && Array.isArray(result.response.resources) && (
                <div className="bg-white p-5 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Resources</h4>
                  <ul className="space-y-2">
                    {result.response.resources.map((res, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-500 mt-1">•</span>
                        <span className="text-gray-700 flex-1">{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Urgency Level */}
              {result.response.urgency_level && (
                <div className="bg-white p-5 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Urgency Level</h4>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 text-${getUrgencyColor(result.response.urgency_level)}-600`} />
                    <span className={`text-base font-semibold capitalize text-${getUrgencyColor(result.response.urgency_level)}-700`}>
                      {result.response.urgency_level}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legacy fields */}
        {result.emotional_state && !result.mood_assessment && (
          <div className="bg-white p-6 rounded-xl border-2 border-indigo-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Emotional State</h4>
            <p className="text-gray-800 text-base font-medium">{result.emotional_state}</p>
          </div>
        )}

        {result.analysis && !result.mood_assessment && (
          <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Analysis</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.analysis}</p>
          </div>
        )}

        {/* Additional unknown fields */}
        {Object.keys(result)
          .filter(
            (key) =>
              ![
                "emotional_state",
                "analysis",
                "recommendations",
                "mood_score",
                "sentiment",
                "detail",
                "error",
                "facial_emotion",
                "facial_confidence",
                "mood_assessment",
                "response"
              ].includes(key)
          )
          .map((key) => {
            const value = result[key];
            if (value === null || value === undefined) return null;

            return (
              <div
                key={key}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm"
              >
                <h3 className="text-base font-semibold text-gray-700 mb-3 capitalize">
                  {key.replace(/_/g, " ")}
                </h3>
                <div className="pl-2">
                  {typeof value === "object" && !Array.isArray(value) ? (
                    renderObjectContent(value, key)
                  ) : Array.isArray(value) ? (
                    <ul className="space-y-2">
                      {value.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700 flex-1">
                            {typeof item === "object" ? renderObjectContent(item, `${key}-${idx}`) : String(item)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{String(value)}</p>
                  )}
                </div>
              </div>
            );
          })}

        {/* Collapsible raw data */}
        <details className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <span>🔍</span>
            View complete response data
          </summary>
          <pre className="text-xs text-gray-600 mt-3 p-4 bg-white rounded-lg overflow-auto border border-gray-200 max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}