import React from 'react';
import { Card, Button } from 'react-bootstrap';

const Profile = () => {
  // TODO: Fetch admin profile from API, add edit/change password logic
  return (
    <div className="p-4">
      <h2>Profile</h2>
      <Card style={{ maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title>Admin Name</Card.Title>
          <Card.Text>Email: admin@example.com</Card.Text>
          <Card.Text>Role: Super Admin</Card.Text>
          <Button variant="primary">Edit Profile</Button>{' '}
          <Button variant="secondary">Change Password</Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;
