import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import StickyCTA from "./StickyCTA";
import FloatingSearchBar from "./FloatingSearchBar";
import MobileNav from "./MobileNav";
import CookieConsent from "./CookieConsent";
import Footer from "./Footer";
// Language switcher removed — English-only for international Asia market
import SignInModal from "./SignInModal";
import TripPlannerChat from "./TripPlannerChat";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);
  const isResultsPage = location.startsWith('/flights/results');

  // Force hard reload when leaving /flights/results → Travelpayouts CSS/script အကုန် ရှင်းမယ်
  useEffect(() => {
    const wasResults = prevLocationRef.current.startsWith('/flights/results');
    const isResults = location.startsWith('/flights/results');

    // Back button, footer link, any navigation အကုန် catch လုပ်မယ်
    if (wasResults && !isResults) {
      window.location.href = location;   // ← hard reload (pollution လုံးဝ ဖျက်မယ်)
    }

    prevLocationRef.current = location;
  }, [location]);

  const [chatOpen, setChatOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Custom observer to show inline search bar when scrolling past widget
  useEffect(() => {
    const mainWidget = document.getElementById("mainWidget");
    if (!mainWidget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setSearchVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-56px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(mainWidget);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Header — Gold */}
      <header
        className="sticky top-0 z-50 bg-[#F5C518] border-b border-gray-200 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        <div className="container flex h-14 items-center justify-between relative">
          <div className="flex items-center gap-3 relative z-10 w-[200px]">
            {/* Hamburger Menu */}
            <MobileNav onPlanTrip={() => setChatOpen(true)} />
            {isResultsPage ? (
              <a href="/" className="flex items-center gap-2">
                <img src="/logo.webp" alt="GoTravel Logo" className="h-[36px] w-auto object-contain" />
                <span className="font-extrabold text-[#5B0EA6] text-xl tracking-tight hidden sm:inline-block">
                  GO TRAVEL
                </span>
              </a>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.webp" alt="GoTravel Logo" className="h-[36px] w-auto object-contain" />
                <span className="font-extrabold text-[#5B0EA6] text-xl tracking-tight hidden sm:inline-block">
                  GO TRAVEL
                </span>
              </Link>
            )}
          </div>

          {/* Embedded Floating Search Bar */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-[92%] sm:w-auto max-w-[500px] transition-all duration-300 ease-in-out ${searchVisible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}`}>
            <FloatingSearchBar />
          </div>

          <div className="flex items-center gap-3 relative z-10 w-[200px] justify-end">
            <SignInModal variant="header" autoOpen />
          </div>
        </div>
      </header>

      {/* AI Trip Planner Chat */}
      <TripPlannerChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <StickyCTA />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
