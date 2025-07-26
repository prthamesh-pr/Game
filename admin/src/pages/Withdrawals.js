import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Withdrawals = () => {
  // TODO: Fetch withdrawal requests from API, handle modals for approve/reject/view details
  return (
    <div className="p-4">
      <h2>Withdrawal Requests</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map withdrawal requests here */}
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>$50</td>
            <td>Pending</td>
            <td>2025-07-26</td>
            <td>
              <Button size="sm" variant="success">Approve</Button>{' '}
              <Button size="sm" variant="danger">Reject</Button>{' '}
              <Button size="sm" variant="info">View Details</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modals for approve/reject/view details go here */}
    </div>
  );
};

export default Withdrawals;
