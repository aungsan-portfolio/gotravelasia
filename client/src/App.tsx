// GoTravel Asia — Flights, Hotels, Transport
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FlightSearchProvider } from "./contexts/FlightSearchContext";
import { WebsiteJsonLd } from "./components/JsonLd";

const Home = lazy(() => import("./pages/Home"));
const Blog = lazy(() => import("./pages/Blog"));
const Bangkok = lazy(() => import("./pages/destinations/Bangkok"));
const ChiangMai = lazy(() => import("./pages/destinations/ChiangMai"));
const Phuket = lazy(() => import("./pages/destinations/Phuket"));
const Krabi = lazy(() => import("./pages/destinations/Krabi"));
const Pai = lazy(() => import("./pages/destinations/Pai"));
const ChiangRai = lazy(() => import("./pages/destinations/ChiangRai"));
const WhiteLabelResultsBridge = lazy(() => import("./pages/flights/WhiteLabelResultsBridge"));
const FlightDestinationPage = lazy(() => import("./pages/FlightDestinationPage"));
const DestinationLandingPage = lazy(() => import("./pages/DestinationLandingPage"));
const FlightsQueryRedirect = lazy(() => import("./pages/FlightsQueryRedirect"));
const TermsAndPrivacy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const BlogPost = lazy(() => import("./pages/blog/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const CookieSettings = lazy(() => import("./pages/CookieSettings"));
const TransportPage = lazy(() => import("./pages/TransportPage"));
const HotelsPage = lazy(() => import("./pages/hotels/HotelSearchResultsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />

        {/* Thailand Destinations */}
        <Route path="/thailand/bangkok" component={Bangkok} />
        <Route path="/thailand/chiang-mai" component={ChiangMai} />
        <Route path="/thailand/phuket" component={Phuket} />
        <Route path="/thailand/krabi" component={Krabi} />
        <Route path="/thailand/pai" component={Pai} />
        <Route path="/thailand/chiang-rai" component={ChiangRai} />

        {/* Flight Search Results (Travelpayouts White Label) */}
        <Route path="/flights/results" component={WhiteLabelResultsBridge} />

        {/* Query-based redirect entry */}
        <Route path="/flights" component={FlightsQueryRedirect} />

        {/* Dedicated Destination Landing Pages (must be before generic /flights/:o/:d) */}
        <Route path="/flights/to/:slug" component={DestinationLandingPage} />

        {/* Path-based Hotel Routes (SEO Growth) */}
        <Route path="/hotels" component={HotelsPage} />
        <Route path="/transport" component={TransportPage} />
        <Route path="/hotels/:city" component={DestinationLandingPage} />
        <Route path="/hotels/:city/:hotel" component={DestinationLandingPage} />

        <Route path="/flights/:originCode/:destinationCode" component={FlightDestinationPage} />

        {/* Blog & Money Pages */}
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />

        {/* Legal & Company Pages */}
        <Route path="/privacy" component={TermsAndPrivacy} />
        <Route path="/terms-privacy" component={TermsAndPrivacy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />
        <Route path="/about" component={About} />
        <Route path="/cookies" component={CookieSettings} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={<div className="p-10 text-center font-bold text-lg">Something went wrong. Please refresh the page.</div>}>
      <FlightSearchProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <WebsiteJsonLd />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </FlightSearchProvider>
    </ErrorBoundary>
  );
}

export default App;
