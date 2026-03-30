# System Patterns: Eco Vigyan Foundation

## Architecture Overview

### 🚨 IMPORTANT: Dual Architecture Notice

The project currently contains **TWO separate applications**:

1. **Main Application** (Production Ready)
   - Next.js 16 App Router
   - Full backend integration
   - MongoDB + NextAuth
   - Located at project root

2. **EcovigyanDesign** (New Design - Frontend Only)
   - Vite + React Router
   - Mock data only
   - No backend
   - Located in `Ecovigyandesign/` folder

**Migration required to unify these applications.**

---

## Main Application Architecture (Current Production)

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  Next.js 16 App Router + React 19 + Tailwind CSS 4     │
│  - Server Components (default)                          │
│  - Client Components (interactive features)             │
│  - Framer Motion (animations)                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  API Route Handlers                     │
│  /api/* - Next.js Route Handlers (App Router)          │
│  - Auth endpoints                                        │
│  - Mushroom CRUD                                        │
│  - Admin operations                                      │
│  - Trail/Zone management                                │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Data & Auth Layer                      │
│  - MongoDB/Mongoose (database)                          │
│  - NextAuth.js + JWT (authentication)                   │
│  - Cloudinary (image storage)                           │
│  - Mapbox (mapping)                                     │
└─────────────────────────────────────────────────────────┘
```

### Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout with providers
│   ├── page.js            # Homepage
│   ├── explore/           # Map exploration interface
│   ├── api/               # API route handlers
│   ├── admin/             # Admin panel pages
│   └── [feature]/         # Feature-specific pages
├── components/            # React components
│   ├── [Feature]*.jsx    # Feature components
│   └── [Shared]*.jsx     # Shared UI components
├── lib/                   # Utility libraries
│   ├── auth.js           # Authentication helpers
│   ├── mongodb.js        # Database connection
│   ├── cloudinary.js     # Image upload
│   └── exifUtils.js      # EXIF extraction
├── models/               # Mongoose schemas
├── context/              # React contexts
└── constants/            # Shared constants
```

## Key System Patterns

### 1. Data Submission Flow

**Pattern: Photo → EXIF → Upload → Database**

```
User selects/captures photo
         ↓
Extract EXIF data (GPS, date/time)
         ↓
Generate preview locally
         ↓
User confirms submission
         ↓
Upload to Cloudinary
         ↓
Create MongoDB record
         ↓
Return success/assign points
```

**Implementation:**
- `MushroomSubmissionForm.jsx` - Handles user input
- `exifUtils.js` - Extracts GPS/timestamp from EXIF
- `uploadToCloudinary.js` - Handles image upload
- `/api/mushrooms` POST - Creates database record

**Key Considerations:**
- Mobile browsers may strip EXIF data for privacy
- Camera capture uses device GPS as fallback
- Gallery selection allows manual location input
- Image upload happens before database write (fail early)

### 2. Authentication Architecture

**Pattern: Hybrid Auth System (NextAuth + Legacy JWT)**

```
Login Request
     ↓
NextAuth Session + JWT Cookie
     ↓
Request with credentials
     ↓
getAuthenticatedUser() checks:
  1. NextAuth session
  2. Legacy JWT cookie
     ↓
Returns user or error
```

**Implementation:**
- `AuthContext.jsx` - React context for client-side auth state
- `AuthSessionProvider.jsx` - NextAuth session wrapper
- `lib/auth.js` - Server-side authentication helper
- `/api/auth/[...nextauth]/route.js` - NextAuth configuration

**Authentication Flows:**

**Signup:**
1. User submits form with profile photo
2. Upload photo to Cloudinary
3. Hash password with bcrypt
4. Create user in MongoDB
5. Generate JWT token
6. Set HttpOnly cookie
7. Create NextAuth session

**Login:**
1. User submits credentials
2. NextAuth validates against MongoDB
3. Creates session with user data
4. Sets session cookie
5. Client updates auth context

**Protected Routes:**
```javascript
const { user, error } = await getAuthenticatedUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 3. Moderation Workflow

**Pattern: Submission → Queue → Review → Publication**

```
User submits observation
         ↓
Status: "pending" (hidden from public)
         ↓
Admin views pending queue
         ↓
Reviews photo, location, classification
         ↓
Admin classifies (scientific name, attributes)
         ↓
Approve or Reject
         ↓
Status: "approved" (visible on map)
User receives +10 points
PointLog entry created
```

**Implementation:**
- `/api/mushrooms` POST - Creates pending submission
- `/api/admin/mushrooms` GET - Lists by status
- `/api/admin/mushrooms/[id]` PATCH - Update/approve/reject
- `PointLog` model - Tracks point awards

**Admin Classification Fields:**
- `scientificName` - Taxonomy identification
- `ecologicalRole` - Decomposer, symbiont, parasite
- `texture` - Physical characteristics
- `underside` - Gills, pores, teeth, etc.
- `fruitingSurface` - Ground, wood, leaf, dung
- `stemPresence` - Has stem or not
- `commonUses` - Edible, medicinal, poisonous, etc.

### 4. Map Visualization Pattern

**Pattern: Lazy Loading + Client-Side Filtering**

```
Page loads → Fetch approved mushrooms
         ↓
Store in React state (5000+ items)
         ↓
Apply filters (category, use, date, search)
         ↓
Filtered results render on map
         ↓
User clicks marker → Show detail modal
```

**Implementation:**
- `explore/page.jsx` - Main exploration interface
- `Map.jsx` - Mapbox GL integration
- `MushroomGrid.jsx` - Grid view with pagination
- `MushroomDetailModal.jsx` - Observation details

**Performance Optimizations:**
- Fetch all approved data once (cached in state)
- Client-side filtering (no re-fetching)
- Mapbox clusters markers for performance
- Pagination for grid view (30 items per page)
- Intersection Observer for lazy image loading

### 5. Points & Gamification System

**Pattern: Event-Driven Point Award**

```
User Action (mushroom submission)
         ↓
+5 points immediately
PointLog: MUSHROOM_SUBMITTED
         ↓
Admin approves submission
         ↓
+10 additional points
PointLog: MUSHROOM_APPROVED
         ↓
Update user.points (atomic)
         ↓
Leaderboard auto-updates
```

**Implementation:**
- Points tracked in `User.points` field
- `PointLog` maintains audit trail
- Leaderboard queries sorted by points
- Admin actions can award bonus points

**Point Values:**
- Mushroom submission: +5 points
- Mushroom approval: +10 points (total +15)
- Article published: Variable
- Admin bonus: Variable

### 6. Trail & Zone Management

**Pattern: Geospatial Boundaries + Embedded Data**

**Trails (Walking Routes):**
```javascript
{
  name: "Forest Trail #1",
  user: ObjectId,
  location: {
    type: "trail",
    center: { lat, lng },
    currentLocation: { lat, lng },
    boundary: [[lat, lng], ...] // polyline
  },
  mushrooms: [...] // embedded full documents
}
```

**Zones (Geographic Areas):**
```javascript
{
  name: "Shimla District",
  category: "region",
  user: ObjectId,
  location: {
    type: "zone",
    center: { lat, lng },
    boundary: [[lat, lng], ...] // polygon
  },
  shapeType: "circle" | "rectangle" | "polygon" | "city"
}
```

**Usage Pattern:**
1. User creates zone by drawing on map
2. System calculates boundary coordinates
3. Query mushrooms within boundary
4. Display filtered results

### 7. Image Handling Pattern

**Pattern: Client Upload → CDN → Database Reference**

```
User selects image
         ↓
Read as ArrayBuffer (preserve EXIF)
         ↓
Extract EXIF metadata
         ↓
Upload to Cloudinary via API
         ↓
Receive secure_url + public_id
         ↓
Store in MongoDB:
{
  images: [{
    url: "https://res.cloudinary.com/...",
    publicId: "mushrooms/abc123"
  }]
}
```

**Cloudinary Configuration:**
- Folder structure: `users/`, `mushrooms/`, `gallery/`, `articles/`
- Auto-optimization enabled
- Responsive image delivery
- Fallback for missing credentials

**EXIF Extraction Logic:**
1. Try reading from File object directly
2. If no EXIF, try ArrayBuffer
3. If no EXIF, try as Blob
4. Extract GPS coordinates (convert DMS to decimal)
5. Extract date/time from various EXIF fields
6. Handle mobile browser limitations (EXIF stripping)

### 8. Search & Autocomplete Pattern

**Pattern: Debounced Client-Side Search**

```
User types in search field
         ↓
Debounce input (300ms)
         ↓
Filter local dataset (commonName, scientificName)
         ↓
Generate unique suggestions (Map for deduplication)
         ↓
Display dropdown with matches
         ↓
User selects → Autofill form fields
```

**Implementation:**
- Used in `MushroomSubmissionForm` (form autofill)
- Used in `MushroomGrid` (observation search)
- Supports keyboard navigation (arrow keys, enter, escape)
- Fuzzy matching on both common and scientific names

### 9. Role-Based Access Control

**Pattern: Hierarchical Roles with Route Guards**

```
Roles: user < writer < admin

Route Protection:
├── Public: /, /explore, /articles, /gallery
├── Authenticated: /submit, /my-submissions, /account
├── Writer: /articles/create
└── Admin: /admin/*, bulk operations
```

**Implementation:**
```javascript
// Server-side guard
const { user } = await getAuthenticatedUser();
if (user.role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Client-side guard
const { isWriterOrAdmin } = useAuth();
if (!isWriterOrAdmin()) {
  router.push("/");
  return null;
}
```

### 10. Error Handling Pattern

**Pattern: Graceful Degradation**

**API Routes:**
```javascript
try {
  await connectDB();
  // Operation
  return NextResponse.json({ success: true });
} catch (error) {
  console.error("Operation failed:", error);
  return NextResponse.json(
    { error: "User-friendly message" },
    { status: 500 }
  );
}
```

**Client Components:**
```javascript
try {
  const res = await fetch("/api/endpoint");
  if (!res.ok) throw new Error(data.error);
  toast.success("Success!");
} catch (error) {
  toast.error(error.message || "Something went wrong");
}
```

**Graceful Fallbacks:**
- Missing Cloudinary → Disable image uploads with message
- Missing Mapbox → Show placeholder message
- Missing MongoDB → Return empty arrays
- EXIF extraction fails → Allow manual input

## Critical Integration Patterns

### MongoDB Connection Pattern
```javascript
// Singleton pattern with caching
let cachedDb = null;

export async function getMongoDb() {
  if (cachedDb) return cachedDb;
  
  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client.db(MONGODB_DB);
  return cachedDb;
}
```

### Cloudinary Upload Pattern
```javascript
// Stream-based upload from buffer
const uploadStream = cloudinary.uploader.upload_stream(
  { folder: "mushrooms", resource_type: "image" },
  (err, result) => {
    if (err) reject(err);
    resolve(result);
  }
);
uploadStream.end(buffer);
```

### Mapbox Integration Pattern
```javascript
// Component lazy-loads map library
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
  container: mapRef.current,
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [lng, lat],
  zoom: 12
});
```

## Component Patterns

### Server vs Client Components
- **Server Components (default)**: Static pages, data fetching
- **Client Components ("use client")**: Interactive features, hooks, state

### State Management
- Local state (useState) for component-specific data
- Context (AuthContext) for global user state
- No external state library needed (Next.js handles routing state)

### Animation Patterns
```javascript
// Framer Motion wrapper for consistent animations
<FramerAnimation delay={0.2} variant="slideUp">
  <Component />
</FramerAnimation>

// Common variants: slideUp, slideLeft, slideRight, rise, float, cascade
```

## Data Validation Patterns

### Client-Side
- Form validation before submission
- Real-time feedback on input errors
- Coordinate range validation
- File type/size validation

### Server-Side
- Schema validation via Mongoose
- Coordinate range checks
- Image type verification
- Role permission checks
- Duplicate detection

## EcovigyanDesign Architecture (New Design)

### Architecture Pattern
```
┌─────────────────────────────────────────────────────────┐
│                 Client Layer (SPA)                      │
│  Vite + React 18 + React Router 7 + Tailwind CSS 4     │
│  - Client-side routing only                             │
│  - shadcn/ui components (Radix UI)                      │
│  - Motion animations                                     │
│  - Leaflet maps                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Mock Data Layer                       │
│  - mushroom-data.ts (static data)                       │
│  - AuthContext with simulated auth                      │
│  - GoogleOAuthSimulator                                 │
│  - No real backend                                      │
└─────────────────────────────────────────────────────────┘
```

### Routing Structure (React Router)
```javascript
/ (Layout wrapper)
├── / (Home)
├── /explore (Map exploration)
├── /shroomhub (Mushroom database)
├── /shroomhub/observation/:observationId
├── /contributor/:contributorName
├── /donate
├── /join-us
├── /programs
├── /enroll
├── /gallery
├── /reports
├── /dashboard
└── /profile-settings
```

### Key Design Patterns

#### Component Organization
```
components/
├── ui/              # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── [50+ components]
├── Navbar.tsx       # App navigation
├── Footer.tsx       # App footer
├── Hero.tsx         # Landing hero
├── AuthModal.tsx    # Login/signup
└── [feature components]
```

#### Authentication Pattern (Mock)
```typescript
// AuthContext provides simulated auth
const { user, login, logout, signup } = useAuth();

// GoogleOAuthSimulator simulates OAuth flow
// No real backend validation
```

#### Data Flow Pattern
```
Component Request
      ↓
Local State/Mock Data
      ↓
Render UI
```

**Note**: No API calls, no database queries, no server-side logic.

### Integration Points Needed

To connect EcovigyanDesign to existing backend:

1. **Replace Mock Data**
   - `mushroom-data.ts` → API calls to `/api/mushrooms`
   - Static arrays → Dynamic data fetching

2. **Authentication Integration**
   - `AuthContext` → NextAuth session
   - `GoogleOAuthSimulator` → Real OAuth

3. **Map Integration**
   - Leaflet → Mapbox GL (or keep Leaflet)
   - Mock coordinates → Real GPS data

4. **Form Submissions**
   - Local state → API POST requests
   - Mock validation → Server validation

5. **Routing Migration**
   - React Router → Next.js App Router
   - Client-side → SSR/SSG pages

### Design System Highlights

#### New UI Components (shadcn/ui)
- **Consistent Design**: All components follow same patterns
- **Accessibility**: Built on Radix UI (ARIA compliant)
- **Customizable**: Tailwind-based styling
- **Type-Safe**: TypeScript definitions

#### Key Improvements Over Current Design
- **Better Forms**: react-hook-form integration
- **Modal System**: Radix Dialog vs custom modals
- **Toast Notifications**: Sonner vs react-hot-toast
- **Data Tables**: Enhanced table components
- **Command Palette**: Quick navigation (cmdk)
- **Better Mobile UX**: Improved responsive patterns

## Security Patterns

### Authentication Security
- Passwords hashed with bcrypt (10 rounds)
- HttpOnly cookies (CSRF protection)
- JWT secrets in environment variables
- Session expiry (7 days default)

### Data Security
- User input sanitization (Mongoose escaping)
- No direct database queries from client
- Admin-only endpoints protected
- Image uploads validated (type, size)

### Privacy Considerations
- User emails never displayed publicly
- Optional profile information
- GPS coordinates to 5 decimal places (11m accuracy)
- EXIF stripping option for privacy-conscious users
