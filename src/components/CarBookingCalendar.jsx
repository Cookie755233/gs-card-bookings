import { Box, Typography, Button, Badge } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { carColors } from '../theme/theme';

export const CarBookingCalendar = ({ carPlate, bookings, onClose }) => {
  const carBookings = bookings.filter(booking => booking.carPlate === carPlate);

  const renderDayWithBookings = (dayProps) => {
    const {
      day,
      outsideCurrentMonth,
      ...other
    } = dayProps;

    const isBooked = carBookings.some(booking => {
      try {
        const rentDate = new Date(booking.rentDate);
        const returnDate = new Date(booking.returnDate);
        const checkDate = new Date(day);
        
        rentDate.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        
        return checkDate >= rentDate && checkDate <= returnDate;
      } catch (err) {
        console.error('Date parsing error:', err);
        return false;
      }
    });

    const today = new Date();
    const isToday = day.getDate() === today.getDate() &&
                    day.getMonth() === today.getMonth() &&
                    day.getFullYear() === today.getFullYear();

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={isBooked && !outsideCurrentMonth ? '●' : undefined}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: 'transparent',
            color: carColors[carPlate] ? carColors[carPlate].replace(/[0-9a-f]{2}$/i, '80') : '#666',
            right: '50%',
            top: '50%',
            transform: 'translate(50%, -50%)',
            fontSize: '25px',
            pointerEvents: 'none',
          }
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: outsideCurrentMonth ? 0.5 : 1,
            position: 'relative',
            fontWeight: isToday ? 'bold' : 'normal',
            textDecoration: isToday ? 'underline' : 'none',
          }}
          {...other}
        >
          {format(day, 'd')}
        </Box>
      </Badge>
    );
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'white',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        p: 2,
        zIndex: 1300,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Bookings for {carPlate}</Typography>
        <Button onClick={onClose}>Close</Button>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          slots={{
            day: renderDayWithBookings
          }}
          slotProps={{
            actionBar: { actions: [] },
            layout: {
              sx: {
                '& .MuiPickersCalendarHeader-root': {
                  paddingLeft: 2,
                  paddingRight: 2,
                  marginTop: 1,
                },
                '& .MuiDayCalendar-weekContainer': {
                  margin: '8px 0',
                },
                '& .MuiPickersDay-root': {
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  margin: '0 2px',
                },
              }
            }
          }}
          sx={{
            width: '100%',
            maxWidth: '400px',
            mx: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            '& .MuiPickersCalendarHeader-label': {
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}; 