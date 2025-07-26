import React from 'react';
import { Nav } from 'react-bootstrap';

const Sidebar = () => (
  <div className="bg-light border-right" id="sidebar-wrapper" style={{ width: '220px', minHeight: '100vh', position: 'fixed' }}>
    <div className="sidebar-heading">Admin Panel</div>
    <Nav className="flex-column">
      <Nav.Link href="/dashboard">Dashboard</Nav.Link>
      <Nav.Link href="/users">Users</Nav.Link>
      <Nav.Link href="/admins">Admins</Nav.Link>
      <Nav.Link href="/games">Games</Nav.Link>
      <Nav.Link href="/results">Results</Nav.Link>
      <Nav.Link href="/withdrawals">Withdrawals</Nav.Link>
      <Nav.Link href="/transactions">Transactions</Nav.Link>
      <Nav.Link href="/qrcodes">QR Codes</Nav.Link>
      <Nav.Link href="/settings">Settings</Nav.Link>
      <Nav.Link href="/notifications">Notifications</Nav.Link>
      <Nav.Link href="/reports">Reports</Nav.Link>
      <Nav.Link href="/logout">Logout</Nav.Link>
    </Nav>
  </div>
);

export default Sidebar;
