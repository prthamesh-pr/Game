import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call login API
    if (!email || !password) {
      setError('Please enter both email and password.');
    } else {
      setError('');
      // Call API and handle login
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '350px' }}>
        <Card.Body>
          <Card.Title className="mb-4">Admin Login</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="submit" block>Login</Button>
            <Form.Text className="text-muted">
              <a href="/forgot-password">Forgot Password?</a>
            </Form.Text>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
