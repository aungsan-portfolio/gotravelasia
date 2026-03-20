import Layout from "@/components/Layout";
import { Link } from "wouter";
import SEO from "@/seo/SEO";
import OptimizedImage from "@/seo/OptimizedImage";
import { BLOG_POSTS } from "@/lib/blog-registry";

export default function Blog() {
  const posts = BLOG_POSTS;

  return (
    <Layout>
      <SEO path="/blog" />
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
              <Link key={index} href={`/blog/${post.slug}`} className="group block border border-border bg-card hover:border-primary transition-colors h-full flex flex-col">
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <OptimizedImage
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={225}
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
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
