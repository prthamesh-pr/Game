import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';

const Topbar = () => (
  <Navbar bg="light" expand="lg" className="mb-4">
    <Navbar.Brand href="/">Admin Panel</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ml-auto">
        <Nav.Link href="/notifications">Notifications</Nav.Link>
        <Nav.Link href="/settings">Settings</Nav.Link>
        <Nav.Link href="/profile">Profile</Nav.Link>
        <Nav.Link href="/logout">Logout</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Topbar;
