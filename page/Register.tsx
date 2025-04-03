/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Card,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const images = ["/images/login-1.jpg", "/images/login-2.jpg", "/images/login-3.jpg"];

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        address,
        phone,
        email,
        createdAt: new Date(),
      });

      navigate("/store"); 
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error code:", (error as any).code);
        console.error("Error message:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
      setError("Failed to create an account. Please try again.");
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={6} sx={{ position: "relative", overflow: "hidden" }}>
        {images.map((img, index) => (
          <Box
            key={index}
            component="img"
            src={img}
            alt={`Slide ${index + 1}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: currentImage === index ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}
      </Grid>
      <Grid item xs={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card
          sx={{
            width: 400,
            p: 4,
            textAlign: "center",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", 
            borderRadius: "12px", 
          }}
        >
          <Box component="img" src="/Rectangle 2.png" alt="Logo" sx={{ width: 120, mb: 2 }} />

          <Typography variant="h4" gutterBottom color="#FF4500" fontWeight={"bold"}>
            Register
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRegister}>
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

          <Button color="secondary" sx={{ mt: 2 }} onClick={() => navigate("/login")}>
            Already have an account? Login
          </Button>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Register;
