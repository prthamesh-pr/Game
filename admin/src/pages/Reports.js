import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge,
  Form,
  Button,
  DatePicker,
  Spinner
} from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        includeCharts: true
      };

      const response = await adminAPI.getReports(params);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    fetchReports();
  };

  const revenueChartData = reportData?.dailyRevenue?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    revenue: item.totalRevenue,
    games: item.totalGames
  })) || [];

  const gameClassData = [
    { name: 'Class A', games: reportData?.gamesByClass?.classA || 0, color: '#667eea' },
    { name: 'Class B', games: reportData?.gamesByClass?.classB || 0, color: '#764ba2' },
    { name: 'Class C', games: reportData?.gamesByClass?.classC || 0, color: '#f093fb' }
  ];

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-gradient mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Reports & Analytics
        </h2>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Button 
                variant="primary" 
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Generate Report
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Generating reports...</p>
        </div>
      ) : reportData ? (
        <>
          {/* Summary Statistics */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="text-center">
                  <div className="display-4 mb-2">
                    <i className="bi bi-currency-rupee"></i>
                  </div>
                  <h3>{formatCurrency(reportData.totalRevenue)}</h3>
                  <p className="mb-0">Total Revenue</p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="stats-card-success h-100">
                <Card.Body className="text-center">
                  <div className="display-4 mb-2">
                    <i className="bi bi-controller"></i>
                  </div>
                  <h3>{reportData.totalGames}</h3>
                  <p className="mb-0">Total Games</p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="stats-card-warning h-100">
                <Card.Body className="text-center">
                  <div className="display-4 mb-2">
                    <i className="bi bi-people"></i>
                  </div>
                  <h3>{reportData.activeUsers}</h3>
                  <p className="mb-0">Active Users</p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="stats-card-danger h-100">
                <Card.Body className="text-center">
                  <div className="display-4 mb-2">
                    <i className="bi bi-trophy"></i>
                  </div>
                  <h3>{formatCurrency(reportData.totalPayouts)}</h3>
                  <p className="mb-0">Total Payouts</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className="mb-4">
            <Col lg={8} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Daily Revenue Trend
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? 'Revenue' : 'Games'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
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
                    <BarChart data={gameClassData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="games" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Top Players */}
          <Row>
            <Col lg={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-star me-2"></i>
                    Top Players by Games
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Games Played</th>
                          <th>Total Spent</th>
                          <th>Total Won</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topPlayers?.slice(0, 10).map((player, index) => (
                          <tr key={player._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <Badge bg="primary" className="me-2">#{index + 1}</Badge>
                                <strong>{player.username}</strong>
                              </div>
                            </td>
                            <td>{player.gamesPlayed}</td>
                            <td>{formatCurrency(player.totalSpent)}</td>
                            <td className="text-success">
                              <strong>{formatCurrency(player.totalWon)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-trophy me-2"></i>
                    Recent Big Winners
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Game Class</th>
                          <th>Win Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.bigWinners?.slice(0, 10).map((winner, index) => (
                          <tr key={index}>
                            <td><strong>{winner.username}</strong></td>
                            <td>
                              <Badge bg="success">Class {winner.gameClass}</Badge>
                            </td>
                            <td className="text-success">
                              <strong>{formatCurrency(winner.winAmount)}</strong>
                            </td>
                            <td>
                              <small>{formatDate(winner.date)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <div className="text-center p-5">
          <i className="bi bi-graph-up display-1 text-muted"></i>
          <p className="text-muted mt-3">Click "Generate Report" to view analytics</p>
        </div>
      )}
    </Container>
  );
};

export default Reports;
