import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Config ───────────────────────────────────────────────────────────────────

const UPLOADS_BASE_URL = import.meta.env.VITE_BASE_URL_FOR_FILE ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceMapping {
  service_id: string;
  subcategory_id: string;
  ServiceName: string;
  SubServiceName: string;
}

interface PortfolioEntry {
  ID: string;
  EventName: string;
  EventDate: string;
  location: string;
  ServiceID: string;
  SubServiceID: string;
  EventBrief: string;
  StartingBudget: string;
  ThumnailFileName: string | null;
  Detail: {
    Images: string[];
    Videos: string[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileUrl(filename: string | null | undefined): string | null {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${UPLOADS_BASE_URL}/uploads/vendor/portfolio/images/${filename}`;
}

function fileUrlForVideo(filename: string | null | undefined): string | null {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${UPLOADS_BASE_URL}/uploads/vendor/portfolio/videos/${filename}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Like Button ──────────────────────────────────────────────────────────────

function LikeButton({ size = "sm" }: { id: string; size?: "sm" | "lg" }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(Math.floor(Math.random() * 30) + 5);
  const s = size === "lg" ? 22 : 16;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);
      }}
      className={`flex items-center gap-1 transition ${liked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"}`}
    >
      <svg width={s} height={s} fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className={`font-semibold ${size === "lg" ? "text-sm" : "text-xs"}`}>{count}</span>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioDetail() {
  // const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // VendorProfile passes the already-fetched entry via route state —
  // zero additional network requests needed.
  const { portfolioEntry, serviceMappings } = (location.state ?? {}) as {
    portfolioEntry?: PortfolioEntry;
    serviceMappings?: ServiceMapping[];
  };

  const [lightbox, setLightbox] = useState<{ type: "image" | "video"; src: string } | null>(null);

  // ── Resolve category names from service mapping ────────────────────────────

  const serviceMap = Object.fromEntries(
    (serviceMappings ?? []).map((s) => [s.service_id, s])
  );

  console.log(serviceMap)

  const categoryName =
    serviceMap[portfolioEntry?.ServiceID ?? ""]?.ServiceName ?? portfolioEntry?.ServiceID ?? "—";
  const subCategoryName =
    serviceMap[portfolioEntry?.ServiceID ?? ""]?.SubServiceName ?? portfolioEntry?.SubServiceID ?? "—";

  // ── Resolve file URLs ──────────────────────────────────────────────────────

  const images = (portfolioEntry?.Detail?.Images ?? [])
    .map(fileUrl)
    .filter(Boolean) as string[];

  const videos = (portfolioEntry?.Detail?.Videos ?? [])
    .map(fileUrlForVideo)
    .filter(Boolean) as string[];

  // ── Not found (navigated directly without state) ───────────────────────────

  if (!portfolioEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Portfolio not found</p>
          <button onClick={() => navigate(-1)} className="text-[#7c5cbf] font-semibold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 transition">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#7c5cbf] font-semibold">{categoryName} · {subCategoryName}</p>
          <h1 className="text-base font-bold text-gray-900 truncate">{portfolioEntry.EventName}</h1>
        </div>
        <LikeButton id={`event-${portfolioEntry.ID}`} size="lg" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-12">
        {/* Event Meta */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Event Date</p>
              <p className="text-sm font-bold text-gray-800">
                📅 {formatDate(portfolioEntry.EventDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Location</p>
              <p className="text-sm font-bold text-gray-800">
                📍 {portfolioEntry.location || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Category</p>
              <p className="text-sm font-bold text-gray-800">🎯 {categoryName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sub-Category</p>
              <p className="text-sm font-bold text-gray-800">🏷️ {subCategoryName}</p>
            </div>
            {portfolioEntry.StartingBudget && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                <p className="text-sm font-bold text-gray-800">💰 ₹{portfolioEntry.StartingBudget}</p>
              </div>
            )}
          </div>
          {portfolioEntry.EventBrief && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-1">About this Event</p>
              <p className="text-sm text-gray-600 leading-relaxed">{portfolioEntry.EventBrief}</p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">
              📷 Photos <span className="text-gray-400 font-normal">({images.length})</span>
            </h2>
          </div>
          {images.length === 0 ? (
            <p className="text-xs text-gray-400">No photos uploaded.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden cursor-pointer group ${i === 0 ? "col-span-2 h-52" : "h-32"}`}
                  onClick={() => setLightbox({ type: "image", src })}
                >
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <LikeButton id={`img-${portfolioEntry.ID}-${i}`} />
                  </div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition bg-white/70 rounded-full p-1">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        {videos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              🎬 Videos <span className="text-gray-400 font-normal">({videos.length})</span>
            </h2>
            <div className="flex flex-col gap-3">
              {videos.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100">
                  <video src={src} controls className="w-full rounded-xl" style={{ maxHeight: 260 }} preload="metadata" />
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="text-xs text-gray-400 font-medium">Video {i + 1}</span>
                    <div className="bg-gray-100 rounded-full px-3 py-1">
                      <LikeButton id={`vid-${portfolioEntry.ID}-${i}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition" onClick={() => setLightbox(null)}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {lightbox.type === "image" && (
            <img src={lightbox.src} alt="Full view" className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
}