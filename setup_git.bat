@echo off
echo Setting up Git repository and pushing to GitHub...

REM Initialize git if not already done
git init

REM Add all files
echo Adding files to git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Game 999: Updated app name, added responsive web UI, and prepared for deployment"

echo.
echo Git setup completed!
echo.
echo To push to GitHub:
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_GITHUB_REPO_URL
echo 4. Run: git branch -M main
echo 5. Run: git push -u origin main
echo.
echo After pushing to GitHub, you can deploy to Vercel using:
echo 1. Go to vercel.com
echo 2. Import your GitHub repository
echo 3. Set build directory to: frontend_andriod/build/web
echo.
pause
