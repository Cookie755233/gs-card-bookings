import { Paper, Box } from '@mui/material';
import { useState, useEffect } from 'react';

const FloatingSection = ({ children, isScrolled, calendar, isExpanded, setIsExpanded }) => {
  useEffect(() => {
    if (isScrolled) {
      setIsExpanded(false);
    }
  }, [isScrolled, setIsExpanded]);

  const handleHeaderClick = (e) => {
    if (isScrolled && 
        (e.target.closest('.headerTitle') || 
         (!e.target.closest('.regionDots') && 
          !e.target.closest('#date-select-button') && 
          !e.target.closest('.availableCarsGrid') &&
          !e.target.closest('.switchesSection') &&
          !e.target.closest('.switchControl')))) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      {/* Glass effect overlay */}
      {isScrolled && (
        <Box
          sx={{
            position: 'fixed',
            top: -13,
            left: 0,
            right: 0,
            height: { xs: '100px', sm: '140px' },
            zIndex: 1200,
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 25%, rgba(255, 255, 255, 0.95) 60%, rgba(255, 255, 255, 0) 100%)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.4) 25%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }
          }}
        />
      )}
      
      <Paper
        sx={{
          position: 'sticky',
          top: { xs: 8, sm: 16 },
          zIndex: 1201,
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: '16px', sm: '20px' },
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          mb: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: isScrolled && !isExpanded ? '80px' : '1000px',
          overflow: 'hidden',
          willChange: 'max-height, transform',
          cursor: 'default',
          '&:hover': {
            transform: isScrolled ? 'translateY(-2px)' : 'none',
            boxShadow: isScrolled ? '0 12px 36px rgba(0, 0, 0, 0.12)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
          },
          '& .headerTitle': {
            cursor: isScrolled ? 'pointer' : 'default',
          },
          '& .hideWhenScrolled': {
            opacity: isScrolled && !isExpanded ? 0 : 1,
            visibility: isScrolled && !isExpanded ? 'hidden' : 'visible',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          },
        }}
        onClick={handleHeaderClick}
      >
        {children}
        {calendar}
      </Paper>
    </>
  );
};

export default FloatingSection; 