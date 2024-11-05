import { lazy, Suspense, memo } from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import Badge from '@mui/material/Badge';
import { theme, carColors } from './theme/theme';

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const FloatingSection = lazy(() => import('./components/FloatingSection'));
const CarBookingCalendar = lazy(() => import('./components/CarBookingCalendar'));

const BookingCard = memo(({ booking, expandedId, handleCardClick, isExpired, carColors, theme }) => (
  <Card 
    data-booking-card
    key={booking.id}
    sx={{ 
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { 
        transform: { xs: 'none', sm: 'translateY(-4px) scale(1.02)' },
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
      },
      bgcolor: isExpired(booking.returnDate) 
        ? '#eeeeee'
        : carColors[booking.carPlate] || '#FFFFFF',
      width: '100%',
      maxWidth: 'none',
      mx: 'auto',
      position: 'relative',
      pl: { xs: 4.5, sm: 6, md: 8 },
      ml: { xs: 2, sm: 4, md: 5 },
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
        left: { xs: 12, sm: 16 },
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
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        fontFamily: theme.typography.fontFamily,
        zIndex: 1,
      }}
    >
      {booking.rentID}
    </Box>

    <CardContent sx={{ py: { xs: 2, sm: 2 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        ml: { xs: 0.5, sm: 1 }
      }}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '0.85rem', sm: '0.85rem' },
              mb: 1,
              lineHeight: { xs: 1.3, sm: 1.5 }
            }}
          >
            {`${booking.rentDate}~${booking.returnDate}`}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.8rem', sm: '0.8rem' }
            }}
          >
            {booking.carPlate}
            {booking.carLocation && ` (${booking.carLocation})`}
          </Typography>
        </Box>
        <IconButton 
          sx={{ 
            transform: expandedId === booking.rentID ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Fade in={expandedId === booking.rentID}>
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          display: expandedId === booking.rentID ? 'block' : 'none'
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
));

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [allBookingsLoaded, setAllBookingsLoaded] = useState(false);

  const fetchBookings = async () => {
    try {
      setInitialLoading(true);
      const data = await apiService.getAllBookings();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const currentBookings = data.filter(booking => {
        const returnDate = new Date(booking.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        return returnDate >= today;
      });
      
      setBookings(currentBookings);
      setAllBookings(data);
      setAllBookingsLoaded(true);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!allBookingsLoaded) return;
    
    if (hideExpired) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filteredBookings = allBookings.filter(booking => {
        const returnDate = new Date(booking.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        return returnDate >= today;
      });
      
      setBookings(filteredBookings);
    } else {
      setBookings(allBookings);
    }
  }, [hideExpired, allBookingsLoaded, allBookings]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const calculateAvailableCars = useCallback(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const allCarPlates = Object.keys(carColors);
    const checkDate = new Date(dateStr);
    checkDate.setHours(0, 0, 0, 0);
    
    const busyCarPlates = new Set(
      bookings
        .filter(booking => {
          const rentDate = new Date(booking.rentDate);
          const returnDate = new Date(booking.returnDate);
          rentDate.setHours(0, 0, 0, 0);
          returnDate.setHours(0, 0, 0, 0);
          return checkDate >= rentDate && checkDate <= returnDate;
        })
        .map(booking => booking.carPlate)
    );
    
    setAvailableCars(allCarPlates.filter(car => !busyCarPlates.has(car)));
  }, [selectedDate, bookings, carColors]);

  useEffect(() => {
    calculateAvailableCars();
  }, [selectedDate, bookings]);

  useEffect(() => {
    let ticking = false;
    let timeout;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
      
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        const cards = document.querySelectorAll('[data-booking-card]');
        let closestCard = null;
        let minDistance = Infinity;
        
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
          }
        });
        
        if (closestCard) {
          closestCard.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const groupedBookings = useMemo(() => {
    const grouped = {};
    bookings.forEach(booking => {
      const rentDate = booking.rentDate;
      if (!grouped[rentDate]) {
        grouped[rentDate] = [];
      }
      grouped[rentDate].push(booking);
    });
    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [bookings]);

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

  const handleCardClick = (rentID) => {
    setExpandedId(expandedId === rentID ? null : rentID);
  };

  const isExpired = (returnDate) => {
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    
    const bookingReturnDate = new Date(returnDate);
    bookingReturnDate.setHours(0, 0, 0, 0);
    
    return bookingReturnDate < compareDate;
  };

  const getBookingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => {
      const rentDate = booking.rentDate;
      const returnDate = booking.returnDate;
      return rentDate <= dateStr && returnDate >= dateStr;
    });
  };

  const handleCarClick = (carPlate) => {
    setSelectedCar(null);
    setTimeout(() => setSelectedCar(carPlate), 0);
  };

  const availableCarsSection = (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
      {availableCars.map(carPlate => (
        <Paper
          key={carPlate}
          onClick={() => handleCarClick(carPlate)}
          sx={{
            p: 1,
            bgcolor: carColors[carPlate] || '#F5F5F5',
            borderRadius: 1,
            minWidth: '90px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
            },
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
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 2, md: 3 }
          }}
        >
          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Suspense fallback={null}>
              <FloatingSection 
                isScrolled={isScrolled}
                calendar={
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
                }
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: isScrolled ? 0 : 3
                }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: 'text.primary',
                      transition: 'all 0.2s ease',
                      fontSize: { xs: '20px', sm: '24px' },
                    }}
                  >
                    WECC Car Bookings
                  </Typography>

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

                <Box className="hideWhenScrolled">
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
                            Available on {' '}
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
                        </Box>
                      </Box>
                      {availableCarsSection}
                    </Box>
                  )}
                </Box>
              </FloatingSection>
            </Suspense>

            {/* Bookings Section */}
            {initialLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={40} />
              </Box>
            ) : error ? (
              <Paper sx={{ p: 3, bgcolor: '#FFE5E5', color: '#FF3B30', borderRadius: 2 }}>
                <Typography>{error}</Typography>
              </Paper>
            ) : (
              <Suspense fallback={null}>
                <Stack spacing={4}>
                  {groupedBookings.map(([date, dateBookings]) => (
                    <Box key={date}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2,
                          fontSize: '1rem',  // Increased from default
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                        {formatDate(new Date(date))}
                      </Typography>
                      <Stack spacing={2}>
                        {dateBookings.map((booking) => (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            expandedId={expandedId}
                            handleCardClick={handleCardClick}
                            isExpired={isExpired}
                            carColors={carColors}
                            theme={theme}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Suspense>
            )}
          </Stack>
        </Container>
      </Box>
      {selectedCar && (
        <Suspense fallback={null}>
          <CarBookingCalendar
            carPlate={selectedCar}
            bookings={bookings}
            onClose={() => setSelectedCar(null)}
            hideExpired={hideExpired}
          />
        </Suspense>
      )}
    </ThemeProvider>
  );
}

export default App;
