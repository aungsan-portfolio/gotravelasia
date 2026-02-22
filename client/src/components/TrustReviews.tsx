import { Star, Quote, Shield, CheckCircle } from "lucide-react";

const REVIEWS = [
  {
    name: "Aung Kyaw",
    location: "Yangon, Myanmar",
    text: "The price comparison across multiple sites helped me find a better deal on my Bangkok flight than what the travel agency quoted. So convenient!",
    rating: 5,
    route: "Yangon → Bangkok",
    saved: "Better price",
  },
  {
    name: "Su Myat",
    location: "Mandalay, Myanmar",
    text: "Booked my Chiang Mai hotel through the Agoda link and it was so easy. Love that the site supports Burmese — really helpful for my parents.",
    rating: 5,
    route: "Hotels in Chiang Mai",
    saved: "Easy booking",
  },
  {
    name: "Thura Win",
    location: "Yangon, Myanmar",
    text: "Used 12Go to book the Bangkok to Phuket train. So much easier than trying to find the Thai railway website myself. Highly recommend.",
    rating: 4,
    route: "Bangkok → Phuket",
    saved: "Time saved",
  },
];

const PARTNER_STATS = [
  { name: "Aviasales", role: "Flight Search", logo: "/images/partners/aviasales.svg" },
  { name: "Trip.com", role: "Flights & Hotels", logo: "/images/partners/tripcom.svg" },
  { name: "Agoda", role: "Hotel Booking", logo: "/images/partners/agoda.svg" },
  { name: "12Go", role: "Transport", logo: "/images/partners/12go.svg" },
  { name: "Klook", role: "Tours & Activities", logo: "/images/partners/klook.svg" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function TrustReviews() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Shield className="w-4 h-4" />
            Trusted by travelers from Myanmar
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            What Our Travelers Say
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real experiences from travelers who found better deals through GoTravelAsia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
            >
              <Quote className="w-8 h-8 text-primary/15 absolute top-4 right-4" />
              <StarRow rating={review.rating} />
              <p className="text-gray-700 mt-3 mb-4 leading-relaxed text-sm">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{review.name}</div>
                  <div className="text-xs text-gray-500">{review.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{review.route}</div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <CheckCircle className="w-3 h-3" />
                    {review.saved}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            We compare prices from these trusted partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {PARTNER_STATS.map((partner) => (
              <div key={partner.name} className="flex flex-col items-center gap-2 group">
                <div className="h-10 w-28 flex items-center justify-center grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{partner.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
