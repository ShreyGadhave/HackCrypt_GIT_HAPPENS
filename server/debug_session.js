// Using native fetch

async function run() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@school.edu', password: 'teacher123' })
        });

        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error("Login failed:", loginData);
            return;
        }

        const token = loginData.token; // Usually in cookie or response?
        // authMiddleware checks headers or cookies.
        // login controller usually sends token in cookie and maybe body?
        // Let's check authController.js if needed, but usually it returns token.
        // Wait, authMiddleware checks req.headers.authorization.

        // 2. Get GPS Data (Mock)
        console.log("Fetching GPS data...");
        const gpsRes = await fetch('http://127.0.0.1:8000/teacher/gps');
        const gpsData = await gpsRes.json();
        console.log("GPS Data:", gpsData);

        // 3. Create Session
        console.log("Creating session...");
        const sessionData = {
            subject: "Debug Math",
            topic: "Debugging 101",
            class: "10",
            section: "A",
            date: "2023-12-31",
            startTime: "10:00",
            endTime: "11:00",
            gpsLocation: {
                latitude: gpsData.latitude,
                longitude: gpsData.longitude,
                city: gpsData.city,
                region: gpsData.region,
                country: gpsData.country,
                ip: gpsData.ip,
                timezone: gpsData.timezone,
                timestamp: new Date().toISOString()
            }
        };

        const createRes = await fetch('http://127.0.0.1:5000/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming token is returned in loginData.token?
                // If not, I might need to check how login returns token.
            },
            body: JSON.stringify(sessionData)
        });

        const createData = await createRes.json();
        console.log("Create Session Response Status:", createRes.status);
        console.log("Create Session Response:", createData);

    } catch (error) {
        console.error("Error:", error);
    }
}

run();
