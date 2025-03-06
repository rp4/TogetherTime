import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { TextField, Button, Snackbar, Alert, Box, Typography } from '@mui/material';

const EmailSubscription = ({ birthMonth, birthYear }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [supabaseAvailable, setSupabaseAvailable] = useState(true);

  // Check if Supabase is available
  useEffect(() => {
    const checkSupabase = () => {
      if (typeof window !== 'undefined' && !window.supabase) {
        console.warn('Supabase client not available via CDN');
        setSupabaseAvailable(false);
      }
    };
    
    checkSupabase();
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSnackbarMessage('Please enter a valid email address');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (!supabaseAvailable) {
      setSnackbarMessage('Subscription service is temporarily unavailable. Please try again later.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Get month name from index
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = months[birthMonth];
      
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('milestone_subscribers')
        .insert([
          { 
            email, 
            source: 'TogetherTime',
            child_birth_month: monthName,
            child_birth_year: birthYear,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      
      setSnackbarMessage('Thank you for subscribing to milestone alerts!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setEmail('');
    } catch (error) {
      console.error('Error inserting data:', error);
      setSnackbarMessage('Something went wrong. Please try again later.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box className="subscription-container">
      <form onSubmit={handleSubmit} className="subscription-form">
        <TextField
          label="Email Address"
          variant="outlined"
          type="email"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          margin="normal"
          required
          className="subscription-input"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !supabaseAvailable}
          className="subscription-button"
          style={{ backgroundColor: 'black' }}
        >
          {loading ? 'Processing...' : 'Stay Updated'}
        </Button>
      </form>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailSubscription; 