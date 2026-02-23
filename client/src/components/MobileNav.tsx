import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileNavProps {
    onPlanTrip?: () => void;
}

export default function MobileNav({ onPlanTrip }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    const handleLinkClick = () => {
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <img src="/logo.webp" alt="GoTravel Logo" className="h-8 w-auto" />
                    </SheetTitle>
                </SheetHeader>

                <nav className="mt-8 flex flex-col">
                    <a href="/#flights" onClick={handleLinkClick}
                        className="flex items-center gap-3 py-3 px-3 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-[15px]"
                    >
                        <span className="text-xl">✈️</span> Flights
                    </a>
                    <a href="/#hotels" onClick={handleLinkClick}
                        className="flex items-center gap-3 py-3 px-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-[15px]"
                    >
                        <span className="text-xl">🏨</span> Hotels
                    </a>
                    <a href="/#transport" onClick={handleLinkClick}
                        className="flex items-center gap-3 py-3 px-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-[15px]"
                    >
                        <span className="text-xl">🚌</span> Transport
                    </a>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

