// document.body.classList.add('dark'); // since you want dark theme

// // Function to fetch live stats and update cards & charts
// async function updateStats() {
//   try {
//     const res = await fetch('/api/stats');
//     const stats = await res.json();

//     // Update dashboard cards
//     document.querySelector('[data-key="users"] p').textContent = stats.users;
//     document.querySelector('[data-key="sales"] p').textContent = `$${stats.sales}`;
//     document.querySelector('[data-key="conversions"] p').textContent = `${stats.conversions}%`;
//     document.querySelector('[data-key="growth"] p').textContent = `+${stats.growth}%`;

//     // Update Bar Chart
//     barChart.data.datasets[0].data = [
//       stats.sales, stats.conversions, stats.growth, stats.users
//     ]; // adjust order to your preference
//     barChart.update();

//     // Update Line Chart
//     lineChart.data.datasets[0].data = [
//       stats.users, stats.users + 50, stats.users + 100, stats.users + 150
//     ]; // example growth; replace with real historical data if available
//     lineChart.update();

//   } catch (err) {
//     console.error('Error fetching stats:', err);
//   }
// }

// // Initialize charts with empty or placeholder data
// const barCtx = document.getElementById('barChart').getContext('2d');
// const barChart = new Chart(barCtx, {
//   type: 'bar',
//   data: {
//     labels: ['Sales', 'Conversions', 'Growth', 'Users'],
//     datasets: [{
//       label: 'Stats',
//       data: [0,0,0,0], // placeholder, will be updated dynamically
//       backgroundColor: 'rgba(37, 99, 235, 0.7)',
//       borderRadius: 6
//     }]
//   },
//   options: { responsive: true, scales: { y: { beginAtZero: true } } }
// });

// const lineCtx = document.getElementById('lineChart').getContext('2d');
// const lineChart = new Chart(lineCtx, {
//   type: 'line',
//   data: {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     datasets: [{
//       label: 'Users',
//       data: [0,0,0,0,0,0], // placeholder
//       fill: true,
//       borderColor: 'rgba(37, 99, 235, 1)',
//       backgroundColor: 'rgba(37, 99, 235, 0.2)',
//       tension: 0.4
//     }]
//   },
//   options: { responsive: true, scales: { y: { beginAtZero: true } } }
// });

// // Call initially & refresh every minute
// updateStats();
// setInterval(updateStats, 60000);


// DARK THEME SETUP
document.body.classList.add('dark');
document.body.style.backgroundColor = '#1f2937'; // Tailwind gray-800
document.body.style.color = '#f9fafb'; // Tailwind gray-50

// DASHBOARD CARDS SELECTORS
const cards = {
  users: document.querySelector('[data-key="users"] p'),
  sales: document.querySelector('[data-key="sales"] p'),
  conversions: document.querySelector('[data-key="conversions"] p'),
  growth: document.querySelector('[data-key="growth"] p')
};

// INITIALIZE CHARTS
const barCtx = document.getElementById('barChart').getContext('2d');
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['Sales', 'Conversions', 'Growth', 'Users'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [0],
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderRadius: 6
      },
      {
        label: 'Conversions (%)',
        data: [0],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6
      },
      {
        label: 'Growth (%)',
        data: [0],
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
        borderRadius: 6
      },
      {
        label: 'Users',
        data: [0],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 6
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#f9fafb' } }
    },
    scales: {
      x: { ticks: { color: '#f9fafb' } },
      y: { ticks: { color: '#f9fafb', beginAtZero: true } }
    }
  }
});

const lineCtx = document.getElementById('lineChart').getContext('2d');
const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Users Over Time',
        data: [0, 0, 0, 0, 0, 0],
        fill: true,
        borderColor: 'rgba(37, 99, 235, 1)',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: '#f9fafb' } } },
    scales: {
      x: { ticks: { color: '#f9fafb' } },
      y: { ticks: { color: '#f9fafb', beginAtZero: true } }
    }
  }
});

// FETCH AND UPDATE DASHBOARD DATA
async function updateStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();

    // UPDATE CARDS
    cards.users.textContent = stats.users;
    cards.sales.textContent = `$${stats.sales}`;
    cards.conversions.textContent = `${stats.conversions}%`;
    cards.growth.textContent = `+${stats.growth}%`;

    // UPDATE BAR CHART
    barChart.data.datasets[0].data = [stats.sales];
    barChart.data.datasets[1].data = [stats.conversions];
    barChart.data.datasets[2].data = [stats.growth];
    barChart.data.datasets[3].data = [stats.users];
    barChart.update();

    // UPDATE LINE CHART (example growth over months)
    // Replace this with real historical data if you store it
    const historicalUsers = [stats.users - 50, stats.users - 30, stats.users - 20, stats.users - 10, stats.users, stats.users];
    lineChart.data.datasets[0].data = historicalUsers;
    lineChart.update();

  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// INITIAL CALL + AUTO REFRESH EVERY 60s
updateStats();
setInterval(updateStats, 60000);
