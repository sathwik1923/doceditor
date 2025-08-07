import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Landing Page
import LandingPage from './components/landing/LandingPage';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Editor
import Editor from './components/editor/Editor';
import EditorWrapper from './components/editor/EditorWrapper';
import SharedDocumentHandler from './components/shared/SharedDocumentHandler';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor/:docId"
            element={
              <PrivateRoute>
                <EditorWrapper />
              </PrivateRoute>
            }
          />
          {/* NEW: Shared document route */}
          <Route
            path="/shared/:token"
            element={<SharedDocumentHandler />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
