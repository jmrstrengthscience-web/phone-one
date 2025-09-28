import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useData } from '../lib/DataContext';

export default function Login() {
  const [email, setEmail] = useState('coach@phorce.com');
  const [password, setPassword] = useState('password');
  const { login } = useData();
  const navigate = useNavigate();

  function handleLogin() {
    const user = login(email, password, 'coach');
    if (user) navigate('/teams');
    else alert('Login failed');
  }

  return (
    <Box className="auth-page" maxWidth={480} mx="auto" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
      <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
      <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleLogin}>Login</Button>
      <Typography sx={{ mt: 2, color: 'text.secondary' }}>Demo: coach@phorce.com / password</Typography>
    </Box>
  );
}
