// routes/content.js
const express = require('express');
const router = express.Router();

// In-memory storage for content (you can replace this with MongoDB later)
let contentStorage = {
  dashboard: `<div class="hero">
    <h1>Welcome to Your Dashboard</h1>
    <p>Access all your tools and manage your projects from here</p>
</div>
<div class="services-grid">
    <div class="service-card">
        <div class="service-icon">📊</div>
        <h3>Analytics</h3>
        <p>View your website performance and user engagement metrics</p>
    </div>
    <div class="service-card">
        <div class="service-icon">⚙️</div>
        <h3>Settings</h3>
        <p>Manage your account settings and preferences</p>
    </div>
    <div class="service-card">
        <div class="service-icon">📁</div>
        <h3>Projects</h3>
        <p>Access and manage all your active projects</p>
    </div>
</div>`,

  about: `<h2>About TechVision Solutions</h2>
<p>Founded in 2020, TechVision Solutions is a leading technology company specializing in cutting-edge digital solutions. We help businesses transform their operations through innovative technology implementations.</p>

<h3>Our Mission</h3>
<p>To empower businesses with technology solutions that drive growth, efficiency, and innovation. We believe in creating digital experiences that not only meet current needs but anticipate future challenges.</p>

<h3>Our Values</h3>
<p><strong>Innovation:</strong> We stay at the forefront of technological advancement</p>
<p><strong>Quality:</strong> We deliver excellence in every project</p>
<p><strong>Integrity:</strong> We build trust through transparent communication</p>
<p><strong>Collaboration:</strong> We work closely with our clients as partners</p>`,

  services: `<h2>Our Services</h2>
<p>We offer comprehensive technology solutions tailored to your business needs.</p>

<div class="services-grid">
    <div class="service-card">
        <div class="service-icon">🌐</div>
        <h3>Web Development</h3>
        <p>Full-stack web development using React, Node.js, Python, and modern frameworks.</p>
    </div>
    <div class="service-card">
        <div class="service-icon">📱</div>
        <h3>Mobile Development</h3>
        <p>Native iOS and Android apps, as well as cross-platform solutions.</p>
    </div>
    <div class="service-card">
        <div class="service-icon">☁️</div>
        <h3>Cloud Solutions</h3>
        <p>AWS, Azure, and Google Cloud implementations and migration services.</p>
    </div>
    <div class="service-card">
        <div class="service-icon">🎨</div>
        <h3>UI/UX Design</h3>
        <p>User-centered design solutions that create engaging digital experiences.</p>
    </div>
</div>`,

  portfolio: `<h2>Our Portfolio</h2>
<p>Explore some of our recent projects and success stories.</p>

<div class="services-grid">
    <div class="service-card">
        <div class="service-icon">🏪</div>
        <h3>E-commerce Platform</h3>
        <p>Built a scalable e-commerce solution handling 10,000+ daily transactions.</p>
    </div>
    <div class="service-card">
        <div class="service-icon">🏥</div>
        <h3>Healthcare System</h3>
        <p>Developed a comprehensive patient management system for medical clinics.</p>
    </div>
    <div class="service-card">
        <div class="service-icon">🎓</div>
        <h3>Education Platform</h3>
        <p>Created an interactive learning management system for global students.</p>
    </div>
</div>`,

  contact: `<h2>Get In Touch</h2>
<p>Ready to start your next project? Contact us today for a consultation.</p>

<div class="contact-form">
    <form id="contactForm">
        <div class="form-group">
            <label for="contactName">Full Name</label>
            <input type="text" id="contactName" name="name" required placeholder="Enter your full name">
        </div>

        <div class="form-group">
            <label for="contactEmail">Email Address</label>
            <input type="email" id="contactEmail" name="email" required placeholder="Enter your email">
        </div>

        <div class="form-group">
            <label for="contactMessage">Message</label>
            <textarea id="contactMessage" name="message" rows="5" required placeholder="Tell us about your project..."></textarea>
        </div>

        <button type="submit" class="cta-button">Send Message</button>
    </form>
</div>`,

  blog: `<h2>Latest Blog Posts</h2>
<p>Stay updated with the latest technology trends and insights.</p>

<div class="services-grid">
    <div class="service-card">
        <h3>The Future of Web Development</h3>
        <p>Exploring emerging technologies and trends shaping web development in 2024.</p>
        <p><small>Posted on March 15, 2024</small></p>
    </div>
    <div class="service-card">
        <h3>Cloud Migration Best Practices</h3>
        <p>A comprehensive guide to successfully migrating applications to the cloud.</p>
        <p><small>Posted on March 10, 2024</small></p>
    </div>
    <div class="service-card">
        <h3>Mobile App Security Tips</h3>
        <p>Essential security measures every mobile app developer should implement.</p>
        <p><small>Posted on March 5, 2024</small></p>
    </div>
</div>`,

  adminPanel: `<h2>Admin Control Panel</h2>
<p>Welcome, Admin! You have full access to manage website content.</p>
<p>You can edit all page content by using the <strong>Content Editor</strong> from the navigation bar.</p>
<p>
    <a href="admin-editor.html">🛠️ Open Content Editor</a>
</p>`
};

// Middleware to verify admin access
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // You should implement proper JWT verification here
    // For now, we'll just check if token exists
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (!decoded.isAdmin) {
    //   return res.status(403).json({ message: 'Admin access required' });
    // }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/content/:sectionId - Get content for a section
router.get('/content/:sectionId', (req, res) => {
  try {
    const { sectionId } = req.params;
    const html = contentStorage[sectionId] || '';
    
    res.json({ 
      success: true, 
      html: html,
      sectionId: sectionId
    });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve content' 
    });
  }
});

// PUT /api/content/:sectionId - Update content for a section (Admin only)
router.put('/content/:sectionId', verifyAdmin, (req, res) => {
  try {
    const { sectionId } = req.params;
    const { html } = req.body;

    if (!html && html !== '') {
      return res.status(400).json({ 
        success: false, 
        message: 'HTML content is required' 
      });
    }

    // Update the content in storage
    contentStorage[sectionId] = html;
    
    res.json({ 
      success: true, 
      message: `Content updated successfully for ${sectionId}`,
      sectionId: sectionId
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update content' 
    });
  }
});

// GET /api/content - Get all content sections (Admin only)
router.get('/content', verifyAdmin, (req, res) => {
  try {
    res.json({ 
      success: true, 
      content: contentStorage 
    });
  } catch (error) {
    console.error('Error getting all content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve content' 
    });
  }
});

module.exports = router;