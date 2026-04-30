import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserbyIDAPI, submitQueAPI } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

// interface AskQuestionPayload {
//   UserID: string;
//   VendorID: string;
//   LeadID: string;
//   Question: string;
// }

// interface ApiResponse {
//   Status: number;
//   Message: string;
//   Data?: {
//     userName?: string;
//     userPhone?: string;
//   };
// }

// ─── Helpers ──────────────────────────────────────────────────────────────────

// async function submitQuestion(
//   payload: AskQuestionPayload,
// ): Promise<ApiResponse> {
//   const res = await fetch("/api/ask-question", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err?.Message || `Request failed: ${res.status}`);
//   }

//   return res.json();
// }

interface CurrentUser {
  name: string;
  MobileNumber: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AskQuestion() {
  const navigate = useNavigate();

  // Pull IDs from route params — adjust names to match your router setup.
  // e.g. /vendor/:vendorId/lead/:leadId/ask
  const [searchParams] = useSearchParams();

  const vendorId = searchParams.get("vendorId") || "";
  const leadId = searchParams.get("lead"); // because URL has ?lead=
  const userId = searchParams.get("userId") || "";

  console.log(vendorId, leadId, userId);

  // TODO: replace with real auth context / user hook
  // const currentUser = {
  //   id: "USER_ID_FROM_AUTH",
  //   name: "Karan Yadav",
  //   phone: "91XXXXXXXXXX", // E.164 format without '+'
  // };

  const vendorName = "Celebrations by Aryan"; // TODO: pass via props or fetch

  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
  name: "",
  MobileNumber: "",
});

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      let res: any = await getUserbyIDAPI(userId);
      console.log(res);
      if (res.Status) {
        setCurrentUser(res.Data);
      }
    } catch (error) {}
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!question.trim()) return;

    if (!vendorId || !leadId) {
      setError(
        "Missing vendor or lead information. Please go back and try again.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res: any = await submitQueAPI({
        UserID: userId,
        VendorID: vendorId,
        LeadID: leadId,
        Question: question.trim(),
        Phone: currentUser.MobileNumber,
      });
      console.log(res);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">Ask a Question</h1>
          <p className="text-xs text-gray-400">We'll get back to you shortly</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
        {!submitted ? (
          <>
            {/* Vendor Card */}
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c5cbf] to-[#e84393] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                C
              </div>
              <div>
                <p className="text-xs text-gray-400">You're asking</p>
                <p className="text-sm font-bold text-gray-900">{vendorName}</p>
                <p className="text-xs text-emerald-600 font-medium">
                  ⚡ Typically responds in ~2 hrs
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-5">
              {/* User Name (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Your Name
                </label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
                  {currentUser.name}
                </div>
              </div>

              {/* Vendor Name (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Vendor Name
                </label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
                  {vendorName}
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Your Question <span className="text-pink-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition resize-none disabled:opacity-60"
                />
                <p className="text-xs text-gray-300 mt-1 text-right">
                  {question.length} characters
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || loading}
                className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Sending…
                  </>
                ) : (
                  "Send Question 🚀"
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7c5cbf] to-[#e84393] flex items-center justify-center mb-5 shadow-xl">
              <svg
                width="36"
                height="36"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Question Sent!
            </h2>

            <p className="text-gray-500 text-sm mb-1">
              Hey{" "}
              <span className="font-semibold text-gray-700">
                {currentUser.name}
              </span>
              , your question has been sent to
            </p>
            <p className="text-[#7c5cbf] font-bold text-base mb-4">
              {vendorName}
            </p>

            <div className="flex flex-col gap-3 w-full">
              {/* <button
                onClick={() => navigate(-1)}
                className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-lg"
              >
                Back to Vendor
              </button> */}
              <button
                onClick={() => {
                  setQuestion("");
                  setSubmitted(false);
                  setError(null);
                }}
                className="w-full border border-gray-200 text-gray-500 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition text-sm"
              >
                Ask Another Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
