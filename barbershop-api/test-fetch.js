const axios = require('axios');

async function testFetch() {
    try {
        // 1. Login
        const loginRes = await axios.post('https://barber-pro-backend-indol.vercel.app/v1/auth/login', {
            email: 'narsie454@gmail.com',
            password: 'barber123'
        });
        const token = loginRes.data.tokens.access.token;
        console.log('Got token:', token.substring(0, 20) + '...');

        // 2. Fetch /subscription/all
        const subRes = await axios.get('https://barber-pro-backend-indol.vercel.app/v1/subscription/all', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Subscriptions:', subRes.data.results.length);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testFetch();
