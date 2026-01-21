# Sports Mockery Mobile App

React Native mobile app for Sports Mockery, built with Expo.

## Architecture

This app is a **thin client** that fetches all data from the website APIs:
- All content comes from `test.sportsmockery.com` (dev) or `sportsmockery.com` (prod)
- When content is updated on the website, the app syncs automatically
- No local content database - just API calls + caching for performance

## Features

- **News Feed** - Personalized, team-filtered articles
- **Fan Chat** - Real-time chat rooms with AI personalities (Supabase Realtime)
- **Ask Mockery AI** - Sports Q&A chatbot
- **Team Hubs** - Bears, Bulls, Cubs, White Sox, Blackhawks
- **Push Notifications** - Breaking news, game alerts (OneSignal)
- **Offline Reading** - Cache articles for offline access
- **Ads** - Flexible system supporting AdMob + custom ad code

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
cd mobile
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `EXPO_PUBLIC_ONESIGNAL_APP_ID` - Your OneSignal App ID

### Running Locally

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Building for Production

### Setup EAS Build

```bash
# Login to Expo
eas login

# Configure your project
eas build:configure
```

### Build for App Stores

```bash
# Build for iOS App Store
npm run build:ios

# Build for Google Play Store
npm run build:android

# Build for both
npm run build:all
```

### Submit to Stores

```bash
# Submit to App Store
npm run submit:ios

# Submit to Play Store
npm run submit:android
```

## Admin Panel

Mobile app settings are controlled from the website admin panel at:
`/admin/mobile`

From there you can:
- Configure AdMob ad unit IDs
- Add custom ad code (HTML/JS)
- Control ad placements and frequency
- Enable/disable features
- Set force update requirements
- Enable maintenance mode

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET/POST /api/feed` | Personalized news feed |
| `GET /api/posts/[slug]` | Article content |
| `GET/POST /api/chat/messages` | Fan Chat messages |
| `POST /api/ask-ai` | AI chatbot |
| `GET /api/team/[slug]` | Team data |
| `GET /api/mobile/config` | App configuration |

## Data Sync

- **Feed**: Auto-refresh every 5 minutes, pull-to-refresh
- **Articles**: Cached 30 minutes, refresh on view
- **Chat**: Real-time via Supabase subscriptions
- **Config**: Cached 1 hour

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   ├── article/           # Article detail
│   ├── team/              # Team hub
│   └── chat/              # Chat room
├── components/            # Shared components
├── hooks/                 # React hooks
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── supabase.ts       # Supabase client
│   ├── queryClient.ts    # React Query config
│   └── pushNotifications.ts
└── assets/               # Images, fonts
```

## Fonts

The app uses Montserrat font family. Download and place in `assets/fonts/`:
- Montserrat-Bold.ttf
- Montserrat-SemiBold.ttf
- Montserrat-Medium.ttf
- Montserrat-Regular.ttf

## Troubleshooting

### Build Errors

1. Clear cache: `expo start --clear`
2. Reset Metro: `npx expo start --reset-cache`
3. Clean install: `rm -rf node_modules && npm install`

### Push Notifications Not Working

1. Check OneSignal App ID is correct
2. Verify iOS provisioning profile has push capability
3. Check Android FCM configuration

### Ads Not Showing

1. Verify AdMob IDs in admin panel
2. Check `app.json` has correct AdMob app IDs
3. Use test IDs in development
