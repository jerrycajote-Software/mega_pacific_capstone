import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const result = await register(fullName, email, password);
    
    if (result.success) {
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
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

        .custom-flex {
          display: flex;
          width: 100%;
          gap: 10px;
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
        <h2 className="custom-title">Register</h2>
        <p className="custom-message">Signup now and get full access to our app.</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-2 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="custom-flex">
            <label>
              <input 
                required 
                placeholder=" " 
                type="text" 
                className="custom-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <span>Firstname</span>
            </label>
            <label>
              <input 
                required 
                placeholder=" " 
                type="text" 
                className="custom-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <span>Lastname</span>
            </label>
          </div>  
          
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
              minLength={6}
            />
            <span>Password</span>
          </label>
          
          <label>
            <input 
              required 
              placeholder=" " 
              type="password" 
              className="custom-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
            <span>Confirm password</span>
          </label>
          
          <button type="submit" className="custom-submit" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Submit'}
          </button>
        </form>
        
        <p className="custom-signin">
          Already have an acount ? <Link to="/login">Signin</Link> 
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
