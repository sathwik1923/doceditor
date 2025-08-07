// src/components/landing/LandingPage.js

import React, { useState } from 'react';
import Features from './Features';
import Hero from './Hero';
import Testimonials from './Testimonials';
import Login from '../auth/Login';
import Register from '../auth/Register';
import '../../App.css';

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient1)" />
                <path d="M8 12h16M8 16h12M8 20h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a1a1a" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">CollabDocs</span>
          </div>
          <nav className="nav-links">
            <button className="nav-link" onClick={() => openAuthModal('login')}>
              Sign In
            </button>
            <button className="nav-link nav-link-primary" onClick={() => openAuthModal('register')}>
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Hero onGetStarted={() => openAuthModal('register')} />
        <Features />
        <Testimonials />
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} CollabDocs. Empowering Collaboration.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <button className="auth-modal-close" onClick={closeAuthModal}>×</button>
            {authMode === 'login' ? (
              <Login 
                onClose={closeAuthModal}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <Register 
                onClose={closeAuthModal}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
