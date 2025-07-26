import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Games = () => {
  // TODO: Fetch games from API, handle modals for create/edit/activate/deactivate
  return (
    <div className="p-4">
      <h2>Games</h2>
      <Button variant="primary" className="mb-3">Create Game</Button>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map games here */}
          <tr>
            <td>1</td>
            <td>Game 1</td>
            <td>Active</td>
            <td>2025-07-26 10:00</td>
            <td>2025-07-26 11:00</td>
            <td>
              <Button size="sm" variant="info">Edit</Button>{' '}
              <Button size="sm" variant="success">Activate</Button>{' '}
              <Button size="sm" variant="warning">Deactivate</Button>{' '}
              <Button size="sm" variant="danger">Delete</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modals for create/edit/activate/deactivate go here */}
    </div>
  );
};

export default Games;
