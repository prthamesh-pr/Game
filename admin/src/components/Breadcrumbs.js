import React from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const Breadcrumbs = ({ items }) => (
  <nav aria-label="breadcrumb">
    <ol className="breadcrumb">
      {items.map((item, idx) => (
        <li key={idx} className={`breadcrumb-item${idx === items.length - 1 ? ' active' : ''}`}>{item}</li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
