import React from 'react';
import { Table, Button } from 'react-bootstrap';

const Transactions = () => {
  // TODO: Fetch transactions from API, handle export and filters
  return (
    <div className="p-4">
      <h2>Transaction History</h2>
      <Button variant="secondary" className="mb-3">Export CSV</Button>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {/* Map transactions here */}
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>Deposit</td>
            <td>$100</td>
            <td>2025-07-26</td>
          </tr>
        </tbody>
      </Table>
      {/* Add filters and export logic here */}
    </div>
  );
};

export default Transactions;
