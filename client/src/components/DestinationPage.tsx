import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Ticket, Car, Wifi, ShieldCheck, ExternalLink, MapPin } from "lucide-react";
import TransportScheduleWidget from "./TransportScheduleWidget";
import { usePageMeta } from "@/hooks/usePageMeta";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export interface DestinationPageProps {
  name: string;
  heroImage: string;
  description: string;
  bestTime: string;
  currency: string;
  language: string;
  slug?: string;
  sections: {
    title: string;
    content: string; // HTML string
  }[];
  affiliateLinks: {
    klook: string;
    kiwi: string;
    traveloka: string;
    welcomePickups: string;
    insurance: string;
    esim: string;
  };
}

export default function DestinationPage(props: DestinationPageProps) {
  const slug = props.slug || props.name.toLowerCase().replace(/\s+/g, "-");
  usePageMeta({
    title: `${props.name} Travel Guide 2026 - Hotels, Flights & Things to Do`,
    description: `Plan your trip to ${props.name}, Thailand. ${props.description.slice(0, 120)}. Compare cheap flights, hotels, and transport with GoTravel Asia.`,
    path: `/thailand/${slug}`,
    ogImage: props.heroImage.startsWith("http") ? props.heroImage : undefined,
    keywords: `${props.name.toLowerCase()} travel guide, ${props.name.toLowerCase()} thailand, travel asia ${props.name.toLowerCase()}, cheap flights ${props.name.toLowerCase()}, ${props.name.toLowerCase()} hotels, things to do ${props.name.toLowerCase()}, southeast asia travel`,
  });

  return (
    <Layout>
      <BreadcrumbJsonLd items={[
        { name: "Thailand", path: "/" },
        { name: props.name, path: `/thailand/${slug}` },
      ]} />
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={props.heroImage} 
            alt={props.name} 
            className="w-full h-full object-cover grayscale contrast-125 brightness-75"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
        </div>
        
        <div className="container relative z-10 text-center">
          <div className="inline-block bg-primary px-4 py-1 mb-4">
            <span className="text-white font-mono text-xs uppercase tracking-widest">Destination Guide</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-4">
            {props.name.toUpperCase()}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light tracking-wide">
            Thailand Travel Guide
          </p>
        </div>
      </section>

      {/* Quick Nav / Intro */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <p className="text-xl leading-relaxed text-muted-foreground">
                {props.description}
              </p>
            </div>
            <div className="bg-muted p-6 border-l-4 border-primary">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Trip Essentials
              </h3>
              <ul className="space-y-3 font-mono text-sm">
                <li className="flex justify-between">
                  <span>Flight Time:</span>
                  <span className="text-muted-foreground">Varies</span>
                </li>
                <li className="flex justify-between">
                  <span>Currency:</span>
                  <span className="text-muted-foreground">{props.currency}</span>
                </li>
                <li className="flex justify-between">
                  <span>Best Time:</span>
                  <span className="text-muted-foreground">{props.bestTime}</span>
                </li>
                 <li className="flex justify-between">
                  <span>Language:</span>
                  <span className="text-muted-foreground">{props.language}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {props.sections.map((section, index) => (
        <section key={index} className={`py-16 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight mb-8">{section.title}</h2>
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        </section>
      ))}

      {/* Transport Widget */}
      <section className="py-16 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Getting Around Thailand</h2>
          <p className="text-muted-foreground mb-8 text-lg">Search for buses, trains, and minibuses to {props.name} and other Thai cities.</p>
          <TransportScheduleWidget />
        </div>
      </section>

      {/* Affiliate Tools Grid */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center text-white">Plan Your Trip to {props.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-white/10 p-6 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <Plane className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2 text-white">Find Cheap Flights</h3>
                <p className="text-sm text-white/80 mb-4">Compare prices from all major airlines.</p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href={props.affiliateLinks.kiwi} target="_blank" rel="noopener noreferrer">Check Prices</a>
                </Button>
             </div>

             <div className="bg-white/10 p-6 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <Hotel className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2 text-white">Book Hotels</h3>
                <p className="text-sm text-white/80 mb-4">Best deals on hotels and resorts.</p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href={props.affiliateLinks.traveloka} target="_blank" rel="noopener noreferrer">Find Stays</a>
                </Button>
             </div>

             <div className="bg-white/10 p-6 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <Ticket className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2 text-white">Book Activities</h3>
                <p className="text-sm text-white/80 mb-4">Tours, tickets, and local experiences.</p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href={props.affiliateLinks.klook} target="_blank" rel="noopener noreferrer">Explore</a>
                </Button>
             </div>

             <div className="bg-white/10 p-6 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <Car className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2 text-white">Airport Transfers</h3>
                <p className="text-sm text-white/80 mb-4">Reliable pickups from the airport.</p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href={props.affiliateLinks.welcomePickups} target="_blank" rel="noopener noreferrer">Book Ride</a>
                </Button>
             </div>

             <div className="bg-white/10 p-6 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <Wifi className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2 text-white">Get an eSIM</h3>
                <p className="text-sm text-white/80 mb-4">Instant connectivity upon arrival.</p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href={props.affiliateLinks.esim} target="_blank" rel="noopener noreferrer">Get Connected</a>
                </Button>
             </div>

             <div className="bg-white/10 p-6 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                <ShieldCheck className="w-8 h-8 mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2 text-white">Travel Insurance</h3>
                <p className="text-sm text-white/80 mb-4">Stay protected during your trip.</p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href={props.affiliateLinks.insurance} target="_blank" rel="noopener noreferrer">Get Quote</a>
                </Button>
             </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
