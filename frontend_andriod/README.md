# Game 999 - Flutter Web App

A responsive number guessing game built with Flutter, featuring multiple game classes, real-time statistics, and token-based gameplay.

## Features

- **🎮 Multiple Game Classes**: Three different game types (A, B, C) with unique number patterns
- **📱 Responsive Design**: Optimized for both mobile and web platforms
- **🎯 Real-time Statistics**: Live game stats, win rates, and performance tracking
- **💰 Token Wallet System**: Secure token-based betting and rewards
- **📊 Live Results**: Real-time game results and history tracking
- **🏆 User Dashboard**: Comprehensive dashboard with game analytics
- **🎨 Modern UI**: Beautiful, animated interface with smooth transitions

## Game Classes

- **Class A**: Repeating Numbers (111, 222, 333) - High reward potential
- **Class B**: Pattern Numbers (112, 221, 334) - Balanced risk/reward
- **Class C**: Unique Numbers (123, 456, 789) - Strategic gameplay

## Tech Stack

- **Frontend**: Flutter (Dart)
- **State Management**: Provider
- **UI Framework**: Material Design + Custom Components
- **Responsive Design**: ResponsiveBuilder, LayoutBuilder
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

## Setup and Run

### Prerequisites
- Flutter SDK (>=3.0.0)
- Dart SDK
- Web browser (Chrome recommended)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prthamesh-pr/Game.git
   cd Game/frontend_andriod
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Run for mobile:**
   ```bash
   flutter run
   ```

4. **Run for web:**
   ```bash
   flutter run -d chrome
   ```

### Building for Production

**Build for Web:**
```bash
flutter build web --release
```

**Build for Android:**
```bash
flutter build apk --release
```

## Deployment on Vercel

This app is configured for easy deployment on Vercel:

1. **Push to GitHub** (already done)
2. **Connect Vercel to your GitHub repository**
3. **Configure build settings** (automatic with vercel.json)
4. **Deploy** - Vercel will build and deploy automatically

### Manual Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project root: `cd frontend_andriod`
3. Deploy: `vercel --prod`

## Important Notes

- Uses mock data for demonstration purposes
- All game data is stored locally in browser/device memory
- Token system is simulated (no real transactions)
- Responsive design works across all screen sizes
