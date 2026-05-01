import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserbyIDAPI, getVenderById, submitQueAPI } from "../services/api";

interface CurrentUser {
  name: string;
  MobileNumber: string;
}

export default function AskQuestion() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("vendorId") || "";
  const leadId = searchParams.get("lead") || "";
  const userId = searchParams.get("userId") || "";

  const [question, setQuestion] = useState("");
  const [userName, setUserName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    name: "",
    MobileNumber: "",
  });

  const [vendor, setVendor] = useState({
    name: "",
    ResponseTime: "",
  });

  useEffect(() => {
    fetchUser();
    fetchVender();
  }, []);

  const fetchUser = async () => {
    try {
      let res: any = await getUserbyIDAPI(userId);
      if (res.Status) {
        setCurrentUser(res.Data);
        // Pre-fill the editable name with whatever the API returns
        setUserName(res.Data.name || "");
      }
    } catch (error) {}
  };

  const fetchVender = async () => {
    try {
      let res: any = await getVenderById(vendorId);
      if (res.Status) {
        setVendor(res.Data);
      }
    } catch (error) {}
  };

  const handleSubmit = async () => {
    // Name is required — validate before anything else
    if (!userName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    if (!question.trim()) return;

    if (!vendorId || !leadId) {
      setError("Missing vendor or lead information. Please go back and try again.");
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
        UserName: userName.trim(),
      });
      console.log(res);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = userName.trim() && question.trim() && !loading;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
                {vendor.name?.[0]?.toUpperCase() || "V"}
              </div>
              <div>
                <p className="text-xs text-gray-400">You're asking</p>
                <p className="text-sm font-bold text-gray-900">{vendor.name}</p>
                <p className="text-xs text-emerald-600 font-medium">
                  ⚡ Typically responds {vendor.ResponseTime}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-5">

              {/* Your Name — always editable, pre-filled from API */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Your Name <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (nameError && e.target.value.trim()) setNameError(false);
                  }}
                  disabled={loading}
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                    nameError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50"
                      : "border-gray-200 focus:border-[#7c5cbf] focus:ring-[#7c5cbf]/10"
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    Please enter your name to continue
                  </p>
                )}
              </div>

              {/* Vendor Name (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Vendor Name
                </label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
                  {vendor.name}
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

              {/* API Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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
              <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Question Sent!</h2>

            <p className="text-gray-500 text-sm mb-1">
              Hey{" "}
              <span className="font-semibold text-gray-700">{userName}</span>
              , your question has been sent to
            </p>
            <p className="text-[#7c5cbf] font-bold text-base mb-8">{vendor.name}</p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  setQuestion("");
                  setSubmitted(false);
                  setError(null);
                  setNameError(false);
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