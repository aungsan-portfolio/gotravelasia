import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Train, Wifi, Snowflake, Coffee, Ticket, ExternalLink, CalendarClock, AlertTriangle, Lightbulb } from "lucide-react";

/* ─── Types matching transport.json → featuredTrains ─── */
interface TrainClass {
    class: string;
    price: number;
    availability: string;
    features: string[];
}

interface FeaturedTrain {
    trainNumber: string;
    trainName: string;
    departure: string;
    arrival: string;
    duration: string;
    frequency: string;
    classes: TrainClass[];
    bookingUrl: string;
    tips: string[];
}

interface FeaturedTrainCardProps {
    from: string;
    to: string;
}

export function FeaturedTrainCard({ from, to }: FeaturedTrainCardProps) {
    const [activeTab, setActiveTab] = useState("exterior");
    const [trainData, setTrainData] = useState<FeaturedTrain | null>(null);
    const [loading, setLoading] = useState(true);

    // Only show for BKK-CNX route
    const isBkkToCnx = from === "Bangkok" && to === "Chiang Mai";
    const isCnxToBkk = from === "Chiang Mai" && to === "Bangkok";
    const routeKey = isBkkToCnx ? "Bangkok-Chiang Mai" : isCnxToBkk ? "Chiang Mai-Bangkok" : null;

    useEffect(() => {
        if (!routeKey) return;

        fetch("/data/transport.json")
            .then((res) => res.json())
            .then((data) => {
                const featured = data?.featuredTrains?.[routeKey];
                if (featured) setTrainData(featured);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [routeKey]);

    if (!routeKey) return null;
    if (loading) return null;

    // Fallback to hardcoded data if transport.json doesn't have featuredTrains yet
    const train: FeaturedTrain = trainData || {
        trainNumber: isBkkToCnx ? "9" : "10",
        trainName: "Uttraphimuk Special Express (CNR)",
        departure: isBkkToCnx ? "18:10" : "18:00",
        arrival: isBkkToCnx ? "07:15 (+1)" : "06:50 (+1)",
        duration: "13 hours",
        frequency: "Daily",
        classes: [
            { class: "1st Class AC Sleeper", price: 1650, availability: "High Demand — Book 60-90 days ahead", features: ["Private Lockable Cabin (2 Berth)", "Touchscreen & USB Charging", "Wash Basin & Mirror", "Shared Hot Shower"] },
            { class: "2nd Class AC Sleeper", price: 950, availability: "Available — Book 30-60 days ahead", features: ["Comfortable Open-Plan Berths", "Privacy Curtains", "Power Outlet at every berth", "Clean Bedding Provided"] },
        ],
        bookingUrl: `https://12go.asia/en/travel/${from.toLowerCase().replace(" ", "-")}/${to.toLowerCase().replace(" ", "-")}?z=14566451&sub_id=featured_train_card`,
        tips: ["Lower berths have windows and more space", "Dining car serves Thai food — bring snacks too"],
    };

    const firstClass = train.classes[0];
    const secondClass = train.classes[1];

    // Availability badge color
    const getAvailabilityColor = (text: string) => {
        if (text.toLowerCase().includes("sold out")) return "bg-gray-800 text-white";
        if (text.toLowerCase().includes("high demand")) return "bg-amber-100 text-amber-800 border-amber-200";
        return "bg-green-100 text-green-800 border-green-200";
    };

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="bg-red-600 hover:bg-red-700 text-white border-none px-3 py-1 text-xs uppercase tracking-wider shadow-sm">
                    🌟 Featured Journey
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">most popular choice</span>
            </div>

            <Card className="overflow-hidden border-2 border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-lg relative">
                <div className="grid grid-cols-1 lg:grid-cols-5 h-full">

                    {/* Left: Image Showcase */}
                    <div className="lg:col-span-2 relative h-64 lg:h-full bg-slate-100">
                        <Tabs defaultValue="exterior" className="h-full" onValueChange={setActiveTab}>
                            <div className="absolute top-4 left-4 z-20 flex gap-2">
                                <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-md border-none">
                                    Special Express CNR
                                </Badge>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 z-20">
                                <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-md border-white/10 text-white">
                                    <TabsTrigger value="exterior" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white">Train</TabsTrigger>
                                    <TabsTrigger value="1st-class" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white">1st Class</TabsTrigger>
                                    <TabsTrigger value="2nd-class" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white">2nd Class</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="exterior" className="h-full m-0 p-0">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/201701_SRT_CNR_Second_Class_Sleeper_Coaches_as_023_at_Bangkok_Station.jpg/1024px-201701_SRT_CNR_Second_Class_Sleeper_Coaches_as_023_at_Bangkok_Station.jpg"
                                    alt="Thai Railways CNR Red Train"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </TabsContent>
                            <TabsContent value="1st-class" className="h-full m-0 p-0">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/201701_Cabin_Corridor_of_SRT_CNR_First_Class_Sleeper_Coach.jpg/1024px-201701_Cabin_Corridor_of_SRT_CNR_First_Class_Sleeper_Coach.jpg"
                                    alt="1st Class Sleeper Cabin Corridor"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </TabsContent>
                            <TabsContent value="2nd-class" className="h-full m-0 p-0">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/201701_Beds_at_SRT_CNR_Second_Class_Sleeper_Coach_%282%29.jpg/1024px-201701_Beds_at_SRT_CNR_Second_Class_Sleeper_Coach_%282%29.jpg"
                                    alt="2nd Class Sleeper Berths"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right: Content & Booking */}
                    <div className="lg:col-span-3 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Train className="w-6 h-6 text-red-600" />
                                        {isBkkToCnx ? "Bangkok → Chiang Mai" : "Chiang Mai → Bangkok"}
                                    </h3>
                                    <p className="text-muted-foreground font-medium">
                                        Train No. {train.trainNumber} "{train.trainName}"
                                    </p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-red-600 flex items-center justify-end gap-1">
                                        <CalendarClock className="w-4 h-4" /> {train.frequency}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{train.departure} → {train.arrival}</p>
                                </div>
                            </div>

                            {/* Class cards with dynamic availability */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {firstClass && (
                                    <div className={`p-4 rounded-xl border transition-all ${activeTab === '1st-class' ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-100 hover:border-red-100'}`}>
                                        <h4 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                                            <Ticket className="w-4 h-4" /> {firstClass.class}
                                        </h4>
                                        <Badge className={`mb-2 text-[10px] font-medium border ${getAvailabilityColor(firstClass.availability)}`}>
                                            {firstClass.availability}
                                        </Badge>
                                        <ul className="text-sm space-y-1 text-slate-600">
                                            {firstClass.features.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-lg font-bold text-slate-900">~ ฿{firstClass.price.toLocaleString()}</p>
                                    </div>
                                )}

                                {secondClass && (
                                    <div className={`p-4 rounded-xl border transition-all ${activeTab === '2nd-class' ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-100 hover:border-red-100'}`}>
                                        <h4 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                                            <Ticket className="w-4 h-4" /> {secondClass.class}
                                        </h4>
                                        <Badge className={`mb-2 text-[10px] font-medium border ${getAvailabilityColor(secondClass.availability)}`}>
                                            {secondClass.availability}
                                        </Badge>
                                        <ul className="text-sm space-y-1 text-slate-600">
                                            {secondClass.features.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-lg font-bold text-slate-900">~ ฿{secondClass.price.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1"><Snowflake className="w-3 h-3" /> AC</span>
                                <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> No Wifi</span>
                                <span className="flex items-center gap-1"><Coffee className="w-3 h-3" /> Dining Car</span>
                            </div>

                            {/* Tips from bot data */}
                            {train.tips && train.tips.length > 0 && (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3">
                                    <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                                        <Lightbulb className="w-3 h-3" /> Insider Tips
                                    </p>
                                    <ul className="text-xs text-amber-700 space-y-0.5">
                                        {train.tips.map((tip, i) => (
                                            <li key={i}>• {tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-red-100 pt-4 mt-auto">
                            <div className="text-xs text-red-600 font-medium px-3 py-1.5 bg-red-50 rounded-full flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" /> Book 30-90 days in advance!
                            </div>

                            <a
                                href={train.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200 transition-all font-bold">
                                    Check Availability on 12Go <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
