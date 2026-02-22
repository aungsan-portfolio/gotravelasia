import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WebsiteJsonLd } from "./components/JsonLd";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Bangkok from "./pages/destinations/Bangkok";
import ChiangMai from "./pages/destinations/ChiangMai";
import Phuket from "./pages/destinations/Phuket";
import Krabi from "./pages/destinations/Krabi";
import Pai from "./pages/destinations/Pai";
import ChiangRai from "./pages/destinations/ChiangRai";
import FlightResults from "./pages/FlightResults";

// Legal & Company Pages
import TermsAndPrivacy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";

// Money Pages
import BestThingsToDoBangkok from "./pages/blog/BestThingsToDoBangkok";
import CheapFlightsBangkok from "./pages/blog/CheapFlightsBangkok";
import BestTransfersBangkok from "./pages/blog/BestTransfersBangkok";
import BestInsuranceThailand from "./pages/blog/BestInsuranceThailand";
import BestEsimThailand from "./pages/blog/BestEsimThailand";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
