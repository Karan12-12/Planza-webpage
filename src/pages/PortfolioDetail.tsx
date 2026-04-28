import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const portfolioData: Record<string, {
  id: number;
  title: string;
  category: string;
  subCategory: string;
  eventDate: string;
  eventTime: string;
  brief: string;
  images: string[];
  videos: string[];
}> = {
  "1": {
    id: 1,
    title: "Rooftop Surprise Birthday",
    category: "Birthday",
    subCategory: "Surprise Party",
    eventDate: "March 15, 2025",
    eventTime: "7:00 PM – 11:00 PM",
    brief:
      "A magical rooftop setup for a 30th birthday surprise. The venue was transformed with thousands of warm fairy lights, lush floral arches in blush and gold, and a dedicated photo wall with curated Polaroid memories. A live acoustic duo kept the vibe intimate and soulful all evening. The guest-of-honor cried — in the best way possible.",
    images: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80",
    ],
    videos: [
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://www.w3schools.com/html/movie.mp4",
    ],
  },
  "2": {
    id: 2,
    title: "Garden Proposal Setup",
    category: "Proposal",
    subCategory: "Romantic Outdoor",
    eventDate: "January 20, 2025",
    eventTime: "6:30 PM – 8:00 PM",
    brief:
      "An intimate garden proposal at the scenic Kerwa Dam viewpoint. We created a rose-petal pathway leading to a candle-lit arch adorned with jasmine and red roses. A personalized photo wall displayed the couple's journey from their first date to the present. She said yes before he even finished asking.",
    images: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80",
      "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
    ],
    videos: [
      "https://www.w3schools.com/html/mov_bbb.mp4",
    ],
  },
  "3": {
    id: 3,
    title: "Grand Housewarming Puja",
    category: "Housewarming",
    subCategory: "Traditional Ceremony",
    eventDate: "November 5, 2024",
    eventTime: "9:00 AM – 2:00 PM",
    brief:
      "A beautifully orchestrated Griha Pravesh ceremony in Arera Colony. We blended traditional elements — marigold torans, brass diyas, and rangoli — with a modern, clean aesthetic. A live dhol performance welcomed the family into their new home. The puja concluded with a community feast for 80+ guests.",
    images: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=800&q=80",
      "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=800&q=80",
    ],
    videos: [
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://www.w3schools.com/html/movie.mp4",
    ],
  },
};

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

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<{ type: "image" | "video"; src: string } | null>(null);

  const portfolio = id ? portfolioData[id] : null;

  if (!portfolio) {
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
          <p className="text-xs text-[#7c5cbf] font-semibold">{portfolio.category} · {portfolio.subCategory}</p>
          <h1 className="text-base font-bold text-gray-900 truncate">{portfolio.title}</h1>
        </div>
        <LikeButton id={`event-${portfolio.id}`} size="lg" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-12">
        {/* Event Meta */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Event Date</p>
              <p className="text-sm font-bold text-gray-800">📅 {portfolio.eventDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Event Time</p>
              <p className="text-sm font-bold text-gray-800">⏰ {portfolio.eventTime}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Category</p>
              <p className="text-sm font-bold text-gray-800">🎯 {portfolio.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sub-Category</p>
              <p className="text-sm font-bold text-gray-800">🏷️ {portfolio.subCategory}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 mb-1">About this Event</p>
            <p className="text-sm text-gray-600 leading-relaxed">{portfolio.brief}</p>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">📷 Photos <span className="text-gray-400 font-normal">({portfolio.images.length})</span></h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.images.map((src, i) => (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden cursor-pointer group ${i === 0 ? "col-span-2 h-52" : "h-32"}`}
                onClick={() => setLightbox({ type: "image", src })}
              >
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                {/* Like per image */}
                <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
                  <LikeButton id={`img-${portfolio.id}-${i}`} />
                </div>
                {/* Expand icon */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition bg-white/70 rounded-full p-1">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">🎬 Videos <span className="text-gray-400 font-normal">({portfolio.videos.length})</span></h2>
          <div className="flex flex-col gap-3">
            {portfolio.videos.map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100">
                <video
                  src={src}
                  controls
                  className="w-full rounded-xl"
                  style={{ maxHeight: 260 }}
                  preload="metadata"
                />
                {/* Like per video */}
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="text-xs text-gray-400 font-medium">Video {i + 1}</span>
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <LikeButton id={`vid-${portfolio.id}-${i}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {/* <div className="flex gap-3">
          <button
            onClick={() => navigate("/vendor/ask")}
            className="flex-1 border-2 border-[#7c5cbf] text-[#7c5cbf] font-bold py-3.5 rounded-2xl hover:bg-[#f9f5ff] transition text-sm"
          >
            💬 Ask a Question
          </button>
          <button className="flex-1 bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition text-sm shadow-lg">
            Request Quote
          </button>
        </div> */}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
            onClick={() => setLightbox(null)}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {lightbox.type === "image" && (
            <img
              src={lightbox.src}
              alt="Full view"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
