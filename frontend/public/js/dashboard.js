document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    console.log("🔐 Token Retrieved:", token);

    // ✅ Fetch User Profile
    async function fetchUserProfile() {
        try {
            const response = await fetch("/api/user/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to fetch user profile.");

            document.getElementById("userEmail").textContent = data.email;
            document.getElementById("balance").textContent = `$${parseFloat(data.balance).toFixed(2)}`;
            document.getElementById("savings").textContent = `$${parseFloat(data.savings).toFixed(2)}`;
        } catch (error) {
            console.error("❌ User Profile Error:", error);
        }
    }

    async function transferToBalance() {
        const token = localStorage.getItem("token");
        const amount = parseFloat(document.getElementById("transferToBalanceAmount").value);
    
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
    
        try {
            const response = await fetch("/api/transfer/savings-to-balance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                alert(data.error || "Transfer failed.");
            } else {
                alert("Transfer successful!");
                fetchUserProfile(); // Refresh balance & savings
            }
        } catch (error) {
            console.error("❌ Transfer Error:", error.message);
        }
    }
    
    // Attach event listener
    document.getElementById("transferToBalanceBtn").addEventListener("click", transferToBalance);
    async function transferToSavings() {
        const token = localStorage.getItem("token");
        const amount = parseFloat(document.getElementById("transferToSavingsAmount").value);
    
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
    
        try {
            const response = await fetch("/api/transfer/balance-to-savings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                alert(data.error || "Transfer failed.");
            } else {
                alert("Transfer successful!");
                fetchUserProfile(); // Refresh balance & savings
            }
        } catch (error) {
            console.error("❌ Transfer Error:", error.message);
        }
    }
    
    // Attach event listener
    document.getElementById("transferToSavingsBtn").addEventListener("click", transferToSavings);
    // ✅ Fetch Transaction History
async function fetchTransactionHistory() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/api/transactions", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch transactions.");

        const transactions = await response.json();
        console.log("✅ Transaction Data Fetched:", transactions);

        const transactionList = document.getElementById("transactionList");
        transactionList.innerHTML = '';

        if (transactions.length === 0) {
            transactionList.innerHTML = '<li>No transactions available.</li>';
            return;
        }

        transactions.forEach(txn => {
            const recipient = txn.recipient_email ? txn.recipient_email : "Unknown";
            const sender = txn.sender_email ? txn.sender_email : "Unknown";

            let transactionDetail = '';
            if (txn.transaction_type.toLowerCase() === 'transfer') {
                transactionDetail = `Sent to: ${recipient}`;
            } else if (txn.transaction_type.toLowerCase() === 'received') {
                transactionDetail = `Received from: ${sender}`;
            } else {
                transactionDetail = 'Transaction details unavailable';
            }

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <strong>${txn.transaction_type.toUpperCase()}:</strong> ${transactionDetail}
                <span class="money">$${txn.amount}</span>
                <small>(${new Date(txn.created_at).toLocaleString()})</small>
            `;
            transactionList.appendChild(listItem);
        });

    } catch (error) {
        console.error("❌ Transaction Fetch Error:", error.message);
    }
}

    // ✅ Fetch Notifications
    async function fetchNotifications() {
        try {
            const response = await fetch("/api/notifications", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch notifications.");

            const notifications = await response.json();
            const notificationList = document.getElementById("notificationList");

            notificationList.innerHTML = notifications.length
                ? notifications.map(n => `<li>${n.message} <small>(${new Date(n.created_at).toLocaleString()})</small></li>`).join('')
                : "<li>No notifications available.</li>";

        } catch (error) {
            console.error("❌ Notification Error:", error);
        }
    }

    // ✅ Transfer Money Function
    async function transferMoney() {
        const recipientEmail = document.getElementById("recipientEmail").value.trim();
        const amount = parseFloat(document.getElementById("transferAmount").value);

        if (!recipientEmail || isNaN(amount)) {
            alert("Please enter valid details.");
            return;
        }

        const response = await fetch("/api/transfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ recipientEmail, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Transfer failed.");
        } else {
            alert("Transfer successful!");
            fetchUserProfile();
            fetchTransactionHistory();
            fetchNotifications();
        }
    }

    document.getElementById("transferBtn").addEventListener("click", transferMoney);

    // ✅ Logout Button Toggles Notification Display
    const logoutBtn = document.getElementById("logoutBtn");
    const notificationList = document.getElementById("notificationList");
    
    logoutBtn.addEventListener("click", () => {
        notificationList.classList.toggle("show");
    });

    // ✅ Initial Fetch Calls
    fetchUserProfile();
    fetchTransactionHistory();
    fetchNotifications();
});  

function generateRandomTransactionID() {
    return Math.floor(1000000000 + Math.random() * 9000000000); // Generates a 10-digit random number
}

function renderTransactions() {
    const transactionList = document.getElementById("transactionList");
    transactionList.innerHTML = '';

    let start = (currentPage - 1) * transactionsPerPage;
    let end = start + transactionsPerPage;
    let paginatedTransactions = transactionsData.slice(start, end);

    if (paginatedTransactions.length === 0) {
        transactionList.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 15px;">No transactions available.</td>
            </tr>`;
        return;
    }

    paginatedTransactions.forEach((txn) => {
        const transactionID = generateRandomTransactionID(); // Generate unique ID
        const formattedDate = new Date(txn.created_at).toLocaleString();
        const formattedAmount = `$${txn.amount.toFixed(2)}`;
        
        const listItem = document.createElement("tr");
        listItem.innerHTML = `
            <td class="transaction-desc"><strong>TRANSFER:</strong> Sent to: ${txn.recipient_email || "Unknown"}</td>
            <td>${transactionID}</td>
            <td>${formattedDate}</td>
            <td class="amount">${formattedAmount}</td>
        `;
        transactionList.appendChild(listItem);
    });
}

