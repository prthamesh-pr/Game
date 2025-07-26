import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Dashboard = () => (
  <Container fluid>
    <Row>
      <Col md={2} className="p-0">
        <Sidebar />
      </Col>
      <Col md={10}>
        <Topbar />
        <h2>Dashboard</h2>
        {/* Add widgets, charts, and recent activity here */}
      </Col>
    </Row>
  </Container>
);

export default Dashboard;
