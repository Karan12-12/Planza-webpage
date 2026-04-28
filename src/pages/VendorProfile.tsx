import { useState } from "react";
import { useNavigate } from "react-router-dom";

const vendor = {
  name: "Celebrations by Aryan",
  category: "Event Planner",
  verified: true,
  tagline: "Turning your moments into timeless memories, one event at a time.",
  rating: 4.8,
  reviews: 126,
  location: "Bhopal, MP",
  responseTime: "~2 hrs",
  startingPrice: "₹25,000",
  eventTypes: ["Birthday", "Proposal", "Housewarming", "Wedding"],
  services: ["Photography", "Decor", "Catering", "Music", "Lighting"],
  about:
    "We are a full-service event planning studio based in Bhopal, specializing in curated celebrations that reflect your personality. From intimate proposals to grand birthday galas, we bring creativity, precision, and passion to every event. Our team of 20+ professionals ensures every detail — from florals to lighting — tells your story.",
  coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80",
  portfolio: [
    {
      id: 1,
      title: "Rooftop Surprise Birthday",
      type: "Birthday",
      date: "March 2025",
      location: "Bhopal",
      budget: "₹40,000",
      summary: "A dreamy rooftop setup with fairy lights, floral arches, and a live acoustic duo.",
      thumbnail: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
    },
    {
      id: 2,
      title: "Garden Proposal Setup",
      type: "Proposal",
      date: "January 2025",
      location: "Kerwa Dam, Bhopal",
      budget: "₹18,000",
      summary: "Intimate garden proposal with rose petals, candles, and a personalized photo wall.",
      thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=80",
    },
    {
      id: 3,
      title: "Grand Housewarming Puja",
      type: "Housewarming",
      date: "November 2024",
      location: "Arera Colony, Bhopal",
      budget: "₹55,000",
      summary: "Traditional meets modern — marigold garlands, brass décor, and a live dhol performance.",
      thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80",
    },
  ],
  social: {
    website: "https://celebrationsbyaryan.in",
    instagram: "https://instagram.com/celebrationsbyaryan",
  },
};

export default function VendorProfile() {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Cover */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
        <img
          src={vendor.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Back button */}
        {/* <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button> */}
        {/* Like */}
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#7c5cbf] uppercase tracking-wide">{vendor.category}</span>
            {vendor.verified && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verified
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">{vendor.name}</h1>
          <p className="text-sm text-gray-500 mb-2">{vendor.tagline}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg width="13" height="13" fill="#f59e0b" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              {vendor.rating} |
            </span>
            <span> {vendor.reviews} reviews |</span>
            <span>📍 {vendor.location} |</span>
            <span>⚡ Responds in {vendor.responseTime}</span>
          </div>
        </div>

        {/* Price + Event Types */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Starting price</p>
            <p className="text-lg font-bold text-gray-900">{vendor.startingPrice}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Event types</p>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{vendor.eventTypes.join(" · ")}</p>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Services Offered</h2>
          <div className="flex flex-wrap gap-2">
            {vendor.services.map((s) => (
              <span key={s} className="text-xs border border-[#7c5cbf] text-[#7c5cbf] rounded-full px-3 py-1 font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">About this Vendor</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{vendor.about}</p>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Portfolio Highlights</h2>
          <div className="flex flex-col gap-3">
            {/* {vendor.portfolio.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/vendor/portfolio/${item.id}`)}
                className="flex items-center gap-3 text-left w-full hover:bg-[#f9f5ff] rounded-xl p-2 transition group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#7c5cbf] font-semibold mb-0.5">{item.type} · {item.date}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.location} · {item.budget}</p>
                </div>
                <svg className="text-gray-300 group-hover:text-[#7c5cbf] transition flex-shrink-0" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))} */}

            {vendor.portfolio.map((item) => (
  <button
    key={item.id}
    onClick={() => navigate(`/vendor/portfolio/${item.id}`)}
    className="flex items-center gap-3 text-left w-full border border-gray-200 rounded-xl p-3 hover:border-[#7c5cbf] hover:bg-[#f9f5ff] transition group"
  >
    {/* Square thumbnail - matches wireframe box */}
    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />
    </div>

    {/* Text content */}
    <div className="flex-1 min-w-0">
      {/* Line 1: Event name | Event type | Month/Year */}
      <p className="text-sm font-bold text-gray-900 truncate">
        {item.title} | {item.type} | {item.date}
      </p>
      {/* Line 2: Location | budget | 1 line summary */}
      <p className="text-xs text-gray-400 mt-0.5 truncate">
        {item.location} | {item.budget} | {item.summary}
      </p>
    </div>
  </button>
))}
          </div>
        </div>

        {/* Links & Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Links & Actions</h2>
          <div className="flex flex-wrap gap-2">
            <a
              href={vendor.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition"
            >
              🌐 Website
            </a>
            <a
              href={vendor.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition"
            >
              📸 Instagram
            </a>
            {/* <button
              onClick={() => navigate("/vendor/ask")}
              className="flex items-center gap-2 text-sm font-semibold bg-[#7c5cbf] text-white rounded-full px-4 py-2 hover:bg-[#6a4db0] transition"
            >
              💬 Ask a Question
            </button> */}
          </div>
        </div>

        {/* Request Quote CTA */}
        {/* <button className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition text-base tracking-wide">
          Request a Quote
        </button> */}
      </div>
    </div>
  );
}
