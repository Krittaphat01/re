import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import Firebase auth and firestore

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // บันทึกข้อมูลผู้ใช้ลง Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        address,
        phone,
        email,
        createdAt: new Date(),
      });
  
      navigate('/store'); // ✅ สมัครสำเร็จ ไปที่ Store
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error('Error code:', (error as any).code); // แสดงรหัสข้อผิดพลาด
        console.error('Error message:', error.message); // แสดงข้อความข้อผิดพลาด
      } else {
        console.error('An unknown error occurred:', error);
      }
      setError('Failed to create an account. Please try again.'); // ❌ ข้อความข้อผิดพลาดทั่วไป
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
        <Typography variant="h4" gutterBottom color="primary">
          Register
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} {/* 🚀 Error alert */}

        <form onSubmit={handleRegister} style={{ width: '100%' }}>
          <TextField
            label="Name"
            type="text"
            fullWidth
            margin="normal"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <TextField
            label="Address"
            type="text"
            fullWidth
            margin="normal"
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <TextField
            label="Phone Number"
            type="text"
            fullWidth
            margin="normal"
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
        </form>

        <Button color="secondary" sx={{ mt: 2 }} onClick={() => navigate('/login')}>
          Already have an account? Login
        </Button> {/* ✅ Button to go to Login page */}
      </Box>
    </Container>
  );
};

export default Register;
