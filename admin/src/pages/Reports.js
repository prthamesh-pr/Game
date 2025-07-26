import React from 'react';
import { Table, Button, Form } from 'react-bootstrap';

const Reports = () => {
  // TODO: Fetch reports from API, handle export and date range picker
  return (
    <div className="p-4">
      <h2>Reports</h2>
      <Form inline className="mb-3">
        <Form.Label className="mr-2">Date Range:</Form.Label>
        <Form.Control type="date" className="mr-2" />
        <Form.Control type="date" className="mr-2" />
        <Button variant="primary">Export CSV</Button>
      </Form>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {/* Map reports here */}
          <tr>
            <td>1</td>
            <td>User Report</td>
            <td>2025-07-26</td>
            <td>100 users registered</td>
          </tr>
        </tbody>
      </Table>
      {/* Add export and date range logic here */}
    </div>
  );
};

export default Reports;
