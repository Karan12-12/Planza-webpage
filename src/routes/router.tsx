import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../Layouts/MainLayout";
import NotFound from "../pages/PageNotFound";

// Lazy imports
// const Home = lazy(() => import("../pages/Home"));
// const Login = lazy(() => import("../pages/Login"));
const VendorProfile = lazy(() => import("../pages/VendorProfile"));
const PortfolioDetail = lazy(() => import("../pages/PortfolioDetail"));
const AskQuestion = lazy(() => import("../pages/AskQuestion"));
const VendorOnboarding = lazy(() => import("../pages/VendorOnboarding"));
const VendorUpdate = lazy(()=>import("../pages/VendorOnboardingUpdate"))

// Loader component
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-4 border-[#7c5cbf]/20 border-t-[#7c5cbf] animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <NotFound />
          </Suspense>
        ),
      },
      // {
      //   path: "login",
      //   element: (
      //     <Suspense fallback={<Loader />}>
      //       <Login />
      //     </Suspense>
      //   ),
      // },
      {
        path: "vendor/:vendorId",
        element: (
          <Suspense fallback={<Loader />}>
            <VendorProfile />
          </Suspense>
        ),
      },
      {
        path: "vendor/portfolio/:id",
        element: (
          <Suspense fallback={<Loader />}>
            <PortfolioDetail />
          </Suspense>
        ),
      },
      {
        path: "vendor/ask",
        element: (
          <Suspense fallback={<Loader />}>
            <AskQuestion />
          </Suspense>
        ),
      },
         {
        path: "vendor/onboarding",
        element: (
          <Suspense fallback={<Loader />}>
            <VendorOnboarding />
          </Suspense>
        ),
      },
          {
        path: "vendor/updateVendor/:vendorId",
        element: (
          <Suspense fallback={<Loader />}>
            <VendorUpdate />
          </Suspense>
        ),
      },
       {
        path: "*",
        element: (
          <Suspense fallback={<Loader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);