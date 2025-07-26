import React from 'react';
import { ListGroup } from 'react-bootstrap';

export const Sidebar = () => (
  <div className="sidebar bg-light p-3" style={{ minHeight: '100vh', width: '220px' }}>
    <ListGroup variant="flush">
      <ListGroup.Item action href="/dashboard">Dashboard</ListGroup.Item>
      <ListGroup.Item action href="/users">Users</ListGroup.Item>
      <ListGroup.Item action href="/admins">Admins</ListGroup.Item>
      <ListGroup.Item action href="/games">Games</ListGroup.Item>
      <ListGroup.Item action href="/results">Results</ListGroup.Item>
      <ListGroup.Item action href="/withdrawals">Withdrawals</ListGroup.Item>
      <ListGroup.Item action href="/transactions">Transactions</ListGroup.Item>
      <ListGroup.Item action href="/qrcodes">QR Codes</ListGroup.Item>
      <ListGroup.Item action href="/settings">Settings</ListGroup.Item>
      <ListGroup.Item action href="/notifications">Notifications</ListGroup.Item>
      <ListGroup.Item action href="/reports">Reports</ListGroup.Item>
      <ListGroup.Item action href="/logout">Logout</ListGroup.Item>
    </ListGroup>
  </div>
);
