import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Bus, Train, Clock, MapPin, Star, ExternalLink, Loader2 } from "lucide-react";

interface TransportWidgetProps {
  defaultFrom?: string;
  defaultTo?: string;
}

export default function TransportScheduleWidget({ defaultFrom = "BKK", defaultTo = "CNX" }: TransportWidgetProps) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: schedules, isLoading, error } = trpc.transport.search.useQuery(
    { from, to, date },
    { enabled: !!from && !!to }
  );

  const cities = [
    { code: "BKK", name: "Bangkok" },
    { code: "CNX", name: "Chiang Mai" },
    { code: "PHK", name: "Phuket" },
    { code: "KBI", name: "Krabi" },
    { code: "PAI", name: "Pai" },
    { code: "CRI", name: "Chiang Rai" },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "train":
        return <Train className="w-4 h-4" />;
      case "minibus":
        return <Bus className="w-4 h-4 text-orange-500" />;
      default:
        return <Bus className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Form */}
      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-bold mb-4">Search Transport</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading schedules...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading schedules. Please try again.
        </div>
      )}

      {schedules && schedules.schedules.length === 0 && !isLoading && (
        <div className="p-8 text-center text-muted-foreground">
          No schedules found for this route. Try different dates or cities.
        </div>
      )}

      {schedules && schedules.schedules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg">
              {schedules.schedules.length} Options Found
            </h4>
            <Badge variant="outline" className="text-xs">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Badge>
          </div>

          {schedules.schedules.map((schedule) => (
            <Card key={schedule.id} className="p-4 border border-border hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Type & Company */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(schedule.type)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{schedule.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTypeLabel(schedule.type)}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-bold">{schedule.departureTime}</p>
                    <p className="text-xs text-muted-foreground">Depart</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-mono text-sm">{schedule.duration}</p>
                </div>

                {/* Price & Rating */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{schedule.rating}</span>
                  </div>
                  <p className="font-bold text-primary">
                    ฿{schedule.price.toLocaleString()}
                  </p>
                </div>

                {/* CTA Button */}
                <a
                  href={schedule.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    size="sm"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors font-mono uppercase text-xs"
                  >
                    Book Now <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}

          {/* Affiliate Disclosure */}
          <div className="p-4 bg-muted/30 border border-border rounded-lg text-xs text-muted-foreground">
            <p>
              🔗 <strong>Affiliate Link:</strong> We earn a small commission when you book through our links.
              This helps us provide free travel guides. Your price remains the same.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
