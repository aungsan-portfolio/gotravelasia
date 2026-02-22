import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WebsiteJsonLd } from "./components/JsonLd";

const Home = lazy(() => import("./pages/Home"));
const Blog = lazy(() => import("./pages/Blog"));
const Bangkok = lazy(() => import("./pages/destinations/Bangkok"));
const ChiangMai = lazy(() => import("./pages/destinations/ChiangMai"));
const Phuket = lazy(() => import("./pages/destinations/Phuket"));
const Krabi = lazy(() => import("./pages/destinations/Krabi"));
const Pai = lazy(() => import("./pages/destinations/Pai"));
const ChiangRai = lazy(() => import("./pages/destinations/ChiangRai"));
const FlightResults = lazy(() => import("./pages/FlightResults"));
const TermsAndPrivacy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const BestThingsToDoBangkok = lazy(() => import("./pages/blog/BestThingsToDoBangkok"));
const CheapFlightsBangkok = lazy(() => import("./pages/blog/CheapFlightsBangkok"));
const BestTransfersBangkok = lazy(() => import("./pages/blog/BestTransfersBangkok"));
const BestInsuranceThailand = lazy(() => import("./pages/blog/BestInsuranceThailand"));
const BestEsimThailand = lazy(() => import("./pages/blog/BestEsimThailand"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
        <Route path="/flights/results" component={FlightResults} />

        {/* Blog & Money Pages */}
        <Route path="/blog" component={Blog} />
        <Route path="/blog/best-things-to-do-in-bangkok" component={BestThingsToDoBangkok} />
        <Route path="/blog/cheap-flights-to-bangkok" component={CheapFlightsBangkok} />
        <Route path="/blog/best-airport-transfers-in-bangkok" component={BestTransfersBangkok} />
        <Route path="/blog/best-travel-insurance-for-thailand" component={BestInsuranceThailand} />
        <Route path="/blog/best-esim-for-thailand" component={BestEsimThailand} />

        {/* Legal & Company Pages */}
        <Route path="/privacy" component={TermsAndPrivacy} />
        <Route path="/terms-privacy" component={TermsAndPrivacy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/contact" component={Contact} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <WebsiteJsonLd />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
