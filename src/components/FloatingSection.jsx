import { Paper, Box } from '@mui/material';

const FloatingSection = ({ children, isScrolled, calendar }) => (
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
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        maxHeight: isScrolled ? '80px' : '1000px',
        overflow: 'hidden',
        willChange: 'max-height, transform',
        '& .hideWhenScrolled': {
          opacity: isScrolled ? 0 : 1,
          visibility: isScrolled ? 'hidden' : 'visible',
          transition: 'opacity 0.15s ease, visibility 0.15s ease',
          maxHeight: isScrolled ? '0' : '1000px',
          overflow: 'hidden',
        },
      }}
    >
      {children}
      {calendar}
    </Paper>
  </>
);

export default FloatingSection; 