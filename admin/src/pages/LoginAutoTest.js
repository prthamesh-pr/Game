import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LoginAutoTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTest, setCurrentTest] = useState('');

  const apiUrl = 'https://game-39rz.onrender.com/api/auth/admin/login';
  
  const testCases = [
    { email: 'admin@numbergame.com', password: 'Admin@123', label: 'Default credentials' },
    { email: 'admin@numbergame.com', password: 'admin123', label: 'Lowercase password' },
    { email: 'admin@numbergame.com', password: 'ADMIN@123', label: 'Uppercase password' },
    { email: 'Admin@numbergame.com', password: 'Admin@123', label: 'Case-sensitive email' },
    { email: 'admin@numbergame.com', password: 'admin@123', label: 'Lowercase @ password' }
  ];

  const testLogin = async (creds, label) => {
    try {
      setCurrentTest(label);
      console.log(`Testing: ${label}`, creds);
      
      const response = await axios.post(apiUrl, {
        email: creds.email,
        password: creds.password
      });
      
      return { 
        success: true, 
        data: response.data,
        status: response.status
      };
    } catch (err) {
      console.error(`Error in test "${label}":`, err.response?.data || err.message);
      return { 
        success: false, 
        error: err.response?.data || { message: err.message },
        status: err.response?.status || 500
      };
    }
  };

  useEffect(() => {
    const runAllTests = async () => {
      setLoading(true);
      const allResults = {};
      
      for (const testCase of testCases) {
        const result = await testLogin(testCase, testCase.label);
        allResults[testCase.label] = result;
      }
      
      setResults(allResults);
      setLoading(false);
      setCurrentTest('All tests completed');
    };

    runAllTests();
  }, []);

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Admin Login Testing</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="ms-2 d-inline">Running test: {currentTest}</p>
                </div>
              ) : (
                <div>
                  <h5>Test Results</h5>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Test Case</th>
                        <th>Status</th>
                        <th>HTTP Code</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results).map(([label, result]) => (
                        <tr key={label}>
                          <td>{label}</td>
                          <td>
                            {result.success ? (
                              <span className="badge bg-success">Success</span>
                            ) : (
                              <span className="badge bg-danger">Failed</span>
                            )}
                          </td>
                          <td>{result.status}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              data-bs-toggle="collapse"
                              data-bs-target={`#details-${label.replace(/\s+/g, '-')}`}
                            >
                              View Details
                            </button>
                            <div 
                              className="collapse mt-2" 
                              id={`details-${label.replace(/\s+/g, '-')}`}
                            >
                              <pre className="bg-light p-2">
                                {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4">
                    <h5>Recommendations:</h5>
                    <ol>
                      <li>
                        If all tests failed, the admin account on the hosted backend might not be created with 
                        the expected credentials.
                      </li>
                      <li>
                        If some tests passed, use those credentials for your regular login.
                      </li>
                      <li>
                        Consider checking if the backend admin seeding process completed correctly on the hosted server.
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAutoTest;
