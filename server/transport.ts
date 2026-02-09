/**
 * Transport Service - Mock 12Go.asia Integration
 * 
 * This service provides real-time bus and train schedules between Thai cities.
 * Currently uses mock data. Replace with real 12Go.asia API calls once credentials are obtained.
 * 
 * 12Go.asia API Integration Steps:
 * 1. Contact 12Go.asia at api@12go.asia with your website details
 * 2. Receive API credentials and documentation
 * 3. Replace the mockSchedules function with actual API calls
 * 4. Add 12GO_API_KEY to environment variables
 */

export interface TransportSchedule {
  id: string;
  type: 'bus' | 'train' | 'minibus';
  company: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  seats: number;
  rating: number;
  bookingUrl: string;
}

export interface TransportSearchParams {
  from: string;
  to: string;
  date: string;
}

export interface TransportSearchResult {
  from: string;
  to: string;
  date: string;
  schedules: TransportSchedule[];
  affiliateLink: string;
}

/**
 * Mock data for demonstration
 * Replace this with real 12Go.asia API calls
 */
function mockSchedules(from: string, to: string): TransportSchedule[] {
  const routes: Record<string, TransportSchedule[]> = {
    'BKK-CNX': [
      {
        id: '1',
        type: 'bus',
        company: 'Nok Air',
        departureTime: '08:00',
        arrivalTime: '09:15',
        duration: '1h 15m',
        price: 1200,
        currency: 'THB',
        seats: 12,
        rating: 4.8,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/bangkok-chiang-mai',
      },
      {
        id: '2',
        type: 'bus',
        company: 'Chiang Mai Tour',
        departureTime: '10:30',
        arrivalTime: '11:45',
        duration: '1h 15m',
        price: 1100,
        currency: 'THB',
        seats: 8,
        rating: 4.6,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/bangkok-chiang-mai',
      },
      {
        id: '3',
        type: 'minibus',
        company: 'Thai Airways',
        departureTime: '14:00',
        arrivalTime: '15:30',
        duration: '1h 30m',
        price: 1500,
        currency: 'THB',
        seats: 6,
        rating: 4.9,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/bangkok-chiang-mai',
      },
    ],
    'BKK-PHK': [
      {
        id: '4',
        type: 'bus',
        company: 'Phuket Tour',
        departureTime: '07:00',
        arrivalTime: '12:30',
        duration: '5h 30m',
        price: 450,
        currency: 'THB',
        seats: 15,
        rating: 4.5,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/bangkok-phuket',
      },
      {
        id: '5',
        type: 'bus',
        company: 'First Class Transport',
        departureTime: '09:00',
        arrivalTime: '14:30',
        duration: '5h 30m',
        price: 550,
        currency: 'THB',
        seats: 20,
        rating: 4.7,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/bangkok-phuket',
      },
    ],
    'CNX-BKK': [
      {
        id: '6',
        type: 'bus',
        company: 'Nok Air',
        departureTime: '10:00',
        arrivalTime: '11:15',
        duration: '1h 15m',
        price: 1200,
        currency: 'THB',
        seats: 10,
        rating: 4.8,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/chiang-mai-bangkok',
      },
    ],
    'PHK-KBI': [
      {
        id: '7',
        type: 'minibus',
        company: 'Krabi Express',
        departureTime: '08:00',
        arrivalTime: '10:30',
        duration: '2h 30m',
        price: 300,
        currency: 'THB',
        seats: 8,
        rating: 4.6,
        bookingUrl: 'https://www.12go.asia/en/travel/bus/phuket-krabi',
      },
    ],
  };

  const key = `${from}-${to}`;
  return routes[key] || [];
}

/**
 * Search for transport schedules between two cities
 * @param params Search parameters (from, to, date)
 * @returns Transport schedules with affiliate link
 */
export async function searchTransport(
  params: TransportSearchParams
): Promise<TransportSearchResult> {
  const { from, to, date } = params;

  // TODO: Replace with real 12Go.asia API call
  // const response = await fetch(`https://api.12go.asia/v1/search`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.TWELVE_GO_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ from, to, date }),
  // });
  // const data = await response.json();

  const schedules = mockSchedules(from, to);

  return {
    from,
    to,
    date,
    schedules,
    affiliateLink: `https://www.12go.asia/en/travel/bus/${from.toLowerCase()}-${to.toLowerCase()}`,
  };
}

/**
 * Get popular routes for a destination
 */
export function getPopularRoutes(destination: string): Array<{ from: string; to: string; label: string }> {
  const routes: Record<string, Array<{ from: string; to: string; label: string }>> = {
    'CNX': [
      { from: 'BKK', to: 'CNX', label: 'Bangkok to Chiang Mai' },
      { from: 'CNX', to: 'BKK', label: 'Chiang Mai to Bangkok' },
      { from: 'CNX', to: 'PHK', label: 'Chiang Mai to Phuket' },
    ],
    'PHK': [
      { from: 'BKK', to: 'PHK', label: 'Bangkok to Phuket' },
      { from: 'PHK', to: 'KBI', label: 'Phuket to Krabi' },
      { from: 'PHK', to: 'BKK', label: 'Phuket to Bangkok' },
    ],
    'KBI': [
      { from: 'PHK', to: 'KBI', label: 'Phuket to Krabi' },
      { from: 'KBI', to: 'PHK', label: 'Krabi to Phuket' },
    ],
  };

  return routes[destination] || [];
}
