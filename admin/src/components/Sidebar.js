import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar d-flex flex-column p-3">
      <div className="text-center mb-4">
        <h4 className="text-white">
          <i className="bi bi-gear-fill me-2"></i>
          Admin Panel
        </h4>
        <small className="text-light">Welcome, {user?.fullName}</small>
      </div>

      <Nav className="flex-column flex-grow-1">
        <Link to="/dashboard" className={`nav-link sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </Link>

        <Link to="/users" className={`nav-link sidebar-link ${isActive('/users') ? 'active' : ''}`}>
          <i className="bi bi-people me-2"></i>
          Users
        </Link>

        <Link to="/results" className={`nav-link sidebar-link ${isActive('/results') ? 'active' : ''}`}>
          <i className="bi bi-trophy me-2"></i>
          Results
        </Link>

        <Link to="/winners" className={`nav-link sidebar-link ${isActive('/winners') ? 'active' : ''}`}>
          <i className="bi bi-award me-2"></i>
          Winners
        </Link>

        <Link to="/reports" className={`nav-link sidebar-link ${isActive('/reports') ? 'active' : ''}`}>
          <i className="bi bi-graph-up me-2"></i>
          Reports
        </Link>
      </Nav>

      <div className="mt-auto">
        <Nav.Link 
          className="sidebar-link text-danger" 
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;
