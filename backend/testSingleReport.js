const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await post('/api/auth/login', { email: 'admin', password: 'admin123' });
        if (loginRes.status !== 200) {
            console.log('Login failed', loginRes.body);
            return;
        }
        const token = loginRes.body.token;
        console.log('Token acquired');

        const id = '69524f906f8a854a0f2ce112';
        console.log(`Fetching report ${id}...`);
        const reportRes = await get(`/api/admin/reports/${id}`, token);
        console.log('Report Status:', reportRes.status);
        console.log('Report Body:', reportRes.body);

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
