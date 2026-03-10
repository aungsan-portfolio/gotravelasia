interface SummaryCardProps {
    label: string;
    value: string;
    helperText?: string;
}

export default function SummaryCards({ cards = [] }: { cards: SummaryCardProps[] }) {
    if (!cards.length) return null;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {card.value}
                    </p>
                    {card.helperText ? (
                        <p className="mt-2 text-sm text-slate-600">{card.helperText}</p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
