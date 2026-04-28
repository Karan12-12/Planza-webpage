import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  GetServiceAPI,
  getVendorDetails,
  updateVendorAPI,
} from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface PortfolioEntry {
  _localId: string;
  portfolioMasterId?: string; // present for existing entries from backend
  title: string;
  category: string;
  subCategory: string;
  eventDate: string;
  location: string;
  budget: string;
  brief: string;
  thumbnail: File | null;
  thumbnailPreviewUrl: string;
  existingThumbnailUrl?: string; // URL from backend for existing entries
  images: File[];
  imagePreviewUrls: string[];
  existingImageUrls?: string[]; // URLs from backend for existing entries
  videos: File[];
  videoPreviewUrls: string[];
  existingVideoUrls?: string[];
}

interface FormData {
  // Step 1 — MobileNumber intentionally NOT editable
  name: string;
  MobileNumber: string; // read-only / display only
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
  // Step 5
  portfolio: PortfolioEntry[];
  // Meta
  CoverImageFileName: string;
  CoverImageFile: File | null;
  CoverImagePreviewUrl: string;
  existingCoverImageUrl: string; // served from backend
  Rating: string;
  ReviewCount: string;
  TotalRatingCount: string;
  AverageRating: string;
}

// ─── Static Options ───────────────────────────────────────────────────────────

const TIER_OPTIONS = ["Tier1", "Tier2", "Tier3", "Tier4"];
const RESPONSE_TIME_OPTIONS = [
  "Within 1 hour",
  "Within 2 hours",
  "Within 4 hours",
  "Within 12 hours",
  "Within 24 hours",
];

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
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
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

// ─── Step 1 ───────────────────────────────────────────────────────────────────

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
    set("existingCoverImageUrl", "");
  };

  const displayCoverUrl = form.existingCoverImageUrl;

  console.log(displayCoverUrl, "cover image url");

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

      {/* Mobile — read-only */}
      <div>
        <Label>Mobile Number</Label>
        <div className="flex gap-2 items-center">
          <span className="flex items-center px-3 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50 flex-shrink-0 py-3">
            +91
          </span>
          <div className="flex-1 relative">
            <Input
              value={form.MobileNumber}
              onChange={() => {}}
              placeholder="9876543210"
              type="tel"
              disabled
            />
            {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              Cannot edit
            </span> */}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          Mobile number cannot be changed after registration.
        </p>
      </div>

      <div>
        <Label required>Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {["Freelancer", "Company"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("FreeLancerOrCompany", t)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${
                form.FreeLancerOrCompany === t
                  ? "border-[#7c5cbf] bg-[#f9f5ff] text-[#7c5cbf]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
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
        {displayCoverUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#7c5cbf] group">
            <img
              src={displayCoverUrl}
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
            {form.CoverImageFileName && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                <p className="text-xs text-white font-medium truncate">
                  {form.CoverImageFileName}
                </p>
              </div>
            )}
            {/* <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-2 right-2 text-xs bg-white/90 text-gray-700 font-semibold rounded-full px-2.5 py-1 hover:bg-white transition opacity-0 group-hover:opacity-100"
            >
              Change
            </button> */}
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
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.Rating}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  set("Rating", "");
                  return;
                }
                const num = Number(value);
                if (num >= 0 && num <= 5) set("Rating", value);
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
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
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["ReviewCount", "Review Count", "e.g. 24"],
              ["TotalRatingCount", "Total Ratings", "e.g. 120"],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <Label>{label}</Label>
              <input
                type="number"
                min="0"
                value={form[key]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    set(key, "");
                    return;
                  }
                  if (Number(value) >= 0) set(key, value);
                }}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
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

