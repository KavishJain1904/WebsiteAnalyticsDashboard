// admin.js — updated
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('adminEmail');
  const passInput  = document.getElementById('adminPassword');
  const errorDiv   = document.getElementById('adminError');
  const submitBtn  = form.querySelector('.auth-button');

  const API_BASE = 'http://localhost:5000/api';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error
    hideError();

    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      return showError('Please enter your admin email and password.');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showError(data?.message || 'Login failed.');
        setLoading(false);
        return;
      }

      // Must be an admin account (as issued by the backend)
      if (!data?.user?.isAdmin) {
        showError('Access denied: Not an admin');
        setLoading(false);
        return;
      }

      // Save both user and JWT for subsequent admin-only API calls
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      sessionStorage.setItem('jwt', data.token);

      // Go to the main app
      window.location.href = 'index.html';
    } catch (err) {
      showError('Login failed. Server error.');
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.innerHTML = isLoading ? '<div class="loading"></div> Signing In…' : 'Admin Sign In';
  }

  function showError(msg) {
    if (!errorDiv) {
      alert(msg);
      return;
    }
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
  }

  function hideError() {
    if (!errorDiv) return;
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
  }
});
