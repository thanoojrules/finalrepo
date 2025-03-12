const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`🔍 Checking user with email: ${email}`);

        // ✅ Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            console.error("❌ User not found");
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        // ✅ If passwords are stored in plain text, compare directly
        if (password !== user.password) {
            console.error("❌ Incorrect password");
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user.id }, 'mysecretkey', { expiresIn: '1h' });

        console.log("✅ Login successful!");
        res.json({ token });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: error.message }); // ✅ Show exact error
    }
};