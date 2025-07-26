import React from 'react';
import { Table, Button, Modal, Form, Image } from 'react-bootstrap';

const QRCodes = () => {
  // TODO: Fetch QR codes from API, handle modals for upload/assign/deactivate/download
  return (
    <div className="p-4">
      <h2>QR Code Management</h2>
      <Button variant="primary" className="mb-3">Upload QR Image</Button>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Status</th>
            <th>QR Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map QR codes here */}
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>Active</td>
            <td><Image src="/path/to/qr.png" width={40} height={40} rounded /></td>
            <td>
              <Button size="sm" variant="info">Assign</Button>{' '}
              <Button size="sm" variant="danger">Deactivate</Button>{' '}
              <Button size="sm" variant="secondary">Download</Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* Modals for upload/assign/deactivate/download go here */}
    </div>
  );
};

export default QRCodes;
