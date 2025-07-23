import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Table,
  Badge,
  Spinner
} from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { adminAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  gameClass: Yup.string().required('Game class is required'),
  winningNumber: Yup.string()
    .matches(/^\d{3}$/, 'Winning number must be exactly 3 digits')
    .required('Winning number is required'),
  roundName: Yup.string().required('Round name is required')
});

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getResults({ limit: 20 });
      setResults(response.data.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (values, { resetForm, setFieldError }) => {
    try {
      setSubmitting(true);
      
      const data = {
        gameClass: values.gameClass,
        winningNumbers: {
          [values.gameClass.toLowerCase()]: values.winningNumber
        },
        roundName: values.roundName,
        description: values.description || `${values.gameClass} - ${values.roundName}`
      };

      const response = await adminAPI.setResult(data);
      
      if (response.data.success) {
        toast.success('Result set successfully! Users have been notified.');
        resetForm();
        fetchResults(); // Refresh results list
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to set result';
      toast.error(message);
      setFieldError('winningNumber', message);
    } finally {
      setSubmitting(false);
    }
  };

  const getGameClassBadge = (gameClass) => {
    const variants = {
      'A': 'primary',
      'B': 'success', 
      'C': 'warning'
    };
    
    return (
      <Badge bg={variants[gameClass] || 'secondary'}>
        Class {gameClass}
      </Badge>
    );
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-gradient mb-0">
          <i className="bi bi-trophy me-2"></i>
          Game Results
        </h2>
        <Button variant="outline-primary" onClick={fetchResults}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      <Row>
        {/* Set New Result Form */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Set New Result
              </h5>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={{
                  gameClass: '',
                  winningNumber: '',
                  roundName: '',
                  description: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmitResult}
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
                      <Form.Label>Game Class</Form.Label>
                      <Form.Select
                        name="gameClass"
                        value={values.gameClass}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.gameClass && errors.gameClass}
                      >
                        <option value="">Select game class</option>
                        <option value="A">Class A</option>
                        <option value="B">Class B</option>
                        <option value="C">Class C</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.gameClass}
                      </Form.Control.Feedback>
                    </div>

                    <div className="mb-3">
                      <Form.Label>Winning Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="winningNumber"
                        placeholder="Enter 3-digit number (e.g., 123)"
                        value={values.winningNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.winningNumber && errors.winningNumber}
                        maxLength="3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.winningNumber}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Must be exactly 3 digits (000-999)
                      </Form.Text>
                    </div>

                    <div className="mb-3">
                      <Form.Label>Round Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="roundName"
                        placeholder="e.g., Morning Round, Evening Round"
                        value={values.roundName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.roundName && errors.roundName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.roundName}
                      </Form.Control.Feedback>
                    </div>

                    <div className="mb-4">
                      <Form.Label>Description (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        placeholder="Additional notes about this result"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>

                    <Alert variant="warning" className="mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <strong>Warning:</strong> Setting a result will immediately calculate wins/losses for all users and cannot be undone.
                    </Alert>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Setting Result...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Set Result
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        {/* Results History */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Results History
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading results...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Round Details</th>
                        <th>Class</th>
                        <th>Winning Number</th>
                        <th>Winners</th>
                        <th>Total Payout</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length > 0 ? (
                        results.map((result) => (
                          <tr key={result._id}>
                            <td>
                              <div>
                                <strong>{result.roundName}</strong>
                                {result.description && (
                                  <small className="text-muted d-block">
                                    {result.description}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              {getGameClassBadge(result.gameClass)}
                            </td>
                            <td>
                              <span className="badge bg-dark font-monospace fs-6">
                                {result.winningNumbers?.[result.gameClass.toLowerCase()] || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success">
                                {result.winnersCount || 0}
                              </span>
                            </td>
                            <td>
                              <strong className="text-success">
                                {formatCurrency(result.totalPayout || 0)}
                              </strong>
                            </td>
                            <td>
                              <small>{formatDate(result.createdAt)}</small>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center p-4">
                            <i className="bi bi-trophy display-1 text-muted"></i>
                            <p className="text-muted mt-3">No results found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Results;
