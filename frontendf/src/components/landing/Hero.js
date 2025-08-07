import React from 'react';
import '../../App.css';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-grid-pattern"></div>
        <div className="hero-gradient-orb hero-gradient-orb-1"></div>
        <div className="hero-gradient-orb hero-gradient-orb-2"></div>
      </div>
      <div className="container hero-grid">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-icon">✨</span>
            <span>New: Real-time AI suggestions</span>
          </div>
          <h1 className="hero-title">
            The Future of <span className="highlight">Real-Time Collaboration</span>
          </h1>
          <p className="hero-subtitle">
            Edit documents, brainstorm ideas, and co-create content with your team — all in one smooth, synchronized workspace. No delays. No confusion. Just flow.
          </p>
          <div className="hero-buttons">
            <button className="hero-button hero-button-primary" onClick={onGetStarted}>
              <span>Get Started for Free</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="hero-button hero-button-secondary">
              <span>Watch Demo</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">10K+</div>
              <div className="hero-stat-label">Active Users</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">99.9%</div>
              <div className="hero-stat-label">Uptime</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">50M+</div>
              <div className="hero-stat-label">Documents</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-mockup">
            <div className="hero-mockup-header">
              <div className="hero-mockup-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="hero-mockup-title">Project-Proposal.docx</div>
            </div>
            <div className="hero-mockup-content">
              <div className="hero-mockup-line long"></div>
              <div className="hero-mockup-line medium"></div>
              <div className="hero-mockup-line short"></div>
              <div className="hero-mockup-line long"></div>
              <div className="hero-mockup-cursor hero-mockup-cursor-1">
                <div className="hero-mockup-cursor-user">Sarah</div>
              </div>
              <div className="hero-mockup-cursor hero-mockup-cursor-2">
                <div className="hero-mockup-cursor-user">Mike</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default Hero;
