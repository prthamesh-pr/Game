import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Admins = () => {
  // TODO: Fetch admins from API, handle modals for add/edit/remove
  return (
    <div className="p-4">
      <h2>Admins</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map admins here */}
          <tr>
            <td>1</td>
            <td>Admin User</td>
            <td>admin@example.com</td>
            <td>Super Admin</td>
            <td>
              <Button size="sm" variant="info">Edit</Button>{' '}
              <Button size="sm" variant="danger">Remove</Button>{' '}
              <Button size="sm" variant="secondary">Change Password</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modals for add/edit/remove go here */}
    </div>
  );
};

export default Admins;
