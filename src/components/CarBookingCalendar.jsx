import { Box, Typography, Button, Badge, Card, CardContent, Fade, Stack } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { carColors } from '../theme/theme';
import { useState, useEffect } from 'react';

const CarBookingCalendar = ({ carPlate, bookings, onClose, hideExpired, onAddBooking }) => {
  const [selectedBookings, setSelectedBookings] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  
  // Show calendar after mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);
  
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

  const renderDayWithBookings = (props) => {
    const {
      day,
      outsideCurrentMonth,
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
    currentDate.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(day);
    checkDate.setHours(0, 0, 0, 0);
    
    const isToday = checkDate.getTime() === currentDate.getTime();
    const isPast = checkDate < currentDate;

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={
          isBooked && !outsideCurrentMonth ? (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                if (isBooked) {
                  setSelectedBookings(dayBookings);
                  setSelectedDate(day);
                }
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '30px',
                color: carColors[carPlate],
                '&:hover': {
                  transform: 'scale(1)',
                },
                transition: 'transform 0.2s ease',
                opacity: 1,
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
            top: '50%',
            transform: 'translate(50%, -50%)',
            pointerEvents: 'auto',
          }
        }}
      >
        <Box
          onClick={() => {
            if (isBooked) {
              setSelectedBookings(dayBookings);
              setSelectedDate(day);
            } else if (!isBooked && !outsideCurrentMonth && !isPast && !isToday) {
              onClose();
              onAddBooking({ carPlate, rentDate: day });
            }
          }}
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
            color: isToday ? 'white' : isPast ? '#9e9e9e' : 'inherit',
            cursor: (isBooked || (!isBooked && !outsideCurrentMonth && !isPast && !isToday)) ? 'pointer' : 'default',
            '&:hover': {
              bgcolor: (isBooked || (!isBooked && !outsideCurrentMonth && !isPast && !isToday)) 
                ? 'rgba(0,0,0,0.04)' 
                : undefined,
            },
          }}
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
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          visibility: isVisible ? 'visible' : 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#E0E0E0',
            borderRadius: '4px',
            '&:hover': {
              background: '#BDBDBD',
            },
          },
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
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
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
              day: {
                outsideCurrentMonth: true,
              },
              previousIconButton: {
                sx: { 
                  color: 'action.active',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }
              },
              nextIconButton: {
                sx: { 
                  color: 'action.active',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }
              }
            }}
            sx={{
              width: '100%',
              maxWidth: '400px',
              mx: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiPickersCalendarHeader-root': {
                '& .MuiIconButton-root': {
                  color: 'action.active',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&.Mui-disabled': {
                    display: 'none',
                  }
                }
              }
            }}
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
              fontSize: '0.5rem',
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
        <Fade in={selectedBookings !== null} timeout={{ enter: 300, exit: 200 }}>
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
              willChange: 'transform, opacity',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother transition
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
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#E0E0E0',
                borderRadius: '4px',
                '&:hover': {
                  background: '#BDBDBD',
                },
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
                  Bookings for {carPlate} on {format(selectedDate, 'MMM d, yyyy')}
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