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
import { theme } from './theme/theme';
import AddBookingFab from './components/AddBookingFab';
import { carInfo, activeCars, carRegion, carRegionColor, carColors } from './config/carConfig';

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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
    <CardContent sx={{ py: 2.5, px: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mb: 1,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
            }}
          >
            Booking #{booking.rentID}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500,
              fontSize: '0.9375rem',
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            {booking.carPlate}
            {carInfo[booking.carPlate] && (
              <Typography 
                component="span" 
                sx={{ 
                  ml: 1,
                  color: 'text.secondary',
                  fontSize: '0.8125rem',
                }}
              >
                {carInfo[booking.carPlate]}
              </Typography>
            )}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.8125rem',
            }}
          >
            {`${booking.rentDate} ~ ${booking.returnDate}`}
          </Typography>
        </Box>
        <IconButton 
          sx={{ 
            transform: expandedId === booking.rentID ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            p: 1,
          }}
        >
          <ExpandMoreIcon sx={{ fontSize: '1.25rem' }} />
        </IconButton>
      </Box>

      <Fade in={expandedId === booking.rentID}>
        <Box sx={{ 
          mt: 2.5, 
          pt: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          display: expandedId === booking.rentID ? 'block' : 'none'
        }}>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>預約者姓名:</Box>
              {booking.person}
            </Typography>
            <Typography variant="body2">
              <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>預計出差地點:</Box>
              {booking.destination}
            </Typography>
            {booking.info && (
              <Typography variant="body2">
                <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>備注:</Box>
                {booking.info}
              </Typography>
            )}
          </Stack>
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
  const [addBookingData, setAddBookingData] = useState(null);
  const [showOccupied, setShowOccupied] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initialize Google auth when app loads
    apiService.getAllBookings().catch(console.error);
  }, []);

  const fetchBookings = async (shouldHideExpired) => {
    try {
      setInitialLoading(true);
      const data = await apiService.getAllBookings();
      console.log('Fetched data:', data.length, 'bookings');
      
      if (shouldHideExpired) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const filteredData = data.filter(booking => {
          const returnDate = new Date(booking.returnDate);
          returnDate.setHours(0, 0, 0, 0);
          
          const rentDate = new Date(booking.rentDate);
          rentDate.setHours(0, 0, 0, 0);
          
          return returnDate >= today || (rentDate <= today && returnDate >= today);
        });
        
        console.log('Filtered data (hiding expired):', filteredData.length, 'bookings');
        setBookings(filteredData);
      } else {
        console.log('Setting all data (showing expired):', data.length, 'bookings');
        setBookings(data);
      }
      
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
    fetchBookings(hideExpired);
  }, []);

  const calculateAvailableCars = useCallback(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const allCarPlates = activeCars;
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
  }, [selectedDate, bookings]);

  useEffect(() => {
    calculateAvailableCars();
  }, [selectedDate, bookings]);

  useEffect(() => {
    let ticking = false;
    let timeout;
    let lastScrollY = window.scrollY;
    const scrollThreshold = 30; // Reduced threshold for earlier response
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Start transition as soon as scrolling begins
      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            setIsScrolled(currentScrollY > 20); // Reduced threshold to start earlier
            ticking = false;
            lastScrollY = currentScrollY;
          });
          ticking = true;
        }
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
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const isExpired = (returnDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingReturnDate = new Date(returnDate);
    bookingReturnDate.setHours(0, 0, 0, 0);
    
    return bookingReturnDate < today;
  };

  const groupedBookings = useMemo(() => {
    console.log('Grouping bookings, total:', bookings.length);
    console.log('hideExpired is:', hideExpired);

    // First group all bookings by date
    const grouped = {};
    bookings.forEach(booking => {
      // Get all dates between rentDate and returnDate
      const rentDate = new Date(booking.rentDate);
      const returnDate = new Date(booking.returnDate);
      const currentDate = new Date(rentDate);

      while (currentDate <= returnDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(booking);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Sort all dates
    const sortedEntries = Object.entries(grouped)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));

    // Only filter by selected date if we're hiding expired
    if (hideExpired) {
      const compareDate = new Date(selectedDate);
      compareDate.setHours(0, 0, 0, 0);
      
      return sortedEntries.filter(([date]) => {
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= compareDate;
      });
    }

    return sortedEntries;
  }, [bookings, selectedDate, hideExpired]);

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
    <Box 
      className="availableCarsGrid"
      sx={{
        height: selectedRegion ? 'auto' : 0,
        opacity: selectedRegion ? 1 : 0,
        transform: selectedRegion ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        visibility: selectedRegion ? 'visible' : 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 100px)',
        gap: 1.2,
        justifyContent: 'start',
        mt: 2,
        pb: 2,
        px: 0.6,
        '& .carCard': {
          width: '100px',
          p: { xs: 1.5, sm: 1.5 },
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            opacity: 0.8,
          },
        },
      }}
    >
      {activeCars
        .filter(carPlate => carRegion[selectedRegion]?.includes(carPlate))
        .map((carPlate, index) => {
          const isAvailable = availableCars.includes(carPlate);
          
          if (!showOccupied && !isAvailable) return null;
          
          return (
            <Paper
              key={carPlate}
              onClick={() => handleCarClick(carPlate)}
              className="carCard"
              data-index={index}
              sx={{
                bgcolor: carColors[carPlate] || '#F5F5F5',
                opacity: isAvailable ? 1 : 0.5,
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '20px',
                p: { xs: 1.5, sm: 2 },
                minWidth: 0,
                width: '100%',
                '&:hover': {
                  transform: 'scale(1.05)',
                  opacity: 0.8,
                },
                '&::after': !isAvailable && showOccupied ? {
                  content: '"Occupied"',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-30deg)',
                  color: 'rgba(239, 68, 68, 0.4)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  textAlign: 'center',
                } : undefined,
              }}
            >
              <Typography 
                className="plateNumber"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  opacity: isAvailable ? 1 : 0.3,
                }}
              >
                {carPlate}
              </Typography>
              {carInfo[carPlate] && (
                <Typography 
                  className="carInfo"
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    mt: 0.5,
                    opacity: isAvailable ? 0.8 : 0.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {carInfo[carPlate]}
                </Typography>
              )}
            </Paper>
          );
        })}
    </Box>
  );

  const handleHideExpiredToggle = async (event) => {
    const newHideExpired = event.target.checked;
    console.log('Toggle switched to:', newHideExpired ? 'hide expired' : 'show all');
    setHideExpired(newHideExpired);
    await fetchBookings(newHideExpired);
    console.log('Current bookings after toggle:', bookings.length);
  };

  const handlePreFilledBooking = ({ carPlate, rentDate }) => {
    setAddBookingData({ carPlate, rentDate });
  };

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
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
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
                sx={{
                  '& .availableCarsGrid': {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: { xs: 0.75, sm: 1.5 },
                    mt: 2,
                    pb: 0.2,
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  {/* Title and switches */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: isScrolled ? 0 : 2
                  }} className="headerSection">
                    <Typography 
                      variant="h4" 
                      className="headerTitle"
                      sx={{ 
                        color: 'text.primary',
                        transition: 'all 0.2s ease',
                        fontSize: { xs: '20px', sm: '24px' },
                        cursor: isScrolled ? 'pointer' : 'default',
                      }}
                    >
                      WECC Car Bookings
                    </Typography>

                    <Stack 
                      direction="column" 
                      spacing={0}
                      alignItems="flex-end"
                      className="switchesSection"
                      sx={{
                        '& .MuiFormControlLabel-root': {
                          marginRight: 0,
                          marginLeft: 0,
                          justifyContent: 'flex-start',
                          height: 24,
                          py: 0.25,
                          pr: { xs: 0, sm: 0 },
                          minWidth: '140px',
                        },
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                        },
                        '& .MuiSwitch-root': {
                          marginRight: 1,
                        },
                      }}
                    >
                      <FormControlLabel
                        className="switchControl"
                        control={
                          <Switch
                            checked={hideExpired}
                            onChange={handleHideExpiredToggle}
                            size="small"
                          />
                        }
                        label="Hide Expired"
                        sx={{ width: '100%' }}
                      />
                      <FormControlLabel
                        className="switchControl"
                        control={
                          <Switch
                            checked={showOccupied}
                            onChange={(e) => setShowOccupied(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Show Occupied"
                        sx={{ width: '100%' }}
                      />
                    </Stack>
                  </Box>

                  {/* Date section */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: isScrolled && !isExpanded ? 0 : 'auto',
                    opacity: isScrolled && !isExpanded ? 0 : 1,
                    visibility: isScrolled && !isExpanded ? 'hidden' : 'visible',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                    px: 1,
                  }}>
                    <Box sx={{ position: 'relative', minHeight: '70px' }}>
                      <Box sx={{ position: 'relative' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            mb: 0.8,
                          }}
                        >
                          Available on {' '}
                          <Button
                            id="date-select-button"
                            onClick={() => setIsCalendarOpen(true)}
                            variant="contained"
                            sx={{
                              textTransform: 'none',
                              bgcolor: 'rgba(0,0,0,0.08)',
                              color: 'text.primary',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                              minWidth: 'auto',
                              px: 2,
                              py: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.08)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                              },
                            }}
                          >
                            {format(selectedDate, 'MMM d') === format(new Date(), 'MMM d') 
                              ? 'Today'
                              : format(selectedDate, 'MMM d')}
                          </Button>
                        </Typography>

                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            flex: '0 1 auto',
                            minWidth: 0,
                            maxWidth: '280px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {formatDate(selectedDate)}
                        </Typography>

                        {/* Region dots - aligned with switches */}
                        <Box 
                          className="regionDots"
                          sx={{ 
                            display: 'flex',
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: { xs: 1, sm: 1.5 },
                            position: 'absolute',
                            right: { 
                              xs: 16,
                              sm: 24,
                            },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: '100%',
                            width: { xs: '54px', sm: 'auto' },
                            paddingRight: { xs: 0, sm: 0 },
                          }}
                        >
                          {Object.entries(carRegion).map(([region, cars]) => {
                            const hasAvailableCars = cars.some(car => availableCars.includes(car));
                            const regionColor = carRegionColor[region];
                            const isSelected = selectedRegion === region;
                            
                            return (
                              <Box
                                key={region}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isScrolled && !isExpanded) return;
                                  setSelectedRegion(isSelected ? null : region);
                                }}
                                sx={{
                                  width: { xs: 22, sm: 22 },
                                  height: { xs: 22, sm: 22 },
                                  borderRadius: '50%',
                                  bgcolor: hasAvailableCars ? regionColor : '#F5F5F5',
                                  opacity: hasAvailableCars ? 1 : 0.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                                  boxShadow: isSelected 
                                    ? `0 4px 12px #1e1e1e1a`
                                    : '0 2px 8px rgba(0,0,0,0.15)',
                                  '&:hover': {
                                    transform: 'scale(1.2)',
                                    boxShadow: `0 4px 12px #1e1e1e1a`,
                                  },
                                  '&:active': {
                                    transform: 'scale(1.4)',
                                    opacity: 1,
                                    boxShadow: `0 4px 12px #1e1e1e1a`,
                                  },
                                  position: 'relative',
                                  zIndex: 1,
                                  '&::before': isSelected ? {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '50%',
                                    boxShadow: `0 4px 12px #1e1e1e1a`,
                                    zIndex: -1,
                                  } : undefined,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: isSelected 
                                      ? { xs: '0.6rem', sm: '0.8rem' }
                                      : { xs: '0.55rem', sm: '0.65rem' },
                                    fontWeight: isSelected ? 800 : 600,
                                    transform: isSelected ? 'scale(0.9)' : 'scale(1)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  }}
                                >
                                  {region}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box className="hideWhenScrolled" sx={{ 
                  display: selectedRegion && (!isScrolled || isExpanded) ? 'block' : 'none',
                  mb: 0,
                  height: selectedRegion && (!isScrolled || isExpanded) ? 'auto' : '0px',
                  opacity: selectedRegion && (!isScrolled || isExpanded) ? 1 : 0,
                  transform: selectedRegion && (!isScrolled || isExpanded) 
                    ? 'translateY(0)' 
                    : 'translateY(-20px)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  willChange: 'transform, opacity, height',
                  transformOrigin: 'top',
                }}>
                  <Box sx={{ 
                    transform: selectedRegion ? 'scaleY(1)' : 'scaleY(0)',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformOrigin: 'top',
                  }}>
                    {availableCarsSection}
                  </Box>
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
            onAddBooking={handlePreFilledBooking}
            carInfo={carInfo}
          />
        </Suspense>
      )}
      <AddBookingFab 
        onAddBooking={handleAddBooking} 
        bookings={bookings}
        prefilledData={addBookingData}
        onPrefilledDataUsed={() => setAddBookingData(null)}
      />
    </ThemeProvider>
  );
}

export default App;
