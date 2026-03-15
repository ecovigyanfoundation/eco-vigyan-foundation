# Active Context: Eco Vigyan Foundation

## Current State of the Application

### Deployment Status
- **Environment**: Development phase with production readiness
- **Latest Commit**: aa3aca55e02482edfb687213feae6452aa47b502
- **Repository**: https://github.com/omp10/eco-vigyan-foundation.git
- **Platform**: Next.js 16 App Router with React 19

### 🚨 MAJOR DEVELOPMENT: Design Integration In Progress (54% Complete)
- **New Project Added**: `Ecovigyandesign/` - Complete visual redesign from Figma
- **Status**: Porting designs to Next.js app incrementally
- **Progress**: 7 of 13 pages integrated (Home, Programs, Gallery, Donate, Join-Us, Reports, Explore)
- **Latest**: Explore page with MushroomHub design and Discovery Hub sidebar
- **Impact**: Transforming visual layer while maintaining backend functionality

### Active Features

#### Core Functionality (Operational)
✅ **User Authentication**
- NextAuth.js implementation with credential login
- Google OAuth integration ready
- Legacy JWT token support for backward compatibility
- Profile creation with Cloudinary image upload
- Role-based access control (user, writer, admin)

✅ **Mushroom Observation System**
- Photo submission with EXIF extraction
- Camera capture with device GPS fallback
- Manual location selection (map, city search, coordinates)
- Autocomplete for common/scientific names
- Optional classification fields
- Admin moderation workflow (pending/approved/rejected)

✅ **Interactive Map Exploration**
- Mapbox GL integration showing all approved observations
- Advanced filtering by category, use, date, contributor
- Search functionality with autocomplete
- Grid view with pagination (30 items/page)
- Detail pages for individual mushrooms
- Contributor profiles

✅ **Trail & Zone Management**
- Create custom mushroom trails
- Define geographic zones (circle, rectangle, polygon, city)
- View observations within boundaries
- Save and share trails

✅ **Gamification System**
- Point awards for submissions (+5) and approvals (+10)
- Public leaderboard
- User profiles showing achievements
- PointLog audit trail

✅ **Content Management**
- Articles with image uploads
- Eco-art gallery
- Program information pages
- Contact and donation pages

✅ **Admin Panel**
- Pending submission queue
- Bulk approval/rejection
- User management (ban/unban)
- System import tracking
- Classification tools

## Recent Design Decisions

### Mobile-First EXIF Handling
**Decision**: Implement dual-path GPS capture
- Camera photos: Use device GPS API immediately + EXIF as fallback
- Gallery photos: Try EXIF extraction + manual selection option
- **Rationale**: Mobile browsers increasingly strip EXIF for privacy
- **Implementation**: `MushroomSubmissionForm.jsx` with `isFromCamera` flag

### Hybrid Authentication System
**Decision**: Maintain NextAuth.js + legacy JWT cookies
- **Rationale**: Backward compatibility with existing users
- **Trade-off**: Slightly more complex auth logic
- **Future**: Migrate fully to NextAuth sessions

### Client-Side Filtering Pattern
**Decision**: Fetch all approved mushrooms once, filter in memory
- **Rationale**: Better UX (instant filtering), reduced server load
- **Constraint**: Works well up to ~10k observations
- **Future**: Implement server-side pagination at scale

### Embedded Trail Data
**Decision**: Store full mushroom documents in trails
- **Rationale**: Trails are snapshots in time, should be immutable
- **Trade-off**: Data duplication vs. referential integrity
- **Benefit**: Trails remain accurate even if mushrooms deleted

## Current Work Focus

### 🎯 LATEST COMPLETION: MushroomHub Explore Page (March 16, 2026)

Successfully integrated the complete MushroomHub design into the explore page, establishing a professional design pattern for the entire application.

**Key Achievements:**
- **Hero Section**: "VERIFIED MYCOLOGY HUB" badge, large serif heading, Species of the Day card
- **Navigation Redesign**: Clean tabbed layout with separated action buttons (Add, Trails, Zones)
- **Discovery Hub Sidebar**: Integrated search inputs with Zones/Trails cards
  - Species Search: Emerald theme, rounded-2xl, shadow-inner
  - Location Search: Purple theme, rounded-2xl, shadow-inner
  - Explore Tools: Beautiful card design for Zones (emerald) and Trails (blue)
