// main.js — FINAL VERSION (with editing functionality fully removed)
document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.getElementById('authContainer');
  const mainApp = document.getElementById('mainApp');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotPasswordForm');
  const loginButton = document.getElementById('loginButton');
  const contactForm = document.getElementById('contactForm');
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  const navLinksWrap = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav-link');
  const adminLink = document.getElementById('adminLink');
  const loginNavItem = document.getElementById('loginNav');
  const userInfoItem = document.querySelector('.user-info');
  const userAvatar = document.getElementById('userAvatar');
  const userNameSpan = document.getElementById('userName');
  const pages = document.querySelectorAll('.page-content');

  const API_BASE = 'http://localhost:5000/api';
  let currentUser = null;
  let jwt = null;

  function showError(message) {
    if (!errorDiv) return alert(message);
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
  }

  function showSuccess(message) {
    if (!successDiv) return console.log(message);
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    setTimeout(() => successDiv.classList.add('hidden'), 3000);
  }

  function setAuthUI(loggedIn) {
    if (loginNavItem) loginNavItem.style.display = loggedIn ? 'none' : '';
    if (userInfoItem) userInfoItem.style.display = loggedIn ? '' : 'none';
    const isAdmin = !!currentUser?.isAdmin;
    if (adminLink) adminLink.style.display = isAdmin ? '' : 'none';

    const adminEditorLink = document.getElementById('adminEditorLink');
    if (adminEditorLink) adminEditorLink.style.display = isAdmin ? '' : 'none';

    if (loggedIn && currentUser) {
      const name = currentUser.name || currentUser.email || 'User';
      userNameSpan && (userNameSpan.textContent = name);
      const first = (name[0] || 'U').toUpperCase();
      if (userAvatar) {
        userAvatar.textContent = first;
        userAvatar.title = name;
      }
    } else {
      userNameSpan && (userNameSpan.textContent = '');
      if (userAvatar) userAvatar.textContent = '';
    }
  }

  function persistAuth(user, token) {
    currentUser = user || null;
    jwt = token || null;
    if (user) sessionStorage.setItem('currentUser', JSON.stringify(user));
    else sessionStorage.removeItem('currentUser');
    if (token) sessionStorage.setItem('jwt', token);
    else sessionStorage.removeItem('jwt');
    setAuthUI(!!user);
  }

  function restoreAuth() {
    try {
      const u = sessionStorage.getItem('currentUser');
      const t = sessionStorage.getItem('jwt');
      if (u && t) {
        currentUser = JSON.parse(u);
        jwt = t;
        setAuthUI(true);
        authContainer && (authContainer.style.display = 'none');
        mainApp && mainApp.classList.add('active');
      } else {
        setAuthUI(false);
      }
    } catch {
      setAuthUI(false);
    }
  }

  function setActiveNav(pageId) {
    navLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.page === pageId);
    });
  }

  function showPage(pageId) {
    pages.forEach(p => p.classList.toggle('active', p.id === pageId));
    setActiveNav(pageId);
    loadSection(pageId);
  }

  function attachNavHandlers() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
        navLinksWrap && navLinksWrap.classList.remove('open');
      });
    });
  }

  async function loadSection(sectionId) {
    try {
      const res = await fetch(`${API_BASE}/content/${encodeURIComponent(sectionId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.html) {
        const el = document.getElementById(sectionId);
        if (el) {
          el.innerHTML = data.html;
        }
      }
    } catch (err) {
      console.warn('Failed to load section', sectionId, err);
    }
  }

  async function doLogin(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d?.message || 'Login failed');
    }
    return res.json();
  }

  loginForm && loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
      loginButton && (loginButton.disabled = true);
      const data = await doLogin(email, password);
      if (!data?.user || !data?.token) throw new Error('Invalid server response');
      persistAuth(data.user, data.token);
      authContainer && (authContainer.style.display = 'none');
      mainApp && mainApp.classList.add('active');
      showPage('dashboard');
      showSuccess('Logged in successfully.');
    } catch (err) {
      showError(err.message);
    } finally {
      loginButton && (loginButton.disabled = false);
    }
  });

  window.showLoginForm = function () {
    authContainer && (authContainer.style.display = '');
    showLogin();
  };

  window.logout = function () {
    persistAuth(null, null);
    mainApp && mainApp.classList.remove('active');
    authContainer && (authContainer.style.display = '');
    showLogin();
  };

  window.continueAsGuest = function () {
    persistAuth(null, null);
    authContainer && (authContainer.style.display = 'none');
    mainApp && mainApp.classList.add('active');
    showPage('dashboard');
  };

  function showLogin() {
    if (!loginForm || !signupForm || !forgotForm) return;
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    forgotForm.classList.add('hidden');
  }

  window.showLogin = showLogin;

  restoreAuth();
  attachNavHandlers();

  if (mainApp && mainApp.classList.contains('active')) {
    showPage('dashboard');
  } else {
    continueAsGuest();
  }

  const firstActive = document.querySelector('.page-content.active');
  if (firstActive) {
    loadSection(firstActive.id);
  }
});