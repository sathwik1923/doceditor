// src/components/landing/Features.js
import React from 'react';
import '../../App.css';

const Features = () => {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Real-Time Collaboration',
      description: 'Work together with your team in real-time. See changes instantly as others type and edit.',
      color: '#1a1a1a'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Secure & Private',
      description: 'Your documents are encrypted and secure. Control who can access and edit your content.',
      color: '#374151'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Cross-Platform',
      description: 'Access your documents from any device. Seamless experience across desktop and mobile.',
      color: '#4b5563'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" strokeWidth="2"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 2l7.586 7.586" stroke="currentColor" strokeWidth="2"/>
          <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Rich Text Editor',
      description: 'Powerful formatting tools, tables, images, and more. Create beautiful documents effortlessly.',
      color: '#6b7280'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2"/>
          <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2"/>
          <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Auto-Save',
      description: 'Never lose your work. All changes are automatically saved and synced across devices.',
      color: '#9ca3af'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="1,20 1,14 7,14" stroke="currentColor" strokeWidth="2"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Version History',
      description: 'Track changes and revert to previous versions. Complete revision history at your fingertips.',
      color: '#d1d5db'
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <div className="features-header">
          <h2 className="features-title">
            Everything you need to collaborate
          </h2>
          <p className="features-subtitle">
            Powerful tools designed for modern teams and individuals
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ background: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;