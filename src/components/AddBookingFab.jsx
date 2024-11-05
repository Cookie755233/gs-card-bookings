import { useState } from 'react';
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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';

const locations = [
  "屏東外辦",
  "屏東綠辦",
  "高雄辦",
  "高雄漁電",
  "台南辦",
  "台東辦"
];

const carPlates = [
  "BJK-0596",
  "RFC-3623",
  "RDJ-0550",
  "RFJ-0812",
  "BCL-7376",
  "RBH-9726",
  "BJH-9755",
  "BNJ-0027",
  "RDQ-2200",
  "REA-2063",
  "RFH-2963",
  "RFJ-2180"
];

const AddBookingFab = ({ onAddBooking, bookings }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    rentDate: null,
    returnDate: null,
    carLocation: '',
    carPlate: '',
    person: '',
    destination: '',
    info: ''
  });

  const validateDates = (rentDate, returnDate) => {
    if (!rentDate || !returnDate) return true;
    return isAfter(returnDate, rentDate) || isEqual(returnDate, rentDate);
  };

  const isCarAvailable = (carPlate, startDate, endDate) => {
    if (!startDate || !endDate || !carPlate) return true;

    // Convert dates to comparable format
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Check for overlapping bookings
    const conflictingBooking = bookings.find(booking => {
      const bookingStart = new Date(booking.rentDate);
      const bookingEnd = new Date(booking.returnDate);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(0, 0, 0, 0);

      return (
        booking.carPlate === carPlate &&
        (
          // Check if the new booking overlaps with existing booking
          (start <= bookingEnd && end >= bookingStart) ||
          (start >= bookingStart && start <= bookingEnd) ||
          (end >= bookingStart && end <= bookingEnd)
        )
      );
    });

    return !conflictingBooking;
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

    try {
      await onAddBooking({
        ...formData,
        rentDate: formData.rentDate.toISOString().split('T')[0],
        returnDate: formData.returnDate.toISOString().split('T')[0]
      });
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
    } catch (error) {
      setError('Failed to add booking. Please try again.');
      console.error(error);
    }
  };

  // Check availability when dates or car changes
  const handleDateChange = (field) => (newValue) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: newValue };
      setError('');
      
      // Only check availability if we have all required data
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
      const newData = { ...prev, carPlate: newCarPlate };
      setError('');
      
      // Check availability if we have all required data
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
        <DialogTitle>Add New Car Booking</DialogTitle>
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
                label="Car Location *"
                value={formData.carLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, carLocation: e.target.value }))}
                fullWidth
              >
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>

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
                    {plate}
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
    </>
  );
};

export default AddBookingFab;