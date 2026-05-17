import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CandlestickBg from '../components/CandlestickBg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.success) navigate('/login');
  };

  return (
    <div className="auth-container">
      <CandlestickBg />
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p style={{ fontSize: '12px', marginTop: '-12px', marginBottom: '16px', color: '#9b9eac' }}>At least 8 chars, one uppercase, one lowercase, one number, one special character</p>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}