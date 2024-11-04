import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  CircularProgress,
  IconButton,
  Fade,
  Paper,
  Switch,
  FormControlLabel,
  Stack,
  Grid,
  Button,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { apiService } from './services/apiService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

// Car color mapping based on carPlate with lower opacity colors
const carColors = {
  'BJK-0596': '#b4ddf333',
  'RFC-3623': '#b4ddf333',
  'RDJ-0550': '#b4ddf333',
  'RFJ-0812': '#b4ddf333',
  'BCL-7376': '#ffc2e266',
  'RBH-9726': '#ffc2e266',
  'BJH-9755': '#ffe09b66',
  'BNJ-0027': '#cce9b7',
  'RDQ-2200': '#e4c9eedd',
  'REA-2063': '#00674433',
  'RFH-2963': '#ffc9c399',
  'RFJ-2180': '#ffc9c399',
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
    },
    background: {
      default: 'linear-gradient(145deg, #F2F2F7 0%, #E8ECF4 100%)',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '32px',
      background: 'linear-gradient(45deg, #007AFF, #5856D6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      fontSize: '18px',
    },
    body1: {
      fontSize: '17px',
    },
    body2: {
      fontSize: '15px',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          maxWidth: '600px',
          margin: '0 auto',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const FloatingSection = ({ children }) => (
  <Paper
    sx={{
      position: 'sticky',
      top: 16,
      zIndex: 2,
      p: 3,
      borderRadius: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      mb: 3,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '20px',
        padding: '2px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      },
    }}
  >
    {children}
  </Paper>
);

function App() {
  console.log('App component rendering');
  const [bookings, setBookings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideExpired, setHideExpired] = useState(true);
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    calculateAvailableCars();
  }, [bookings]);

  useEffect(() => {
    calculateAvailableCars();
  }, [selectedDate, bookings, hideExpired]);

  const calculateAvailableCars = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Get all unique car plates
    const allCarPlates = Object.keys(carColors);
    
    // Find busy cars on selected date
    const busyCarPlates = bookings
      .filter(booking => {
        // Check if selected date falls within the booking range (inclusive)
        const rentDate = new Date(booking.rentDate);
        const returnDate = new Date(booking.returnDate);
        const checkDate = new Date(dateStr);
        
        // Set all times to midnight for proper comparison
        rentDate.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        
        return checkDate >= rentDate && checkDate <= returnDate;
      })
      .map(booking => booking.carPlate);
    
    setAvailableCars(allCarPlates.filter(car => !busyCarPlates.includes(car)));
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = async (newBooking) => {
    try {
      const created = await apiService.createBooking(newBooking);
      setBookings(prev => [...prev, created]);
    } catch (err) {
      console.error('Failed to create booking:', err);
    }
  };

  const handleUpdateBooking = async (id, updatedBooking) => {
    try {
      const updated = await apiService.updateBooking(id, updatedBooking);
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updated : booking
      ));
    } catch (err) {
      console.error('Failed to update booking:', err);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await apiService.deleteBooking(id);
      setBookings(prev => prev.filter(booking => booking.id !== id));
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleCardClick = (id) => {
    setExpandedId(id);
  };

  const filterBookings = (bookings) => {
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    
    return bookings.filter(booking => {
      const returnDate = new Date(booking.returnDate);
      returnDate.setHours(0, 0, 0, 0);
      
      if (hideExpired) {
        return returnDate >= compareDate;
      }
      return true;
    });
  };

  const isExpired = (returnDate) => {
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    
    const bookingReturnDate = new Date(returnDate);
    bookingReturnDate.setHours(0, 0, 0, 0);
    
    return bookingReturnDate < compareDate;
  };

  const groupBookingsByDate = (bookings) => {
    const grouped = {};
    bookings.forEach(booking => {
      const rentDate = booking.rentDate;
      if (!grouped[rentDate]) {
        grouped[rentDate] = [];
      }
      grouped[rentDate].push(booking);
    });
    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const getBookingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => {
      const rentDate = booking.rentDate;
      const returnDate = booking.returnDate;
      return rentDate <= dateStr && returnDate >= dateStr;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <FloatingSection>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'text.primary',
                  mb: 3
                }}
              >
                WECC Car Bookings
              </Typography>

              {availableCars.length >= 0 && (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 1
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                        }}
                      >
                        Available Cars on{' '}
                        <Button
                          id="date-select-button"
                          onClick={() => setIsCalendarOpen(true)}
                          variant="contained"
                          sx={{
                            textTransform: 'none',
                            bgcolor: 'rgba(0,0,0,0.04)',
                            color: 'text.primary',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            minWidth: 'auto',
                            px: 2,
                            py: 0.5,
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.08)',
                              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                            },
                          }}
                        >
                          {format(selectedDate, 'MMM d') === format(new Date(), 'MMM d') 
                            ? 'Today'
                            : format(selectedDate, 'MMM d')}
                        </Button>
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, ml: 1 }}>
                        {formatDate(selectedDate)}
                      </Typography>

                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          open={isCalendarOpen}
                          onClose={() => setIsCalendarOpen(false)}
                          value={selectedDate}
                          onChange={(newValue) => {
                            setSelectedDate(newValue);
                            setIsCalendarOpen(false);
                          }}
                          PopperProps={{
                            anchorEl: document.getElementById('date-select-button'),
                            placement: "bottom-start",
                          }}
                          slotProps={{
                            textField: {
                              sx: { display: 'none' }
                            },
                            popper: {
                              sx: {
                                zIndex: 1400,
                                '& .MuiPaper-root': {
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  borderRadius: 2,
                                }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hideExpired}
                          onChange={(e) => setHideExpired(e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Hide Expired
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {availableCars.map(carPlate => (
                      <Paper
                        key={carPlate}
                        sx={{
                          p: 1,
                          bgcolor: carColors[carPlate] || '#F5F5F5',
                          borderRadius: 1,
                          minWidth: '90px',
                          textAlign: 'center',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {carPlate}
                        </Typography>
                      </Paper>
                    ))}
                    {availableCars.length === 0 && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No cars available on this date
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </FloatingSection>

            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: 'blur(8px)',
                  zIndex: 1,
                  pointerEvents: 'none',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                },
                '&:hover::before': {
                  opacity: 0.1, // Subtle blur effect on hover
                },
              }}
            >
              {/* Bookings Section */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : error ? (
                <Paper sx={{ p: 3, bgcolor: '#FFE5E5', color: '#FF3B30', borderRadius: 2 }}>
                  <Typography>{error}</Typography>
                </Paper>
              ) : (
                <Stack spacing={4} sx={{ 
                  width: '100%',
                  maxWidth: { xs: '100%', lg: '1200px' },
                  mx: 'auto',
                  position: 'relative',
                  zIndex: 0,
                }}>
                  {groupBookingsByDate(filterBookings(bookings)).map(([date, dateBookings]) => (
                    <Box key={date}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2,
                          px: 2,
                          py: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        {formatDate(new Date(date))}
                      </Typography>
                      
                      <Stack spacing={2}>
                        {dateBookings.map((booking) => (
                          <Card 
                            key={booking.id}
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': { 
                                transform: 'translateY(-4px) scale(1.02)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                              },
                              bgcolor: isExpired(booking.returnDate) 
                                ? '#eeeeee'
                                : carColors[booking.carPlate] || '#FFFFFF',
                              width: '100%',
                              maxWidth: 'none',
                              mx: 'auto',
                              position: 'relative',
                              pl: { xs: 5, sm: 7 },
                              ml: { xs: 4, sm: 5 },
                              borderRadius: '16px',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.8))',
                                opacity: 0.5,
                              },
                            }}
                            onClick={() => handleCardClick(booking.rentID)}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: { xs: 16, sm: 20 },
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                                borderRadius: '50%',
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '2px solid',
                                borderColor: isExpired(booking.returnDate) 
                                  ? '#bdbdbd'
                                  : carColors[booking.carPlate]?.replace('22', '44') || '#e0e0e0',
                                color: isExpired(booking.returnDate)
                                  ? '#9e9e9e'
                                  : '#757575',
                                fontWeight: 'bold',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                fontFamily: theme.typography.fontFamily,
                                zIndex: 1,
                              }}
                            >
                              {booking.rentID}
                            </Box>

                            <CardContent>
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <Box>
                                  <Typography 
                                    variant="h5" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      fontSize: '1.5rem',
                                      mb: 1 
                                    }}
                                  >
                                    {`${booking.rentDate} ~ ${booking.returnDate}`}
                                  </Typography>
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      fontSize: '1.1rem'
                                    }}
                                  >
                                    {booking.carPlate}
                                    {booking.carLocation && ` (${booking.carLocation})`}
                                  </Typography>
                                </Box>
                                <IconButton 
                                  sx={{ 
                                    transform: expandedId === booking.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                  }}
                                >
                                  <ExpandMoreIcon />
                                </IconButton>
                              </Box>

                              <Fade in={expandedId === booking.id}>
                                <Box sx={{ 
                                  mt: 2, 
                                  pt: 2, 
                                  borderTop: '1px solid',
                                  borderColor: 'divider',
                                  display: expandedId === booking.id ? 'block' : 'none'
                                }}>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>預約者姓名:</strong> {booking.person}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>預計出差地點:</strong> {booking.destination}
                                  </Typography>
                                  {booking.info && (
                                    <Typography variant="body2">
                                      <strong>備注:</strong> {booking.info}
                                    </Typography>
                                  )}
                                </Box>
                              </Fade>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;