- **Map Container**: Max-width constraint, increased height (calc(100vh - 400px)), rounded corners
- **Design Consistency**: Established color schemes, rounded corners, shadow patterns

**Technical Implementation:**
- Modified: `src/app/explore/page.jsx` (complete redesign)
- Enhanced: `src/components/MapSidebar.jsx` (added Zones/Trails buttons)
- Redesigned: `src/components/LocationSearchInput.jsx` (purple MushroomHub style)
- Verified: All existing functionality preserved (map, filters, trails, zones)

**Impact**: This is the most complex page with highest user interaction - completing this establishes the design pattern for remaining pages.

---

### 🎯 NEXT FOCUS: Complete Remaining Design Pages

#### Design Migration Progress
With the Explore page complete (the most complex page), we've established clear design patterns:
- **MushroomHub Aesthetic**: Professional cards, emerald/purple color schemes
- **Discovery Hub Pattern**: Sidebar with Zones/Trails cards
- **Consistent Styling**: rounded-2xl, shadow-lg, proper spacing
- **54% Complete**: 7 of 13 pages integrated

#### New Design System (EcovigyanDesign)
**Critical Context**: A complete visual redesign has been added to the project in the `Ecovigyandesign/` directory. This is a **separate application** built from Figma designs that will replace the current UI.

**Technology Stack Differences**:
- **Build Tool**: Vite 6.3.5 (vs Next.js 16)
- **Framework**: React 18.3.1 with React Router 7 (vs Next.js App Router)
- **UI Library**: Radix UI + shadcn/ui components (vs custom Tailwind components)
- **Maps**: Leaflet + React Leaflet (vs Mapbox GL)
- **Animation**: Motion 12.23.24 (vs Framer Motion)
- **State**: AuthContext with mock data (vs NextAuth + MongoDB)
- **Additional**: Material UI components, Recharts for data viz

**Current State**:
- ✅ Complete frontend design implemented
- ✅ All pages created (Home, Explore, MushroomHub, Dashboard, etc.)
- ✅ Component library (shadcn/ui style)
- ❌ No backend integration (mock data only)
- ❌ No MongoDB connection
- ❌ Simulated authentication (GoogleOAuthSimulator)
- ❌ Not integrated with existing Next.js app

**Integration Challenges**:
1. **Architectural Mismatch**: Vite SPA vs Next.js SSR/SSG
2. **Routing**: React Router vs Next.js App Router
3. **Library Conflicts**: Different UI libraries and map providers
4. **Data Layer**: Mock data vs real MongoDB APIs
5. **Authentication**: Simulated vs NextAuth.js

**Migration Decision Required**:
- **Option A**: Port new design components to existing Next.js app (RECOMMENDED)
  - Keep Next.js architecture and SSR benefits
  - Migrate UI components one-by-one
  - Replace old components with new designs
  - Maintain existing API routes and data flow
  
- **Option B**: Rebuild backend in Vite app
  - Add API routes to Vite (using Express/Fastify)
  - Duplicate MongoDB logic
  - More work, two separate apps to maintain
  
- **Option C**: Convert Vite app to Next.js
  - Refactor routing to Next.js App Router
  - Keep new design components
  - Complex migration but clean result

### Active Development Areas

#### 1. EXIF Extraction Reliability
**Challenge**: Inconsistent EXIF data across devices/browsers
- iOS Safari sometimes strips GPS even from Camera API
- Android varies by browser and gallery app
- HEIC format support limited
- **Current Status**: Multiple extraction methods implemented
- **Next Steps**: Add user feedback when EXIF missing

#### 2. Performance at Scale
**Challenge**: Map performance with 5000+ markers
- Mapbox clustering helps but limits interaction
- Grid view pagination works well
- **Current Status**: Acceptable for current data volume
- **Next Steps**: Monitor as dataset grows

#### 3. Admin Workflow Efficiency
**Challenge**: Manual classification time-consuming
- Each submission needs expert review
- Classification fields are detailed
- **Current Status**: Functional but could be optimized
- **Next Steps**: AI-assisted classification suggestions

## Important Patterns & Preferences

### Code Organization
- **Server Components**: Default for pages, data fetching
- **Client Components**: Only when hooks/interactivity needed
- **API Routes**: Follow RESTful conventions
- **Error Handling**: Always graceful degradation

### Naming Conventions
- **Components**: PascalCase (e.g., `MushroomGrid.jsx`)
- **Utilities**: camelCase (e.g., `exifUtils.js`)
- **API Routes**: kebab-case folders (e.g., `/api/my-submissions`)
- **Database Fields**: camelCase (e.g., `submittedBy`)

