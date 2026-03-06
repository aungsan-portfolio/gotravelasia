import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Plane, Hotel, Bus, Globe, X } from "lucide-react";

interface MobileNavProps {
    onPlanTrip?: () => void;
}

const NAV_ITEMS = [
    { icon: Plane, label: "Flights", href: "/#flights" },
    { icon: Hotel, label: "Hotels", href: "/#hotels" },
    { icon: Bus, label: "Transport", href: "/#transport" },
];

export default function MobileNav({ onPlanTrip }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const [pathname] = useLocation();

    const handlePlanTrip = () => {
        onPlanTrip?.();
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>

            {/* Custom styled Sheet Content */}
            <SheetContent side="left" className="w-[min(280px,80vw)] p-0 flex flex-col bg-white border-r-0 shadow-2xl [&>button]:hidden">
                {/* ── Yellow Header (flush to top edge) ── */}
                <div className="bg-[#FFD700] px-4 py-4 flex items-center gap-3 flex-shrink-0">
                    {/* Using SheetClose for accessibility but styling it like the user's close button */}
                    <SheetClose className="p-1 rounded hover:bg-[#FFC200] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-[#FFD700]">
                        <X className="w-5 h-5 text-gray-900" />
                        <span className="sr-only">Close</span>
                    </SheetClose>
                    <SheetHeader className="text-left space-y-0 p-0 m-0">
                        <SheetTitle>
                            <img src="/logo.webp" alt="GoTravel Asia" className="h-8 w-auto" />
                        </SheetTitle>
                    </SheetHeader>
                </div>

                {/* ── Plan My Trip CTA ── */}
                {onPlanTrip && (
                    <div className="px-3 pt-4 pb-2">
                        <button
                            onClick={handlePlanTrip}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                                bg-gray-900 hover:bg-gray-700 text-[#FFD700]
                                font-semibold rounded-lg transition-colors text-sm"
                        >
                            <Plane className="w-4 h-4" />
                            Plan My Trip
                        </button>
                    </div>
                )}

                {/* ── Nav Items ── */}
                <nav className="flex-1 py-2">
                    {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                        const isActive = pathname === href || pathname === href.replace("/#", "/");
                        return (
                            <a
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-[15px] font-medium transition-colors
                                    ${isActive
                                        ? "bg-gray-100 font-bold text-gray-900"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-500"}`} />
                                {label}
                            </a>
                        );
                    })}
                </nav>

                {/* ── Divider ── */}
                <div className="border-t border-gray-200 mx-4" />

                {/* ── Language & Currency (Footer) ── */}
                <div className="py-2 flex-shrink-0">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <span>English</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-500">฿</span>
                        <span>Thai Baht</span>
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
