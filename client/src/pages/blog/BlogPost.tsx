import { useRoute } from "wouter";
import { getPostBySlug } from "@/lib/blog-registry";
import { Suspense } from "react";
import NotFound from "@/pages/NotFound";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const post = params?.slug ? getPostBySlug(params.slug) : null;

  if (!post) {
    return <NotFound />;
  }

  const Component = post.component;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    }>
      <Component />
    </Suspense>
  );
}
