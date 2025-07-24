import React, { useState } from 'react';
import axios from 'axios';

const LoginTest = () => {
  const [email, setEmail] = useState('admin@numbergame.com');
  const [password, setPassword] = useState('Admin@123');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = 'https://game-39rz.onrender.com/api/auth/admin/login';
      console.log('Sending request to:', apiUrl);
      
      const response = await axios.post(apiUrl, {
        email,
        password
      });
      
      setResult(response.data);
      console.log('Success:', response.data);
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data || { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Test Login API</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Test Login'}
                </button>
              </form>

              {error && (
                <div className="alert alert-danger mt-3">
                  <h5>Error:</h5>
                  <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
              )}

              {result && (
                <div className="alert alert-success mt-3">
                  <h5>Success:</h5>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;
