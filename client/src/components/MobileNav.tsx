import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Plane, MapPin, BookOpen, Mail } from "lucide-react";
import SignInModal from "./SignInModal";
import { AFFILIATE, buildAviasalesUrl, buildAgodaPartnerUrl, buildKlookUrl } from "@/lib/config";

interface MobileNavProps {
    onPlanTrip?: () => void;
}

export default function MobileNav({ onPlanTrip }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    const destinations = [
        { name: "Bangkok", href: "/thailand/bangkok" },
        { name: "Chiang Mai", href: "/thailand/chiang-mai" },
        { name: "Phuket", href: "/thailand/phuket" },
        { name: "Krabi", href: "/thailand/krabi" },
        { name: "Pai", href: "/thailand/pai" },
        { name: "Chiang Rai", href: "/thailand/chiang-rai" },
    ];

    const handleLinkClick = () => {
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <img src="/logo.webp" alt="GoTravel Logo" className="h-8 w-auto" />
                    </SheetTitle>
                </SheetHeader>

                <nav className="mt-8 flex flex-col gap-6">
                    {/* Search Tabs */}
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            <Plane className="w-4 h-4" />
                            Search
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <a href="/#flights" onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
                                >✈️ Flights</a>
                            </li>
                            <li>
                                <a href="/#hotels" onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
                                >🏨 Hotels</a>
                            </li>
                            <li>
                                <a href="/#transport" onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
                                >🚌 Transport</a>
                            </li>
                        </ul>
                    </div>

                    {/* Destinations */}
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            Destinations
                        </div>
                        <ul className="space-y-1">
                            {destinations.map((dest) => (
                                <li key={dest.href}>
                                    <Link
                                        href={dest.href}
                                        onClick={handleLinkClick}
                                        className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                                    >
                                        {dest.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Other Links */}
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            <BookOpen className="w-4 h-4" />
                            Resources
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/blog"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    Travel Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CTAs */}
                    <div className="border-t border-border pt-6 space-y-3">
                        <SignInModal variant="mobile" />
                        <Button
                            className="w-full justify-start font-mono text-xs uppercase bg-secondary text-secondary-foreground hover:bg-primary hover:text-white"
                            onClick={() => {
                                setOpen(false);
                                onPlanTrip?.();
                            }}
                        >
                            {t("cta.planTrip")}
                        </Button>
                    </div>

                    {/* Quick Links */}
                    <div className="border-t border-border pt-6">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            <Plane className="w-4 h-4" />
                            {t("mobile.quickBook")}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={buildAviasalesUrl("RGN", "BKK")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                {t("nav.flights")}
                            </a>
                            <a
                                href={buildAgodaPartnerUrl(15932)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                Agoda
                            </a>
                            <a
                                href={buildKlookUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                {t("nav.tours")}
                            </a>
                            <a
                                href={AFFILIATE.AIRALO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                {t("nav.esim")}
                            </a>
                        </div>
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

