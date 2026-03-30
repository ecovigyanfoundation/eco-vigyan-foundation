# Tech Context: Eco Vigyan Foundation

## Technology Stack

### 🚨 NEW: Dual Architecture (Migration Pending)

The project currently has **TWO separate applications**:

#### 1. Main Application (Production - Next.js)
Current production-ready app at project root

#### 2. EcovigyanDesign (New Design - Vite)
Complete redesign in `Ecovigyandesign/` subfolder - **needs integration**

---

## Main Application Tech Stack (Current Production)

### Frontend Framework
- **Next.js 16.0.8** (App Router)
  - React Server Components by default
  - File-based routing
  - Built-in API routes
  - Image optimization
  - Font optimization (Geist via next/font)

- **React 19.2.1**
  - Latest stable version
  - Concurrent features
  - Automatic batching
  - Suspense support

### Styling & UI
- **Tailwind CSS 4** (with @tailwindcss/postcss)
  - Utility-first CSS framework
  - JIT compiler for optimal performance
  - Custom design tokens in globals.css
  - Responsive breakpoints: sm, md, lg, xl

- **Framer Motion 12.23.25**
  - Advanced animations
  - Gesture recognition
  - Layout animations
  - Custom animation variants

- **Lucide React 0.556.0**
  - Icon library (SVG-based)
  - Tree-shakeable
  - Consistent design language

### Backend & Database
- **MongoDB 7.0.0**
  - Document database
  - Geospatial queries
  - Indexing for performance
  - Atlas cloud hosting (recommended)

- **Mongoose 9.0.2**
  - ODM (Object Document Mapper)
  - Schema validation
  - Middleware hooks
  - Population (joins)

### Authentication
- **NextAuth.js 4.24.13**
  - Session management
  - OAuth providers (Google)
  - Credential-based auth
  - JWT sessions

- **JSON Web Token (jsonwebtoken 9.0.3)**
  - Legacy auth support
  - Token generation/verification
  - Custom claims

- **bcryptjs 3.0.3**
  - Password hashing
  - Salt generation
  - Compare function

### File Storage
- **Cloudinary 2.8.0**
  - Image hosting & CDN
  - On-the-fly transformations
  - Upload API
  - Folder organization

### Mapping & Geolocation
- **Mapbox GL JS 3.17.0**
  - Interactive vector maps
  - Marker clustering
  - Custom styling
  - Popup overlays

- **Google Maps API** (geocoding)
  - City name to coordinates
  - Reverse geocoding
  - Places API

### Image Processing
- **exifr 7.1.3**
  - EXIF metadata extraction
  - GPS coordinate parsing
  - Date/time extraction
  - Multiple format support (JPEG, HEIC, etc.)

### UI Libraries
- **react-hot-toast 2.6.0**
  - Toast notifications
  - Customizable styling
  - Promise-based API

- **react-intersection-observer 10.0.0**
  - Lazy loading
  - Scroll-based animations
  - Performance optimization

### Utilities
- **qrcode 1.5.4**
  - QR code generation
  - Donation/contact info

- **xlsx 0.18.5**
  - Excel export functionality
  - Admin data export

### Email (Optional)
- **Resend 6.6.0**
  - Transactional emails
  - Password reset
  - Notifications

- **Nodemailer 7.0.12**
  - Alternative email provider
  - SMTP support
  - Gmail integration

## Environment Configuration

### Required Variables

```bash
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=eco-vigyan

# NextAuth (REQUIRED)
NEXTAUTH_SECRET=<32+ character random string>
NEXTAUTH_URL=http://localhost:3000

# JWT Legacy Auth (REQUIRED for backward compatibility)
JWT_SECRET=<32+ character random string>
```

### Optional but Recommended

```bash
# Cloudinary (Image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mapbox (Maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps (Geocoding)
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (Password reset)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
# OR
EMAIL_SERVER=smtp://user:pass@smtp.gmail.com:587
EMAIL_FROM=your-email@gmail.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxx
```

## Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git
- MongoDB Atlas account OR local MongoDB installation
- Code editor (VS Code recommended)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/omp10/eco-vigyan-foundation.git
cd eco-vigyan-foundation

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

