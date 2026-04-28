import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import { createVendorOnboarding, GetServiceAPI } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

// interface Service {
//   id: string;
//   name: string;
//   code?: string;
//   subServices: SubService[];
//   status: "active" | "inactive";
// }

interface SubService {
  id: string;
  name: string;
  is_active: boolean;
}

interface ApiService {
  id: string;
  name: string;
  code: string;
  subServices: SubService[];
  status: "active" | "inactive";
}

interface SelectedService {
  service_id: string;
  subcategory_id: string;
}

// One portfolio entry (maps to portfolioData shape)
interface PortfolioEntry {
  _localId: string; // client-only key for list rendering
  title: string;
  category: string;
  subCategory: string;
  eventDate: string;
  // eventTime: string; // kept for backward compat (computed as "HH:MM – HH:MM")
  // eventTimeStart: string;
  // eventTimeEnd: string;
  location: string;
  budget: string;
  brief: string;
  thumbnail: File | null; // single cover image for the portfolio card
  thumbnailPreviewUrl: string;
  images: File[]; // will be uploaded; backend stores URLs
  imagePreviewUrls: string[];
  videos: File[];
  videoPreviewUrls: string[];
}

interface FormData {
  // Step 1
  name: string;
  MobileNumber: string;
  FreeLancerOrCompany: "Freelancer" | "Company" | "";
  Tagline: string;
  description: string;
  // Step 2
  area_served: string;
  tier: string;
  FromPrice: string;
  ToPrice: string;
  // Step 3
  Website: string;
  InstagramHandle: string;
  FacebookHandle: string;
  ResponseTime: string;
  FromPreferredCallBackTime: string;
  ToPreferredCallBackTime: string;
  // Step 4
  services: SelectedService[];
  // Step 5 – Portfolio
  portfolio: PortfolioEntry[];
  // Meta / Ratings
  CoverImageFileName: string;
  CoverImageFile: File | null; // actual file for upload
  CoverImagePreviewUrl: string; // local blob URL for preview
  Rating: string;
  ReviewCount: string;
  TotalRatingCount: string;
  AverageRating: string;
}

// ─── Static Options ───────────────────────────────────────────────────────────

const TIER_OPTIONS = ["Tier1", "Tier2", "Tier3", "Tier4"];
// const AREA_OPTIONS = [
//   "Bhopal",
//   "Indore",
//   "Jabalpur",
//   "Gwalior",
//   "Ujjain",
//   "Sagar",
//   "Dewas",
//   "Satna",
//   "Ratlam",
//   "Rewa",
// ];
const RESPONSE_TIME_OPTIONS = [
  "Within 1 hour",
  "Within 2 hours",
  "Within 4 hours",
  "Within 12 hours",
  "Within 24 hours",
];

// const MOCK_SERVICES: ApiService[] = [
//   { id:"S001", name:"Photography", code:"PHOTO", status:"active",
//     subServices:[{id:"SC001",name:"Event Photography",is_active:true},{id:"SC002",name:"Candid Photography",is_active:true},{id:"SC003",name:"Portrait Photography",is_active:true},{id:"SC004",name:"Product Photography",is_active:true}]},
//   { id:"S002", name:"Decor", code:"DECOR", status:"active",
//     subServices:[{id:"SC005",name:"Floral Decor",is_active:true},{id:"SC006",name:"Theme Decor",is_active:true},{id:"SC007",name:"Stage Setup",is_active:true},{id:"SC008",name:"Balloon Decoration",is_active:true}]},
//   { id:"S003", name:"Catering", code:"CATER", status:"active",
//     subServices:[{id:"SC009",name:"Veg Catering",is_active:true},{id:"SC010",name:"Non-Veg Catering",is_active:true},{id:"SC011",name:"Desserts & Sweets",is_active:true},{id:"SC012",name:"Live Counters",is_active:true}]},
//   { id:"S004", name:"Music & Entertainment", code:"MUSIC", status:"active",
//     subServices:[{id:"SC013",name:"DJ",is_active:true},{id:"SC014",name:"Live Band",is_active:true},{id:"SC015",name:"Dhol",is_active:true},{id:"SC016",name:"Anchor / Emcee",is_active:false}]},
//   { id:"S005", name:"Lighting", code:"LIGHT", status:"active",
//     subServices:[{id:"SC017",name:"LED Lighting",is_active:true},{id:"SC018",name:"Fairy Lights",is_active:true},{id:"SC019",name:"Spotlights",is_active:true}]},
//   { id:"S006", name:"Videography", code:"VIDEO", status:"active",
//     subServices:[{id:"SC020",name:"Cinematic Video",is_active:true},{id:"SC021",name:"Drone Footage",is_active:true},{id:"SC022",name:"Reel Making",is_active:true}]},
// ];

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Basic Info", icon: "👤" },
  { id: 2, label: "Pricing", icon: "💰" },
  { id: 3, label: "Contact", icon: "🔗" },
  { id: 4, label: "Services", icon: "🎯" },
  { id: 5, label: "Portfolio", icon: "📸" },
  { id: 6, label: "Review", icon: "✅" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
      {required && <span className="text-pink-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition disabled:bg-gray-50 disabled:text-gray-400"
    />
  );
}

function PlanzaSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ─── Steps 1–3 ───────────────────────────────────────────────────────────────

