document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("❌ Login form not found in the DOM.");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form refresh

        const emailField = document.getElementById("email");
        const passwordField = document.getElementById("password");

        if (!emailField || !passwordField) {
            console.error("❌ Email or Password field not found.");
            return;
        }

        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        if (!email || !password) {
            alert("⚠️ Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("https://your-backend-url.com/api/auth/login", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // ✅ Handle empty response
            const text = await response.text();
            console.log("🔍 Raw API Response:", text);
            
            const data = text ? JSON.parse(text) : null; // Prevents JSON parse error

            if (response.ok && data) {
                localStorage.setItem("token", data.token);
                alert("✅ Login successful!");
                window.location.href = "dashboard.html"; // Redirect to dashboard
            } else {
                alert(`🚨 Login failed: ${data ? data.error : "Unknown error"}`);
            }
        } catch (error) {
            console.error("❌ Login request failed:", error);
            alert("🚨 Network error. Try again later.");
        }
    });
});