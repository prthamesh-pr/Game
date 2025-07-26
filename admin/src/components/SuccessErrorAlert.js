import React from 'react';
import { Alert } from 'react-bootstrap';

const SuccessErrorAlert = ({ variant, message, onClose }) => (
  <Alert variant={variant} dismissible onClose={onClose}>
    {message}
  </Alert>
);

export default SuccessErrorAlert;
