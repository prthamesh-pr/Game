import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0')
    .max(100000, 'Maximum amount is ₹1,00,000'),
  type: Yup.string().required('Transaction type is required'),
  description: Yup.string().max(200, 'Description must be less than 200 characters')
});

const WalletModal = ({ show, onHide, user, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      
      const data = {
        userId: user._id,
        amount: parseFloat(values.amount),
        type: values.type,
        description: values.description || `Wallet ${values.type} by admin`
      };

      const response = await adminAPI.manageWallet(data);
      
      if (response.data.success) {
        toast.success(`Wallet ${values.type} successful!`);
        onUpdate(response.data.data.user);
        onHide();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Transaction failed';
      toast.error(message);
      setFieldError('amount', message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-wallet2 me-2"></i>
          Manage Wallet - {user?.username}
        </Modal.Title>
      </Modal.Header>
      
      <Formik
        initialValues={{
          amount: '',
          type: 'credit',
          description: ''
        }}
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
            <Modal.Body>
              <div className="mb-3">
                <Alert variant="info">
                  <strong>Current Balance:</strong> ₹{user?.wallet?.toFixed(2) || '0.00'}
                </Alert>
              </div>

              <div className="mb-3">
                <Form.Label>Transaction Type</Form.Label>
                <Form.Select
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.type && errors.type}
                >
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Deduct Money)</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type}
                </Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.amount && errors.amount}
                  min="1"
                  max="100000"
                  step="0.01"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.amount}
                </Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Enter description for this transaction"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.description && errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </div>

              {values.type === 'debit' && (
                <Alert variant="warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This will deduct money from the user's wallet.
                  Make sure the user has sufficient balance.
                </Alert>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={onHide} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading || isSubmitting}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    {values.type === 'credit' ? 'Add Money' : 'Deduct Money'}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default WalletModal;
