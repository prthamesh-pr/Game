import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const Logout = () => {
  // TODO: Add logout logic and confirmation modal
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Modal show={true} centered>
        <Modal.Header>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Logout</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Logout;
