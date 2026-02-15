import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Plane, MapPin, BookOpen, Mail } from "lucide-react";

export default function MobileNav() {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    const destinations = [
        { nameKey: "destinations.chiangMai", href: "/thailand/chiang-mai" },
        { nameKey: "destinations.bangkok", href: "/thailand/bangkok" },
        { nameKey: "destinations.phuket", href: "/thailand/phuket" },
        { nameKey: "destinations.krabi", href: "/thailand/krabi" },
        { nameKey: "destinations.pai", href: "/thailand/pai" },
        { nameKey: "destinations.chiangRai", href: "/thailand/chiang-rai" },
    ];

    const handleLinkClick = () => {
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <img src="/logo.png" alt="GoTravel Logo" className="h-8 w-auto" />
                    </SheetTitle>
                </SheetHeader>

                <nav className="mt-8 flex flex-col gap-6">
                    {/* Destinations */}
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            {t("mobile.destinations")}
                        </div>
                        <ul className="space-y-1">
                            {destinations.map((dest) => (
                                <li key={dest.href}>
                                    <Link
                                        href={dest.href}
                                        onClick={handleLinkClick}
                                        className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                                    >
                                        {t(dest.nameKey)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Other Links */}
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            <BookOpen className="w-4 h-4" />
                            {t("mobile.resources")}
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    href="/blog"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    {t("mobile.travelBlog")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    {t("footer.contactUs")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CTAs */}
                    <div className="border-t border-border pt-6 space-y-3">
                        <Button variant="outline" className="w-full justify-start font-mono text-xs uppercase">
                            {t("cta.signIn")}
                        </Button>
                        <Button className="w-full justify-start font-mono text-xs uppercase bg-secondary text-secondary-foreground hover:bg-primary hover:text-white">
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
                                href="https://www.kiwi.com/en/search/results/yangon-myanmar/thailand"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                {t("nav.flights")}
                            </a>
                            <a
                                href="https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1959281&city=15932"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                Agoda
                            </a>
                            <a
                                href="https://www.klook.com/en-US/country/4-thailand-things-to-do/?aid=111750"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-center py-2 px-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                {t("nav.tours")}
                            </a>
                            <a
                                href="https://www.airalo.com/thailand-esim"
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

