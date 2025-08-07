import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp',
      avatar: 'SJ',
      content: 'CollabDocs has completely transformed how our team works together. The real-time collaboration is seamless and intuitive.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Lead Designer',
      company: 'DesignStudio',
      avatar: 'MC',
      content: 'The clean interface and powerful features make document collaboration a breeze. Our productivity has increased significantly.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Writer',
      company: 'MediaFlow',
      avatar: 'ER',
      content: 'Finally, a collaborative editor that just works. No more version conflicts or lost changes. It\'s exactly what we needed.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Engineering Manager',
      company: 'StartupXYZ',
      avatar: 'DK',
      content: 'The real-time cursors and live editing features make remote collaboration feel natural. Highly recommend for any team.',
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">What our users say</h2>
          <p className="testimonials-subtitle">
            Trusted by teams worldwide
          </p>
        </div>
        <div className="testimonials-carousel">
          <div className="testimonials-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-button carousel-button-prev" onClick={prevSlide}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="carousel-button carousel-button-next" onClick={nextSlide}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="testimonials-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonial-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


export default Testimonials
