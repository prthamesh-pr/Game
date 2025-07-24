const axios = require('axios');

const BASE_URL = 'https://game-39rz.onrender.com/api';
const TIMEOUT = 10000; // 10 seconds timeout

// Function to test if the server is up and running
async function testServerConnection() {
  console.log('========================================');
  console.log('TESTING SERVER CONNECTION');
  console.log('========================================');
  console.log(`Server URL: ${BASE_URL}`);
  console.log('----------------------------------------');
  
  try {
    // Try to connect to the base URL
    const response = await axios.get(BASE_URL, { timeout: TIMEOUT });
    console.log('✅ Server is up and running!');
    console.log(`Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.log('❌ CONNECTION REFUSED: Server is not accessible');
      console.log('The server might be down or hibernating (if using free tier)');
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ CONNECTION TIMEOUT: Server took too long to respond');
    } else if (error.response) {
      // The server responded with a status code outside of 2xx range
      console.log(`⚠️ Server responded with status: ${error.response.status}`);
      
      // If we get a 404 but the server responds, it's probably working but the route is invalid
      if (error.response.status === 404) {
        console.log('✅ Server is up and running, but the endpoint is not found');
        console.log('This is expected if the root endpoint is not defined');
        if (error.response.data?.availableRoutes) {
          console.log('\nAvailable routes:');
          error.response.data.availableRoutes.forEach(route => {
            console.log(`- ${route}`);
          });
        }
        return true;
      }
      
      console.log('Response data:', error.response.data);
    } else {
      console.log('❌ ERROR:', error.message);
    }
    
    // Check if it's a Render.com free tier issue
    console.log('\n📝 NOTE: If you\'re using Render.com free tier:');
    console.log('- The service may be spun down due to inactivity');
    console.log('- First request after inactivity can take 1-2 minutes');
    console.log('- Try accessing the URL in a browser and wait for 2 minutes');
    
    return false;
  }
}

// Function to test the admin login API
async function testAdminLogin() {
  console.log('\n========================================');
  console.log('TESTING ADMIN LOGIN API');
  console.log('========================================');
  console.log(`Endpoint: ${BASE_URL}/auth/admin/login`);
  console.log('----------------------------------------');
  
  const credentials = {
    email: 'admin@numbergame.com',
    password: 'Admin@123'
  };
  
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/admin/login`, 
      credentials, 
      { timeout: TIMEOUT }
    );
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Message:', response.data.message || 'No message');
    
    if (response.data.token) {
      console.log('Token received:', response.data.token.substring(0, 20) + '...');
      return response.data.token;
    }
    
    return null;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.log('❌ CONNECTION REFUSED: Server is not accessible');
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ CONNECTION TIMEOUT: Server took too long to respond');
    } else if (error.response) {
      console.log(`❌ Login failed with status: ${error.response.status}`);
      console.log('Error message:', error.response.data?.message || 'No message');
      
      // Check for common issues
      if (error.response.status === 429) {
        console.log('\n⚠️ TOO MANY ATTEMPTS:');
        console.log('- Account is temporarily locked due to too many failed attempts');
        console.log('- Based on the code, this lock should expire after 2 hours');
        console.log('- Wait before trying again');
      } else if (error.response.status === 401) {
        console.log('\n⚠️ INVALID CREDENTIALS:');
        console.log('- Double-check your email and password');
        console.log('- Default credentials might have been changed');
      }
    } else {
      console.log('❌ ERROR:', error.message);
    }
    
    return null;
  }
}

