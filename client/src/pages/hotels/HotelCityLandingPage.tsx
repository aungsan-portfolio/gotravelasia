import { useEffect } from "react";
import { useRoute, Redirect } from "wouter";
import { Helmet } from "react-helmet-async";
import { hotelCitiesRegistry } from "@/data/hotelCities";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { StructuredData } from "@/components/seo/StructuredData";
import HotelsSearchForm from "@/components/hotels/HotelsSearchForm";
import { SITE_URL } from "@/lib/config";
import { trackHotelCityLandingView } from "@/lib/hotels/tracking";

export default function HotelCityLandingPage() {
  const [match, params] = useRoute("/hotels/:city");
  
  if (!match || !params?.city) {
    return <Redirect to="/hotels" />;
  }

  const citySlug = params.city.toLowerCase().trim();
  const cityData = hotelCitiesRegistry[citySlug];

  // Graceful fallback for unsupported SEO cities: 
  // redirect to the standard search page with the city prefilled in the query.
  if (!cityData) {
    return <Redirect to={`/hotels?city=${encodeURIComponent(citySlug)}`} />;
  }

  useEffect(() => {
    trackHotelCityLandingView({
      city: cityData.slug,
      cityName: cityData.cityName,
      canonicalPath: cityData.canonicalPath,
      entryPoint: "hotel_city_page",
    });
  }, [cityData]);

  // Schema.org CollectionPage and BreadcrumbList using @graph
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${cityData.canonicalPath}#webpage`,
        "url": `${SITE_URL}${cityData.canonicalPath}`,
        "name": cityData.title,
        "description": cityData.description,
        "isPartOf": {
          "@id": `${SITE_URL}/#website`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}${cityData.canonicalPath}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${SITE_URL}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Hotels",
            "item": `${SITE_URL}/hotels`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": cityData.cityName,
            "item": `${SITE_URL}${cityData.canonicalPath}`
          }
        ]
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{cityData.title}</title>
        <meta name="description" content={cityData.description} />
        <link rel="canonical" href={`${SITE_URL}${cityData.canonicalPath}`} />
      </Helmet>

      <StructuredData schema={schema} />

      <main className="min-h-screen bg-slate-50 font-sans pb-16">
        {/* Hero Section */}
        <div className="relative h-[400px] md:h-[500px] w-full bg-slate-900">
          <img
            src={cityData.heroImage}
            alt={`Hotels in ${cityData.cityName}, ${cityData.country}`}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-12 md:pb-16 max-w-7xl mx-auto w-full">
            <Breadcrumbs
              items={[
                { label: "Hotels", href: "/hotels" },
                { label: cityData.cityName }
              ]}
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight">
              Hotels in {cityData.cityName}
            </h1>
            <p className="mt-3 text-lg text-slate-200 max-w-2xl">
              {cityData.country}
            </p>
          </div>
        </div>

        {/* Search Widget Overlay */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Search {cityData.cityName} Hotels</h2>
            <HotelsSearchForm 
              initialCity={cityData.slug} 
              layout="compact" 
              entryPoint="hotel_city_page"
              canonicalPath={cityData.canonicalPath}
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About {cityData.cityName} Hotels</h2>
              <p className="text-slate-700 leading-relaxed">
                {cityData.aboutText}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Areas to Stay</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cityData.areasToStay.map((area, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-700">{area.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{area.description}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          <aside className="space-y-6">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900 mb-3">Best Time to Visit</h3>
              <p className="text-sm text-indigo-800 leading-relaxed">
                {cityData.bestTimeToVisit}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Live Inventory</h3>
              <p className="text-sm text-slate-600 mb-4">
                Enter your travel dates in the search form above to see live prices, real-time availability, and detailed room options from our booking partners.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
