import { useState, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { activeCars as carPlates, carInfo, carLocation } from '../config/carConfig';

const ADMIN_PASSWORD = '24031247';

const AddBookingFab = ({ onAddBooking, bookings, prefilledData, onPrefilledDataUsed }) => {
  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [formData, setFormData] = useState({
    rentDate: null,
    returnDate: null,
    carLocation: '',
    carPlate: '',
    person: '',
    destination: '',
    info: ''
  });

  // Get unique locations from carLocation object
  const uniqueLocations = [...new Set(Object.values(carLocation))];

  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        carPlate: prefilledData.carPlate,
        rentDate: prefilledData.rentDate,
        // Still set carLocation in the background
        carLocation: carLocation[prefilledData.carPlate] || ''
      }));
      setOpen(true);
      onPrefilledDataUsed();
    }
  }, [prefilledData]);

  const validateDates = (rentDate, returnDate) => {
    if (!rentDate || !returnDate) return true;
    return isAfter(returnDate, rentDate) || isEqual(returnDate, rentDate);
  };

  const isCarAvailable = (carPlate, startDate, endDate) => {
    if (!startDate || !endDate || !carPlate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const conflictingBooking = bookings.find(booking => {
      const bookingStart = new Date(booking.rentDate);
      const bookingEnd = new Date(booking.returnDate);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(0, 0, 0, 0);

      return (
        booking.carPlate === carPlate &&
        (
          (start <= bookingEnd && end >= bookingStart) ||
          (start >= bookingStart && start <= bookingEnd) ||
          (end >= bookingStart && end <= bookingEnd)
        )
      );
    });

    return !conflictingBooking;
  };

  const handlePasswordSubmit = async () => {
    if (password === ADMIN_PASSWORD) {
      setPasswordDialogOpen(false);
      setPassword('');
      setPasswordError('');
      
      if (pendingSubmission) {
        try {
          await onAddBooking(pendingSubmission);
          setOpen(false);
          setFormData({
            rentDate: null,
            returnDate: null,
            carLocation: '',
            carPlate: '',
            person: '',
            destination: '',
            info: ''
          });
          setPendingSubmission(null);
        } catch (error) {
          setError('Failed to add booking. Please try again.');
          console.error(error);
        }
      }
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!formData.rentDate || !formData.returnDate || !formData.carLocation || 
        !formData.carPlate || !formData.person || !formData.destination) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateDates(formData.rentDate, formData.returnDate)) {
      setError('Return date must be after or equal to rent date');
      return;
    }

    if (!isCarAvailable(formData.carPlate, formData.rentDate, formData.returnDate)) {
      setError(`Car ${formData.carPlate} is not available for the selected dates. Please choose different dates or another car.`);
      return;
    }

    const submissionData = {
      ...formData,
      rentDate: formData.rentDate.toISOString().split('T')[0],
      returnDate: formData.returnDate.toISOString().split('T')[0]
    };

    setPendingSubmission(submissionData);
    setPasswordDialogOpen(true);
  };

  const handleDateChange = (field) => (newValue) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: newValue };
      setError('');
      
      if (newData.carPlate && newData.rentDate && newData.returnDate) {
        if (!isCarAvailable(newData.carPlate, newData.rentDate, newData.returnDate)) {
          setError(`Car ${newData.carPlate} is not available for the selected dates`);
        }
      }
      
      return newData;
    });
  };

  const handleCarChange = (e) => {
    const newCarPlate = e.target.value;
    setFormData(prev => {
      const newData = { 
        ...prev, 
        carPlate: newCarPlate,
        // Still update carLocation in the background
        carLocation: carLocation[newCarPlate] || prev.carLocation
      };
      setError('');
      
      if (newData.rentDate && newData.returnDate) {
        if (!isCarAvailable(newCarPlate, newData.rentDate, newData.returnDate)) {
          setError(`Car ${newCarPlate} is not available for the selected dates`);
        }
      }
      
      return newData;
    });
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '20px', sm: '24px' },
              background: 'linear-gradient(45deg, #007AFF, #5856D6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            Add New Car Booking
          </Typography>
          {formData.carPlate && carInfo[formData.carPlate] && (
            <Typography 
              variant="caption" 
              display="block" 
              sx={{ 
                mt: 0.5,
                fontSize: '0.85rem',
                fontWeight: 500,
                letterSpacing: '0.3px',
                opacity: 0.85,
                background: 'linear-gradient(45deg, #666, #999)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase'
              }}
            >
              {carInfo[formData.carPlate]}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <DatePicker
                label="Rent Date *"
                value={formData.rentDate}
                onChange={handleDateChange('rentDate')}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: !validateDates(formData.rentDate, formData.returnDate)
                  } 
                }}
              />
              
              <DatePicker
                label="Return Date *"
                value={formData.returnDate}
                onChange={handleDateChange('returnDate')}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: !validateDates(formData.rentDate, formData.returnDate)
                  } 
                }}
                minDate={formData.rentDate}
              />

              <TextField
                select
                label="Car Plate *"
                value={formData.carPlate}
                onChange={handleCarChange}
                fullWidth
                error={Boolean(error && error.includes(formData.carPlate))}
              >
                {carPlates.map((plate) => (
                  <MenuItem key={plate} value={plate}>
                    {plate} {carInfo[plate] && `(${carInfo[plate]} - ${carLocation[plate]})`}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Person *"
                value={formData.person}
                onChange={(e) => setFormData(prev => ({ ...prev, person: e.target.value }))}
                fullWidth
              />

              <TextField
                label="Destination *"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                fullWidth
              />

              <TextField
                label="Additional Info"
                value={formData.info}
                onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={Boolean(error)}
          >
            Add Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Confirmation Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setPassword('');
          setPasswordError('');
        }}
      >
        <DialogTitle>Enter Admin Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {passwordError && (
              <Alert severity="error">
                {passwordError}
              </Alert>
            )}
            <TextField
              autoFocus
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPasswordDialogOpen(false);
              setPassword('');
              setPasswordError('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordSubmit}
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBookingFab;