const axios = require('axios');


async function test() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com', 
            password: 'adminpassword' 
        });

       
        const token = loginRes.data.token;
        console.log('Login successful, token:', token.substring(0, 20) + '...');

        const res = await axios.get('http://localhost:5000/api/admin/partners-analytics', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Analytics fetched successfully!');
        console.log('Partners count:', res.data.length);
        if (res.data.length > 0) {
            const p = res.data[0];
            console.log('First partner:', p.name);
            console.log('Approved Movies:', p.approvedMovies?.length);
            console.log('Screens:', p.screens?.length);
            if (p.screens?.length > 0) {
                console.log('First screen showtimes:', p.screens[0].showtimes);
            }
        }

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

test();