### UI/UX Principles
- **Mobile-First**: Design for smartphones in field conditions
- **Progressive Enhancement**: Core features work without JS
- **Instant Feedback**: Toast notifications for all actions
- **Visual Hierarchy**: Bold typography, rounded corners, ample whitespace
- **Nature-Inspired**: Emerald greens, earth tones, organic shapes

### Data Integrity
- **Moderation First**: Nothing public without admin approval
- **Audit Trails**: Log all point awards and moderations
- **Immutable History**: Don't delete, mark inactive instead
- **Attribution**: Always credit contributors

## Key Learnings & Insights

### Mobile Browser Behavior
1. **EXIF Stripping**: iOS 14.5+ strips EXIF from gallery photos shared to web apps
2. **Camera API**: Direct camera capture preserves more metadata
3. **Permissions**: Location permission separate from camera permission
4. **Fallbacks**: Always provide manual input options

### Citizen Science UX
1. **Simplicity First**: Most users are students, not tech experts
2. **Instant Gratification**: Show preview and points immediately
3. **Education Moment**: Admin classification teaches identification
4. **Social Proof**: Leaderboards motivate continued participation

### Database Design
1. **Denormalization**: Better for read-heavy workloads
2. **Indexes**: Critical for query performance at scale
3. **Embedded vs Referenced**: Context-dependent decision
4. **Status Fields**: Enable soft deletes and workflows

### Image Handling
1. **Upload Early**: Fail fast before database writes
2. **CDN Essential**: Direct MongoDB storage doesn't scale
3. **Size Limits**: 5MB reasonable for mobile photos
4. **Format Flexibility**: Accept JPEG, PNG, WebP, HEIC

## Active Considerations

### Scaling Questions
- **When to implement pagination?** Currently client-side filtering works well
- **Redis caching layer?** Not needed yet, but plan ahead
- **Database sharding?** Single cluster sufficient for now
- **CDN costs?** Monitor Cloudinary usage closely

### Feature Priorities
- **AI identification?** High interest but complex implementation
- **Offline mode?** Important for field conditions
- **Native app?** Better UX but maintenance burden
- **Multi-language?** Required for broader India reach

### Data Quality
- **How to handle duplicates?** Manual detection by admins currently
- **Misidentifications?** Admin can edit classifications
- **Spam submissions?** Account banning mechanism exists
- **Data validation?** Server-side validation prevents bad data

## Integration Status

### Fully Integrated ✅
- MongoDB Atlas database
- Cloudinary image hosting
- NextAuth.js authentication
- Mapbox GL maps
- React Hot Toast notifications
- Framer Motion animations

### Partially Integrated ⚠️
- Google Maps Geocoding (optional)
- Email services (Resend/Nodemailer for password reset)
- Google OAuth (configured but optional)

### Planned Integrations 📋
- AI/ML identification service
- Real-time notifications (WebSockets)
- Analytics dashboard (Plausible/Umami)
- Export API for research partners

## Environment-Specific Notes

### Development Environment
- Hot reload works reliably
- EXIF extraction best tested on physical devices
- MongoDB connection via Atlas (shared cluster)
- Cloudinary test folder structure

### Production Considerations
- NEXTAUTH_URL must match deployment domain
- Mapbox token usage monitoring
- Cloudinary bandwidth limits
- MongoDB connection pooling

## Browser-Specific Quirks

### iOS Safari
- Aggressive EXIF stripping since iOS 14.5
- Camera API preferred for location capture
- Touch events work better than mouse events
- Image orientation issues (EXIF rotation)

### Android Chrome
- Better EXIF preservation than iOS
- File picker UI varies by manufacturer
- Performance generally good
- PWA installation prompt more reliable

### Desktop Browsers
- EXIF extraction most reliable
- Map interaction smoother
- Multiple file upload easier
- DevTools essential for debugging

## Common Development Patterns

### Adding a New API Route
1. Create route handler in `src/app/api/[feature]/route.js`
2. Import `getAuthenticatedUser` if protected
3. Add error handling with try/catch
4. Return NextResponse.json()
5. Test with Postman/Insomnia

### Creating a New Model
1. Define schema in `src/models/[ModelName].js`
2. Add indexes for query performance
3. Use timestamps: true for createdAt/updatedAt
4. Handle model caching in development
5. Test with MongoDB Compass

