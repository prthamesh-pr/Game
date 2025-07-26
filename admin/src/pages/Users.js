import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Users = () => {
  // TODO: Fetch users from API, handle modals for view/edit/add balance
  return (
    <div className="p-4">
      <h2>Users</h2>
      {/* Search/filter bar here */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map users here */}
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>Active</td>
            <td>$100</td>
            <td>
              <Button size="sm" variant="info">View</Button>{' '}
              <Button size="sm" variant="warning">Edit</Button>{' '}
              <Button size="sm" variant="danger">Block</Button>{' '}
              <Button size="sm" variant="success">Add Balance</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modals for view/edit/add balance go here */}
    </div>
  );
};

export default Users;
