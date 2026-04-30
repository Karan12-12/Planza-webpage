import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AskQuestion() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "Karan Yadav", question: "" });
  const [submitted, setSubmitted] = useState(false);
  const vendorName = "Celebrations by Aryan";

  const handleSubmit = () => {
    if (!form.userName.trim() || !form.question.trim()) return;
    setSubmitted(true);
  };

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
              {/* User Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Your Name
                </label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
                  {form.userName}
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
                  // placeholder="e.g. Do you offer outdoor setups for proposals? What's the minimum budget for a rooftop birthday event?"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition resize-none"
                />
                <p className="text-xs text-gray-300 mt-1 text-right">
                  {form.question.length} characters
                </p>
              </div>

              {/* Tips */}
              {/* <div className="bg-[#f9f5ff] border border-[#e8d9ff] rounded-xl p-3">
                <p className="text-xs font-semibold text-[#7c5cbf] mb-1">💡 Good questions to ask</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• What is included in the base package?</li>
                  <li>• Can you accommodate last-minute bookings?</li>
                  <li>• Do you provide a mood board before the event?</li>
                </ul>
              </div> */}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!form.userName.trim() || !form.question.trim()}
                className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Question 🚀
              </button>
            </div>

            {/* <p className="text-center text-xs text-gray-300 mt-4">
              Your contact info is kept private and shared only with the vendor.
            </p> */}
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
                {form.userName}
              </span>
              , your question has been sent to
            </p>
            <p className="text-[#7c5cbf] font-bold text-base mb-6">
              {vendorName}
            </p>
            {/* <div className="bg-white rounded-2xl shadow-sm p-4 w-full text-left mb-8 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Your question</p>
              <p className="text-sm text-gray-700 leading-relaxed italic">"{form.question}"</p>
            </div> */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-lg"
              >
                Back to Vendor
              </button>
              <button
                onClick={() => {
                  setForm({ userName: "", question: "" });
                  setSubmitted(false);
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