### Development Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking (if TypeScript added)
npm run type-check

# Linting (if ESLint configured)
npm run lint
```

## Project Structure

```
eco-vigyan-foundation/
├── public/                    # Static assets
│   ├── images/               # General images
│   ├── icons/                # App icons
│   ├── mushrooms/            # Mushroom category icons
│   ├── gallery/              # Gallery images
│   ├── paintings/            # Art gallery
│   ├── programs/             # Program logos
│   └── articles/             # Article images
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.js        # Root layout
│   │   ├── page.js          # Homepage
│   │   ├── globals.css      # Global styles
│   │   │
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication
│   │   │   ├── mushrooms/   # Mushroom CRUD
│   │   │   ├── admin/       # Admin operations
│   │   │   ├── trails/      # Trail management
│   │   │   ├── zones/       # Zone management
│   │   │   ├── articles/    # Article management
│   │   │   └── gallery/     # Gallery management
│   │   │
│   │   ├── explore/         # Map exploration
│   │   ├── admin/           # Admin panel
│   │   ├── mushroom/[id]/   # Mushroom details
│   │   ├── user/[id]/       # User profiles
│   │   ├── my-submissions/  # User submissions
│   │   ├── account/         # Account settings
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration
│   │   ├── signup/          # Alternative signup
│   │   ├── articles/        # Articles list
│   │   ├── gallery/         # Eco-art gallery
│   │   ├── programs/        # Programs info
│   │   ├── contact/         # Contact page
│   │   ├── donate/          # Donation page
│   │   ├── reports/         # Reports
│   │   └── join-us/         # Join page
│   │
│   ├── components/          # React components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Map.jsx
│   │   ├── MushroomSubmissionForm.jsx
│   │   ├── MushroomGrid.jsx
│   │   └── [...].jsx        # Other components
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── auth.js          # Auth helpers
│   │   ├── mongodb.js       # DB connection
│   │   ├── cloudinary.js    # Image upload
│   │   ├── exifUtils.js     # EXIF extraction
│   │   ├── geocoding.js     # Location services
│   │   ├── trailStorage.js  # Trail persistence
│   │   └── uploadToCloudinary.js
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Mushroom.js
│   │   ├── Trail.js
│   │   ├── Zone.js
│   │   ├── Article.js
│   │   ├── Gallery.js
│   │   ├── PointLog.js
│   │   └── ApprovalLog.js
│   │
│   ├── context/             # React contexts
│   │   └── AuthContext.jsx
│   │
│   ├── constants/           # Shared constants
│   │   └── mushroomOption.js
│   │
│   └── data/                # Static data
│       ├── articles.js
│       └── mushrooms.js     # Legacy data
│
├── memory-bank/             # Project documentation
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
│
├── .env.local               # Environment variables (gitignored)
├── .env.example             # Example env file
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.mjs          # Next.js config
├── postcss.config.mjs       # PostCSS config
├── jsconfig.json            # Path aliases
├── README.md
└── SETUP.md                 # Setup instructions
```

## Database Schema

### Collections

#### users
- Authentication & profile data
- Points & gamification
- Role-based permissions

#### mushrooms
- Observation submissions
- Classification data
- Moderation status

#### trails
- Walking routes
- Embedded mushroom data
- User-created trails

#### zones
- Geographic boundaries
- City/region definitions
- Custom areas

#### articles
- Educational content
- Writer contributions
- Image attachments

#### gallery
- Eco-art submissions
- Student artwork
- Image metadata

#### pointlogs
- Point transaction history
- Audit trail
- Action tracking

#### approvallogs
- Moderation history
- Admin actions
- Reason tracking

## Third-Party Services

### MongoDB Atlas
- **Purpose**: Database hosting
- **Plan**: Free tier (512MB) or paid clusters
- **Setup**: atlas.mongodb.com
- **Features**: Automated backups, monitoring, alerts

### Cloudinary
- **Purpose**: Image CDN & storage
- **Plan**: Free tier (25 GB storage, 25 GB bandwidth/month)
- **Setup**: cloudinary.com
- **Features**: Transformations, optimization, responsive delivery

### Mapbox
- **Purpose**: Interactive maps
- **Plan**: Free tier (50k map loads/month)
- **Setup**: mapbox.com
- **Features**: Vector tiles, marker clustering, custom styles

### Google Cloud Platform
- **Purpose**: Geocoding API
- **Plan**: $200 free credit/month
- **Setup**: console.cloud.google.com
- **Features**: City search, reverse geocoding

### Resend (Optional)
- **Purpose**: Transactional email
- **Plan**: Free tier (3k emails/month)
- **Setup**: resend.com
- **Features**: Password reset, notifications

## Performance Considerations

### Frontend Optimization
- Server-side rendering (SSR) by default
- Image optimization via next/image
- Code splitting per route
- Lazy loading for heavy components
- Client-side caching of API responses

### Database Optimization
- Indexes on frequently queried fields:
  - `mushrooms.status`
  - `mushrooms.submittedBy`
  - `users.username`
  - `users.email`
- Lean queries (select only needed fields)
- Population limits
- Connection pooling

### Image Optimization
- Cloudinary auto-format
- Responsive image delivery
- Lazy loading with Intersection Observer
- WebP format with fallbacks

### API Optimization
- Pagination for large datasets
- Debounced search queries
- Client-side filtering for small datasets
- Efficient MongoDB queries

## Security Measures

### Authentication
- Password hashing (bcrypt)
- HttpOnly cookies
- Secure session tokens
- CSRF protection

### Data Validation
- Mongoose schema validation
- Server-side input sanitization
- File type/size validation
- Coordinate range checks

### Environment Security
- Secrets in .env.local (gitignored)
- No hardcoded credentials
- Separate prod/dev environments
- Environment variable validation

### API Security
- Role-based access control
- Rate limiting (future enhancement)
- Input validation on all endpoints
- Error message sanitization

## Browser Compatibility

### Target Browsers
- Chrome 90+ (primary)
- Safari 14+ (iOS devices)
- Firefox 88+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Android WebView

### Progressive Enhancement
- Core functionality works without JavaScript
- Graceful degradation for older browsers
- Mobile-first responsive design

## Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- GitLens

### Debugging Tools
- React DevTools
- Next.js DevTools
- MongoDB Compass
- Postman/Insomnia (API testing)
- Chrome DevTools

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables
- Set all required env vars in Vercel dashboard
- Use different values for production
- Secure secrets storage

### Build Configuration
- Automatic builds on git push
- Preview deployments for PRs
- Production domain configuration
- HTTPS by default

## Known Technical Limitations

### EXIF Data
- Some mobile browsers strip EXIF for privacy
- Cannot be prevented client-side
- Fallback: device GPS API
- Workaround: manual location input

### MongoDB Free Tier
- 512MB storage limit
- Shared cluster performance
- Consider upgrade as data grows

### Cloudinary Free Tier
- 25GB storage
- 25GB bandwidth/month
- Upgrade needed for high traffic

### Image Upload Size
- Maximum 5MB per image
- Larger files rejected
- Client-side validation

## EcovigyanDesign Project Tech Stack (New Design)

### Build Tool & Framework
- **Vite 6.3.5**
  - Lightning-fast dev server
  - Optimized production builds
  - Hot module replacement
  - ESM-based bundling

- **React 18.3.1** (peer dependency)
  - Standard React (not React 19)
  - React Router 7.13.0 for routing
  - No server-side rendering

### UI Component Libraries
- **Radix UI Primitives** (shadcn/ui style)
  - @radix-ui/react-* (full suite)
  - Accessible, unstyled components
  - Fully customizable with Tailwind

- **Material UI 7.3.5**
  - @mui/material + @mui/icons-material
  - Additional component options
  - Icon library

### Styling
- **Tailwind CSS 4.1.12**
  - @tailwindcss/vite plugin
  - CSS-first configuration
  - Custom theme and animations

- **Class Utilities**
  - class-variance-authority (CVA)
  - clsx for conditional classes
  - tailwind-merge for conflict resolution

### Mapping & Geolocation
- **Leaflet 1.9.4**
  - Open-source map library
  - react-leaflet 4.2.1 wrapper
  - leaflet.heat 0.2.0 for heatmaps
  - **Different from main app's Mapbox GL**

### Animation
- **Motion 12.23.24**
  - Similar to Framer Motion
  - Lightweight animation library
  - Gesture support

### Forms & Validation
- **React Hook Form 7.55.0**
  - Performance-focused forms
  - Built-in validation
  - Better than current manual forms

### Data Visualization
- **Recharts 2.15.2**
  - Chart library built on D3
  - Responsive charts
  - Not in main app

### Additional Libraries
- **cmdk 1.1.1** - Command palette UI
- **date-fns 3.6.0** - Date utilities
- **sonner 2.0.3** - Toast notifications (vs react-hot-toast)
- **vaul 1.1.2** - Drawer component
- **embla-carousel-react 8.6.0** - Carousel
- **input-otp 1.4.2** - OTP input
- **next-themes 0.4.6** - Theme switching
- **react-dnd 16.0.1** - Drag and drop
- **react-responsive-masonry 2.7.1** - Gallery layout
- **react-slick 0.31.0** - Slider component

### Current State
- ✅ Fully functional frontend
- ✅ Mock data in `mushroom-data.ts`
- ✅ Simulated authentication
- ❌ **No backend integration**
- ❌ **No MongoDB connection**
- ❌ **No real API calls**

### Integration Challenges

#### Library Conflicts
| Feature | Main App | EcovigyanDesign | Resolution Needed |
|---------|----------|-----------------|-------------------|
| Maps | Mapbox GL | Leaflet | Choose one or support both |
| Toast | react-hot-toast | sonner | Standardize |
| Animation | Framer Motion | Motion | Both similar, choose one |
| Routing | Next.js App Router | React Router | Convert to Next.js |
| Forms | Manual | react-hook-form | Adopt new pattern |
| UI Components | Custom | shadcn/ui | Replace with shadcn |

#### Architecture Mismatch
- **Routing**: React Router client-side vs Next.js App Router SSR
- **Rendering**: SPA vs SSR/SSG hybrid
- **API**: Would need Express/Fastify vs Next.js Route Handlers
- **Build**: Vite vs Next.js build system
- **Deployment**: Static hosting vs Vercel serverless

## Migration Strategy Considerations

### Option A: Port to Next.js (RECOMMENDED)
**Approach**: Extract UI components from EcovigyanDesign and adapt to Next.js

**Pros**:
- Keep existing backend and data layer
- Maintain SSR benefits
- Incremental migration (less risky)
- No API duplication

**Cons**:
- Need to adapt React Router to Next.js routing
- Some component refactoring required
- May need to replace Leaflet with Mapbox

**Effort**: Medium (2-3 weeks)

### Option B: Rebuild Backend in Vite
**Approach**: Add backend to Vite app, duplicate MongoDB logic

**Pros**:
- Keep new design exactly as-is
- Modern SPA architecture
- Faster dev server

**Cons**:
- Lose SSR benefits
- Duplicate all API routes
- More maintenance burden
- SEO challenges

**Effort**: High (4-6 weeks)

### Option C: Hybrid Approach
**Approach**: Use EcovigyanDesign as design system reference, rebuild in Next.js

**Pros**:
- Best of both worlds
- Clean codebase
- Optimized for Next.js

**Cons**:
- Most time-consuming
- Essentially rebuilding frontend

**Effort**: Very High (6-8 weeks)

## Future Technical Enhancements

### Progressive Web App (PWA)
- Service workers for offline support
- Install prompt
- Push notifications
- Background sync

### Performance
- Redis caching layer
- CDN for static assets
- Database query optimization
- Image lazy loading improvements

### Features
- Real-time updates (WebSockets)
- Bulk operations API
- Data export API
- Mobile native app (React Native)

### DevOps
- CI/CD pipeline
- Automated testing
- Staging environment
- Monitoring & alerting
