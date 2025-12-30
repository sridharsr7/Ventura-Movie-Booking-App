const testAdminCreate = async () => {
    try {
        console.log('Logging in as admin...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.statusText}`);
        }

        const { token, user } = await loginRes.json();
        console.log('Login successful. User Role:', user.role);

        if (user.role !== 'admin') {
            console.error('ERROR: Admin user does not have "admin" role. Role is:', user.role);
        }

        console.log('Attempting to create partner...');
        const partnerData = {
            name: 'Test Partner',
            email: 'testpartner@example.com',
            mobile: '9988776655',
            password: 'password123',
            address: 'Test Address',
            location: 'Test City'
        };

        const createRes = await fetch('http://localhost:5000/api/admin/partners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(partnerData)
        });

        const createData = await createRes.json();

        if (createRes.ok) {
            console.log('Partner created successfully:', createData);
        } else {
            console.error('Partner creation failed:', createData);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

testAdminCreate();
