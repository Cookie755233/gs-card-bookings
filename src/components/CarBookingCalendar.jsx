import { Box, Typography, Button, Badge, Card, CardContent, Fade, Stack } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { carColors } from '../theme/theme';
import { useState, useEffect } from 'react';

const CarBookingCalendar = ({ carPlate, bookings, onClose, hideExpired }) => {
  const [selectedBookings, setSelectedBookings] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isVisible, setIsVisible] = useState(true);
  
  // Filter bookings based on hideExpired
  const carBookings = bookings.filter(booking => {
    const isForThisCar = booking.carPlate === carPlate;
    if (!hideExpired) return isForThisCar;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const returnDate = new Date(booking.returnDate);
    returnDate.setHours(0, 0, 0, 0);
    
    return isForThisCar && returnDate >= today;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const removeColorTransparency = (color) => {
    return color.slice(0, -2);
  };

  const renderDayWithBookings = (props) => {
    const {
      day,
      outsideCurrentMonth,
      disableHighlightToday,
      showDaysOutsideCurrentMonth,
      isAnimating,
      isFirstVisibleCell,
      isLastVisibleCell,
      selected,
      today,
      onDaySelect,
      onClick,
      onMouseEnter,
      onFocus,
      ...other
    } = props;

    const dayBookings = carBookings.filter(booking => {
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

    const isBooked = dayBookings.length > 0;
    const currentDate = new Date();
    const isToday = day.getDate() === currentDate.getDate() &&
                    day.getMonth() === currentDate.getMonth() &&
                    day.getFullYear() === currentDate.getFullYear();

    const handleDotClick = (e) => {
      e.stopPropagation();
      if (isBooked) {
        setSelectedBookings(dayBookings);
        setSelectedDate(day);
      }
    };

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={
          isBooked && !outsideCurrentMonth ? (
            <Box
              onClick={handleDotClick}
              sx={{
                cursor: 'pointer',
                fontSize: '50px',
                color: carColors[carPlate],
                '&:hover': {
                  transform: 'scale(1)',
                },
                transition: 'transform 0.2s ease',
              }}
            >
              ●
            </Box>
          ) : undefined
        }
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: 'transparent',
            right: '50%',
            top: '30%',
            transform: 'translate(50%, -50%)',
            pointerEvents: 'auto',
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
            borderRadius: '50%',
            bgcolor: isToday ? '#007AFF' : 'transparent',
            color: isToday ? 'white' : 'inherit',
          }}
          {...other}
        >
          {format(day, 'd')}
        </Box>
      </Badge>
    );
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
          p: 2,
          zIndex: 1300,
          maxHeight: '80vh',
          overflowY: 'auto',
          transform: `translateY(${isVisible ? '0' : '100%'})`,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          visibility: isVisible ? 'visible' : 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          position: 'relative'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '1.4rem',
              fontWeight: 'bold',
            }}
          >
            Bookings for {carPlate}
          </Typography>
          <Button 
            onClick={onClose}
            variant="contained"
            sx={{ 
              bgcolor: '#007AFF',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,122,255,0.2)',
              '&:hover': {
                bgcolor: '#0063CC',
                boxShadow: '0 6px 16px rgba(0,122,255,0.3)',
              },
              textTransform: 'none',
              px: 3,
            }}
          >
            Close
          </Button>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            slots={{
              day: renderDayWithBookings
            }}
            value={calendarDate}
            onChange={setCalendarDate}
            slotProps={{
              actionBar: { actions: [] },
              day: { 
                selected: false,
                disableHighlightToday: true
              },
              toolbar: {
                hidden: true
              },
              layout: {
                sx: {
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: 2,
                    paddingRight: 2,
                    marginTop: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    '& .MuiPickersArrowSwitcher-root': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    },
                    '& .MuiPickersCalendarHeader-label': {
                      margin: 0,
                      order: 2,
                    },
                    '& .MuiButtonBase-root': {
                      order: 1,
                    },
                    '& .MuiPickersCalendarHeader-switchViewButton': {
                      order: 3,
                    }
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
            componentsProps={{
              leftArrowButton: {
                sx: { order: 1 }
              },
              rightArrowButton: {
                sx: { order: 3 }
              },
              switchViewButton: {
                sx: { display: 'none' }
              }
            }}
            ToolbarComponent={({ date, ...props }) => (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 2,
                py: 1,
              }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  {format(date, 'MMMM yyyy')}
                </Typography>
                <Button
                  onClick={() => {
                    const today = new Date();
                    setCalendarDate(today);
                  }}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    bgcolor: 'rgba(0,122,255,0.1)',
                    color: '#007AFF',
                    '&:hover': {
                      bgcolor: 'rgba(0,122,255,0.2)',
                    },
                    minWidth: 'auto',
                    px: 2,
                  }}
                >
                  Today
                </Button>
              </Box>
            )}
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
            readOnly
            disableHighlightToday
          />
        </LocalizationProvider>

        {/* Warning message for hidden expired bookings */}
        {hideExpired && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              color: 'text.secondary',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&::before': {
                content: '"ⓘ"',
                color: '#007AFF',
                fontSize: '1rem',
              }
            }}
          >
            Expired bookings are hidden when "Hide Expired" is toggled on.
          </Typography>
        )}

        {/* Selected bookings modal */}
        <Fade in={selectedBookings !== null} timeout={{ enter: 200, exit: 150 }}>
          <Card
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1400,
              width: '90%',
              maxWidth: 400,
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              bgcolor: 'white',
              borderRadius: '16px',
              p: 0,
              willChange: 'transform, opacity', // Improves performance
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
          >
            <CardContent sx={{ p: 2.5 }}>
              {selectedDate && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  Bookings for{' '}
                  <span style={{ 
                    color: removeColorTransparency(carColors[carPlate]),
                    fontWeight: 'bold' 
                  }}>
                    {carPlate}
                  </span>
                  {' '}on {format(selectedDate, 'MMM d, yyyy')}
                </Typography>
              )}
              <Stack spacing={1.5}>
                {selectedBookings?.map((booking, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 1,
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ fontWeight: 700, fontSize: '1rem' }}>租期:</strong> {booking.rentDate} ~ {booking.returnDate}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 1,
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ fontWeight: 700, fontSize: '1rem' }}>預約者姓名:</strong> {booking.person}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 1,
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ fontWeight: 700, fontSize: '1rem' }}>預計出差地點:</strong> {booking.destination}
                    </Typography>
                    {booking.info && (
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                        }}
                      >
                        <strong style={{ fontWeight: 700, fontSize: '1rem' }}>備注:</strong> {booking.info}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  onClick={() => setSelectedBookings(null)}
                  variant="contained"
                  sx={{ 
                    bgcolor: '#007AFF',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,122,255,0.2)',
                    '&:hover': {
                      bgcolor: '#0063CC',
                      boxShadow: '0 6px 16px rgba(0,122,255,0.3)',
                    },
                    textTransform: 'none',
                    px: 3,
                  }}
                >
                  Close
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </>
  );
};

export default CarBookingCalendar;