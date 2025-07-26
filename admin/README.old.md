# Admin Panel Frontend (React + Bootstrap)

This folder will contain the React-based admin panel UI. Follow these steps to get started:

## 1. Setup

- Run `npx create-react-app .` in this folder to initialize the React app.
- Install dependencies:
  - `npm install react-bootstrap bootstrap axios react-router-dom chart.js react-chartjs-2 @fortawesome/react-fontawesome`
- Import Bootstrap CSS in `src/index.js`:
  ```js
  import 'bootstrap/dist/css/bootstrap.min.css';
  ```

## 2. Folder Structure

- `src/components/` - Reusable UI components (Sidebar, Topbar, Modals, Tables, Forms)
- `src/pages/` - Main screens (Dashboard, Users, Admins, Games, Results, Withdrawals, Transactions, QR Codes, Settings, Notifications, Reports, Login)
- `src/services/` - API service (Axios instance pointing to https://game-39rz.onrender.com)
- `src/App.js` - Routing and layout

## 3. Key Features

- Responsive sidebar and topbar navigation
- Authentication (login/logout)
- Dashboard with stats and charts
- CRUD for users, admins, games, results, withdrawals, transactions, QR codes
- Modals for forms and confirmations
- File/image upload for QR codes
- Notifications and audit logs
- Data export (CSV/Excel)

## 4. API Integration

- All API calls should use the backend URL: `https://game-39rz.onrender.com`
- Example Axios service:
  ```js
  import axios from 'axios';
  export default axios.create({
    baseURL: 'https://game-39rz.onrender.com/api',
    withCredentials: true,
  });
  ```

## 5. Styling

- Use Bootstrap components for layout, forms, tables, modals, buttons, alerts
- Customize with SCSS or CSS for a professional look

---

You can now scaffold your React app and start building each screen as described in `admin.md`. For code samples or starter components, let me know!
