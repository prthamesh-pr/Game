import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const NumberSelections = () => {
  // TODO: Fetch user number selections from API, handle view logic
  return (
    <div className="p-4">
      <h2>Number Selections</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>User</th>
            <th>Round</th>
            <th>Selected Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map selections here */}
          <tr>
            <td>John Doe</td>
            <td>Round 1</td>
            <td>7</td>
            <td>
              <Button size="sm" variant="info">View</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modal for view details goes here */}
    </div>
  );
};

export default NumberSelections;
