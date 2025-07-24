import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  isRenderStartupIssue,
  getRenderFreeServiceSuggestions
} from '../utils/apiErrorHandler';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline', 'starting'
  
  // Check if the backend server is up
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Use a simple API endpoint to check if server is responding
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        await axios.get(`${baseUrl}/auth/admin/login`, { timeout: 5000 });
        setServerStatus('online');
      } catch (err) {
        if (isRenderStartupIssue(err)) {
          setServerStatus('starting');
        } else if (err.response) {
          // If we get a response, even an error, the server is up
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      }
    };
    
    checkServerStatus();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      console.log("Attempting login with:", values);
      const result = await login(values);
      
      if (!result.success) {
        console.error("Login failed:", result.message);
        setError(result.message);
        
        // Check for specific error cases
        if (result.message?.toLowerCase().includes('too many authentication attempts')) {
          setError('Account is temporarily locked due to too many failed login attempts. Please try again later.');
        }
      } else {
        console.log("Login successful!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="login-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="text-gradient mb-2">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Admin Login
                  </h2>
                  <p className="text-muted">Sign in to access the admin panel</p>
                </div>
                
                {serverStatus === 'checking' && (
                  <Alert variant="info" className="mb-3 d-flex align-items-center">
                    <Spinner animation="border" size="sm" role="status" className="me-2" />
                    <span>Checking server connection...</span>
                  </Alert>
                )}
                
                {serverStatus === 'starting' && (
                  <Alert variant="warning" className="mb-3">
                    <h5><i className="bi bi-hourglass-split me-2"></i>Server is starting up</h5>
                    <p className="mb-0">This may take 1-2 minutes if the server was inactive.</p>
                    <hr />
                    <small>
                      <ul className="mb-0 ps-3">
                        {getRenderFreeServiceSuggestions().map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </small>
                  </Alert>
                )}
                
                {serverStatus === 'offline' && (
                  <Alert variant="danger" className="mb-3">
                    <h5><i className="bi bi-exclamation-triangle me-2"></i>Server is offline</h5>
                    <p>The backend server is currently not responding. Please try again later or contact the administrator.</p>
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </div>

                      <div className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Enter your password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </div>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In
                          </>
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
