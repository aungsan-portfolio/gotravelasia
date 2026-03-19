import { useMemo } from "react";

const TP_MARKER = import.meta.env.VITE_TP_MARKER ?? "697202";

interface Props {
  cityName: string;
  destinationCode: string;
  pickupDate: string | null;
  returnDate: string | null;
}

type CarCard = {
  label: string;
  imageSrc: string;
  imageAlt: string;
};

const CAR_CARDS: CarCard[] = [
  {
    label: "Small",
    imageSrc: "/images/cars/small.png",
    imageAlt: "Small rental car",
  },
  {
    label: "Medium",
    imageSrc: "/images/cars/medium.png",
    imageAlt: "Medium rental car",
  },
  {
    label: "Large",
    imageSrc: "/images/cars/large.png",
    imageAlt: "Large rental car",
  },
];

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function buildCarsUrl({
  cityName,
  destinationCode,
  pickupDate,
  returnDate,
}: Props): string {
  const url = new URL("https://www.discovercars.com/");
  url.searchParams.set("a_aid", TP_MARKER);
  url.searchParams.set("pick_up_location", destinationCode || cityName);
  if (pickupDate) url.searchParams.set("pick_up_date", pickupDate);
  if (returnDate) url.searchParams.set("drop_off_date", returnDate);
  url.searchParams.set("currency", "THB");
  return url.toString();
}

export function CarsSection({
  cityName,
  destinationCode,
  pickupDate,
  returnDate,
}: Props) {
  const carsUrl = useMemo(
    () =>
      buildCarsUrl({
        cityName,
        destinationCode,
        pickupDate,
        returnDate,
      }),
    [cityName, destinationCode, pickupDate, returnDate],
  );

  const dateRange = useMemo(() => {
    if (pickupDate && returnDate) return `${fmtDate(pickupDate)} – ${fmtDate(returnDate)}`;
    if (pickupDate) return `From ${fmtDate(pickupDate)}`;
    return "";
  }, [pickupDate, returnDate]);

  if (!cityName && !destinationCode) return null;

  return (
    <section
      aria-labelledby="cars-heading"
      className="border-t border-neutral-200 bg-white px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="cars-heading" className="text-lg font-bold text-neutral-950 sm:text-xl">
              Drive around in {cityName || destinationCode}
            </h2>
            {dateRange && <p className="mt-0.5 text-sm text-neutral-500">{dateRange}</p>}
          </div>

          <a
            href={carsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-yellow-400 hover:bg-yellow-50"
          >
            Find cars
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CAR_CARDS.map((car) => (
            <a
              key={car.label}
              href={carsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                <img
                  src={car.imageSrc}
                  alt={car.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="px-3 py-3">
                <p className="text-sm font-semibold text-neutral-900">{car.label}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
