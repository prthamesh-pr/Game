import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Results from './pages/Results';
import Winners from './pages/Winners';
import Reports from './pages/Reports';

// Layout Component
const AdminLayout = ({ children }) => {
  return (
    <Row className="g-0">
      <Col md={3} lg={2} className="d-none d-md-block">
        <Sidebar />
      </Col>
      <Col md={9} lg={10} className="main-content">
        <Topbar />
        {children}
      </Col>
    </Row>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Users />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/results"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Results />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/winners"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Winners />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Reports />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
