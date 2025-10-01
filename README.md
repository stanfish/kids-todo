# Kids Todo App

A fun and colorful task management application designed for children aged 6-13 years old. The app helps kids stay organized with their daily tasks while providing an engaging, tablet-optimized user experience.

## Features

- 🎨 Child-friendly, colorful interface optimized for tablets
- 👨‍👩‍👧‍👦 Multi-child support for families
- ✅ Simple task completion with visual feedback
- 🔄 Recurring daily tasks that automatically duplicate
- 📝 General tasks (undated tasks) for ongoing activities
- 🏆 Achievement badges for completed days
- 📅 Date navigation to view past and future tasks
- 🎵 Smooth animations for engagement
- 📱 Touch-optimized for children's fingers
- 🗑️ Task deletion with options for recurring task management

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **State Management**: Zustand
- **Testing**: Jest + Testing Library
- **Deployment**: Netlify (static export)

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Firebase project with Firestore enabled

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

5. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Copy your Firebase config values to `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Firebase Setup

### 1. Create a New Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enter a project name (e.g., "kids-todo-app")
4. Enable Google Analytics (recommended for usage tracking)

### 2. Set Up Firestore Database
1. In the Firebase Console, navigate to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (you can adjust rules later)
4. Select a location closest to your users
5. Click "Enable"

### 3. Configure Authentication (Optional but Recommended)
1. Go to "Authentication" in the left sidebar
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Save your changes

### 4. Set Up Security Rules
1. Go to "Firestore Database" > "Rules"
2. Replace the default rules with the following (adjust as needed for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development rules (allow all access)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Production-ready rules (commented out)
    /*
    match /kids/{kidId} {
      allow read, write: if request.auth != null;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    match /achievements/{achievementId} {
      allow read, write: if request.auth != null;
    }
    */
  }
}
```

### 5. Get Firebase Configuration
1. Go to Project Settings (gear icon next to "Project Overview")
2. Scroll down to "Your apps" section
3. Click the web app icon (</>)
4. Register your app with a nickname (e.g., "Kids Todo Web")
5. Copy the configuration object to your `.env.local` file

### 6. Initialize Firestore Indexes (Optional)
For better query performance, create these composite indexes:

1. Go to "Firestore" > "Indexes"
2. Click "Add Index"
3. For tasks collection, add these indexes:
   - Collection ID: `tasks`
   - Fields to index:
     - `kidId` (Ascending)
     - `date` (Ascending)
     - `createdAt` (Ascending)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main dashboard
│   ├── login/          # Authentication page
│   └── kid/            # Kid-specific pages
│       ├── page.tsx    # Daily tasks page
│       └── general/    # General (undated) tasks page
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── ui/            # Reusable UI components
│   ├── EnvChecker.tsx # Environment validation
│   └── FirebaseTest.tsx # Firebase connection test
├── constants/         # App constants (avatars, etc.)
├── contexts/          # React contexts (AuthContext)
├── hooks/             # Custom React hooks (useTasks, useKids)
├── lib/               # Firebase and utility functions
│   ├── firebase.ts    # Firebase configuration
│   └── firebaseServices.ts # Database operations
├── types/             # TypeScript type definitions
└── utils/             # Utility functions (recurring tasks)
```

## Key Features

### Task Management
- **Daily Tasks**: Date-specific tasks with completion tracking
- **General Tasks**: Undated tasks for ongoing activities
- **Recurring Tasks**: Daily recurring tasks that auto-duplicate
- **Task Completion**: Visual feedback with animations
- **Task Editing**: In-line editing capabilities
- **Task Deletion**: Individual and bulk deletion options

### Achievement System
- **Daily Completion Badges**: Awarded when all tasks for a day are completed
- **Visual Celebrations**: Animated achievement displays
- **Achievement History**: Track completion milestones

### Multi-Child Support
- **Kid Profiles**: Individual profiles with custom avatars
- **Isolated Task Lists**: Each child has separate task lists
- **Family Dashboard**: Overview of all children's activities

### User Experience
- **Tablet Optimized**: Portrait orientation for tablets
- **Touch-Friendly**: Large buttons and touch targets
- **Colorful Design**: Engaging visual design for children
- **Responsive Layout**: Works on different screen sizes
- **Date Navigation**: Easy browsing of past and future dates

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
npm run export
```

2. The static files will be in the `out` directory
3. Upload the `out` directory to Netlify

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run export` - Export static files
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or issues, please open an issue on GitHub.
