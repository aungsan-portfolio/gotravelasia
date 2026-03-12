// client/src/components/flights/destination/FooterSections.tsx

import { useState } from "react";
import { Link } from "wouter";
import type { DestinationPageVM } from "@/types/destination";

type FooterSectionsProps = {
  data: DestinationPageVM;
};

export default function FooterSections({ data }: FooterSectionsProps) {
  const { footer, route } = data;
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
                Trip planning
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {footer.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                Useful route links, related destinations, and common questions for{" "}
                {route.destination.city}.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#100b21] p-4">
              <p className="text-sm font-medium text-white">Browse routes</p>
              <div className="mt-4 grid gap-2">
                {footer.browseLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.08]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#100b21] p-4">
              <p className="text-sm font-medium text-white">Nearby routes</p>
              <div className="mt-4 grid gap-3">
                {footer.nearbyRoutes.map((routeItem) => (
                  <Link
                    key={routeItem.href}
                    href={routeItem.href}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {routeItem.city}
                        </p>
                        <p className="mt-1 text-xs text-white/55">
                          {routeItem.code}
                        </p>
                      </div>

                      {routeItem.tag ? (
                        <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2.5 py-1 text-[11px] text-fuchsia-200">
                          {routeItem.tag}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Frequently asked questions</p>
              <p className="mt-1 text-xs text-white/55">
                Route and booking basics for {route.origin.city} to {route.destination.city}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {footer.faqs.map((faq, index) => {
              const open = openFaqIndex === index;

              return (
                <div
                  key={`${faq.q}-${index}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#100b21]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    <span className="shrink-0 text-lg leading-none text-white/50">
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  {open ? (
                    <div className="border-t border-white/10 px-4 py-4">
                      <p className="text-sm leading-7 text-white/70">{faq.a}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#100b21] p-4">
            <p className="text-sm font-medium text-white">Route note</p>
            <p className="mt-2 text-sm leading-7 text-white/65">
              Prices, schedules, and airline availability can shift quickly, so this page is best
              used as a route planning view before running a fresh search.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
