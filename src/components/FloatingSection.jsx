import { Paper, Box } from '@mui/material';
import { useState } from 'react';

const FloatingSection = ({ children, isScrolled, calendar }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHeaderClick = () => {
    if (isScrolled) {
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
          cursor: isScrolled ? 'pointer' : 'default',
          '&:hover': {
            transform: isScrolled ? 'translateY(-2px)' : 'none',
            boxShadow: isScrolled ? '0 12px 36px rgba(0, 0, 0, 0.12)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
          },
          '& .headerSection': {
            cursor: isScrolled ? 'pointer' : 'default',
          },
          '& .hideWhenScrolled': {
            opacity: isScrolled && !isExpanded ? 0 : 1,
            visibility: isScrolled && !isExpanded ? 'hidden' : 'visible',
            transition: 'opacity 0.3s ease, visibility 0.3s ease',
            maxHeight: isScrolled && !isExpanded ? '0' : '1000px',
            overflow: 'hidden',
          },
          '& .availableCarsGrid': {
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: { xs: 1, sm: 1.5 },
            mt: 2,
            '& .carCard': {
              p: { xs: 1, sm: 1.5 },
              borderRadius: 1,
              width: '100%',
              minWidth: 'unset',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              '& .plateNumber': {
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                letterSpacing: '0.5px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              },
              '& .carInfo': {
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                mt: 0.5,
                opacity: 0.8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
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