// ─── Step 2 ───────────────────────────────────────────────────────────────────

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
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition ${
                form.tier === t
                  ? "border-[#7c5cbf] bg-[#f9f5ff] text-[#7c5cbf]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
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

// ─── Step 3 ───────────────────────────────────────────────────────────────────

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

function newPortfolioEntry(): PortfolioEntry {
  return {
    _localId: `entry_${Date.now()}_${Math.random()}`,
    title: "",
    category: "",
    subCategory: "",
    eventDate: "",
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
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const videosInputRef = useRef<HTMLInputElement>(null);

  const upd = (k: keyof PortfolioEntry, v: any) =>
    onChange({ ...entry, [k]: v });

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (entry.thumbnailPreviewUrl)
      URL.revokeObjectURL(entry.thumbnailPreviewUrl);
    upd("thumbnail", file);
    upd("thumbnailPreviewUrl", URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    upd("images", [...entry.images, ...files]);
    upd("imagePreviewUrls", [...entry.imagePreviewUrls, ...newPreviews]);
    e.target.value = "";
  };

  const handleVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    upd("videos", [...entry.videos, ...files]);
    upd("videoPreviewUrls", [...entry.videoPreviewUrls, ...newPreviews]);
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(entry.imagePreviewUrls[i]);
    upd(
      "images",
      entry.images.filter((_, idx) => idx !== i),
    );
    upd(
      "imagePreviewUrls",
      entry.imagePreviewUrls.filter((_, idx) => idx !== i),
    );
  };

  const removeVideo = (i: number) => {
    URL.revokeObjectURL(entry.videoPreviewUrls[i]);
    upd(
      "videos",
      entry.videos.filter((_, idx) => idx !== i),
    );
    upd(
      "videoPreviewUrls",
      entry.videoPreviewUrls.filter((_, idx) => idx !== i),
    );
  };

  const selectedSvc = services.find((s) => s.id === entry.category);

  return (
    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#7c5cbf] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-gray-700">
            {entry.title || `Event ${index + 1}`}
          </span>
          {entry.portfolioMasterId && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5 font-semibold">
              Existing
            </span>
          )}
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-600 font-semibold transition"
          >
            Remove
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <Label required>Event Title</Label>
          <Input
            value={entry.title}
            onChange={(v) => upd("title", v)}
            placeholder="e.g. Sharma Wedding"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Category (Service)</Label>
            <select
              value={entry.category}
              //   onChange={(e) => {
              //     upd("category", e.target.value);
              //     upd("subCategory", "");
              //   }}
              onChange={(e) => {
                onChange({
                  ...entry,
                  category: e.target.value,
                  subCategory: "",
                });
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white"
            >
              <option value="">Select service</option>
              {services
                .filter((s) => s.status === "active")
                .map((s) => (
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
              onChange={(e) => upd("subCategory", e.target.value)}
              disabled={!selectedSvc}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select sub-service</option>
              {selectedSvc?.subServices
                .filter((s) => s.is_active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Event Date</Label>
            <input
              type="date"
              value={entry.eventDate}
              onChange={(e) => upd("eventDate", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
            />
          </div>
          <div>
            <Label>Budget (₹)</Label>
            <input
              type="number"
              value={entry.budget}
              onChange={(e) => upd("budget", e.target.value)}
              placeholder="e.g. 25000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition"
            />
          </div>
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={entry.location}
            onChange={(v) => upd("location", v)}
            placeholder="e.g. Indore, MP"
          />
        </div>

        <div>
          <Label>Event Brief</Label>
          <textarea
            value={entry.brief}
            onChange={(e) => upd("brief", e.target.value)}
            rows={3}
            placeholder="Describe the event..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#7c5cbf] focus:ring-2 focus:ring-[#7c5cbf]/10 transition resize-none"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <Label>Thumbnail</Label>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbnail}
          />
          {entry.thumbnailPreviewUrl || entry.existingThumbnailUrl ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-[#7c5cbf] h-28 group">
              <img
                src={entry.thumbnailPreviewUrl || entry.existingThumbnailUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  if (entry.thumbnailPreviewUrl)
                    URL.revokeObjectURL(entry.thumbnailPreviewUrl);
                  upd("thumbnail", null);
                  upd("thumbnailPreviewUrl", "");
                  upd("existingThumbnailUrl", "");
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="absolute bottom-1.5 right-1.5 text-xs bg-white/90 text-gray-700 font-semibold rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition text-xs"
            >
              <span className="text-lg">🖼️</span>
              <span className="font-semibold">Upload Thumbnail</span>
            </button>
          )}
        </div>

        {/* Images */}
        <div>
          <Label>Portfolio Images</Label>
          <input
            ref={imagesInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImages}
          />
          {(entry.imagePreviewUrls.length > 0 ||
            (entry.existingImageUrls?.length ?? 0) > 0) && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(entry.existingImageUrls || []).map((url, i) => (
                <div
                  key={`existing-img-${i}`}
                  className="relative rounded-xl overflow-hidden h-20 group border border-gray-200"
                >
                  <img
                    src={`${import.meta.env.VITE_BASE_URL_FOR_FILE || ""}/src/uploads/vendor/portfolio/images/${url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                    ✓
                  </span>
                </div>
              ))}
              {entry.imagePreviewUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden h-20 group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => imagesInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition text-xs font-semibold"
          >
            <span>📷</span> Add Images
          </button>
        </div>

        {/* Videos */}
        <div>
          <Label>Portfolio Videos</Label>
          <input
            ref={videosInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleVideos}
          />
          {entry.videoPreviewUrls.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-2">
              {entry.videoPreviewUrls.map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
                >
                  <span className="text-sm">🎬</span>
                  <span className="flex-1 text-xs text-gray-600 font-medium truncate">
                    {entry.videos[i]?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVideo(i)}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {(entry.existingVideoUrls || []).length > 0 && (
            <div className="flex flex-col gap-1 mb-2">
              {entry.existingVideoUrls!.map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2"
                >
                  <span className="text-sm">🎬</span>
                  <span className="flex-1 text-xs text-blue-700 font-medium truncate">
                    Existing video {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => videosInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-400 hover:border-[#7c5cbf] hover:text-[#7c5cbf] transition text-xs font-semibold"
          >
            <span>🎬</span> Add Videos
          </button>
        </div>
      </div>
    </div>
  );
}

function Step5Portfolio({
  form,
  set,
  services,
  loadingServices,
  // fetchError,
}: {
  form: FormData;
  set: (k: keyof FormData, v: any) => void;
  services: ApiService[];
  loadingServices: boolean;
  fetchError: string | null;
}) {
  const updateEntry = (index: number, updated: PortfolioEntry) => {
    const next = [...form.portfolio];
    next[index] = updated;
    set("portfolio", next);
  };

  const removeEntry = (index: number) => {
    set(
      "portfolio",
      form.portfolio.filter((_, i) => i !== index),
    );
  };

  const addEntry = () => {
    set("portfolio", [...form.portfolio, newPortfolioEntry()]);
  };

  if (loadingServices)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#7c5cbf]/20 border-t-[#7c5cbf] animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400 leading-relaxed">
        Showcase your past work. Existing portfolio entries are pre-loaded — you
        can edit or add new ones.
      </p>

      {form.portfolio.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center gap-3 text-gray-400">
          <span className="text-4xl">📸</span>
          <p className="text-sm font-semibold text-gray-500">
            No portfolio entries yet
          </p>
          <p className="text-xs text-gray-400">
            Add your first event to showcase your work
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {form.portfolio.map((entry, i) => (
            <PortfolioEntryCard
              key={entry._localId}
              entry={entry}
              index={i}
              total={form.portfolio.length}
              onChange={(updated) => updateEntry(i, updated)}
              onRemove={() => removeEntry(i)}
              services={services}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addEntry}
        className="w-full border-2 border-dashed border-[#7c5cbf]/40 rounded-2xl py-4 flex items-center justify-center gap-2 text-[#7c5cbf] hover:border-[#7c5cbf] hover:bg-[#f9f5ff] transition font-semibold text-sm"
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Portfolio Entry
      </button>
    </div>
  );
}

// ─── Step 6: Review ───────────────────────────────────────────────────────────

function Step6Review({
  form,
  services,
}: {
  form: FormData;
  services: ApiService[];
}) {
  const rows: [string, string][] = [
    ["Name", form.name],
    ["Mobile", `+91 ${form.MobileNumber}`],
    ["Type", form.FreeLancerOrCompany || "—"],
    ["Tagline", form.Tagline || "—"],
    ["Area Served", form.area_served || "—"],
    ["Tier", form.tier || "—"],
    [
      "Price Range",
      form.FromPrice && form.ToPrice
        ? `₹${Number(form.FromPrice).toLocaleString("en-IN")} – ₹${Number(form.ToPrice).toLocaleString("en-IN")}`
        : "—",
    ],
    ["Website", form.Website || "—"],
    ["Instagram", form.InstagramHandle ? `@${form.InstagramHandle}` : "—"],
    ["Facebook", form.FacebookHandle ? `@${form.FacebookHandle}` : "—"],
    ["Response Time", form.ResponseTime || "—"],
    [
      "Callback Time",
      form.FromPreferredCallBackTime && form.ToPreferredCallBackTime
        ? `${form.FromPreferredCallBackTime} – ${form.ToPreferredCallBackTime}`
        : "—",
    ],
    ["Rating", form.Rating || "—"],
    ["Review Count", form.ReviewCount || "0"],
    ["Total Ratings", form.TotalRatingCount || "0"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400">
        Review your updated details before saving.
      </p>
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className={`flex items-start gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}
          >
            <span className="text-xs font-semibold text-gray-400 w-32 flex-shrink-0 pt-0.5">
              {label}
            </span>
            <span className="text-sm text-gray-800 font-medium break-all">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Services summary */}
      {form.services.length > 0 && (
        <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/60">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Services ({form.services.length})
          </p>
          {services
            .filter((svc) => form.services.some((s) => s.service_id === svc.id))
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
                <p key={svc.id} className="text-xs text-gray-700 mb-1">
                  <span className="font-semibold">{svc.name}:</span> {subNames}
                </p>
              );
            })}
        </div>
      )}

      {/* Portfolio summary */}
      {form.portfolio.length > 0 && (
        <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/60">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Portfolio ({form.portfolio.length} events)
          </p>
          {form.portfolio.map((e, i) => (
            <div key={e._localId} className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#7c5cbf]/10 text-[#7c5cbf] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-xs text-gray-700">
                {e.title || "Untitled"}
              </span>
              {e.portfolioMasterId && (
                <span className="text-xs text-blue-500 font-semibold">
                  • existing
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, form: FormData): string | null {
  if (step === 1) {
    if (!form.name.trim()) return "Business name is required";
    if (!form.FreeLancerOrCompany) return "Please select Freelancer or Company";
  }
  if (step === 2) {
    if (!form.area_served) return "Please enter area served";
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
    const incomplete = form.portfolio.filter(
      (e) => !e.title || !e.category || !e.eventDate,
    );
    if (incomplete.length > 0)
      return `${incomplete.length} portfolio event(s) are missing required fields (Title, Category, Date)`;
  }
  return null;
}

// ─── Initial Form ─────────────────────────────────────────────────────────────

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
  existingCoverImageUrl: "",
  Rating: "",
  ReviewCount: "0",
  TotalRatingCount: "0",
  AverageRating: "0",
};

// ─── Helper: parse "HH:MM:SS" or Date string → "HH:MM" ───────────────────────
// function toTimeString(raw: string | null | undefined): string {
//   if (!raw) return "";
//   // If it's an ISO date string like "1970-01-01T10:30:00.000Z"
//   try {
//     const d = new Date(raw);
//     if (!isNaN(d.getTime())) {
//       const hh = String(d.getUTCHours()).padStart(2, "0");
//       const mm = String(d.getUTCMinutes()).padStart(2, "0");
//       return `${hh}:${mm}`;
//     }
//   } catch {}
//   // Fallback: already "HH:MM"
//   return raw.slice(0, 5);
// }

function toTimeString(raw: string | null | undefined): string {
  if (!raw) return "";

  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  } catch {}

  return raw.slice(0, 5);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VendorUpdate() {
  const { vendorId } = useParams<{ vendorId: string }>();

  const [step, setStep] = useState(1);
  const [form, setFormState] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingVendor, setFetchingVendor] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [services, setServices] = useState<ApiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // ── Load services list ─────────────────────────────────────────────────────
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

  // ── Fetch vendor details and pre-fill form ─────────────────────────────────
  useEffect(() => {
    if (!vendorId) {
      setFetchError("No vendor ID provided in URL.");
      setFetchingVendor(false);
      return;
    }
    (async () => {
      setFetchingVendor(true);
      setFetchError(null);
      try {
        const res: any = await getVendorDetails(vendorId);
        const data = res?.Data;
        if (!data) throw new Error("Vendor not found");

        const vendor = data.Vendor;
        const mappings: any[] = data.VendorServiceMapping || [];
        const portfolioItems: any[] = data.Portfolio || [];

        setFormState({
          name: vendor.name || "",
          MobileNumber: vendor.MobileNumber || "",
          FreeLancerOrCompany: vendor.FreeLancerOrCompany || "",
          Tagline: vendor.Tagline || "",
          description: vendor.description || "",
          area_served: vendor.area_served || "",
          tier: vendor.tier || "",
          FromPrice: vendor.FromPrice ? String(vendor.FromPrice) : "",
          ToPrice: vendor.ToPrice ? String(vendor.ToPrice) : "",
          Website: vendor.Website || "",
          InstagramHandle: vendor.InstagramHandle || "",
          FacebookHandle: vendor.FacebookHandle || "",
          ResponseTime: vendor.ResponseTime || "",
          FromPreferredCallBackTime: toTimeString(
            vendor.FromPreferredCallBackTime,
          ),
          ToPreferredCallBackTime: toTimeString(vendor.ToPreferredCallBackTime),
          services: mappings.map((m: any) => ({
            service_id: m.service_id,
            subcategory_id: m.subcategory_id,
          })),
          portfolio: portfolioItems.map((p: any) => ({
            _localId: `existing_${p.ID || p.id || Math.random()}`,
            portfolioMasterId: p.ID || p.id,
            title: p.EventName || "",
            category: p.ServiceID || "",
            subCategory: p.SubServiceID || "",
            eventDate: p.EventDate ? p.EventDate.slice(0, 10) : "",
            location: p.location || "",
            budget: p.StartingBudget ? String(p.StartingBudget) : "",
            brief: p.EventBrief || "",
            thumbnail: null,
            thumbnailPreviewUrl: "",
            // existingThumbnailUrl:
            //   p.ThumnailFileName || p.ThumbnailFileName || "",
            existingThumbnailUrl: p.ThumnailFileName
              ? `${import.meta.env.VITE_BASE_URL_FOR_FILE || ""}/src/uploads/vendor/portfolio/images/${p.ThumnailFileName}`
              : "",
            images: [],
            imagePreviewUrls: [],
            existingImageUrls: p.Detail?.Images || [],
            videos: [],
            videoPreviewUrls: [],
            existingVideoUrls: p.Detail?.Videos || [],
          })),
          CoverImageFileName: vendor.CoverImageFileName || "",
          CoverImageFile: null,
          CoverImagePreviewUrl: "",
          existingCoverImageUrl: vendor.CoverImageFileName
            ? `${import.meta.env.VITE_BASE_URL_FOR_FILE || ""}/src/uploads/vendor/portfolio/images/${vendor.CoverImageFileName}`
            : "",
          Rating: vendor.AverageRating ? String(vendor.AverageRating) : "",
          ReviewCount: vendor.ReviewCount ? String(vendor.ReviewCount) : "0",
          TotalRatingCount: vendor.TotalRatingCount
            ? String(vendor.TotalRatingCount)
            : "0",
          AverageRating: vendor.AverageRating
            ? String(vendor.AverageRating)
            : "0",
        });
      } catch (err: any) {
        setFetchError(
          err?.message || "Failed to load vendor details. Please try again.",
        );
      } finally {
        setFetchingVendor(false);
      }
    })();
  }, [vendorId]);

  const set = (k: keyof FormData, v: any) => {
    setFormState((f) => ({ ...f, [k]: v }));
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
      const formPayload = new FormData();

      const jsonData = {
        MobileNumber: form.MobileNumber,
        name: form.name,
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
        portfolio: form.portfolio.map((e, idx) => ({
          index: idx,
          portfolioMasterId: e.portfolioMasterId || null,
          title: e.title,
          category: e.category,
          subCategory: e.subCategory,
          eventDate: e.eventDate,
          location: e.location,
          budget: Number(e.budget) || 0,
          brief: e.brief,
          imageCount: e.images.length,
          videoCount: e.videos.length,
          hasThumbnail: !!e.thumbnail,
          existingImageUrls: e.existingImageUrls || [],
          existingVideoUrls: e.existingVideoUrls || [],
        })),
      };

      formPayload.append("data", JSON.stringify(jsonData));

      if (form.CoverImageFile) {
        formPayload.append("Cover_images", form.CoverImageFile);
      }

      form.portfolio.forEach((entry, idx) => {
        entry.images.forEach((file) =>
          formPayload.append(`portfolio_${idx}_images`, file),
        );
        if (entry.thumbnail)
          formPayload.append("portfolio_thumbnail_images", entry.thumbnail);
        entry.videos.forEach((file) =>
          formPayload.append(`portfolio_${idx}_videos`, file),
        );
      });

      const res: any = await updateVendorAPI(vendorId!, formPayload);

      if (res?.Status === 1 || res?.data?.Status === 1) {
        setSaved(true);
      } else {
        throw new Error(res?.Message || res?.data?.Message || "Update failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (fetchingVendor) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#7c5cbf]/20 border-t-[#7c5cbf] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading vendor details...
          </p>
        </div>
      </div>
    );
  }

  // ── Fetch error ────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-gray-800 font-semibold mb-2">
            Failed to load vendor
          </p>
          <p className="text-sm text-gray-500 mb-6">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#7c5cbf] text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (saved) {
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
            Profile Updated! 🎉
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            Changes for{" "}
            <span className="font-semibold text-gray-700">{form.name}</span>{" "}
            have been saved successfully.
          </p>
          {/* <p className="text-gray-400 text-xs">
            Your updated profile is now live on Planza.
          </p> */}
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
              Step {step} of {STEPS.length} · Editing:{" "}
              <span className="font-semibold text-gray-600">
                {form.name || "Vendor"}
              </span>
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
                    Saving...
                  </span>
                ) : (
                  "Save Changes ✓"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
