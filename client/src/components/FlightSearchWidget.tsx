// components/FlightSearchWidget.tsx
'use client'

import { useState, useMemo } from 'react'
import { Plane, Calendar, MapPin, Search, ArrowRight } from 'lucide-react'

// --- CONFIGURATION ---
const MARKER_ID = '697202' // Travelpayouts Affiliate Marker ID

// --- AIRPORTS DATA ---
const ORIGINS = [
    { code: 'RGN', label: 'Yangon (RGN)', country: 'Myanmar' },
    { code: 'MDL', label: 'Mandalay (MDL)', country: 'Myanmar' },
] as const

const DESTINATIONS = [
    // Thailand
    { code: 'BKK', label: 'Bangkok – Suvarnabhumi (BKK)', country: 'Thailand', group: '🇹🇭 Thailand' },
    { code: 'DMK', label: 'Bangkok – Don Mueang (DMK)', country: 'Thailand', group: '🇹🇭 Thailand' },
    { code: 'CNX', label: 'Chiang Mai (CNX)', country: 'Thailand', group: '🇹🇭 Thailand' },
    { code: 'HKT', label: 'Phuket (HKT)', country: 'Thailand', group: '🇹🇭 Thailand' },
    { code: 'CEI', label: 'Chiang Rai (CEI)', country: 'Thailand', group: '🇹🇭 Thailand' },
    // Singapore & Malaysia
    { code: 'SIN', label: 'Singapore (SIN)', country: 'Singapore', group: '🇸🇬 Singapore & 🇲🇾 Malaysia' },
    { code: 'KUL', label: 'Kuala Lumpur (KUL)', country: 'Malaysia', group: '🇸🇬 Singapore & 🇲🇾 Malaysia' },
    // Vietnam & Cambodia
    { code: 'SGN', label: 'Ho Chi Minh City (SGN)', country: 'Vietnam', group: '🇻🇳 Vietnam & 🇰🇭 Cambodia' },
    { code: 'HAN', label: 'Hanoi (HAN)', country: 'Vietnam', group: '🇻🇳 Vietnam & 🇰🇭 Cambodia' },
    { code: 'REP', label: 'Siem Reap (REP)', country: 'Cambodia', group: '🇻🇳 Vietnam & 🇰🇭 Cambodia' },
    // China
    { code: 'KMG', label: 'Kunming (KMG)', country: 'China', group: '🇨🇳 China' },
    { code: 'CAN', label: 'Guangzhou (CAN)', country: 'China', group: '🇨🇳 China' },
    // India
    { code: 'CCU', label: 'Kolkata (CCU)', country: 'India', group: '🇮🇳 India' },
    { code: 'GAY', label: 'Gaya / Bodh Gaya (GAY)', country: 'India', group: '🇮🇳 India' },
    { code: 'DEL', label: 'New Delhi (DEL)', country: 'India', group: '🇮🇳 India' },
    // Korea & Japan
    { code: 'ICN', label: 'Seoul – Incheon (ICN)', country: 'South Korea', group: '🇰🇷 Korea & 🇯🇵 Japan' },
    { code: 'NRT', label: 'Tokyo – Narita (NRT)', country: 'Japan', group: '🇰🇷 Korea & 🇯🇵 Japan' },
    { code: 'KIX', label: 'Osaka – Kansai (KIX)', country: 'Japan', group: '🇰🇷 Korea & 🇯🇵 Japan' },
] as const

// Group destinations for <optgroup>
const DESTINATION_GROUPS = DESTINATIONS.reduce<Record<string, typeof DESTINATIONS[number][]>>((acc, d) => {
    if (!acc[d.group]) acc[d.group] = []
    acc[d.group].push(d)
    return acc
}, {})

export default function FlightSearchWidget() {
    const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway')
    const [origin, setOrigin] = useState('RGN')
    const [destination, setDestination] = useState('BKK')
    const [departDate, setDepartDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    // Dynamic Price Hint based on selected route
    const priceHint = useMemo(() => {
        const hints: Record<string, string> = {
            'RGN-BKK': 'Direct flights from $59 – most popular route!',
            'RGN-DMK': 'Budget carriers from $45 – Thai AirAsia, Nok Air',
            'RGN-CNX': 'Direct flights available from $120',
            'RGN-SIN': 'Direct flights from $85 – Singapore Airlines, MAI',
            'RGN-KUL': 'Budget options from $70 – AirAsia direct',
            'RGN-HKT': 'Connecting via BKK from $95',
            'RGN-KMG': 'Short hop from $80 – China Eastern, MAI',
            'RGN-ICN': 'From $250 – Korean Air seasonal',
            'RGN-NRT': 'From $280 – via Bangkok or Singapore',
            'RGN-GAY': 'Pilgrimage route from $150 – MAI direct',
            'RGN-CCU': 'From $120 – IndiGo, MAI',
            'RGN-SGN': 'From $100 – VietJet, Vietnam Airlines',
            'RGN-HAN': 'From $110 – Vietnam Airlines',
            'RGN-REP': 'From $130 – Angkor Wat awaits!',
            'MDL-BKK': 'Business route deals from $95',
            'MDL-DMK': 'Budget options from $65',
            'MDL-KMG': 'Border route from $60 – short flight',
        }
        return hints[`${origin}-${destination}`] || 'Best price guarantee for this route'
    }, [origin, destination])

    // Dynamic button text
    const destCountry = useMemo(() => {
        const d = DESTINATIONS.find(d => d.code === destination)
        return d?.country || 'Asia'
    }, [destination])

    const handleSearch = () => {
        if (!departDate) {
            alert('Please select a departure date')
            return
        }

        // Build date segment: DDMM format for Aviasales international URL
        const dp = new Date(departDate)
        const dd = String(dp.getDate()).padStart(2, '0')
        const mm = String(dp.getMonth() + 1).padStart(2, '0')
        let datePart = `${dd}${mm}`

        if (tripType === 'roundtrip') {
            if (!returnDate) {
                alert('Please select a return date')
                return
            }
            if (returnDate < departDate) {
                alert('Return date must be after departure date')
                return
            }
            const rp = new Date(returnDate)
            const rd = String(rp.getDate()).padStart(2, '0')
            const rm = String(rp.getMonth() + 1).padStart(2, '0')
            datePart += `${rd}${rm}`
        }

        // Build Aviasales target URL, then wrap with tp.media for stable tracking
        const searchPath = `${origin}${destination}${datePart}1`
        const targetUrl = `https://www.aviasales.com/search/${searchPath}?locale=en`

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
                    Traveling from Myanmar?
                </h2>
                <p className="text-gray-600">
                    Compare cheap flights from Myanmar to Thailand, Singapore, Malaysia, Vietnam, China, India, Korea &amp; Japan.
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
                                {ORIGINS.map((o) => (
                                    <option key={o.code} value={o.code}>{o.label}</option>
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
                                            <option key={d.code} value={d.code}>{d.label}</option>
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
