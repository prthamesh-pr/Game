# Number Game - Admin Panel

A comprehensive admin panel built with React.js and Bootstrap CSS for managing the Number Game application.

## Features

### 🔐 Authentication
- Secure admin login with JWT tokens
- Role-based access control
- Session management

### 📊 Dashboard
- Real-time statistics and analytics
- Revenue tracking
- User activity monitoring
- Interactive charts and graphs

### 👥 User Management
- View all registered users
- Search and filter functionality
- User wallet management (add/deduct money)
- Activate/deactivate users
- User activity tracking

### 🎯 Game Results
- Set winning numbers for different game classes (A, B, C)
- Automatic win/loss calculation
- Result history with timestamps
- Winner notification system

### 🏆 Winners & Reports
- View winners by game rounds
- Detailed player statistics
- Revenue and payout tracking
- Export functionality

### 📈 Analytics & Reports
- Daily revenue trends
- Game class distribution
- Top players leaderboard
- Custom date range reports

## Technology Stack

- **Frontend**: React.js 18
- **UI Framework**: Bootstrap 5 + React Bootstrap
- **Icons**: Bootstrap Icons
- **Charts**: Recharts
- **Form Handling**: Formik + Yup
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Routing**: React Router DOM

## Installation

1. **Navigate to admin directory**:
   \`\`\`bash
   cd admin
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**:
   Create a \`.env\` file in the admin directory:
   \`\`\`env
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`

4. **Start the development server**:
   \`\`\`bash
   npm start
   \`\`\`

   The admin panel will open at http://localhost:3000

## Default Admin Credentials

- **Email**: admin@numbergame.com
- **Password**: Admin@123

## Backend Integration

The admin panel integrates with the Node.js backend through REST APIs:

### Authentication APIs
- \`POST /api/auth/admin/login\` - Admin login
- \`GET /api/admin/profile\` - Get admin profile

### User Management APIs
- \`GET /api/admin/users\` - Get all users with pagination
- \`GET /api/admin/users/:id\` - Get user details
- \`POST /api/admin/users/:id/toggle-status\` - Activate/deactivate user
- \`POST /api/admin/wallet/manage\` - Manage user wallet

### Game Management APIs
- \`POST /api/admin/results/set\` - Set game results
- \`GET /api/admin/results\` - Get results history
- \`GET /api/admin/results/:roundId/winners\` - Get winners

### Analytics APIs
- \`GET /api/admin/dashboard\` - Dashboard statistics
- \`GET /api/admin/reports\` - Generate reports

## Folder Structure

\`\`\`
/admin
  /public
    index.html
    manifest.json
  /src
    /components
      Sidebar.js          - Navigation sidebar
      Topbar.js           - Top navigation bar
      PrivateRoute.js     - Route protection
      WalletModal.js      - Wallet management modal
    /pages
      Login.js            - Admin login page
      Dashboard.js        - Main dashboard
      Users.js            - User management
      Results.js          - Game results management
      Winners.js          - Winners and players view
      Reports.js          - Analytics and reports
    /services
      api.js              - API service layer
    /contexts
      AuthContext.js      - Authentication context
    /utils
      helpers.js          - Utility functions
    App.js                - Main app component
    index.js              - App entry point
    index.css             - Global styles
  package.json
  README.md
\`\`\`

## Key Features Explained

### Dashboard
- Overview statistics cards
- Revenue trend charts
- Game class distribution
- Recent activity feeds

### User Management
- Paginated user list with search
- Individual user details
- Wallet top-up/deduction
- Status management

### Results Management
- Easy result entry form
- Validation for 3-digit numbers
- Automatic calculation of wins/losses
- Results history table

### Winners View
- Filter by game rounds
- Statistics summary
- Detailed player list
- Win/loss indicators

### Reports & Analytics
- Custom date range selection
- Revenue trend analysis
- Top players ranking
- Big winners tracking

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Role-based route protection
- Secure API communication
- Input validation and sanitization

## Responsive Design

- Mobile-friendly interface
- Collapsible sidebar on smaller screens
- Touch-friendly controls
- Optimized for tablets and desktops

## Development

### Available Scripts

- \`npm start\` - Start development server
- \`npm build\` - Build for production
- \`npm test\` - Run tests
- \`npm eject\` - Eject from Create React App

### Environment Variables

- \`REACT_APP_API_URL\` - Backend API base URL

## Production Deployment

1. **Build the application**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy the build folder** to your web server

3. **Configure environment variables** for production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
