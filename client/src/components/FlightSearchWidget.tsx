// components/FlightSearchWidget.tsx
'use client'

import { useState, useMemo } from 'react'
import { Plane, Calendar, MapPin, Search, ArrowRight } from 'lucide-react'

// --- CONFIGURATION ---
const MARKER_ID = '697202' // Travelpayouts Affiliate Marker ID

// ✈️ Unified Airport List (Master Source)
// Logic: Myanmar ports first, then high-traffic SEA hubs.
const AIRPORTS = [
    // 🇲🇲 Myanmar (Origin/Return Hubs) - Pinned to Top
    { code: 'RGN', name: 'Yangon (ရန်ကုန်)', country: 'Myanmar' },
    { code: 'MDL', name: 'Mandalay (မန္တလေး)', country: 'Myanmar' },

    // 🇹🇭 Thailand (Top Volume)
    { code: 'BKK', name: 'Bangkok (Suvarnabhumi)', country: 'Thailand' },
    { code: 'DMK', name: 'Bangkok (Don Mueang)', country: 'Thailand' },
    { code: 'CNX', name: 'Chiang Mai', country: 'Thailand' },
    { code: 'HKT', name: 'Phuket', country: 'Thailand' },

    // 🇸🇬 Singapore (High Value)
    { code: 'SIN', name: 'Singapore', country: 'Singapore' },

    // 🇲🇾 Malaysia (Family/Business)
    { code: 'KUL', name: 'Kuala Lumpur', country: 'Malaysia' },

    // 🇻🇳 Vietnam (Trending)
    { code: 'SGN', name: 'Ho Chi Minh', country: 'Vietnam' },
    { code: 'HAN', name: 'Hanoi', country: 'Vietnam' },

    // 🇰🇭 Cambodia (Niche/Direct)
    { code: 'PNH', name: 'Phnom Penh', country: 'Cambodia' },
    { code: 'REP', name: 'Siem Reap', country: 'Cambodia' },
] as const

// Country → Flag emoji for optgroup labels
const COUNTRY_FLAGS: Record<string, string> = {
    Myanmar: '🇲🇲', Thailand: '🇹🇭', Singapore: '🇸🇬',
    Malaysia: '🇲🇾', Vietnam: '🇻🇳', Cambodia: '🇰🇭',
}

// Dynamic grouping by country for <optgroup>
const DESTINATION_GROUPS = AIRPORTS.reduce<Record<string, typeof AIRPORTS[number][]>>((acc, d) => {
    const label = `${COUNTRY_FLAGS[d.country] || ''} ${d.country}`
    if (!acc[label]) acc[label] = []
    acc[label].push(d)
    return acc
}, {})

