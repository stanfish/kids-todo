# Kids Todo App

A fun and colorful task management application designed for children aged 6-13 years old. The app helps kids stay organized with their daily tasks while providing an engaging, tablet-optimized user experience.

## Authentication

The application is protected by a simple username/password authentication system. By default, the credentials are:
- **Username**: admin
- **Password**: admin123

For security reasons, please copy the `.env.example` file to `.env.local` and change these default credentials in production by updating the values in your `.env.local` file.

## Features

- 🎨 Child-friendly, colorful interface optimized for tablets
- 👨‍👩‍👧‍👦 Multi-child support for families
- ✅ Simple task completion with visual feedback
- 🔄 Recurring daily tasks that automatically duplicate
- 🏆 Achievement badges for completed days
- 📅 Date navigation to view past and future tasks
- 🎵 Sound effects and animations for engagement
- 📱 Touch-optimized for children's fingers

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Deployment**: Netlify (static export)

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kids-todo-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure authentication (in `.env.local`):
   - `NEXT_PUBLIC_AUTH_USERNAME`: Username for authentication (default: admin)
   - `NEXT_PUBLIC_AUTH_PASSWORD`: Password for authentication (default: admin123)

   For production, please change these default credentials.

4. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Copy your Firebase config values to `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Netlify

This app is configured for static export and optimized for Netlify deployment.

### Automatic Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Deploy!

### Manual Deployment

1. Build the static export:
```bash
npm run build
```

2. The static files will be in the `out` directory
3. Upload the `out` directory to Netlify

## Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Set up the following collections:
   - `kids` - Store child profiles
   - `tasks` - Store individual tasks
   - `achievements` - Store completion badges

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Firebase and utility functions
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Features Implementation

### Recurring Tasks
- Tasks marked as recurring automatically create copies for future dates
- Smart duplication prevents duplicate tasks
- Supports daily recurring patterns

### Achievement System
- Badges awarded when all tasks for a day are completed
- Visual feedback with animations and sound effects
- Achievement history tracking

### Child-Friendly Design
- Large touch targets for small fingers
- High contrast colors and readable fonts
- Engaging animations and sound effects
- Tablet portrait orientation optimized

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
