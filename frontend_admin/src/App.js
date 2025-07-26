import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { NotificationProvider } from './components/NotificationProvider';
import { NotificationList } from './components/NotificationList';
import { LoginPage } from './components/LoginPage';

function App() {
  const adminId = 'admin123'; // Replace with actual admin ID from auth
  return (
    <NotificationProvider adminId={adminId}>
      <Router>
        <Topbar />
        <Container fluid>
          <Row>
            <Col md={2}><Sidebar /></Col>
            <Col md={10}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/notifications" element={<NotificationList />} />
                <Route path="/login" element={<LoginPage />} />
                {/* ...other routes... */}
              </Routes>
            </Col>
          </Row>
        </Container>
      </Router>
    </NotificationProvider>
  );
}

export default App;
