import Layout from "@/components/Layout";
import { Link } from "wouter";

export default function Blog() {
  const posts = [
    {
      title: "10 Best Things to Do in Bangkok (2026 Guide)",
      excerpt: "From ancient temples to rooftop bars, here are the absolute must-do experiences in Thailand's capital.",
      category: "Activities",
      link: "/blog/best-things-to-do-in-bangkok",
      image: "/images/bangkok.jpg"
    },
    {
      title: "How to Find Cheap Flights to Bangkok (2026 Hacks)",
      excerpt: "Stop overpaying for airfare. We've analyzed thousands of routes to find the best strategies for getting to BKK on a budget.",
      category: "Flights",
      link: "/blog/cheap-flights-to-bangkok",
      image: "/images/hero-travel.jpg"
    },
    {
      title: "Best Airport Transfers in Bangkok: BKK & DMK Guide",
      excerpt: "Don't get scammed by taxi drivers. Here are the safest, most reliable ways to get from the airport to your hotel.",
      category: "Transfers",
      link: "/blog/best-airport-transfers-in-bangkok",
      image: "/images/bangkok.jpg"
    },
    {
      title: "Best Travel Insurance for Thailand (2026 Review)",
      excerpt: "Medical bills in Thailand can be shocking. Here's how to protect yourself from accidents, theft, and cancellations.",
      category: "Insurance",
      link: "/blog/best-travel-insurance-for-thailand",
      image: "/images/bali.jpg"
    },
    {
      title: "Best eSIM for Thailand: Airalo vs. Local SIMs",
      excerpt: "Stay connected the moment you land. We tested the top eSIM providers to see which one offers the best speed and value.",
      category: "Tech",
      link: "/blog/best-esim-for-thailand",
      image: "/images/tokyo.jpg"
    }
  ];

  return (
    <Layout>
      <section className="py-24 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Travel Journal</h1>
            <p className="text-xl text-muted-foreground">
              Expert guides, tips, and hacks to help you travel smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Link key={index} href={post.link} className="group block border border-border bg-card hover:border-primary transition-colors h-full flex flex-col">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="text-primary text-sm font-bold uppercase tracking-wider flex items-center gap-2 mt-auto">
                      Read Article <span className="text-lg">→</span>
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