// Function to create Postman collection export file
function generatePostmanCollection() {
  const collection = {
    info: {
      _postman_id: "8e8a2323-b5b7-4f51-b2c0-a5f6bbd5c1d0",
      name: "Number Game API Testing",
      description: "A collection for testing the Number Game APIs",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      // Authentication endpoints
      {
        name: "Authentication",
        item: [
          {
            name: "Admin Login",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  email: "admin@numbergame.com",
                  password: "Admin@123"
                }, null, 2)
              },
              url: {
                raw: "{{baseUrl}}/auth/admin/login",
                host: ["{{baseUrl}}"],
                path: ["auth", "admin", "login"]
              },
              description: "Login as admin"
            }
          },
          {
            name: "User Login",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  identifier: "user123", // username or mobile
                  password: "Password123"
                }, null, 2)
              },
              url: {
                raw: "{{baseUrl}}/auth/login",
                host: ["{{baseUrl}}"],
                path: ["auth", "login"]
              },
              description: "Login as user"
            }
          },
          {
            name: "User Registration",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  username: "newuser123",
                  mobileNumber: "9876543210",
                  password: "Password123"
                }, null, 2)
              },
              url: {
                raw: "{{baseUrl}}/auth/register",
                host: ["{{baseUrl}}"],
                path: ["auth", "register"]
              },
              description: "Register new user"
            }
          }
        ]
      },
      
      // Admin endpoints
      {
        name: "Admin",
        item: [
          {
            name: "Get Dashboard Data",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{adminToken}}"
                }
              ],
              url: {
                raw: "{{baseUrl}}/admin/dashboard",
                host: ["{{baseUrl}}"],
                path: ["admin", "dashboard"]
              },
              description: "Get admin dashboard data"
            }
          },
          {
            name: "Get All Users",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{adminToken}}"
                }
              ],
              url: {
                raw: "{{baseUrl}}/admin/users",
                host: ["{{baseUrl}}"],
                path: ["admin", "users"]
              },
              description: "Get all users"
            }
          },
          {
            name: "Get All Results",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{adminToken}}"
                }
              ],
              url: {
                raw: "{{baseUrl}}/admin/results",
                host: ["{{baseUrl}}"],
                path: ["admin", "results"]
              },
              description: "Get all results"
            }
          }
        ]
      },
      
      // User endpoints
      {
        name: "User",
        item: [
          {
            name: "Get User Profile",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{userToken}}"
                }
              ],
              url: {
                raw: "{{baseUrl}}/user/profile",
                host: ["{{baseUrl}}"],
                path: ["user", "profile"]
              },
              description: "Get user profile"
            }
          },
          {
            name: "Get Wallet History",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{userToken}}"
                }
              ],
              url: {
                raw: "{{baseUrl}}/user/wallet",
                host: ["{{baseUrl}}"],
                path: ["user", "wallet"]
              },
              description: "Get wallet transaction history"
            }
          }
        ]
      },
      
      // Game endpoints
      {
        name: "Game",
        item: [
          {
            name: "Get Current Game",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/game/current",
                host: ["{{baseUrl}}"],
                path: ["game", "current"]
              },
              description: "Get current active game"
            }
          },
          {
            name: "Get Recent Results",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/game/results/recent",
                host: ["{{baseUrl}}"],
                path: ["game", "results", "recent"]
              },
              description: "Get recent game results"
            }
          },
          {
            name: "Submit Number Selection",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                },
                {
                  key: "Authorization",
                  value: "Bearer {{userToken}}"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  gameId: "{{gameId}}",
                  number: 5,
                  amount: 50
                }, null, 2)
              },
              url: {
                raw: "{{baseUrl}}/game/select",
                host: ["{{baseUrl}}"],
                path: ["game", "select"]
              },
              description: "Submit a number selection for the current game"
            }
          }
        ]
      }
    ],
    variable: [
      {
        key: "baseUrl",
        value: "https://game-39rz.onrender.com/api"
      },
      {
        key: "adminToken",
        value: "YOUR_ADMIN_TOKEN_HERE"
      },
      {
        key: "userToken",
        value: "YOUR_USER_TOKEN_HERE"
      },
      {
        key: "gameId",
        value: "CURRENT_GAME_ID"
      }
    ]
  };

  const fs = require('fs');
  const collectionPath = './number-game-postman-collection.json';
  
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  console.log(`\n✅ Postman collection generated: ${collectionPath}`);
  console.log('You can import this file into Postman to test all APIs');
}

// Main function
async function main() {
  console.log('========================================');
  console.log('NUMBER GAME API DIAGNOSTIC TOOL');
  console.log('========================================');
  
  // Test server connection
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    // Test admin login
    const adminToken = await testAdminLogin();
    
    // Generate Postman collection
    generatePostmanCollection();
    
    console.log('\n========================================');
    console.log('RECOMMENDATIONS');
    console.log('========================================');
    
    if (adminToken) {
      console.log('✅ The backend is working correctly!');
      console.log('- You can use the generated Postman collection to test all APIs');
      console.log('- Update the admin token in the collection with the token received');
    } else {
      console.log('⚠️ Server is up but admin login failed.');
      console.log('- Try the Postman collection to test different credentials');
      console.log('- Try waiting for 2 hours if account is locked');
      console.log('- Check the backend logs for more information');
    }
  } else {
    console.log('\n========================================');
    console.log('TROUBLESHOOTING STEPS');
    console.log('========================================');
    console.log('1. Check if Render.com service is running:');
    console.log('   - Visit your Render dashboard');
    console.log('   - Ensure the service is not in "Suspended" state');
    
    console.log('\n2. If using free tier, the service might be spinning up:');
    console.log('   - Wait 1-2 minutes and try again');
    console.log('   - Visit https://game-39rz.onrender.com in browser to wake it up');
    
    console.log('\n3. Start local backend as alternative:');
    console.log('   - cd d:\\GAME999\\backend && npm start');
    console.log('   - Update admin/.env to use: REACT_APP_API_URL=http://localhost:5000/api');
    
    console.log('\n4. Update your React code to handle connection errors properly:');
    console.log('   - Add timeout handling');
    console.log('   - Display user-friendly messages for connection issues');
    console.log('   - Add retry mechanism for transient failures');
  }
}

// Run the main function
main().catch(error => {
  console.error('Script error:', error);
});
