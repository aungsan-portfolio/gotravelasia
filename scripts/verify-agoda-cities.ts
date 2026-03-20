// scripts/verify-agoda-cities.ts
/**
 * Manual Verification Helper for Agoda City IDs.
 * Run this script, then copy the URLs into a browser to verify
 * that each city lands on the correct Agoda results page.
 */

const SEA_CITIES = [
  { id: 3940, slug: 'bangkok',       displayName: 'Bangkok' },
  { id: 3962, slug: 'chiang-mai',    displayName: 'Chiang Mai' },
  { id: 1722, slug: 'da-nang',       displayName: 'Da Nang' },
  { id: 1716, slug: 'hanoi',         displayName: 'Hanoi' },
  { id: 3943, slug: 'penang',        displayName: 'Penang' },
  { id: 4354, slug: 'cebu',          displayName: 'Cebu' },
  { id: 3945, slug: 'bali',          displayName: 'Bali' },
  { id: 6139, slug: 'yangon',        displayName: 'Yangon' },
];

console.log('=== AGODA CITY VERIFICATION URLS ===');
console.log('Please open these in your browser to verify correctness:\n');

for (const city of SEA_CITIES) {
  // Use a future date for testing
  const checkin = '2026-05-15';
  const checkout = '2026-05-18';
  const url = `https://www.agoda.com/search?city=${city.id}&checkin=${checkin}&checkout=${checkout}&adults=1&cid=1844104&utm_source=verification`;
  
  console.log(`${city.displayName.padEnd(15)}: ${url}`);
}

console.log('\n====================================');
