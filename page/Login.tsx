import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // ล้าง error ก่อนล็อกอินใหม่
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/store'); // ✅ ล็อกอินสำเร็จ ไปที่ Store
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      setError('Invalid email or password. Please try again.'); // ❌ แจ้งเตือนเมื่อข้อมูลผิด
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
        <Typography variant="h4" gutterBottom color="primary">
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} {/* 🚀 แจ้งเตือนข้อผิดพลาด */}

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>

        <Button color="secondary" sx={{ mt: 2 }} onClick={() => navigate('/register')}>
          Don't have an account? Register
        </Button> {/* ✅ ปุ่มสมัครสมาชิก */}
      </Box>
    </Container>
  );
};

export default Login;
