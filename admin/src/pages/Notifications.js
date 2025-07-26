import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Notifications = () => {
  // TODO: Fetch notifications from API, handle send notification modal
  return (
    <div className="p-4">
      <h2>Notifications</h2>
      <Button variant="primary" className="mb-3">Send Notification</Button>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map notifications here */}
          <tr>
            <td>1</td>
            <td>System update scheduled</td>
            <td>2025-07-26</td>
            <td>Unread</td>
            <td>
              <Button size="sm" variant="secondary">Mark as Read</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modal for send notification goes here */}
    </div>
  );
};

export default Notifications;
