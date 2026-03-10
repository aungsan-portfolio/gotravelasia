import { Link } from "wouter";

const relatedRoutes = [
    { label: "Yangon to Bangkok", href: "/flights/rgn/bkk" },
    { label: "Mandalay to Bangkok", href: "/flights/mdl/bkk" },
    { label: "Yangon to Singapore", href: "/flights/rgn/sin" },
    { label: "Bangkok to Tokyo", href: "/flights/bkk/nrt" },
    { label: "Kuala Lumpur to Seoul", href: "/flights/kul/icn" },
    { label: "Phuket to Bali", href: "/flights/hkt/dps" },
];

export default function RelatedRoutes({ originCode, destinationCode }: { originCode: string, destinationCode: string }) {
    // We can eventually filter based on originCode if needed
    return (
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Browse more routes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
                Explore nearby and popular routes for internal linking and trip discovery.
            </p>

            <div className="mt-5 space-y-3">
                {relatedRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                        {route.label}
                    </Link>
                ))}
            </div>
        </aside>
    );
}
