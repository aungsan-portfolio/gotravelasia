import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check, X, Star, ArrowRight, ExternalLink } from "lucide-react";

export interface Product {
  name: string;
  rating: number;
  bestFor: string;
  description: string;
  pros: string[];
  cons: string[];
  ctaText: string;
  affiliateLink: string;
  image?: string;
  price?: string;
}

export interface MoneyPageData {
  title: string;
  subtitle: string;
  author: string;
  updatedDate: string;
  intro: string;
  products: Product[];
  conclusion: string;
}

export default function MoneyPage({ data }: { data: MoneyPageData }) {
  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            Expert Review
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">
            {data.title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            {data.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-mono">
            <span>By {data.author}</span>
            <span>•</span>
            <span>Updated {data.updatedDate}</span>
          </div>
        </header>

        {/* Intro */}
        <div className="prose prose-lg max-w-none mb-16">
          <p className="lead">{data.intro}</p>
        </div>

        {/* Comparison Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto mb-20 border border-border bg-background">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-4 font-bold uppercase text-xs tracking-wider">Product</th>
                <th className="p-4 font-bold uppercase text-xs tracking-wider">Best For</th>
                <th className="p-4 font-bold uppercase text-xs tracking-wider">Rating</th>
                <th className="p-4 font-bold uppercase text-xs tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-bold uppercase rounded-sm">
                      {product.bestFor}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <a 
                      href={product.affiliateLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      Check Price <ArrowRight className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product Reviews */}
        <div className="space-y-16">
          {data.products.map((product, idx) => (
            <div key={idx} className="border border-border p-8 bg-background scroll-mt-24" id={`product-${idx}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                      {idx + 1}. {product.name}
                    </h2>
                    <span className="bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {product.bestFor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <span className="text-xl font-bold text-foreground">{product.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {product.price && (
                   <div className="text-2xl font-mono font-bold text-muted-foreground">
                      {product.price}
                   </div>
                )}
              </div>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-green-50/50 p-6 border border-green-100">
                  <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5" /> The Good
                  </h4>
                  <ul className="space-y-2">
                    {product.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50/50 p-6 border border-red-100">
                  <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                    <X className="w-5 h-5" /> The Bad
                  </h4>
                  <ul className="space-y-2">
                    {product.cons.map((con, i) => (
                      <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button size="lg" className="w-full md:w-auto font-mono uppercase tracking-wider text-lg h-14 px-8" asChild>
                <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                  {product.ctaText} <ExternalLink className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* Conclusion */}
        <div className="mt-20 p-8 bg-muted/30 border-t border-border">
          <h3 className="text-2xl font-bold mb-4">Our Verdict</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {data.conclusion}
          </p>
        </div>
      </article>
    </Layout>
  );
}
