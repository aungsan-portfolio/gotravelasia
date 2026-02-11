// components/FlightSearchWidget.tsx
'use client'

import { useState } from 'react'
import { Plane, Calendar, MapPin, Search, ArrowRight } from 'lucide-react'

// --- CONFIGURATION ---
const MARKER_ID = '697202' // Travelpayouts Affiliate Marker ID

export default function FlightSearchWidget() {
    const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway')
    const [origin, setOrigin] = useState('RGN')
    const [destination, setDestination] = useState('BKK')
    const [departDate, setDepartDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    // Dynamic Price Hint Logic
    const getPriceHint = () => {
        if (origin === 'RGN' && destination === 'CNX') return 'Direct flights available from $120'
        if (origin === 'MDL' && destination === 'BKK') return 'Business route deals from $95'
        if (destination === 'DMK') return 'Budget options starting from $59'
        return 'Best price guarantee for this route'
    }

    const handleSearch = () => {
        if (!departDate) {
            alert('Please select a departure date')
            return
        }

        // Build Secure URL
        const baseUrl = 'https://www.aviasales.com/search'
        let query = `?origin=${origin}&destination=${destination}&depart_date=${departDate}&passengers=1&marker=${MARKER_ID}`

        if (tripType === 'roundtrip') {
            if (!returnDate) {
                alert('Please select a return date')
                return
            }
            query += `&return_date=${returnDate}`
        }

        window.open(baseUrl + query, '_blank')
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
                    Find the best flight deals from Yangon or Mandalay to Bangkok & Chiang Mai.
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
                                <option value="RGN">Yangon (RGN)</option>
                                <option value="MDL">Mandalay (MDL)</option>
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
                                <option value="BKK">Bangkok (BKK - Full Service)</option>
                                <option value="DMK">Bangkok (DMK - Budget)</option>
                                <option value="CNX">Chiang Mai (CNX)</option>
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
                    Search Flights to Thailand
                </button>

                {/* Dynamic Price Hint */}
                <div className="text-center bg-green-50 text-green-700 py-2 px-4 rounded-lg text-sm font-semibold border border-green-100 flex items-center justify-center gap-2">
                    <span className="animate-pulse">⚡</span> {getPriceHint()}
                </div>
            </div>
        </div>
    )
}
