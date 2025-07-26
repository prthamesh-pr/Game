import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

export const Topbar = () => (
  <Navbar bg="light" expand="lg" className="mb-3">
    <Container>
      <Navbar.Brand href="/">Admin Panel</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/dashboard">Dashboard</Nav.Link>
          <Nav.Link href="/users">Users</Nav.Link>
          <Nav.Link href="/games">Games</Nav.Link>
          <Nav.Link href="/withdrawals">Withdrawals</Nav.Link>
          <Nav.Link href="/transactions">Transactions</Nav.Link>
          <Nav.Link href="/qrcodes">QR Codes</Nav.Link>
          <Nav.Link href="/settings">Settings</Nav.Link>
          <Nav.Link href="/notifications">Notifications</Nav.Link>
          <Nav.Link href="/reports">Reports</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link href="/logout">Logout</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);
