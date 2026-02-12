import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import FlightSearchWidget from "@/components/FlightSearchWidget";
import TransportScheduleWidget from "@/components/TransportScheduleWidget";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Calendar, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* --- HERO SECTION WITH FLIGHT WIDGET --- */}
      <section className="relative pt-20 pb-32 flex items-center min-h-[600px] bg-gradient-to-b from-purple-50 to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/20 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Explore <span className="text-purple-600">Myanmar</span> &amp; <span className="text-purple-600">Thailand</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Book flights, buses, and trains seamlessly. The smartest way to travel across Southeast Asia with real-time price comparisons.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Best Price Guarantee
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> 24/7 Support
                </div>
              </div>
            </div>

            {/* Right Content: FLIGHT WIDGET */}
            <div className="flex-1 w-full max-w-xl">
              <FlightSearchWidget />
            </div>
          </div>
        </div>
      </section>

      {/* --- TRANSPORT SCHEDULE WIDGET (BUS/TRAIN) --- */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Ground Transport Deals</h2>
            <p className="text-gray-600">Cheapest buses and trains for local travel</p>
          </div>
          <TransportScheduleWidget />
        </div>
      </section>

      {/* --- POPULAR DESTINATIONS --- */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-gray-600">Top rated locations by our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Bangkok Card */}
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2192&auto=format&fit=crop"
                  alt="Bangkok"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Bangkok</h3>
                  <p className="text-sm opacity-90">Thailand</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Best time: Nov-Feb
                  </span>
                  <span className="text-purple-600 font-bold">From $45</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.trip.com/hotels/list?city=359&Allianceid=7796167&SID=293794502&trip_sub3=D12086139"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-center hover:bg-blue-100 font-medium"
                  >
                    Hotels (Trip.com)
                  </a>
                  <a
                    href="https://12go.asia/en/travel/bangkok?z=14566451"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-orange-50 text-orange-600 py-2 px-3 rounded-lg text-center hover:bg-orange-100 font-medium"
                  >
                    Activities (Klook)
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Chiang Mai Card */}
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1598935876694-4b57444c9795?q=80&w=2070&auto=format&fit=crop"
                  alt="Chiang Mai"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Chiang Mai</h3>
                  <p className="text-sm opacity-90">Thailand</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Best time: Oct-Jan
                  </span>
                  <span className="text-purple-600 font-bold">From $55</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.trip.com/hotels/list?city=73&Allianceid=7796167&SID=293794502&trip_sub3=D12086139"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-center hover:bg-blue-100 font-medium"
                  >
                    Hotels
                  </a>
                  <a
                    href="https://12go.asia/en/travel/chiang-mai?z=14566451"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-orange-50 text-orange-600 py-2 px-3 rounded-lg text-center hover:bg-orange-100 font-medium"
                  >
                    Buses
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Phuket Card */}
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1589394815804-989b33841a07?q=80&w=2070&auto=format&fit=crop"
                  alt="Phuket"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Phuket</h3>
                  <p className="text-sm opacity-90">Thailand</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Best time: Nov-Apr
                  </span>
                  <span className="text-purple-600 font-bold">From $60</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.trip.com/hotels/list?city=364&Allianceid=7796167&SID=293794502&trip_sub3=D12086139"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-center hover:bg-blue-100 font-medium"
                  >
                    Hotels
                  </a>
                  <a
                    href="https://12go.asia/en/travel/phuket?z=14566451"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-orange-50 text-orange-600 py-2 px-3 rounded-lg text-center hover:bg-orange-100 font-medium"
                  >
                    Ferry
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER SECTION --- */}
      <section className="py-20 bg-purple-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-800 rounded-full blur-3xl opacity-50 -ml-16 -mb-16" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Mail className="w-12 h-12 mx-auto mb-6 text-purple-300" />
          <h2 className="text-3xl font-bold mb-4">Get Secret Flight Deals</h2>
          <p className="text-purple-100 mb-8 max-w-lg mx-auto">
            Join 10,000+ travelers. We'll send you price drops for Yangon-Bangkok routes directly to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <Button className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 h-auto text-base font-semibold">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-purple-300 mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </section>
    </Layout>
  );
}