### Adding a New Page
1. Create folder in `src/app/[page-name]/`
2. Add `page.jsx` (or `page.js`)
3. Decide server vs client component
4. Import shared components
5. Add route to Navbar if needed

### Implementing a New Feature
1. **Plan**: Review systemPatterns.md for similar patterns
2. **Design**: Mobile-first, consider field conditions
3. **Backend**: API routes + models first
4. **Frontend**: Components + pages
5. **Test**: Multiple browsers, mobile devices
6. **Document**: Update memory bank if significant

## Known Quirks & Workarounds

### Image Upload on Mobile
**Quirk**: Some Android devices send empty filename
**Workaround**: Check file.size instead of file.name

### Map Marker Clustering
**Quirk**: Click events don't fire on clustered markers
**Workaround**: Use unclustered layer for click handlers

### NextAuth Session
**Quirk**: Session cookie not set on first request
**Workaround**: Client-side useSession hook + session provider

### Mongoose Model Caching
**Quirk**: Model recompilation errors in development
**Workaround**: Delete cached model before defining

### Tailwind Purging
**Quirk**: Dynamic classes may be purged
**Workaround**: Whitelist in config or use complete class names

## Communication Patterns

### Toast Notifications
- **Success**: Green, brief message
- **Error**: Red, include actionable guidance
- **Info**: Blue, for non-critical information
- **Loading**: Show for operations >1 second

### Loading States
- **Skeleton Loaders**: For initial page load
- **Spinners**: For button actions
- **Progress Bars**: For uploads
- **Optimistic Updates**: For instant feedback

### Error Messages
- **User-Friendly**: No technical jargon
- **Actionable**: Tell user what to do
- **Specific**: "Location required" not "Invalid input"
- **Helpful**: Include links to help docs when relevant

## EcovigyanDesign Project Structure

### File Organization
```
Ecovigyandesign/
├── src/
│   ├── main.tsx                    # Vite entry point
│   ├── app/
│   │   ├── App.tsx                 # Router setup
│   │   ├── routes.ts               # React Router routes
│   │   ├── Layout.tsx              # Base layout
│   │   ├── Home.tsx                # Homepage
│   │   ├── Explore.tsx             # Map exploration
│   │   ├── MushroomHub.tsx         # Mushroom database
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── Programs.tsx            # Programs page
│   │   ├── Gallery.tsx             # Photo gallery
│   │   ├── Donate.tsx              # Donation page
│   │   ├── JoinUs.tsx              # Join page
│   │   ├── Reports.tsx             # Reports page
│   │   ├── ObservationDetail.tsx   # Mushroom detail
│   │   ├── UserSubmissions.tsx     # User submissions
│   │   ├── ProfileSettings.tsx     # Settings page
│   │   ├── mushroom-data.ts        # Mock data
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── AuthModal.tsx       # Login/signup modal
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   └── figma/              # Figma assets
│   │   └── contexts/
│   │       └── AuthContext.tsx     # Mock auth
│   ├── assets/                     # Figma-extracted images
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       ├── fonts.css
│       └── animations.css
├── guidelines/
│   └── Guidelines.md               # Design system rules
├── index.html
├── vite.config.ts
└── package.json
```

### Key Components from New Design
- **shadcn/ui library**: Full set of Radix-based components
- **Responsive Navbar**: Modern design with mobile menu
- **Hero Section**: Animated hero with CTA
- **AuthModal**: Login/signup in modal overlay
- **Interactive Maps**: Leaflet-based with heatmaps
- **Data Visualizations**: Recharts integration
- **Modern Cards**: Enhanced card designs throughout
- **Improved Forms**: Better form UX with react-hook-form

## Next Session Starting Points

When resuming development, start with:
1. Review this activeContext.md file
2. **Current Priority**: Continue design integration (6 pages remaining - 46% to complete)
3. **Next Recommended**: Dashboard or ObservationDetail page (highest user value)
4. Check progress: `http://localhost:3000/explore` to see latest MushroomHub design
5. Run `npm run dev` to continue
6. Explore `Ecovigyandesign/` for next page to integrate
7. **Note**: Explore page establishes design patterns - use as reference for all remaining pages

## Update Frequency

This activeContext.md should be updated:
- After implementing major features
- When making architecture decisions
- When discovering new patterns
- On user request with **update memory bank**
- Before switching major focus areas
