# GoTravelAsia Hotel UX & Cloud Wishlist Roadmap

## Current Priority

Hotel Search Infrastructure is now premium and stable. The next major product step is to add authenticated user retention through Cloud Wishlist.

## Implementation Order

### 1. Fix richFilters not applied bug in useHotelSearch.ts [x]
- Ensure advanced filters are applied consistently to hotel search results.
- Verify price, star rating, guest rating, amenity, and sorting logic.

### 2. Install Leaflet + React Leaflet dependencies [x]
- Add Leaflet and React Leaflet for hotel map experiences.
- Ensure required CSS is imported globally.

### 3. Replace HotelMapPanel.tsx text preview with real interactive Leaflet map [x]
- Show hotel markers on an interactive map.
- Support hover/selection from hotel cards.
- Keep fallback UI for missing coordinates.

### 4. Add images[] to HotelResult + update normalize.ts [x]
- Extend hotel result model with image gallery support.
- Normalize provider image data into a consistent images[] array.
- Preserve imageUrl as primary fallback.

### 5. Upgrade HotelDetailHeader to gallery/carousel [x]
- Replace static hero image with premium gallery/carousel.
- Use images[] with fallback to imageUrl.
- Add mobile-friendly gallery behavior.

### 6. Add hotel detail location map [x]
- Add map section to HotelDetailPage.
- Show hotel location, neighborhood context, and nearby area.
- Handle missing latitude/longitude gracefully.

### 7. Add Cloud Wishlist / Save Hotel Feature [/]

#### Goal
Move from localStorage-only wishlist to authenticated Cloud Wishlist using the existing auth layer and MySQL/Drizzle database.

#### Database [x]
Modify `drizzle/schema.ts`.

Add `userHotelWishlists` table linked to `users.id`.

Recommended fields:
- id
- userId
- hotelId
- provider
- hotelName
- city
- country
- imageUrl
- starRating
- guestRating
- price
- currency
- bookingUrl
- checkIn
- checkOut
- createdAt
- updatedAt

Add unique constraint:
- unique(userId, hotelId, provider)

#### API [ ]
Add REST handler:
- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/:hotelId`

Important:
- Do not accept userId from the client.
- Resolve the current user from the authenticated request/session.
- Return 401 for unauthenticated requests.
- Use upsert / duplicate-safe insert behavior.

#### Frontend Hook [ ]
Modify or create `useWishlist.ts`.

Behavior:
- If user is unauthenticated, use localStorage.
- If user is authenticated, use Cloud Wishlist.
- On login, sync localStorage items to cloud.
- After successful sync, refetch cloud wishlist.
- Avoid duplicate saves.

#### UI [ ]
Create:
- `SavedHotelsPage.tsx`

Route:
- `/saved-hotels`

Page requirements:
- Premium grid of saved hotels.
- Empty state with CTA to search hotels.
- Continue booking / view deal CTA.
- Responsive mobile layout.

#### Verification [ ]
Automated:
- 401 for unauthenticated API access.
- Duplicate wishlist save does not create duplicate rows.
- GET returns only current user's items.

Manual:
- Save hotel while logged out.
- Login and verify local wishlist syncs to cloud.
- Open another browser/device and verify saved hotels persist.
- Toggle heart button and confirm cloud state updates.
