import Layout from "@/components/Layout";

export default function EmptyState({ originCode, destinationCode }: { originCode: string, destinationCode: string }) {
    return (
        <Layout>
            <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 w-full">
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 shadow-sm flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4">✈️</div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        No flight deals found right now
                    </h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        We couldn’t find any currently tracked deals for flights from{" "}
                        <span className="font-semibold text-primary">{originCode}</span> to{" "}
                        <span className="font-semibold text-primary">{destinationCode}</span>.
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Our bot explores thousands of routes daily. Please try another popular route or check back later!
                    </p>
                    <div className="mt-8 flex gap-4">
                        <a
                            href="/"
                            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
