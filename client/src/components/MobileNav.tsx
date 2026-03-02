import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plane, Hotel, Bus } from "lucide-react";

interface MobileNavProps {
    onPlanTrip?: () => void;
}

export default function MobileNav({ onPlanTrip }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    const handleLinkClick = () => setOpen(false);

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

            <SheetContent side="left" className="w-[280px] flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <img src="/logo.webp" alt="GoTravel Logo" className="h-8 w-auto" />
                    </SheetTitle>
                </SheetHeader>

                {/* CTA Button */}
                {onPlanTrip && (
                    <Button
                        onClick={handlePlanTrip}
                        className="mt-8 w-full bg-[#5B0EA6] hover:bg-[#4a0b8a] text-white font-semibold"
                    >
                        <Plane className="w-4 h-4 mr-2" />
                        Plan My Trip
                    </Button>
                )}

                <nav className="mt-6 flex flex-col">
                    <a
                        href="/#flights"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-[15px]"
                    >
                        <Plane className="w-5 h-5 text-gray-500" /> Flights
                    </a>
                    <a
                        href="/#hotels"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-[15px]"
                    >
                        <Hotel className="w-5 h-5 text-gray-500" /> Hotels
                    </a>
                    <a
                        href="/#transport"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-[15px]"
                    >
                        <Bus className="w-5 h-5 text-gray-500" /> Transport
                    </a>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
