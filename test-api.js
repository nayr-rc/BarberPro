const axios = require('axios');

const data = {
  name: 'João Silva',
  email: 'joao@test.com',
  phone: '11999999999',
  password: 'senha123'
};

axios.post('http://localhost:3001/api/auth/register', data)
  .then(response => {
    console.log('✅ Registration successful!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token.substring(0, 20) + '...');
  })
  .catch(error => {
    console.log('❌ Error:', error.response?.data?.message || error.message);
  });
