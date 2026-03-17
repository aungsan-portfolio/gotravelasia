import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex px-4 py-3 text-white/40" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-xs font-medium hover:text-white transition-colors">
            <Home className="mr-2 h-3 w-3" />
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="h-3 w-3 mx-1" />
              {item.href ? (
                <Link href={item.href} className="ml-1 text-xs font-medium hover:text-white md:ml-2 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="ml-1 text-xs font-medium text-white/70 md:ml-2">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
