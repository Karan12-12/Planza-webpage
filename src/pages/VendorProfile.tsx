import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVendorDetails } from "../services/api"; // adjust path as needed

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

interface VendorData {
  id: string;
  name: string;
  Tagline: string | null;
  AverageRating: string;
  ReviewCount: string;
  area_served: string | null;
  ResponseTime: string | null;
  FromPrice: string;
  ToPrice: string;
  description: string | null;
  CoverImageFileName: string | null;
  Website: string | null;
  InstagramHandle: string | null;
  FacebookHandle: string | null;
  tier: string | null;
  FreeLancerOrCompany: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileUrl(filename: string | null | undefined): string | null {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${UPLOADS_BASE_URL}/src/uploads/vendor/portfolio/images/${filename}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorProfile() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [services, setServices] = useState<ServiceMapping[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      setError("No vendor ID provided.");
      setLoading(false);
      return;
    }

    getVendorDetails(vendorId)
      .then((res: any) => {
        if (res?.Status !== 1) throw new Error(res?.Message ?? "Failed to load vendor");
        setVendor(res.Data.Vendor);
        setServices(res.Data.VendorServiceMapping ?? []);
        setPortfolio(res.Data.Portfolio ?? []);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const coverUrl = fileUrl(vendor?.CoverImageFileName);
  const uniqueServiceNames = [...new Set(services.map((s) => s.ServiceName).filter(Boolean))];
  const uniqueSubServices = [...new Set(services.map((s) => s.SubServiceName).filter(Boolean))];

  if (!loading && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center px-6">
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-[#7c5cbf] font-semibold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Cover */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-gray-200">
        {loading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : coverUrl ? (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7c5cbf]/30 to-[#e84393]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition"
        >
          <svg width="20" height="20" fill={liked ? "#e84393" : "none"} stroke={liked ? "#e84393" : "white"} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10 -mt-6 relative z-10">
        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          {loading ? (
            <>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-3" />
              <Skeleton className="h-4 w-full" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#7c5cbf] uppercase tracking-wide">
                  {vendor?.FreeLancerOrCompany ?? "Vendor"}
                </span>
                {vendor?.tier && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {/* {vendor.tier} */}
                    verified
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-0.5">{vendor?.name}</h1>
              {vendor?.Tagline && <p className="text-sm text-gray-500 mb-2">{vendor.Tagline}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {vendor?.AverageRating && (
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" fill="#f59e0b" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12  2z" /></svg>
                    {vendor.AverageRating} |
                  </span>
                )}
                {vendor?.ReviewCount && <span>{vendor.ReviewCount} reviews |</span>}
                {vendor?.area_served && <span>📍 {vendor.area_served} |</span>}
                {vendor?.ResponseTime && <span>⚡ Responds {vendor.ResponseTime}</span>}
              </div>
            </>
          )}
        </div>

        {/* Price + Event Types */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Starting price</p>
            {loading ? <Skeleton className="h-6 w-24" /> : (
              <p className="text-lg font-bold text-gray-900">
                {vendor?.FromPrice && vendor?.ToPrice
                  ? `₹${vendor.FromPrice}`
                  : vendor?.FromPrice ? `₹${vendor.FromPrice}` : "—"}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Event types</p>
            {loading ? <Skeleton className="h-5 w-full" /> : (
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {uniqueServiceNames.length ? uniqueServiceNames.join(" · ") : "—"}
              </p>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Services Offered</h2>
          {loading ? (
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
            </div>
          ) : uniqueSubServices.length ? (
            <div className="flex flex-wrap gap-2">
              {uniqueSubServices.map((s) => (
                <span key={s} className="text-xs border border-[#7c5cbf] text-[#7c5cbf] rounded-full px-3 py-1 font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No services listed.</p>
          )}
        </div>

        {/* About */}
        {(loading || vendor?.description) && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">About this Vendor</h2>
            {loading ? (
              <><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-5/6 mb-2" /><Skeleton className="h-4 w-4/6" /></>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">{vendor?.description}</p>
            )}
          </div>
        )}

        {/* Portfolio */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Portfolio Highlights</h2>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                  <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                  <div className="flex-1"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-full" /></div>
                </div>
              ))}
            </div>
          ) : portfolio.length === 0 ? (
            <p className="text-xs text-gray-400">No portfolio entries yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {portfolio.map((item) => {
                const thumb = fileUrl(item.ThumnailFileName) ?? fileUrl(item.Detail?.Images?.[0]) ?? null;
                return (
                  <button
                    key={item.ID}
                    // Pass the full portfolio entry via route state — PortfolioDetail reads it
                    // so it doesn't need its own API call at all.
                    onClick={() =>
                      navigate(`/vendor/portfolio/${item.ID}`, {
                        state: { portfolioEntry: item, serviceMappings: services },
                      })
                    }
                    className="flex items-center gap-3 text-left w-full border border-gray-200 rounded-xl p-3 hover:border-[#7c5cbf] hover:bg-[#f9f5ff] transition group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                      {thumb ? (
                        <img src={thumb} alt={item.EventName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🎉</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {item.EventName} | {formatDate(item.EventDate)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {[item.location, item.StartingBudget ? `₹${item.StartingBudget}` : null, item.EventBrief].filter(Boolean).join(" | ")}
                      </p>
                    </div>
                    <svg className="text-gray-300 group-hover:text-[#7c5cbf] transition flex-shrink-0" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Links & Actions */}
        {(loading || vendor?.Website || vendor?.InstagramHandle || vendor?.FacebookHandle) && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Links & Actions</h2>
            {loading ? (
              <div className="flex gap-2"><Skeleton className="h-9 w-24 rounded-full" /><Skeleton className="h-9 w-24 rounded-full" /></div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vendor?.Website && (
                  <a href={vendor.Website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition">
                    🌐 Website
                  </a>
                )}
                {vendor?.InstagramHandle && (
                  <a
                    href={vendor.InstagramHandle.startsWith("http") ? vendor.InstagramHandle : `https://instagram.com/${vendor.InstagramHandle.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition"
                  >
                    📸 Instagram
                  </a>
                )}
                {vendor?.FacebookHandle && (
                  <a
                    href={vendor.FacebookHandle.startsWith("http") ? vendor.FacebookHandle : `https://facebook.com/${vendor.FacebookHandle.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition"
                  >
                    📘 Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}