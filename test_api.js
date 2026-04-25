import axios from 'axios';

async function test() {
  try {
    let token = '';
      try {
        const res = await axios.post('http://localhost:5000/api/auth/register', { 
            name: 'Test', 
            email: 'test' + Date.now() + '@test.com', 
            password: 'password' 
        });
        token = res.data.token;
      } catch (regErr) {
          console.error("Register Error:", regErr.response?.data || regErr.message);
          return;
      }

    try {
        const bookRes = await axios.get('http://localhost:5000/api/appointments', { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        console.log('GET SUCCESS:', bookRes.data);
    } catch (bookErr) {
        console.error('GET ERROR:', bookErr.response?.data || bookErr.message);
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
