import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Badge,
  Pagination,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { adminAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusVariant } from '../utils/helpers';
import WalletModal from '../components/WalletModal';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleWalletUpdate = (updatedUser) => {
    setUsers(users.map(user => 
      user._id === updatedUser.id ? { ...user, wallet: updatedUser.wallet } : user
    ));
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast.success(`User ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openWalletModal = (user) => {
    setSelectedUser(user);
    setShowWalletModal(true);
  };

  const renderPagination = () => {
    const pages = [];
    const { currentPage: current, totalPages } = pagination;

    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === current}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center">
        <Pagination.First 
          disabled={current === 1}
          onClick={() => handlePageChange(1)}
        />
        <Pagination.Prev 
          disabled={current === 1}
          onClick={() => handlePageChange(current - 1)}
        />
        {pages}
        <Pagination.Next 
          disabled={current === totalPages}
          onClick={() => handlePageChange(current + 1)}
        />
        <Pagination.Last 
          disabled={current === totalPages}
          onClick={() => handlePageChange(totalPages)}
        />
      </Pagination>
    );
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-gradient mb-0">
          <i className="bi bi-people me-2"></i>
          Users Management
        </h2>
        <Badge bg="primary" className="fs-6">
          Total: {pagination.totalUsers || 0}
        </Badge>
      </div>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by username or mobile number..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="outline-primary" onClick={fetchUsers}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Mobile</th>
                    <th>Wallet Balance</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div>
                            <strong>{user.username}</strong>
                            <br />
                            <small className="text-muted">{user.email || 'No email'}</small>
                          </div>
                        </td>
                        <td>
                          <span className="font-monospace">{user.mobileNumber}</span>
                        </td>
                        <td>
                          <strong className="text-success">
                            {formatCurrency(user.wallet)}
                          </strong>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </td>
                        <td>
                          <small>{formatDate(user.createdAt)}</small>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openWalletModal(user)}
                              title="Manage Wallet"
                            >
                              <i className="bi bi-wallet2"></i>
                            </Button>
                            
                            <Button
                              variant={user.status === 'active' ? 'outline-danger' : 'outline-success'}
                              size="sm"
                              onClick={() => toggleUserStatus(user._id, user.status)}
                              title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            >
                              <i className={`bi bi-${user.status === 'active' ? 'person-x' : 'person-check'}`}></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-4">
                        <i className="bi bi-people display-1 text-muted"></i>
                        <p className="text-muted mt-3">
                          {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-top">
              {renderPagination()}
              <div className="text-center text-muted mt-2">
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalUsers)} of {pagination.totalUsers} users
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Wallet Management Modal */}
      <WalletModal
        show={showWalletModal}
        onHide={() => setShowWalletModal(false)}
        user={selectedUser}
        onUpdate={handleWalletUpdate}
      />
    </Container>
  );
};

export default Users;
