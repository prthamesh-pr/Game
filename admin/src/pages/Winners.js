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
  Spinner
} from 'react-bootstrap';
import { adminAPI } from '../services/api';
import { formatDate, formatCurrency, getStatusVariant } from '../utils/helpers';
import { toast } from 'react-toastify';

const Winners = () => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [winnersLoading, setWinnersLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getResults({ limit: 50 });
      setResults(response.data.data.results);
      
      // Auto-select the most recent result
      if (response.data.data.results.length > 0) {
        const mostRecent = response.data.data.results[0];
        setSelectedResult(mostRecent);
        fetchWinners(mostRecent._id);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const fetchWinners = async (resultId) => {
    try {
      setWinnersLoading(true);
      const response = await adminAPI.getWinners(resultId);
      setWinners(response.data.data.winners);
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast.error('Failed to fetch winners');
    } finally {
      setWinnersLoading(false);
    }
  };

  const handleResultChange = (e) => {
    const resultId = e.target.value;
    const result = results.find(r => r._id === resultId);
    setSelectedResult(result);
    
    if (resultId) {
      fetchWinners(resultId);
    } else {
      setWinners([]);
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

  const calculateTotalStats = () => {
    const totalWinners = winners.filter(w => w.result === 'win').length;
    const totalLosers = winners.filter(w => w.result === 'loss').length;
    const totalPayout = winners
      .filter(w => w.result === 'win')
      .reduce((sum, w) => sum + (w.winAmount || 0), 0);
    const totalBetAmount = winners.reduce((sum, w) => sum + (w.betAmount || 0), 0);

    return { totalWinners, totalLosers, totalPayout, totalBetAmount };
  };

  const stats = calculateTotalStats();

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-gradient mb-0">
          <i className="bi bi-award me-2"></i>
          Winners & Results
        </h2>
        <Button variant="outline-primary" onClick={fetchResults}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Result Selection */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Label>Select Result Round</Form.Label>
              <Form.Select
                value={selectedResult?._id || ''}
                onChange={handleResultChange}
                disabled={loading}
              >
                <option value="">Choose a result round...</option>
                {results.map((result) => (
                  <option key={result._id} value={result._id}>
                    {result.roundName} - Class {result.gameClass} - {formatDate(result.createdAt)}
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>
        </Col>

        {selectedResult && (
          <Col md={6}>
            <Card>
              <Card.Body>
                <h6>Result Details</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {getGameClassBadge(selectedResult.gameClass)}
                    <span className="ms-2 badge bg-dark font-monospace">
                      {selectedResult.winningNumbers?.[selectedResult.gameClass.toLowerCase()]}
                    </span>
                  </div>
                  <small className="text-muted">
                    {formatDate(selectedResult.createdAt)}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Statistics Cards */}
      {selectedResult && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card-success h-100">
              <Card.Body className="text-center">
                <div className="display-4 mb-2">
                  <i className="bi bi-trophy-fill"></i>
                </div>
                <h3>{stats.totalWinners}</h3>
                <p className="mb-0">Winners</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card-danger h-100">
              <Card.Body className="text-center">
                <div className="display-4 mb-2">
                  <i className="bi bi-x-circle-fill"></i>
                </div>
                <h3>{stats.totalLosers}</h3>
                <p className="mb-0">Losers</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card-warning h-100">
              <Card.Body className="text-center">
                <div className="display-4 mb-2">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <h3>{formatCurrency(stats.totalPayout)}</h3>
                <p className="mb-0">Total Payout</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div className="display-4 mb-2">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <h3>{formatCurrency(stats.totalBetAmount)}</h3>
                <p className="mb-0">Total Bets</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Winners/Players Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-list me-2"></i>
            {selectedResult ? `Players for ${selectedResult.roundName}` : 'Select a result to view players'}
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {!selectedResult ? (
            <div className="text-center p-5">
              <i className="bi bi-arrow-up display-1 text-muted"></i>
              <p className="text-muted mt-3">Please select a result round to view winners and players.</p>
            </div>
          ) : winnersLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading players...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Mobile</th>
                    <th>Selected Number</th>
                    <th>Bet Amount</th>
                    <th>Result</th>
                    <th>Win Amount</th>
                    <th>Placed At</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.length > 0 ? (
                    winners.map((player) => (
                      <tr key={player._id} className={player.result === 'win' ? 'table-success' : ''}>
                        <td>
                          <div>
                            <strong>{player.username}</strong>
                            {player.result === 'win' && (
                              <i className="bi bi-trophy-fill text-warning ms-2" title="Winner!"></i>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="font-monospace">{player.mobileNumber}</span>
                        </td>
                        <td>
                          <span className="badge bg-dark font-monospace">
                            {player.selectedNumber}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(player.betAmount)}</strong>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(player.result)}>
                            {player.result}
                          </Badge>
                        </td>
                        <td>
                          {player.result === 'win' ? (
                            <strong className="text-success">
                              {formatCurrency(player.winAmount)}
                            </strong>
                          ) : (
                            <span className="text-muted">₹0</span>
                          )}
                        </td>
                        <td>
                          <small>{formatDate(player.placedAt)}</small>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center p-4">
                        <i className="bi bi-people display-1 text-muted"></i>
                        <p className="text-muted mt-3">No players found for this result.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Winners;
