const axios = require('axios');

async function testNumberSelection() {
  try {
    const BASE_URL = 'https://game-39rz.onrender.com';
    
    // First login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'apitest1753426819432@example.com',
      password: 'Test123!'
    });
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login successful, token obtained');
    
    console.log('💰 Wallet balance:', loginResponse.data.user.walletBalance);
    
    // Check wallet balance
    // console.log('💰 Checking wallet balance...');
    // const profileResponse = await axios.get(`${BASE_URL}/api/user/profile`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // console.log('💰 Wallet balance:', profileResponse.data.data.walletBalance);
    
    // Try to select a number
    console.log('🎯 Selecting number 111 (Class A) with amount 10...');
    const selectionResponse = await axios.post(`${BASE_URL}/api/game/select`, {
      classType: 'A',
      number: '111',
      amount: 10
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Number selection successful!');
    console.log('Response:', JSON.stringify(selectionResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testNumberSelection();
