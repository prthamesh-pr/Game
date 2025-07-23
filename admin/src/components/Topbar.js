import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <Navbar bg="white" className="shadow-sm mb-4">
      <Container fluid>
        <Navbar.Brand className="text-gradient fw-bold">
          Number Game Admin
        </Navbar.Brand>
        <div className="d-flex align-items-center">
          <span className="text-muted me-3">
            <i className="bi bi-person-circle me-1"></i>
            {user?.email}
          </span>
          <span className="badge bg-primary">{user?.role}</span>
        </div>
      </Container>
    </Navbar>
  );
};

export default Topbar;
