document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');
  const errorDiv = document.getElementById('adminError');
  const API_BASE = 'http://localhost:5000/api';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return showError(data.message);
      if (!data.user.isAdmin) return showError('Access denied: Not an admin');

      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      window.location.href = 'index.html'; // load main dashboard
    } catch {
      showError('Login failed. Server error.');
    }
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 4000);
  }
});
