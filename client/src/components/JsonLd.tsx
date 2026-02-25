const BASE_URL = import.meta.env.VITE_SITE_URL || "https://www.gotravelasia.com";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GoTravel Asia",
  alternateName: "GoTravel",
  url: BASE_URL,
  description:
    "Compare cheap flights, hotels, buses, and trains across Thailand, Singapore, and Vietnam. Travel Asia on a budget with GoTravel Asia.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/flights/results?origin={origin}&destination={destination}`,
    },
    "query-input": "required name=origin required name=destination",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "GoTravel Asia",
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.webp`,
  description:
    "Southeast Asia travel comparison platform. Compare flights, hotels, and transport across Thailand, Singapore, and Vietnam.",
  areaServed: [
    { "@type": "Country", name: "Thailand" },
    { "@type": "Country", name: "Singapore" },
    { "@type": "Country", name: "Vietnam" },
    { "@type": "Country", name: "Myanmar" },
  ],
  serviceType: [
    "Flight Comparison",
    "Hotel Comparison",
    "Transport Booking",
    "Travel Guides",
  ],
  knowsLanguage: ["en", "my"],
};

export function WebsiteJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${BASE_URL}${item.path}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OfferJsonLd({ name, url, category }: { name: string; url: string; category: "flight" | "hotel" | "destination" }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    category,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url,
      priceCurrency: "USD",
      price: "0",
    },
    potentialAction: {
      "@type": "TravelAction",
      target: url,
    },
  };

  if (category === "flight") {
    (schema as any)["@type"] = "Flight";
    (schema as any).offers["@type"] = "FlightOffer";
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