export default function FlightSearchWidget() {
    const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway')
    const [origin, setOrigin] = useState('RGN')
    const [destination, setDestination] = useState('BKK')
    const [departDate, setDepartDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    // 🏷️ Cleaned Price Hints (SEA Only)
    const priceHint = useMemo(() => {
        const hints: Record<string, string> = {
            // 🇹🇭 Thailand Routes
            'RGN-BKK': 'Popular! From $45 – MAI, Thai AirAsia',
            'RGN-DMK': 'Budget choice! From $40 – AirAsia, Nok Air',
            'RGN-CNX': 'Seasonal direct or via BKK from $80',
            'RGN-HKT': 'Beach route! Via BKK from $90',
            'MDL-BKK': 'Direct from Mandalay available ($60+)',
            'MDL-DMK': 'Saver fare from $55',

            // 🇸🇬 Singapore Routes
            'RGN-SIN': 'Direct daily! From $95 – MAI, SQ',
            'MDL-SIN': 'Via Bangkok or Yangon usually cheaper',

            // 🇲🇾 Malaysia Routes
            'RGN-KUL': 'Super Saver! From $50 – AirAsia, MH',

            // 🇻🇳 Vietnam Routes
            'RGN-SGN': 'Direct flights avail from $80 – VietJet',
            'RGN-HAN': 'Via Bangkok/Hanoi from $110',

            // 🇰🇭 Cambodia Routes
            'RGN-PNH': 'Biz route: From $130 – MAI Direct',
            'RGN-REP': 'Gateway to Angkor Wat – via BKK ($140+)',
        }
        return hints[`${origin}-${destination}`] || 'Best price guarantee for this route'
    }, [origin, destination])

    // Dynamic button text
    const destCountry = useMemo(() => {
        const d = AIRPORTS.find(a => a.code === destination)
        return d?.country || 'Asia'
    }, [destination])

    const handleSearch = () => {
        if (origin === destination) {
            alert('Origin and destination cannot be the same')
            return
        }
        if (!departDate) {
            alert('Please select a departure date')
            return
        }
        if (tripType === 'roundtrip') {
            if (!returnDate) {
                alert('Please select a return date')
                return
            }
            if (returnDate < departDate) {
                alert('Return date must be after departure date')
                return
            }
        }

        // Official Aviasales deep link format (query parameters, YYYY-MM-DD dates)
        const params = new URLSearchParams({
            origin_iata: origin,
            destination_iata: destination,
            depart_date: departDate,
            one_way: tripType === 'oneway' ? 'true' : 'false',
            adults: '1',
            locale: 'en',
            currency: 'USD',
        })
        if (tripType === 'roundtrip' && returnDate) {
            params.set('return_date', returnDate)
        }
        const targetUrl = `https://www.aviasales.com/search?${params.toString()}`

        // tp.media redirect — stable Travelpayouts affiliate tracking
        const tpUrl = `https://tp.media/r?marker=${MARKER_ID}&p=4114&u=${encodeURIComponent(targetUrl)}`
        window.open(tpUrl, '_blank')
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-sans">
            {/* Header Section */}
            <div className="bg-purple-50 p-6 border-b border-purple-100">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <Plane className="w-3 h-3" /> Popular Route
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Find Best Flights in SEA
                </h2>
                <p className="text-gray-600">
                    Compare cheap flights across Myanmar, Thailand, Singapore, Malaysia, Vietnam &amp; Cambodia.
                </p>
            </div>

            {/* Form Section */}
            <div className="p-6 space-y-6">
                {/* Trip Type Toggle */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${tripType === 'oneway' ? 'border-purple-600' : 'border-gray-300'}`}>
                            {tripType === 'oneway' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                        </div>
                        <input
                            type="radio"
                            name="tripType"
                            className="hidden"
                            checked={tripType === 'oneway'}
                            onChange={() => setTripType('oneway')}
                        />
                        <span className={`text-sm font-medium ${tripType === 'oneway' ? 'text-purple-700' : 'text-gray-500'}`}>One Way</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${tripType === 'roundtrip' ? 'border-purple-600' : 'border-gray-300'}`}>
                            {tripType === 'roundtrip' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                        </div>
                        <input
                            type="radio"
                            name="tripType"
                            className="hidden"
                            checked={tripType === 'roundtrip'}
                            onChange={() => setTripType('roundtrip')}
                        />
                        <span className={`text-sm font-medium ${tripType === 'roundtrip' ? 'text-purple-700' : 'text-gray-500'}`}>Round Trip</span>
                    </label>
                </div>

                {/* Route Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> From
                        </label>
                        <div className="relative">
                            <select
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-all"
                            >
                                {AIRPORTS.map((o) => (
                                    <option key={o.code} value={o.code}>{o.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> To
                        </label>
                        <div className="relative">
                            <select
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-all"
                            >
                                {Object.entries(DESTINATION_GROUPS).map(([group, dests]) => (
                                    <optgroup key={group} label={group}>
                                        {dests.map((d) => (
                                            <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Departure
                        </label>
                        <input
                            type="date"
                            value={departDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDepartDate(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {tripType === 'roundtrip' && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Return
                            </label>
                            <input
                                type="date"
                                value={returnDate}
                                min={departDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleSearch}
                    className="w-full py-4 px-6 bg-gradient-to-r from-[#4b0082] to-[#7b1fa2] hover:from-[#3a006b] hover:to-[#6a1b9a] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Search Flights to {destCountry}
                </button>

                {/* Dynamic Price Hint */}
                <div className="text-center bg-green-50 text-green-700 py-2 px-4 rounded-lg text-sm font-semibold border border-green-100 flex items-center justify-center gap-2">
                    <span className="animate-pulse">⚡</span> {priceHint}
                </div>
            </div>
        </div>
    )
}