// Fetch and Display Transaction Graph
async function fetchTransactionGraph() {
    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch("/api/transactions", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch transaction data.");

        const transactions = await response.json();
        console.log("📊 Transaction Data:", transactions);

        // Process Data
        const monthlyData = {};
        const dailyData = {};

        // Initialize each month
        for (let i = 1; i <= 12; i++) {
            monthlyData[i] = { sent: 0, received: 0 };
            dailyData[i] = {};
        }

        transactions.forEach(txn => {
            const date = new Date(txn.created_at);
            const month = date.getMonth() + 1; // 1-12
            const day = date.getDate(); // 1-31

            if (!dailyData[month][day]) dailyData[month][day] = { sent: 0, received: 0 };

            if (txn.transaction_type.toLowerCase() === "transfer") {
                monthlyData[month].sent += txn.amount;
                dailyData[month][day].sent += txn.amount;
            } else if (txn.transaction_type.toLowerCase() === "received") {
                monthlyData[month].received += txn.amount;
                dailyData[month][day].received += txn.amount;
            }
        });

        // Convert data for Chart.js
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const sentAmounts = months.map((_, index) => monthlyData[index + 1].sent);
        const receivedAmounts = months.map((_, index) => monthlyData[index + 1].received);

        // Render Chart
        const ctx = document.getElementById("transactionChart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: months,
                datasets: [
                    {
                        label: "💸 Sent",
                        data: sentAmounts,
                        borderColor: "#f4623a",
                        backgroundColor: "rgba(244, 98, 58, 0.2)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "📥 Received",
                        data: receivedAmounts,
                        borderColor: "#198754",
                        backgroundColor: "rgba(25, 135, 84, 0.2)",
                        fill: true,
                        tension: 0.4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Prevents stretching
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: Math.max(...sentAmounts, ...receivedAmounts) + 50, // Dynamic scaling
                        grid: { drawBorder: false }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: true, position: "bottom" }, // Better legend placement
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const monthIndex = tooltipItem.dataIndex + 1;
                                const dayBreakdown = dailyData[monthIndex];
                                let tooltipText = `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
                                if (dayBreakdown) {
                                    tooltipText += "\nDaily Breakdown:";
                                    Object.keys(dayBreakdown).forEach(day => {
                                        tooltipText += `\n${months[monthIndex - 1]} ${day}: Sent $${dayBreakdown[day].sent}, Received $${dayBreakdown[day].received}`;
                                    });
                                }
                                return tooltipText;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Graph Fetch Error:", error.message);
    }
}

// Call function after page load
document.addEventListener("DOMContentLoaded", () => {
    fetchTransactionGraph();
});