function Step1({
  form,
  set,
}: {
  form: FormData;
  set: (k: keyof FormData, v: any) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    set("CoverImageFile", file);
    set("CoverImageFileName", file.name);
    set("CoverImagePreviewUrl", previewUrl);
    e.target.value = "";
  };

  const removeCover = () => {
    if (form.CoverImagePreviewUrl)
      URL.revokeObjectURL(form.CoverImagePreviewUrl);
    set("CoverImageFile", null);
    set("CoverImageFileName", "");
    set("CoverImagePreviewUrl", "");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label required>Full Name / Business Name</Label>
        <Input
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder="e.g. Celebrations by Aryan"
        />
      </div>
      <div>
        <Label required>Mobile Number</Label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50 flex-shrink-0">
            +91
          </span>
          <Input
            value={form.MobileNumber}
            onChange={(v) => set("MobileNumber", v)}
            placeholder="9876543210"
            type="tel"
          />
        </div>
      </div>
      <div>
        <Label required>Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {["Freelancer", "Company"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("FreeLancerOrCompany", t)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${form.FreeLancerOrCompany === t ? "border-[#7c5cbf] bg-[#f9f5ff] text-[#7c5cbf]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {t === "Freelancer" ? "🙋 Freelancer" : "🏢 Company"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Tagline</Label>
        <Input
          value={form.Tagline}
          onChange={(v) => set("Tagline", v)}
          placeholder="e.g. Turning moments into memories"
        />
      </div>
      <div>
        <Label>About / Description</Label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Tell customers who you are, what you do, and what makes you special..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition resize-none"
        />
      </div>

      {/* Cover Image */}
      <div>
        <Label>Cover Image</Label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverImage}
        />
        {form.CoverImagePreviewUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#7c5cbf] group">
            <img
              src={form.CoverImagePreviewUrl}
              alt="Cover"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
            <button
              type="button"
              onClick={removeCover}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
            >
              ✕
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-xs text-white font-medium truncate">
                {form.CoverImageFileName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-2 right-2 text-xs bg-white/90 text-gray-700 font-semibold rounded-full px-2.5 py-1 hover:bg-white transition opacity-0 group-hover:opacity-100"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition"
          >
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-semibold">Upload Cover Image</span>
            <span className="text-xs text-gray-300">
              JPG, PNG, WEBP · Recommended 1200×600
            </span>
          </button>
        )}
      </div>

      {/* Ratings & Review Stats */}
      <div className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 bg-gray-50/50">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Ratings & Reviews
        </p>
        <div>
          <Label>Rating (out of 5)</Label>
          <div className="flex items-center gap-2">
            {/* <input
              type="number" min="0" max="5" step="0.1"
              value={form.Rating}
              onChange={(e) => set("Rating", e.target.value)}
              placeholder="e.g. 4.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
            /> */}
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.Rating}
              onChange={(e) => {
                const value = e.target.value;

                // allow empty
                if (value === "") {
                  set("Rating", "");
                  return;
                }

                const num = Number(value);

                // allow only values between 0 and 5
                if (num >= 0 && num <= 5) {
                  set("Rating", value);
                }
              }}
              onKeyDown={(e) => {
                // block unwanted keys
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="e.g. 4.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
            />
            {form.Rating && (
              <div className="flex items-center gap-1 flex-shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <span className="text-amber-400 text-base">★</span>
                <span className="text-sm font-bold text-amber-600">
                  {Number(form.Rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["ReviewCount", "Review Count", "e.g. 24"],
              ["TotalRatingCount", "Total Ratings", "e.g. 120"],
              ["AverageRating", "Avg Rating", "e.g. 4.5"],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input
                type="number"
                min="0"
                step={key === "AverageRating" ? "0.1" : "1"}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={ph}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
              />
            </div>
          ))}
        </div> */}
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["ReviewCount", "Review Count", "e.g. 24"],
              ["TotalRatingCount", "Total Ratings", "e.g. 120"],
              // ["AverageRating", "Avg Rating", "e.g. 4.5"],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input
                type="number"
                min="0"
                // max={key === "AverageRating" ? "5" : undefined}
                // step={key === "AverageRating" ? "0.1" : "1"}
                value={form[key]}
                onChange={(e) => {
                  const value = e.target.value;

                  // allow empty
                  if (value === "") {
                    set(key, "");
                    return;
                  }

                  const num = Number(value);

                  // special restriction for AverageRating (0 to 5)
                  // if (key === "AverageRating") {
                  //   if (num >= 0 && num <= 5) {
                  //     set(key, value);
                  //   }
                  //   return;
                  // }

                  // normal number fields
                  if (num >= 0) {
                    set(key, value);
                  }
                }}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder={ph}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({
  form,
  set,
}: {
  form: FormData;
  set: (k: keyof FormData, v: any) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label required>Area Served</Label>
        <Input
          value={form.area_served}
          onChange={(v) => set("area_served", v)}
          placeholder="e.g. Indore, Bhopal, Ujjain"
        />
      </div>
      <div>
        <Label required>Tier / Package Level</Label>
        <div className="grid grid-cols-2 gap-3">
          {TIER_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("tier", t)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${form.tier === t ? "border-[#7c5cbf] bg-[#f9f5ff] text-[#7c5cbf]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label required>Price Range (₹)</Label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["FromPrice", "From", "5,000"],
              ["ToPrice", "To", "50,000"],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={ph}
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
                />
              </div>
            </div>
          ))}
        </div>
        {form.FromPrice && form.ToPrice && (
          <p className="text-xs text-[#7c5cbf] font-medium mt-1.5">
            ₹{Number(form.FromPrice).toLocaleString("en-IN")} – ₹
            {Number(form.ToPrice).toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </div>
  );
}

function Step3({
  form,
  set,
}: {
  form: FormData;
  set: (k: keyof FormData, v: any) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Website</Label>
        <Input
          value={form.Website}
          onChange={(v) => set("Website", v)}
          placeholder="https://yourwebsite.com"
        />
      </div>
      {(
        [
          ["InstagramHandle", "Instagram"],
          ["FacebookHandle", "Facebook"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <Label>{label} Handle</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
              @
            </span>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder="yourhandle"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
            />
          </div>
        </div>
      ))}
      <div>
        <Label>Typical Response Time</Label>
        <PlanzaSelect
          value={form.ResponseTime}
          onChange={(v) => set("ResponseTime", v)}
          options={RESPONSE_TIME_OPTIONS}
          placeholder="Select response time"
        />
      </div>
      <div>
        <Label>Preferred Callback Time</Label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["FromPreferredCallBackTime", "From"],
              ["ToPreferredCallBackTime", "To"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <input
                type="time"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Services ─────────────────────────────────────────────────────────

function Step4({
  form,
  set,
  services,
  loadingServices,
  fetchError,
}: {
  form: FormData;
  set: (k: keyof FormData, v: any) => void;
  services: ApiService[];
  loadingServices: boolean;
  fetchError: string | null;
}) {
  const isSubSelected = (svcId: string, subId: string) =>
    form.services.some(
      (s) => s.service_id === svcId && s.subcategory_id === subId,
    );
  const selectedCountFor = (svcId: string) =>
    form.services.filter((s) => s.service_id === svcId).length;
  const isServiceOpen = (svcId: string) => selectedCountFor(svcId) > 0;
  const getActiveSubs = (svc: ApiService) =>
    svc.subServices.filter((s) => s.is_active);
  const allSubsSelected = (svc: ApiService) => {
    const a = getActiveSubs(svc);
    return a.length > 0 && a.every((sub) => isSubSelected(svc.id, sub.id));
  };

  const handleServiceToggle = (svc: ApiService) => {
    if (isServiceOpen(svc.id)) {
      set(
        "services",
        form.services.filter((s) => s.service_id !== svc.id),
      );
    } else {
      const newEntries: SelectedService[] = getActiveSubs(svc).map((sub) => ({
        service_id: svc.id,
        subcategory_id: sub.id,
      }));
      set("services", [...form.services, ...newEntries]);
    }
  };

  const handleSubToggle = (svcId: string, subId: string) => {
    if (isSubSelected(svcId, subId)) {
      set(
        "services",
        form.services.filter(
          (s) => !(s.service_id === svcId && s.subcategory_id === subId),
        ),
      );
    } else {
      set("services", [
        ...form.services,
        { service_id: svcId, subcategory_id: subId },
      ]);
    }
  };

  if (loadingServices)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#7c5cbf]/20 border-t-[#7c5cbf] animate-spin" />
        <p className="text-sm text-gray-400">Loading services...</p>
      </div>
    );

  if (fetchError)
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <p className="text-3xl">⚠️</p>
        <p className="text-sm text-gray-600 font-semibold">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-[#7c5cbf] font-semibold underline"
        >
          Retry
        </button>
      </div>
    );

  const totalSelected = form.services.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400 leading-relaxed">
          Check a service to expand it, then pick sub-services.
        </p>
        {totalSelected > 0 && (
          <span className="ml-2 flex-shrink-0 text-xs font-bold text-white bg-[#7c5cbf] rounded-full px-2.5 py-0.5">
            {totalSelected}
          </span>
        )}
      </div>

      {services.map((svc) => {
        const open = isServiceOpen(svc.id);
        const count = selectedCountFor(svc.id);
        const activeSubs = getActiveSubs(svc);
        const allSel = allSubsSelected(svc);
        const indeterminate = open && !allSel;
        return (
          <div
            key={svc.id}
            className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${open ? "border-[#7c5cbf]" : "border-gray-200"}`}
          >
            <button
              type="button"
              onClick={() => handleServiceToggle(svc)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition ${open ? "bg-[#f9f5ff]" : "bg-white hover:bg-gray-50"}`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${allSel ? "bg-[#7c5cbf] border-[#7c5cbf]" : indeterminate ? "border-[#7c5cbf] bg-white" : "border-gray-300 bg-white"}`}
              >
                {allSel && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {indeterminate && (
                  <div className="w-2.5 h-0.5 rounded-full bg-[#7c5cbf]" />
                )}
              </div>
              <span
                className={`flex-1 text-left text-sm font-bold ${open ? "text-[#7c5cbf]" : "text-gray-800"}`}
              >
                {svc.name}
              </span>
              {count > 0 && (
                <span className="text-xs font-bold text-white bg-[#7c5cbf] rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                  {count}
                </span>
              )}
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#7c5cbf]" : "text-gray-400"}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {open && (
              <div className="border-t-2 border-[#e8d9ff] bg-white divide-y divide-gray-100">
                {activeSubs.map((sub) => {
                  const checked = isSubSelected(svc.id, sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubToggle(svc.id, sub.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition ${checked ? "bg-[#fdf9ff]" : "hover:bg-gray-50"}`}
                    >
                      <div
                        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition ${checked ? "bg-[#7c5cbf] border-[#7c5cbf]" : "border-gray-300 bg-white"}`}
                      >
                        {checked && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="white"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm ${checked ? "text-[#7c5cbf] font-semibold" : "text-gray-700 font-medium"}`}
                      >
                        {sub.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {totalSelected > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-1">
          <p className="text-xs font-semibold text-emerald-700 mb-1.5">
            ✓ {totalSelected} sub-service{totalSelected > 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-col gap-1">
            {services
              .filter((svc) =>
                form.services.some((s) => s.service_id === svc.id),
              )
              .map((svc) => {
                const subNames = form.services
                  .filter((s) => s.service_id === svc.id)
                  .map(
                    (s) =>
                      svc.subServices.find((sub) => sub.id === s.subcategory_id)
                        ?.name,
                  )
                  .filter(Boolean)
                  .join(", ");
                return (
                  <p key={svc.id} className="text-xs text-emerald-700">
                    <span className="font-semibold">{svc.name}:</span>{" "}
                    {subNames}
                  </p>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Portfolio ────────────────────────────────────────────────────────

function newEntry(): PortfolioEntry {
  return {
    _localId: `entry_${Date.now()}_${Math.random()}`,
    title: "",
    category: "",
    subCategory: "",
    eventDate: "",
    // eventTime: "",
    // eventTimeStart: "",
    // eventTimeEnd: "",
    location: "",
    budget: "",
    brief: "",
    thumbnail: null,
    thumbnailPreviewUrl: "",
    images: [],
    imagePreviewUrls: [],
    videos: [],
    videoPreviewUrls: [],
  };
}

function PortfolioEntryCard({
  entry,
  index,
  total,
  onChange,
  onRemove,
  services,
}: {
  entry: PortfolioEntry;
  index: number;
  total: number;
  onChange: (updated: PortfolioEntry) => void;
  onRemove: () => void;
  services: ApiService[];
}) {
  const [expanded, setExpanded] = useState(true);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof PortfolioEntry, v: any) =>
    onChange({ ...entry, [k]: v });

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (entry.thumbnailPreviewUrl)
      URL.revokeObjectURL(entry.thumbnailPreviewUrl);
    onChange({
      ...entry,
      thumbnail: file,
      thumbnailPreviewUrl: URL.createObjectURL(file),
    });
    e.target.value = "";
  };

  const removeThumbnail = () => {
    if (entry.thumbnailPreviewUrl)
      URL.revokeObjectURL(entry.thumbnailPreviewUrl);
    onChange({ ...entry, thumbnail: null, thumbnailPreviewUrl: "" });
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    onChange({
      ...entry,
      images: [...entry.images, ...files],
      imagePreviewUrls: [...entry.imagePreviewUrls, ...urls],
    });
    e.target.value = "";
  };

  const handleVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    onChange({
      ...entry,
      videos: [...entry.videos, ...files],
      videoPreviewUrls: [...entry.videoPreviewUrls, ...urls],
    });
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(entry.imagePreviewUrls[i]);
    onChange({
      ...entry,
      images: entry.images.filter((_, idx) => idx !== i),
      imagePreviewUrls: entry.imagePreviewUrls.filter((_, idx) => idx !== i),
    });
  };

  const removeVideo = (i: number) => {
    URL.revokeObjectURL(entry.videoPreviewUrls[i]);
    onChange({
      ...entry,
      videos: entry.videos.filter((_, idx) => idx !== i),
      videoPreviewUrls: entry.videoPreviewUrls.filter((_, idx) => idx !== i),
    });
  };

  const isComplete = entry.title && entry.category && entry.eventDate;

  // Resolve display names from IDs for the card header
  const categoryName =
    services.find((s) => s.id === entry.category)?.name ?? entry.category;
  const subCategoryName =
    services
      .find((s) => s.id === entry.category)
      ?.subServices.find((sub) => sub.id === entry.subCategory)?.name ??
    entry.subCategory;

  return (
    <div
      className={`border-2 rounded-2xl overflow-hidden transition-all duration-200 ${isComplete ? "border-[#7c5cbf]" : "border-gray-200"}`}
    >
      {/* Card header */}
      <div
        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none transition ${isComplete ? "bg-[#f9f5ff]" : "bg-white"}`}
        onClick={() => setExpanded((e) => !e)}
      >
        <div
          className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 ${isComplete ? "border-[#7c5cbf]" : "border-gray-200"}`}
        >
          {entry.thumbnailPreviewUrl ? (
            <img
              src={entry.thumbnailPreviewUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-sm font-bold ${isComplete ? "bg-[#7c5cbf] text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {isComplete ? "✓" : index + 1}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-bold truncate ${isComplete ? "text-[#7c5cbf]" : "text-gray-500"}`}
          >
            {entry.title || `Event ${index + 1}`}
          </p>
          {entry.category && (
            <p className="text-xs text-gray-400 truncate">
              {categoryName}
              {subCategoryName ? ` · ${subCategoryName}` : ""}
              {entry.location ? ` · 📍${entry.location}` : ""}
              {entry.eventDate ? ` · ${entry.eventDate}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {entry.images.length > 0 && (
            <span className="text-xs text-gray-400">
              📷 {entry.images.length}
            </span>
          )}
          {entry.videos.length > 0 && (
            <span className="text-xs text-gray-400">
              🎬 {entry.videos.length}
            </span>
          )}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-gray-300 hover:text-red-400 transition p-1"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className={`transition-transform duration-200 text-gray-400 ${expanded ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Card body */}
      {expanded && (
        <div className="border-t border-gray-100 bg-white px-4 pt-4 pb-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <Label required>Event Title</Label>
            <input
              value={entry.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Rooftop Surprise Birthday"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
            />
          </div>

          {/* Category + SubCategory — driven by same API as Step 4 */}
          {(() => {
            const activeServices = services.filter(
              (s) => s.status === "active",
            );
            const selectedSvc = activeServices.find(
              (s) => s.id === entry.category,
            );
            const activeSubs = selectedSvc
              ? selectedSvc.subServices.filter((s) => s.is_active)
              : [];
            return (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Category</Label>
                  <select
                    value={entry.category}
                    onChange={(e) =>
                      onChange({
                        ...entry,
                        category: e.target.value,
                        subCategory: "",
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
                  >
                    <option value="">Select</option>
                    {activeServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Sub-Category</Label>
                  <select
                    value={entry.subCategory}
                    onChange={(e) => update("subCategory", e.target.value)}
                    disabled={!entry.category || activeSubs.length === 0}
                    className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white ${
                      !entry.category || activeSubs.length === 0
                        ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-200 text-gray-800"
                    }`}
                  >
                    <option value="">
                      {!entry.category
                        ? "Pick category first"
                        : activeSubs.length === 0
                          ? "No sub-services"
                          : "Select"}
                    </option>
                    {activeSubs.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })()}

          {/* Event Date + Time Range */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label required>Event Date</Label>
                <input
                  type="date"
                  value={entry.eventDate}
                  onChange={(e) => update("eventDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
                />
              </div>
            </div>
            {/* <div>
              <Label>Event Time</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Start Time</p>
                  <input
                    type="time"
                    value={entry.eventTimeStart}
                    onChange={(e) => {
                      const start = e.target.value;
                      const combined =
                        start && entry.eventTimeEnd
                          ? `${start} – ${entry.eventTimeEnd}`
                          : start || entry.eventTimeEnd || "";
                      onChange({
                        ...entry,
                        eventTimeStart: start,
                        eventTime: combined,
                      });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">End Time</p>
                  <input
                    type="time"
                    value={entry.eventTimeEnd}
                    onChange={(e) => {
                      const end = e.target.value;
                      const combined =
                        entry.eventTimeStart && end
                          ? `${entry.eventTimeStart} – ${end}`
                          : entry.eventTimeStart || end || "";
                      onChange({
                        ...entry,
                        eventTimeEnd: end,
                        eventTime: combined,
                      });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
                  />
                </div>
              </div>
              {entry.eventTimeStart && entry.eventTimeEnd && (
                <p className="text-xs text-[#7c5cbf] font-medium mt-1.5">
                  🕐 {entry.eventTimeStart} – {entry.eventTimeEnd}
                </p>
              )}
            </div> */}
          </div>

          {/* Location + Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Location</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <input
                  value={entry.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Indore"
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
                />
              </div>
            </div>
            <div>
              <Label>Budget (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  value={entry.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
                />
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <Label>Thumbnail</Label>
            <p className="text-xs text-gray-400 mb-2">
              This image will be used as the portfolio card cover.
            </p>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnail}
            />
            {entry.thumbnailPreviewUrl ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#7c5cbf] group">
                <img
                  src={entry.thumbnailPreviewUrl}
                  alt="Thumbnail"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => thumbInputRef.current?.click()}
                  className="absolute bottom-1.5 right-1.5 text-xs bg-white/90 text-gray-700 font-semibold rounded-full px-2.5 py-1 hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-medium">Upload Thumbnail</span>
                <span className="text-xs text-gray-300">JPG, PNG, WEBP</span>
              </button>
            )}
          </div>

          {/* Brief */}
          <div>
            <Label>Event Brief</Label>
            <textarea
              value={entry.brief}
              onChange={(e) => update("brief", e.target.value)}
              rows={3}
              placeholder="Describe what made this event special — setup, highlights, client reaction..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition resize-none"
            />
            <p className="text-right text-xs text-gray-300 mt-1">
              {entry.brief.length} chars
            </p>
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Photos</Label>
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="text-xs font-semibold text-[#7c5cbf] bg-[#f9f5ff] border border-[#e8d9ff] rounded-full px-3 py-1 hover:bg-[#f0eaff] transition"
              >
                + Add Photos
              </button>
            </div>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImages}
            />
            {entry.imagePreviewUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {entry.imagePreviewUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 rounded px-1">
                      {i + 1}
                    </span>
                  </div>
                ))}
                {/* Add more tile */}
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-xs mt-1">More</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition"
              >
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-medium">
                  Tap to upload photos
                </span>
                <span className="text-xs text-gray-300">
                  JPG, PNG, WEBP · Multiple allowed
                </span>
              </button>
            )}
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Videos</Label>
              <button
                type="button"
                onClick={() => vidInputRef.current?.click()}
                className="text-xs font-semibold text-[#7c5cbf] bg-[#f9f5ff] border border-[#e8d9ff] rounded-full px-3 py-1 hover:bg-[#f0eaff] transition"
              >
                + Add Videos
              </button>
            </div>
            <input
              ref={vidInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleVideos}
            />
            {entry.videoPreviewUrls.length > 0 ? (
              <div className="flex flex-col gap-2">
                {entry.videoPreviewUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <video
                      src={url}
                      controls
                      className="w-full rounded-xl"
                      style={{ maxHeight: 180 }}
                      preload="metadata"
                    />
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs text-gray-400 font-medium">
                        🎬 {entry.videos[i]?.name || `Video ${i + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVideo(i)}
                        className="text-xs text-red-400 hover:text-red-600 transition font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => vidInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition font-medium"
                >
                  + Add another video
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => vidInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition"
              >
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                  />
                </svg>
                <span className="text-xs font-medium">
                  Tap to upload videos
                </span>
                <span className="text-xs text-gray-300">
                  MP4, MOV, WEBM · Multiple allowed
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step5Portfolio({
  form,
  set,
  services,
  loadingServices,
  fetchError,
}: {
  form: FormData;
  set: (k: keyof FormData, v: any) => void;
  services: ApiService[];
  loadingServices: boolean;
  fetchError: string | null;
}) {
  const addEntry = () => {
    set("portfolio", [...form.portfolio, newEntry()]);
  };

  const updateEntry = (localId: string, updated: PortfolioEntry) => {
    set(
      "portfolio",
      form.portfolio.map((e) => (e._localId === localId ? updated : e)),
    );
  };

  const removeEntry = (localId: string) => {
    set(
      "portfolio",
      form.portfolio.filter((e) => e._localId !== localId),
    );
  };

  const completedCount = form.portfolio.filter(
    (e) => e.title && e.category && e.eventDate,
  ).length;

  if (loadingServices)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#7c5cbf]/20 border-t-[#7c5cbf] animate-spin" />
        <p className="text-sm text-gray-400">Loading categories...</p>
      </div>
    );

  if (fetchError)
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <p className="text-3xl">⚠️</p>
        <p className="text-sm text-gray-600 font-semibold">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-[#7c5cbf] font-semibold underline"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800">Portfolio Events</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Add past events to show customers your work.
          </p>
        </div>
        {form.portfolio.length > 0 && (
          <span className="text-xs font-bold text-[#7c5cbf] bg-[#f9f5ff] border border-[#e8d9ff] px-2.5 py-0.5 rounded-full">
            {completedCount}/{form.portfolio.length} done
          </span>
        )}
      </div>

      {/* Skip hint */}
      {form.portfolio.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Portfolio is <span className="font-semibold">optional</span> — you
            can skip this step and add events later from your dashboard. Vendors
            with portfolios get{" "}
            <span className="font-semibold">3× more enquiries</span>.
          </p>
        </div>
      )}

      {/* Entry cards */}
      {form.portfolio.map((entry, i) => (
        <PortfolioEntryCard
          key={entry._localId}
          entry={entry}
          index={i}
          total={form.portfolio.length}
          services={services}
          onChange={(updated) => updateEntry(entry._localId, updated)}
          onRemove={() => removeEntry(entry._localId)}
        />
      ))}

      {/* Add event button */}
      <button
        type="button"
        onClick={addEntry}
        className="w-full border-2 border-dashed border-[#7c5cbf]/40 rounded-2xl py-4 flex items-center justify-center gap-2 text-[#7c5cbf] hover:bg-[#f9f5ff] hover:border-[#7c5cbf] transition"
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="text-sm font-bold">Add Portfolio Event</span>
      </button>

      {form.portfolio.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          You can reorder and edit events later from your vendor dashboard.
        </p>
      )}
    </div>
  );
}

// ─── Step 6: Review ───────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 w-36">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">
        {value}
      </span>
    </div>
  );
}

function Step6Review({
  form,
  services,
}: {
  form: FormData;
  services: ApiService[];
}) {
  // Helper: resolve service name from ID
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? id;
  const subName = (svcId: string, subId: string) =>
    services
      .find((s) => s.id === svcId)
      ?.subServices.find((sub) => sub.id === subId)?.name ?? subId;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400">
        Review your details before submitting.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wide mb-3">
          👤 Basic Info
        </p>
        {form.CoverImagePreviewUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-gray-200">
            <img
              src={form.CoverImagePreviewUrl}
              alt="Cover"
              className="w-full h-28 object-cover"
            />
          </div>
        )}
        <ReviewRow label="Name" value={form.name} />
        <ReviewRow label="Mobile" value={`+91 ${form.MobileNumber}`} />
        <ReviewRow label="Type" value={form.FreeLancerOrCompany} />
        <ReviewRow label="Tagline" value={form.Tagline} />
        <ReviewRow
          label="Description"
          value={
            form.description
              ? form.description.slice(0, 80) +
                (form.description.length > 80 ? "…" : "")
              : undefined
          }
        />
        <ReviewRow
          label="Rating"
          value={
            form.Rating ? `★ ${Number(form.Rating).toFixed(1)} / 5` : undefined
          }
        />
        <ReviewRow
          label="Review Count"
          value={form.ReviewCount !== "0" ? form.ReviewCount : undefined}
        />
        <ReviewRow
          label="Total Ratings"
          value={
            form.TotalRatingCount !== "0" ? form.TotalRatingCount : undefined
          }
        />
        <ReviewRow
          label="Average Rating"
          value={form.AverageRating !== "0" ? form.AverageRating : undefined}
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wide mb-3">
          💰 Pricing & Location
        </p>
        <ReviewRow label="Area Served" value={form.area_served} />
        <ReviewRow label="Tier" value={form.tier} />
        <ReviewRow
          label="Price Range"
          value={
            form.FromPrice && form.ToPrice
              ? `₹${Number(form.FromPrice).toLocaleString("en-IN")} – ₹${Number(form.ToPrice).toLocaleString("en-IN")}`
              : undefined
          }
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wide mb-3">
          🔗 Contact & Social
        </p>
        <ReviewRow label="Website" value={form.Website} />
        <ReviewRow
          label="Instagram"
          value={form.InstagramHandle ? `@${form.InstagramHandle}` : undefined}
        />
        <ReviewRow
          label="Facebook"
          value={form.FacebookHandle ? `@${form.FacebookHandle}` : undefined}
        />
        <ReviewRow label="Response Time" value={form.ResponseTime} />
        <ReviewRow
          label="Callback"
          value={
            form.FromPreferredCallBackTime && form.ToPreferredCallBackTime
              ? `${form.FromPreferredCallBackTime} – ${form.ToPreferredCallBackTime}`
              : undefined
          }
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wide mb-3">
          🎯 Services ({form.services.length})
        </p>
        {form.services.length === 0 ? (
          <p className="text-xs text-gray-300">No services selected</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {form.services.map((s, i) => (
              <span
                key={i}
                className="text-xs bg-[#f9f5ff] text-[#7c5cbf] border border-[#e8d9ff] rounded-full px-3 py-1 font-medium"
              >
                {svcName(s.service_id)} ·{" "}
                {subName(s.service_id, s.subcategory_id)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio review */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wide mb-3">
          📸 Portfolio ({form.portfolio.length} event
          {form.portfolio.length !== 1 ? "s" : ""})
        </p>
        {form.portfolio.length === 0 ? (
          <p className="text-xs text-gray-300">No portfolio events added</p>
        ) : (
          <div className="flex flex-col gap-3">
            {form.portfolio.map((entry, i) => (
              <div
                key={entry._localId}
                className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                {/* Thumbnail or placeholder */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {entry.thumbnailPreviewUrl ? (
                    <img
                      src={entry.thumbnailPreviewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : entry.imagePreviewUrls[0] ? (
                    <img
                      src={entry.imagePreviewUrls[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                      📷
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {entry.title || `Event ${i + 1}`}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {[
                      entry.category ? svcName(entry.category) : "",
                      entry.subCategory
                        ? subName(entry.category, entry.subCategory)
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {entry.eventDate ? ` · ${entry.eventDate}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {entry.location && (
                      <span className="text-xs text-gray-400">
                        📍 {entry.location}
                      </span>
                    )}
                    {entry.budget && (
                      <span className="text-xs text-gray-400">
                        ₹ {Number(entry.budget).toLocaleString("en-IN")}
                      </span>
                    )}
                    {entry.images.length > 0 && (
                      <span className="text-xs text-gray-400">
                        📷 {entry.images.length}
                      </span>
                    )}
                    {entry.videos.length > 0 && (
                      <span className="text-xs text-gray-400">
                        🎬 {entry.videos.length}
                      </span>
                    )}
                  </div>
                </div>
                {(!entry.title || !entry.category || !entry.eventDate) && (
                  <span className="text-xs text-amber-500 font-semibold flex-shrink-0">
                    Incomplete
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, form: FormData): string | null {
  if (step === 1) {
    if (!form.name.trim()) return "Business name is required";
    if (!form.MobileNumber.trim() || !/^\d{10}$/.test(form.MobileNumber))
      return "Enter a valid 10-digit mobile number";
    if (!form.FreeLancerOrCompany) return "Please select Freelancer or Company";
  }
  if (step === 2) {
    if (!form.area_served) return "Please select area served";
    if (!form.tier) return "Please select a tier";
    if (!form.FromPrice || !form.ToPrice)
      return "Please enter your price range";
    if (Number(form.FromPrice) >= Number(form.ToPrice))
      return "From Price must be less than To Price";
  }
  if (step === 4) {
    if (form.services.length === 0)
      return "Please select at least one sub-service";
  }
  if (step === 5) {
    // Portfolio is optional, but if entries exist they must be valid
    const incomplete = form.portfolio.filter(
      (e) => !e.title || !e.category || !e.eventDate,
    );
    if (incomplete.length > 0)
      return `${incomplete.length} portfolio event(s) are missing required fields (Title, Category, Date)`;
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  name: "",
  MobileNumber: "",
  FreeLancerOrCompany: "",
  Tagline: "",
  description: "",
  area_served: "",
  tier: "",
  FromPrice: "",
  ToPrice: "",
  Website: "",
  InstagramHandle: "",
  FacebookHandle: "",
  ResponseTime: "",
  FromPreferredCallBackTime: "",
  ToPreferredCallBackTime: "",
  services: [],
  portfolio: [],
  CoverImageFileName: "",
  CoverImageFile: null,
  CoverImagePreviewUrl: "",
  Rating: "",
  ReviewCount: "0",
  TotalRatingCount: "0",
  AverageRating: "0",
};

export default function VendorOnboarding() {
  // const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Shared services list used by both Step 4 and Step 5 Portfolio
  const [services, setServices] = useState<ApiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingServices(true);
      setServicesError(null);
      try {
        const res: any = await GetServiceAPI();
        if (res?.data?.Status) {
          const mapped: ApiService[] = res.data.Data.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            subServices: (s.subServices || []).map((sub: any) =>
              typeof sub === "string"
                ? { id: sub, name: sub, is_active: true }
                : {
                    id: sub.id,
                    name: sub.name,
                    is_active: sub.is_active ?? true,
                  },
            ),
            status: s.is_active ? "active" : "inactive",
          }));
          setServices(mapped);
        }
      } catch {
        setServicesError("Failed to load services. Please try again.");
      } finally {
        setLoadingServices(false);
      }
    })();
  }, []);

  const set = (k: keyof FormData, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError(null);
  };
  const next = () => {
    const e = validateStep(step, form);
    if (e) {
      setError(e);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build multipart/form-data to handle file uploads
      const formPayload = new FormData();

      const jsonData = {
        name: form.name,
        MobileNumber: form.MobileNumber,
        area_served: form.area_served,
        FromPrice: Number(form.FromPrice),
        ToPrice: Number(form.ToPrice),
        tier: form.tier,
        description: form.description,
        CoverImageFileName: form.CoverImageFileName || null,
        Tagline: form.Tagline,
        Website: form.Website,
        InstagramHandle: form.InstagramHandle,
        FacebookHandle: form.FacebookHandle,
        ResponseTime: form.ResponseTime,
        Rating: Number(form.Rating) || 0,
        ReviewCount: Number(form.ReviewCount),
        TotalRatingCount: Number(form.TotalRatingCount),
        AverageRating: Number(form.AverageRating),
        FreeLancerOrCompany: form.FreeLancerOrCompany,
        FromPreferredCallBackTime: form.FromPreferredCallBackTime || null,
        ToPreferredCallBackTime: form.ToPreferredCallBackTime || null,
        services: form.services,
        // Portfolio text fields (files appended separately below)
        portfolio: form.portfolio.map((e, idx) => ({
          index: idx,
          title: e.title,
          category: e.category,
          subCategory: e.subCategory,
          eventDate: e.eventDate,
          // eventTime: e.eventTime,
          location: e.location,
          budget: Number(e.budget) || 0,
          brief: e.brief,
          imageCount: e.images.length,
          videoCount: e.videos.length,
          hasThumbnail: !!e.thumbnail,
        })),
      };

      console.log("data", jsonData);

      formPayload.append("data", JSON.stringify(jsonData));

      if (form.CoverImageFile) {
        formPayload.append("Cover_images", form.CoverImageFile);
      }

      // // Append image & video files keyed by portfolio index
      form.portfolio.forEach((entry, idx) => {
        entry.images.forEach((file) =>
          formPayload.append(`portfolio_${idx}_images`, file),
        );

        if (entry.thumbnail) {
          formPayload.append("portfolio_thumbnail_images", entry.thumbnail);
        }
        entry.videos.forEach((file) =>
          formPayload.append(`portfolio_${idx}_videos`, file),
        );
      });

      console.log("file", form);

      const res: any = await createVendorOnboarding(formPayload);

      console.log(res);

      // const res = await fetch("/api/vendor/onboard", {
      //   method: "POST",
      //   body: formPayload, // no Content-Type header — browser sets multipart boundary
      // });

      // const data = await res.json();
      // if (!res.ok || data.Status === 0)
      //   throw new Error(data.Message || "Something went wrong");
      // setSubmitted(true);
      if (res.Status == 1) {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7c5cbf] to-[#e84393] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg
              width="44"
              height="44"
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
            You're on the list! 🎉
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            Thanks{" "}
            <span className="font-semibold text-gray-700">{form.name}</span>,
            your onboarding request has been received.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            Our team will review and call you on{" "}
            <span className="font-semibold">+91 {form.MobileNumber}</span>{" "}
            {/* within 24–48 hours. */}
          </p>
          {/* <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left mb-6">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
              What happens next?
            </p>
            {[
              "Our team reviews your submission",
              "We call you on your preferred callback time",
              "Your profile goes live on Planza",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                <span className="w-5 h-5 rounded-full bg-[#f9f5ff] text-[#7c5cbf] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-gray-600">{t}</p>
              </div>
            ))}
          </div> */}
          {/* <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-lg"
          >
            Back to Home
          </button> */}
        </div>
      </div>
    );
  }

  // ── Shell ──────────────────────────────────────────────────────────────────
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {step > 1 ? (
            <button
              onClick={back}
              className="text-gray-500 hover:text-gray-900 transition flex-shrink-0"
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
          ) : (
            <div className="w-6 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">
              Step {step} of {STEPS.length}
            </p>
            <h1 className="text-sm font-bold text-gray-900">
              {STEPS[step - 1].icon} {STEPS[step - 1].label}
            </h1>
          </div>
          <span className="text-xs font-semibold text-[#7c5cbf] bg-[#f9f5ff] px-2 py-1 rounded-full flex-shrink-0">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[#7c5cbf] to-[#e84393] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step dots */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition flex-shrink-0 ${step > s.id ? "bg-emerald-500 text-white" : step === s.id ? "bg-[#7c5cbf] text-white shadow-lg shadow-[#7c5cbf]/30" : "bg-gray-200 text-gray-400"}`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 transition-colors duration-500 ${step > s.id ? "bg-emerald-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        <div
          className={`bg-white rounded-2xl shadow-sm ${step === 5 ? "p-4" : "p-5"}`}
        >
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} />}
          {step === 3 && <Step3 form={form} set={set} />}
          {step === 4 && (
            <Step4
              form={form}
              set={set}
              services={services}
              loadingServices={loadingServices}
              fetchError={servicesError}
            />
          )}
          {step === 5 && (
            <Step5Portfolio
              form={form}
              set={set}
              services={services}
              loadingServices={loadingServices}
              fetchError={servicesError}
            />
          )}
          {step === 6 && <Step6Review form={form} services={services} />}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            {/* Portfolio step gets a Skip option */}
            {step === 5 && form.portfolio.length === 0 && (
              <button
                onClick={next}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 transition text-sm"
              >
                Skip for now
              </button>
            )}
            {step < STEPS.length ? (
              <button
                onClick={next}
                className="flex-1 bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition text-base shadow-lg"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#7c5cbf] to-[#e84393] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition text-base shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application 🚀"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
