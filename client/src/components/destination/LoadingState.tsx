import Layout from "@/components/Layout";

export default function LoadingState() {
    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
                <div className="animate-pulse space-y-6">
                    <div className="h-40 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
