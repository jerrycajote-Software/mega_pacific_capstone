import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

const CustomerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear state to avoid showing it again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      // Block admin accounts from accessing the customer interface
      if (result.user?.role === 'admin') {
        logout();
        setError('Admin accounts cannot access the customer portal. Please use the Admin Login.');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif' }}>
      <style>{`
        .custom-form-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 400px;
          background-color: #222222;
          padding: 30px;
          border-radius: 20px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .custom-title {
          font-size: 28px;
          color: royalblue;
          font-weight: 600;
          letter-spacing: -1px;
          position: relative;
          display: flex;
          align-items: center;
          padding-left: 30px;
          margin-bottom: 5px;
        }

        .custom-title::before, .custom-title::after {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          border-radius: 50%;
          left: 0px;
          background-color: royalblue;
        }

        .custom-title::before {
          width: 18px;
          height: 18px;
          background-color: royalblue;
        }

        .custom-title::after {
          width: 18px;
          height: 18px;
          animation: pulse 1s linear infinite;
        }

        .custom-message {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 10px;
        }

        .custom-signin {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-top: 10px;
        }

        .custom-signin a {
          color: royalblue;
        }

        .custom-signin a:hover {
          text-decoration: underline royalblue;
        }

        .custom-form-container label {
          position: relative;
          width: 100%;
          display: block;
        }

        .custom-form-container label .custom-input {
          width: 100%;
          padding: 10px 10px 20px 10px;
          outline: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          background-color: transparent;
          color: white;
        }

        .custom-form-container label .custom-input + span {
          position: absolute;
          left: 10px;
          top: 15px;
          color: grey;
          font-size: 0.9em;
          cursor: text;
          transition: 0.3s ease;
          pointer-events: none;
        }

        .custom-form-container label .custom-input:placeholder-shown + span {
          top: 15px;
          font-size: 0.9em;
        }

        .custom-form-container label .custom-input:focus + span,
        .custom-form-container label .custom-input:not(:placeholder-shown) + span {
          top: 32px;
          font-size: 0.7em;
          font-weight: 600;
        }

        .custom-form-container label .custom-input:not(:placeholder-shown) + span {
          color: #4CAF50;
        }
        
        .custom-form-container label .custom-input:focus + span {
          color: royalblue;
        }

        .custom-submit {
          border: none;
          outline: none;
          background-color: royalblue;
          padding: 12px;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          transition: .3s ease;
          cursor: pointer;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 5px;
        }

        .custom-submit:hover {
          background-color: rgb(56, 90, 194);
        }

        .custom-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @keyframes pulse {
          from {
            transform: scale(0.9);
            opacity: 1;
          }
          to {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>

      <div className="custom-form-container">
        <h2 className="custom-title">Login</h2>
        <p className="custom-message">Welcome back. Please login to your account.</p>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg mb-2 text-sm flex items-center justify-center">
            <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-2 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            <input 
              required 
              placeholder=" " 
              type="email" 
              className="custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span>Email</span>
          </label> 
          
          <label>
            <input 
              required 
              placeholder=" " 
              type="password" 
              className="custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>Password</span>
          </label>

          <div style={{ textAlign: 'right', marginTop: '-5px' }}>
            <a href="#" style={{ color: 'royalblue', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</a>
          </div>
          
          <button type="submit" className="custom-submit" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Submit'}
          </button>
        </form>
        
        <p className="custom-signin">
          Don't have an account ? <Link to="/register">Signup</Link> 
        </p>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
