document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotPasswordForm');
  const contactForm = document.getElementById('contactForm');
  const loginButton = document.getElementById('loginButton');

  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');

  let currentUser = null;

  const API_BASE = 'http://localhost:5000/api';

  // ========== PAGE TRACKING ==========
  function trackPageView(pageName, pageTitle) {
    if (typeof gtag === 'function') {
      gtag('config', 'G-C230G3H2P6', {
        page_title: pageTitle,
        page_location: window.location.origin + '/' + pageName
      });
      
      gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.origin + '/' + pageName,
        custom_page_name: pageName
      });
    }
    
    // Update browser URL without page reload
    history.pushState(null, pageTitle, '/' + pageName);
    document.title = `${pageTitle} - TechVision Solutions`;
  }

  // ========== AUTH STATE ==========
  function checkAuthState() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      currentUser = parsedUser;
      showMainApp();
    }
  }

  // ========== SHOW/HIDE HELPERS ==========
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
  }

  function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    setTimeout(() => successDiv.classList.add('hidden'), 3000);
  }

  function showLogin() {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    forgotForm.classList.add('hidden');
    document.querySelector('.auth-title').textContent = 'Welcome Back';
    document.querySelector('.auth-subtitle').textContent = 'Please sign in to access your dashboard';
    trackPageView('login', 'Login');
  }

  function showSignup() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    forgotForm.classList.add('hidden');
    document.querySelector('.auth-title').textContent = 'Create Account';
    document.querySelector('.auth-subtitle').textContent = 'Join TechVision Solutions today';
    trackPageView('signup', 'Create Account');
  }

  function showForgotPassword() {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    forgotForm.classList.remove('hidden');
    document.querySelector('.auth-title').textContent = 'Reset Password';
    document.querySelector('.auth-subtitle').textContent = 'Enter your email to reset your password';
    trackPageView('forgot-password', 'Reset Password');
  }

  // ========== SIGNUP ==========
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = signupForm.signupName.value.trim();
    const email = signupForm.signupEmail.value.trim();
    const password = signupForm.signupPassword.value;
    const confirmPassword = signupForm.confirmPassword.value;

    if (password !== confirmPassword) {
      return showError('Passwords do not match.');
    }

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) return showError(data.message);

      // Track signup success
      if (typeof gtag === 'function') {
        gtag('event', 'sign_up', {
          method: 'email'
        });
      }

      showSuccess('Account created. Please log in.');
      showLogin();
    } catch (err) {
      showError('Server error during signup.');
    }
  });

  // ========== LOGIN ==========
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.loginEmail.value.trim();
    const password = loginForm.loginPassword.value;

    loginButton.disabled = true;
    loginButton.innerHTML = '<div class="loading"></div> Signing In...';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message);
        loginButton.disabled = false;
        loginButton.innerHTML = 'Sign In';
        return;
      }

      currentUser = data.user;
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      showSuccess('Login successful!');
      showMainApp();
    } catch (err) {
      showError('Server error during login.');
    }

    loginButton.disabled = false;
    loginButton.innerHTML = 'Sign In';
  });

  // ========== FORGOT PASSWORD ==========
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = forgotForm.forgotEmail.value.trim();

    try {
      const res = await fetch(`${API_BASE}/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) return showError(data.message);

      showSuccess(data.message);
      showLogin();
    } catch (err) {
      showError('Server error during password reset.');
    }
  });

  // ========== CONTACT FORM ==========
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = contactForm.contactName.value.trim();
    const email = contactForm.contactEmail.value.trim();
    const message = contactForm.contactMessage.value.trim();

    if (!name || !email || !message) {
      alert('All fields are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Submission failed.');
        return;
      }

      // Track contact form submission
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'Contact',
          event_label: 'Contact Form'
        });
      }

      alert(data.message || 'Message sent successfully!');
      contactForm.reset();
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  });

  // ========== MAIN APP ==========
  function showMainApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').classList.add('active');

    if (currentUser) {
      document.getElementById('userName').textContent = currentUser.name;
      document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

      const adminLink = document.getElementById('adminLink');
      adminLink.style.display = currentUser.isAdmin ? 'inline-block' : 'none';

      // Track successful login
      if (typeof gtag === 'function') {
        gtag('event', 'login', {
          method: 'email',
          user_id: currentUser.email
        });
      }

      // Show dashboard by default
      trackPageView('dashboard', 'Dashboard');
    }
  }

  // ========== NAVIGATION ==========
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const page = this.dataset.page;

      document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
      document.getElementById(page).classList.add('active');

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Track page navigation
      const pageNames = {
        'dashboard': 'Dashboard',
        'about': 'About Us',
        'services': 'Services',
        'portfolio': 'Portfolio',
        'contact': 'Contact',
        'blog': 'Blog',
        'adminPanel': 'Admin Panel'
      };

      trackPageView(page, pageNames[page] || page);

      // Track specific events for important pages
      if (typeof gtag === 'function') {
        switch(page) {
          case 'services':
            gtag('event', 'view_item_list', {
              item_list_name: 'Services',
              event_category: 'Navigation'
            });
            break;
          case 'contact':
            gtag('event', 'view_item', {
              item_name: 'Contact Page',
              event_category: 'Navigation'
            });
            break;
          case 'portfolio':
            gtag('event', 'view_item_list', {
              item_list_name: 'Portfolio',
              event_category: 'Navigation'
            });
            break;
        }
      }
    });
  });

  // ========== MENU TOGGLE ==========
  window.toggleMenu = function () {
    document.getElementById('navLinks').classList.toggle('active');
  };

  // ========== LOGOUT ==========
  window.logout = function () {
    // Track logout event
    if (typeof gtag === 'function') {
      gtag('event', 'logout', {
        user_id: currentUser?.email
      });
    }

    sessionStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('authContainer').style.display = 'flex';
    showLogin();
  };

  // ========== ADMIN EDIT ==========
  let isEditing = false;

  window.toggleEditing = function () {
    const editBlocks = document.querySelectorAll('[data-editable="true"]');

    if (!isEditing) {
      // Enable editing
      editBlocks.forEach(section => {
        section.querySelectorAll('p, h1, h2, h3, span, small').forEach(el => {
          el.setAttribute('contenteditable', 'true');
        });
      });

      document.getElementById('editToggleBtn').textContent = "Disable Editing";
      document.getElementById('saveChangesBtn').style.display = "inline-block";
      isEditing = true;

      // Track admin action
      if (typeof gtag === 'function') {
        gtag('event', 'admin_action', {
          event_category: 'Admin',
          event_label: 'Enable Editing'
        });
      }
    } else {
      // Disable editing
      editBlocks.forEach(section => {
        section.querySelectorAll('p, h1, h2, h3, span, small').forEach(el => {
          el.setAttribute('contenteditable', 'false');
        });
      });

      document.getElementById('editToggleBtn').textContent = "Enable Editing";
      document.getElementById('saveChangesBtn').style.display = "none";
      isEditing = false;
    }
  };

  window.saveChanges = function () {
    const editedContent = [];

    document.querySelectorAll('[data-editable="true"]').forEach(section => {
      const sectionId = section.id || 'no-id';
      const content = section.innerHTML;
      editedContent.push({ sectionId, content });
    });

    console.log("Edited Content:", editedContent);
    alert("Changes captured in console. Implement server save if needed.");

    // Track content save
    if (typeof gtag === 'function') {
      gtag('event', 'admin_action', {
        event_category: 'Admin',
        event_label: 'Save Changes'
      });
    }
  };

  // ========== WINDOW HOOKS ==========
  window.showLogin = showLogin;
  window.showSignup = showSignup;
  window.showForgotPassword = showForgotPassword;

  // ========== INITIALIZE ==========
  checkAuthState();
});