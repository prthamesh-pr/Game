import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const Settings = () => {
  // TODO: Fetch and update settings from API
  return (
    <div className="p-4">
      <h2>Settings</h2>
      <Card>
        <Card.Body>
          <Form>
            <Form.Group controlId="formGameTimings">
              <Form.Label>Game Timings</Form.Label>
              <Form.Control type="text" placeholder="Enter game timings" />
            </Form.Group>
            <Form.Group controlId="formWithdrawalLimits">
              <Form.Label>Withdrawal Limits</Form.Label>
              <Form.Control type="number" placeholder="Enter withdrawal limit" />
            </Form.Group>
            <Form.Group controlId="formContactInfo">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control type="text" placeholder="Enter contact info" />
            </Form.Group>
            <Button variant="primary" type="submit">Save Changes</Button>
            <Button variant="secondary" className="ml-2">Change Password</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;
