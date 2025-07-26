import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

export const Dashboard = () => {
  const [stats, setStats] = useState({});
  useEffect(() => {
    axios.get('/api/admin/dashboard').then(res => setStats(res.data.data));
  }, []);
  return (
    <div>
      <Row>
        <Col md={3}><Card><Card.Body><h5>Users</h5><p>{stats.overview?.totalUsers}</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><h5>Games</h5><p>{stats.overview?.totalResults}</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><h5>Revenue</h5><p>{stats.overview?.todaysRevenue}</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><h5>Payout</h5><p>{stats.overview?.todaysPayout}</p></Card.Body></Card></Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
          <h5>User Growth</h5>
          <Line data={{
            labels: stats.userGrowthLabels || [],
            datasets: [{ label: 'Users', data: stats.userGrowthData || [], borderColor: 'blue' }]
          }} />
        </Col>
        <Col md={6}>
          <h5>Game Participation</h5>
          <Bar data={{
            labels: stats.gameLabels || [],
            datasets: [{ label: 'Games', data: stats.gameData || [], backgroundColor: 'orange' }]
          }} />
        </Col>
      </Row>
      <Button className="mt-4" href="/api/reports/users/csv">Export Users CSV</Button>
    </div>
  );
};
