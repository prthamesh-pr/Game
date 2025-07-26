import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Results = () => {
  // TODO: Fetch results from API, handle modals for edit/publish
  return (
    <div className="p-4">
      <h2>Results</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Round ID</th>
            <th>Result Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map results here */}
          <tr>
            <td>1</td>
            <td>7</td>
            <td>Published</td>
            <td>
              <Button size="sm" variant="info">Edit</Button>{' '}
              <Button size="sm" variant="primary">Publish</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modals for edit/publish go here */}
    </div>
  );
};

export default Results;
