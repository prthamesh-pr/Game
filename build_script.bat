@echo off
echo Setting up Game 999 Flutter Project...

REM Navigate to the Flutter project directory
cd /d "%~dp0frontend_andriod"

REM Get dependencies
echo Getting Flutter dependencies...
flutter pub get

REM Build for web
echo Building for web...
flutter build web --release

REM Build for Android (optional)
echo Building for Android...
flutter build apk --release

echo Build completed!
echo.
echo Web build location: build/web/
echo Android APK location: build/app/outputs/flutter-apk/app-release.apk
echo.
echo To deploy to Vercel:
echo 1. Install Vercel CLI: npm i -g vercel
echo 2. Run: vercel --prod
echo 3. Select the 'build/web' folder as your project directory

pause
