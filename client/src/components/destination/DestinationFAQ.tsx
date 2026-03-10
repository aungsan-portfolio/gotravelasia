const buildFaqItems = (originCity: string, destinationCity: string, destinationCode: string) => [
    {
        q: `How do I find cheap flights from ${originCity} to ${destinationCity}?`,
        a: `Start by comparing current fares, checking multiple airlines, and reviewing both one-way and round-trip options. This page currently shows one-way fare data from the latest available route dataset.`,
    },
    {
        q: `Are these prices live and guaranteed?`,
        a: `Prices can change quickly. The deals shown here are based on the latest available dataset, but final fare, baggage rules, and ticket conditions should always be confirmed on the booking provider page.`,
    },
    {
        q: `Are nonstop flights available to ${destinationCode}?`,
        a: `If nonstop options are present in the current dataset, they will appear in the deals section with the label “Nonstop.” Duration, baggage, and booking provider details may not yet be available for all routes.`,
    },
    {
        q: `Why don’t I see trend charts or heatmaps here?`,
        a: `This page follows a data-honest approach. We only display insights backed by real available data from our bots. Trend charts will be added later when reliable historical data is available.`,
    },
];

interface DestinationFAQProps {
    originCity: string;
    destinationCity: string;
    destinationCode: string;
}

export default function DestinationFAQ({
    originCity,
    destinationCity,
    destinationCode,
}: DestinationFAQProps) {
    const items = buildFaqItems(originCity, destinationCity, destinationCode);

    return (
        <section id="faq" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Frequently asked questions
            </h2>
            <div className="mt-6 space-y-4">
                {items.map((item) => (
                    <details
                        key={item.q}
                        className="group rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                        <summary className="cursor-pointer list-none font-semibold text-slate-900">
                            {item.q}
                        </summary>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
