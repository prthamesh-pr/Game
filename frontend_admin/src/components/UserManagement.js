import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => {
    axios.get('/api/admin/users').then(res => setUsers(res.data.data.users));
  }, []);
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEdit(true);
  };
  return (
    <div>
      <h4>User Management</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Balance</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u._id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.status}</td>
              <td>{u.wallet}</td>
              <td>
                <Button size="sm" onClick={() => handleEdit(u)}>Edit</Button>{' '}
                <Button size="sm" variant="danger">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Edit User</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" defaultValue={selectedUser.username} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" defaultValue={selectedUser.email} />
              </Form.Group>
              {/* ...other fields... */}
              <Button variant="primary">Save</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};
