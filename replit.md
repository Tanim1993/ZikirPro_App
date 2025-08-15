# Overview

This is an Islamic Zikir Competition App called "Zikir Amol" that combines digital tasbih functionality with competitive elements. The application allows users to join or create Zikir rooms where they can perform remembrance (dhikr) while competing with others through real-time leaderboards. The app features a full-stack architecture with React frontend, Express.js backend, PostgreSQL database, and WebSocket support for live updates.

# User Preferences

Preferred communication style: Simple, everyday language.
Theme preference: Clean blue and white professional design with gradient styling (FINAL - strongly rejected green theme).
Design approach: Minimal, modern, professional look with blue gradients and white backgrounds.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Islamic blue theme design tokens (moved away from green to elegant blue gradients)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions stored in PostgreSQL
- **Real-time Communication**: WebSocket server for live leaderboard updates
- **API Design**: RESTful endpoints with proper error handling middleware

## Database Design
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with full TypeScript support
- **Schema**: Includes users, zikirs (dhikr), rooms, room members, count entries, live counters, user analytics, and reports
- **Migrations**: Managed through Drizzle Kit

## Core Features Architecture
- **Digital Tasbih**: Interactive counter with visual feedback and congratulations modals
- **Room System**: Public/private rooms with duration-based challenges (1-40 days)
- **Live Leaderboards**: Real-time ranking updates via WebSocket connections
- **User Analytics**: Progress tracking, streaks, and performance metrics
- **Islamic Content**: Master list of authentic zikir with Arabic text, transliteration, and translations
- **Theme Design**: Complete blue gradient professional theme with linear gradient (105.9deg, rgba(0,122,184,1) 24.4%, rgba(46,0,184,0.88) 80.5%) applied across entire application - stunning gradient headers, modern glass-effect cards, clean white content areas, and professional typography for a premium Islamic app experience
- **Room Management**: Deletion system for owners (when sole member) and reporting system for inappropriate content
- **Auto-Membership**: Room creators automatically become members with owner role
- **Verified Organizations**: Complete institutional competition system with organization accounts, prize management, and verified badges
- **Unified Login System**: Single login page supporting both regular users and organization accounts with user-type-based feature display
- **Islamic Features Suite**: Comprehensive external features accessible via "More" button including Salah Tracker, Quran Reader, Hadith Collection, Zakat Calculator, Qiblah Direction, and Donations platform - all maintaining consistent blue gradient theme
- **Data Separation System**: Complete separation between user types - organizations see only their created competitions, regular users see only their joined rooms, with type-specific UI layouts and navigation
- **Organization Tools**: Focused competition management interface with Analytics tab, 2-tab layout (My Competitions + Leaders), and dedicated "Create Competition" workflow
- **Seasonal Competitions System**: Special competition framework for Islamic seasons (Ramadan, Hajj, Muharram) with themed competitions, exclusive rewards, and seasonal-specific leaderboards
- **Achievement Badges System**: Comprehensive gamification with bronze, silver, gold, and platinum badges across multiple categories (zikir, seasonal, social, streak, milestone) including automatic eligibility checking and reward awarding

## Component Structure
- **Modular Components**: Reusable UI components for tasbih counter, room cards, leaderboards
- **Custom Hooks**: WebSocket management, authentication state, mobile detection
- **Islamic Design System**: Custom avatar selector, Islamic patterns, and color scheme

# External Dependencies

## Authentication & Identity
- **Replit Auth**: Primary authentication provider using OpenID Connect
- **Passport.js**: Authentication middleware with OpenID strategy

## Database & Storage
- **Neon Database**: PostgreSQL hosting service
- **Google Cloud Storage**: File storage for room pictures and assets
- **Uppy**: File upload handling with AWS S3 and Google Cloud integration

## Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for live updates
- **Session Store**: PostgreSQL-backed session storage

## UI & Design
- **Radix UI**: Headless UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Font**: Google Fonts (Inter, Amiri for Arabic text)

## Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database schema management and migrations