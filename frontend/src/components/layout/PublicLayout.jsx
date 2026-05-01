import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";

import Header          from "./Header";
import Footer          from "./Footer";
import WhatsAppButton  from "./WhatsAppButton";
import PageLoader      from "../ui/PageLoader";
import ScrollToTop     from "../common/ScrollToTop";
import CookieBanner    from "../common/CookieBanner";
import BackToTop       from "../common/BackToTop";
import { SettingsProvider, useSettings } from "../../context/SettingsContext";

function LayoutInner() {
  const { contactInfo } = useSettings();
  const whatsappNumber  = contactInfo?.whatsappNumber
    ? contactInfo.whatsappNumber.replace(/^\+/, "")
    : "";

  return (
    <div className="flex flex-col min-h-screen bg-white font-gilroy">
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />

      {whatsappNumber && <WhatsAppButton phoneNumber={whatsappNumber} />}
      <BackToTop />
      <CookieBanner />
    </div>
  );
}

export default function PublicLayout() {
  return (
    <SettingsProvider>
      <LayoutInner />
    </SettingsProvider>
  );
}
