import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const chartData = [
    { name: 'Total Users', value: stats?.totalUsers || 0 },
    { name: 'Active Users', value: stats?.activeUsers || 0 },
    { name: 'Total Games', value: stats?.totalGames || 0 },
    { name: 'Winners', value: stats?.totalWinners || 0 }
  ];

  const pieData = [
    { name: 'Class A', value: stats?.gamesByClass?.classA || 0, color: '#667eea' },
    { name: 'Class B', value: stats?.gamesByClass?.classB || 0, color: '#764ba2' },
    { name: 'Class C', value: stats?.gamesByClass?.classC || 0, color: '#f093fb' }
  ];

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-gradient mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h2>
        <small className="text-muted">Last updated: {new Date().toLocaleDateString()}</small>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="text-center">
              <div className="display-4 mb-2">
                <i className="bi bi-people-fill"></i>
              </div>
              <h3>{stats?.totalUsers || 0}</h3>
              <p className="mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card-success h-100">
            <Card.Body className="text-center">
              <div className="display-4 mb-2">
                <i className="bi bi-person-check-fill"></i>
              </div>
              <h3>{stats?.activeUsers || 0}</h3>
              <p className="mb-0">Active Users</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card-warning h-100">
            <Card.Body className="text-center">
              <div className="display-4 mb-2">
                <i className="bi bi-controller"></i>
              </div>
              <h3>{stats?.totalGames || 0}</h3>
              <p className="mb-0">Total Games</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card-danger h-100">
            <Card.Body className="text-center">
              <div className="display-4 mb-2">
                <i className="bi bi-currency-rupee"></i>
              </div>
              <h3>{formatCurrency(stats?.totalRevenue || 0)}</h3>
              <p className="mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Overview Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Games by Class
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Recent Winners
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.recentWinners?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentWinners.slice(0, 5).map((winner, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{winner.username}</strong>
                          <small className="text-muted d-block">Class {winner.gameClass}</small>
                        </div>
                        <span className="badge bg-success">
                          {formatCurrency(winner.winAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No recent winners</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Recent Transactions
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.recentTransactions?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{transaction.type}</strong>
                          <small className="text-muted d-block">{transaction.username}</small>
                        </div>
                        <span className={`badge ${transaction.type === 'credit' ? 'bg-success' : 'bg-danger'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No recent transactions</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
