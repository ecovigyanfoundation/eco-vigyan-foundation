# Project Brief: Eco Vigyan Foundation

## Overview
Eco Vigyan Foundation is a full-stack citizen science web platform that empowers communities to document, map, and learn about fungal biodiversity across India. The platform combines educational outreach with scientific data collection, creating a gamified experience for students, educators, and nature enthusiasts.

## Core Mission
Bridge the gap between humanity and nature by:
- Fostering scientific inquiry through mushroom observation
- Building India's largest community-sourced fungal database
- Empowering schools with sustainability education tools
- Promoting biodiversity conservation through citizen engagement

## Target Audience

### Primary Users
1. **Students** - Young scientists documenting local biodiversity
2. **Teachers** - Educators integrating nature walks into curriculum
3. **Community Members** - Nature enthusiasts and amateur mycologists
4. **Admins** - Foundation staff moderating submissions and managing content

### Geographic Focus
- Primary: Schools and communities across India
- Emphasis on Himalayan regions (Himachal Pradesh, Uttarakhand)

## Key Features

### 1. Mushroom Observation Submission
- Photo upload with automatic EXIF extraction (GPS, date/time)
- Camera integration for instant capture with device location
- Classification fields (ecological role, texture, uses, etc.)
- Autocomplete suggestions from existing database
- Manual location selection via map, city search, or coordinates

### 2. Interactive Exploration ("Mushroom Mania")
- Map-based visualization of all approved observations
- Advanced filtering (category, use, contributor, date)
- Real-time search with autocomplete
- Detailed specimen pages with contributor information
- Leaderboard system showing top contributors

### 3. Trail & Zone Management
- Create custom mushroom trails (walking routes)
- Define zones (cities, regions, custom boundaries)
- View observations within specific areas
- Export trail data for educational purposes

### 4. Educational Content
- Articles about fungi and sustainability
- Eco-art gallery showcasing student work
- Program information (workshops, training)
- Reports and research publications

### 5. Gamification
- Points-based reward system:
  - +5 points for each mushroom submission
  - +10 points when submission is approved
  - Bonus points for admins
- Public leaderboard ranking top contributors
- User profiles displaying achievements

### 6. Admin Moderation System
- Queue-based review of pending submissions
- Approve/reject with reason tracking
- Bulk import system for legacy data
- User management (ban/unban)
- System import tracking for migrated data

## Success Criteria

### Quantitative Metrics
- **300+ schools partnered**
- **20,000+ students engaged**
- **5,000+ mushroom specimens documented**
- **450+ teachers trained**
- **12+ mushroom trails created**

### Qualitative Goals
- Accurate, scientifically valuable biodiversity data
- Active community participation and engagement
- Educational impact in schools
- Sustainable platform growth
- User-friendly experience for all age groups

## 🚨 NEW DEVELOPMENT: Design System Refresh

### EcovigyanDesign Project
A complete visual redesign has been created in a separate Vite application (`Ecovigyandesign/` folder) extracted from Figma designs. This new design will replace the current UI.

**Key Changes**:
- Modern component library (shadcn/ui based on Radix UI)
- Enhanced user experience patterns
- Improved visual hierarchy and design consistency
- Better mobile responsiveness
- Advanced UI components (command palette, better forms, etc.)

**Integration Status**: Pending
- Currently exists as separate frontend-only application
- Needs migration to existing Next.js architecture
- Must be connected to MongoDB backend
- Requires routing conversion (React Router → Next.js App Router)

**Timeline**: 2-4 weeks for complete integration

## Technical Requirements

### Must-Have
- Mobile-responsive design (primary use case)
- GPS/EXIF data extraction
- Real-time data visualization
- Secure authentication
- Image hosting and optimization
- Database scalability

### Performance
- Fast map rendering with thousands of points
- Efficient image upload and processing
- Responsive search and filtering
- Mobile-friendly forms and interfaces

## Constraints
- Budget-conscious infrastructure (free tiers where possible)
- Intermittent internet in field conditions
- Varying device capabilities (older smartphones)
- Data privacy considerations (EXIF stripping by some browsers)

## Future Vision
- Mobile native app for offline data collection
- AI-powered mushroom identification
- Research partnerships with universities
- API for third-party integrations
- Expanded to other biodiversity categories (plants, insects)
- Multi-language support (Hindi, regional languages)
