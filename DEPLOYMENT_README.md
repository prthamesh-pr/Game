# Game 999 - Flutter Web & Mobile App

A responsive gaming application built with Flutter that works on both web and mobile platforms.

## Features

- **Responsive Design**: Different UI layouts for web and mobile
- **Game Classes**: Three different game types (A, B, C)
- **Web-Optimized Interface**: Clean, modern design for web browsers
- **Mobile-Friendly**: Optimized mobile experience
- **Cross-Platform**: Single codebase for web and mobile

## Project Structure

```
├── frontend_andriod/          # Flutter application
│   ├── lib/
│   │   ├── screens/
│   │   │   ├── web_main_screen.dart      # Web-specific main screen
│   │   │   ├── responsive_dashboard.dart # Responsive dashboard
│   │   │   └── ...
│   │   ├── widgets/
│   │   │   ├── responsive_layout.dart    # Responsive layout utilities
│   │   │   ├── web_navigation.dart       # Web navigation components
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── platform_utils.dart       # Platform detection utilities
│   │   └── ...
│   ├── web/                   # Web-specific assets
│   └── build/web/             # Built web application
├── backend/                   # Node.js backend
├── admin/                     # Admin panel
└── build_script.bat           # Build automation script
```

## Quick Start

### Prerequisites

- Flutter SDK (latest stable version)
- Node.js (for Vercel CLI)
- Git

### Building the Application

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Game
   ```

2. **Run the build script:**
   
   **On Windows:**
   ```cmd
   build_script.bat
   ```
   
   **On macOS/Linux:**
   ```bash
   chmod +x build_script.sh
   ./build_script.sh
   ```

3. **Or build manually:**
   ```bash
   cd frontend_andriod
   flutter pub get
   flutter build web --release
   ```

## Deployment to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # From the project root directory
   vercel --prod
   ```
   
   When prompted:
   - Set up and deploy: `Y`
   - Which scope: Choose your account/team
   - Link to existing project: `N` (for first deployment)
   - Project name: `game-999` (or your preferred name)
   - Directory: `./frontend_andriod/build/web`

### Method 2: Using Vercel Dashboard

1. **Build the web app:**
   ```bash
   cd frontend_andriod
   flutter build web --release
   ```

2. **Upload to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Drag and drop the `frontend_andriod/build/web` folder
   - Configure project settings:
     - Framework Preset: "Other"
     - Root Directory: `./`
     - Build Command: (leave empty)
     - Output Directory: `./`

### Method 3: GitHub Integration

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit with Game 999 updates"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Configure:
     - Framework Preset: "Other"
     - Root Directory: `frontend_andriod`
     - Build Command: `flutter build web --release`
     - Output Directory: `build/web`

## Configuration

### Environment Variables (if needed)

Create a `.env` file in the project root:

```env
# API Configuration
API_BASE_URL=https://your-api-url.com
API_KEY=your-api-key

# App Configuration
APP_NAME=Game 999
APP_VERSION=1.0.0
```

### Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Development

### Running Locally

**Web Development:**
```bash
cd frontend_andriod
flutter run -d chrome
```

**Mobile Development:**
```bash
cd frontend_andriod
flutter run
```

### Making Changes

1. **For Web-specific changes:**
   - Modify files in `lib/screens/web_main_screen.dart`
   - Update `lib/widgets/web_navigation.dart`
   - Adjust responsive layouts in `lib/widgets/responsive_layout.dart`

2. **For Mobile-specific changes:**
   - Modify existing mobile screens
   - The app automatically detects platform and shows appropriate UI

3. **For Universal changes:**
   - Update shared components and providers
   - Modify themes and constants

## Troubleshooting

### Common Issues

1. **Build fails:**
   ```bash
   flutter clean
   flutter pub get
   flutter build web --release
   ```

2. **Vercel deployment fails:**
   - Ensure the build/web directory exists
   - Check file permissions
   - Verify vercel.json configuration

3. **Web app not loading:**
   - Check browser console for errors
   - Verify all assets are properly included
   - Ensure service worker is configured correctly

### Getting Help

- Check Flutter documentation: [flutter.dev](https://flutter.dev)
- Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Create an issue in this repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Live Demo:** [Your Vercel URL will appear here after deployment]

**Author:** [Your Name]
**Contact:** [Your Email]
