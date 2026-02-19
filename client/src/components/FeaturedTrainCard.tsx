
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Train, Wifi, Snowflake, Coffee, Ticket, ExternalLink, CalendarClock } from "lucide-react";

interface FeaturedTrainCardProps {
    from: string;
    to: string;
}

export function FeaturedTrainCard({ from, to }: FeaturedTrainCardProps) {
    const [activeTab, setActiveTab] = useState("1st-class");

    // Only show for BKK-CNX route
    const isBkkToCnx = from === "Bangkok" && to === "Chiang Mai";
    const isCnxToBkk = from === "Chiang Mai" && to === "Bangkok";

    if (!isBkkToCnx && !isCnxToBkk) return null;

    const trainNumber = isBkkToCnx ? "9" : "10";
    const departure = isBkkToCnx ? "18:10" : "18:00";
    const arrival = isBkkToCnx ? "07:15" : "06:50";

    // Dynamic booking URL
    const bookingUrl = `https://12go.asia/en/travel/${from.toLowerCase().replace(" ", "-")}/${to.toLowerCase().replace(" ", "-")}?z=14566451&sub_id=featured_train_card`;

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

                            {/* Images via Unsplash Source */}
                            <TabsContent value="exterior" className="h-full m-0 p-0">
                                <img
                                    src="https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?auto=format&fit=crop&q=80&w=800"
                                    alt="Thai Railways CNR Red Train"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </TabsContent>
                            <TabsContent value="1st-class" className="h-full m-0 p-0">
                                <img
                                    src="https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&q=80&w=800"
                                    alt="1st Class Sleeper Cabin"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </TabsContent>
                            <TabsContent value="2nd-class" className="h-full m-0 p-0">
                                <img
                                    src="https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?auto=format&fit=crop&q=80&w=800"
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
                                    <p className="text-muted-foreground font-medium">Train No. {trainNumber} "Uttraphimuk"</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-red-600 flex items-center justify-end gap-1">
                                        <CalendarClock className="w-4 h-4" /> Daily
                                    </p>
                                    <p className="text-xs text-muted-foreground">{departure} - {arrival}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className={`p-4 rounded-xl border transition-all ${activeTab === '1st-class' ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-100 hover:border-red-100'}`}>
                                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                        <Ticket className="w-4 h-4" /> 1st Class AC Sleeper
                                    </h4>
                                    <ul className="text-sm space-y-1.5 text-slate-600">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Private Lockable Cabin (2 Berth)</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Personal Touchescreen & USB</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Wash Basin & Mirror in room</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Hot Shower (Shared)</li>
                                    </ul>
                                    <p className="mt-3 text-lg font-bold text-slate-900">~ ฿1,650 - ฿1,950</p>
                                </div>

                                <div className={`p-4 rounded-xl border transition-all ${activeTab === '2nd-class' ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-100 hover:border-red-100'}`}>
                                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                        <Ticket className="w-4 h-4" /> 2nd Class AC Sleeper
                                    </h4>
                                    <ul className="text-sm space-y-1.5 text-slate-600">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Comfortable Open-Plan Berths</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Privacy Curtains per berth</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Power Outlet at every seat</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Clean Toilets (Shared)</li>
                                    </ul>
                                    <p className="mt-3 text-lg font-bold text-slate-900">~ ฿940 - ฿1,050</p>
                                </div>
                            </div>

                            <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                                <span className="flex items-center gap-1"><Snowflake className="w-3 h-3" /> AC</span>
                                <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> No Wifi</span>
                                <span className="flex items-center gap-1"><Coffee className="w-3 h-3" /> Dining Car</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-red-100 pt-4 mt-auto">
                            <div className="text-xs text-red-600 font-medium px-3 py-1.5 bg-red-50 rounded-full flex items-center gap-1.5">
                                ⚠️ Highly Recommended: Book 30-90 days in advance!
                            </div>

                            <a
                                href={bookingUrl}
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
