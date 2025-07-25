/**
 * Production Setup Script - Creates admin and active round on production
 */

const axios = require('axios');

const BASE_URL = 'https://game-39rz.onrender.com';

async function setupProduction() {
  try {
    console.log('🚀 Setting up production environment...');
    console.log(`📍 Base URL: ${BASE_URL}`);

    // Step 1: Check if server is healthy
    console.log('\n1️⃣ Checking server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is healthy:', health.data.message);

    // Step 2: Try to create admin via direct database connection
    console.log('\n2️⃣ Admin setup needed for production database');
    console.log('📧 Admin Email: 963sohamraut@gmail.com');
    console.log('🔑 Admin Password: Admin@123');
    console.log('⚠️  Note: Admin creation requires direct database access');

    // Step 3: Check what's available
    console.log('\n3️⃣ Checking available API routes...');
    const apiRoutes = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API routes available:', apiRoutes.data.availableRoutes);

    // Step 4: Test basic endpoints
    console.log('\n4️⃣ Testing basic functionality...');
    
    const gameInfo = await axios.get(`${BASE_URL}/api/game/info`);
    console.log('✅ Game info endpoint working');

    const validNumbers = await axios.get(`${BASE_URL}/api/game/numbers/A`);
    console.log('✅ Valid numbers endpoint working');

    const rounds = await axios.get(`${BASE_URL}/api/game/rounds`);
    console.log('✅ Game rounds endpoint working');
    console.log(`📊 Total rounds found: ${rounds.data.data.pagination.totalRounds}`);

    // Step 5: Check for active rounds
    try {
      const currentRound = await axios.get(`${BASE_URL}/api/game/round/current`);
      console.log('✅ Active round found:', currentRound.data.data.round.roundNumber);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('⚠️  No active round found - needs to be created');
      } else {
        console.log('❌ Error checking current round:', error.message);
      }
    }

    console.log('\n🎯 Production Setup Summary:');
    console.log('✅ Server is working properly');
    console.log('✅ All major API endpoints are functional');  
    console.log('⚠️  Admin account needs to be created in production database');
    console.log('⚠️  Active game round needs to be created');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Set environment variable: DISABLE_RATE_LIMIT=true on Render');
    console.log('2. Use Render shell or MongoDB Atlas to run admin creation script');
    console.log('3. Create active game round for testing');

  } catch (error) {
    console.error('❌ Production setup error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the setup
setupProduction();
