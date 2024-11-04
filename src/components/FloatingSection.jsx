import { Paper } from '@mui/material';

export const FloatingSection = ({ children, isScrolled, calendar }) => (
  <Paper
    sx={{
      position: 'sticky',
      top: { xs: 8, sm: 16 },
      zIndex: 2,
      p: { xs: 2, sm: 3 },
      borderRadius: { xs: '16px', sm: '20px' },
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      mb: 3,
      transition: 'all 0.3s ease',
      height: isScrolled ? '80px' : 'auto',
      overflow: isScrolled ? 'hidden' : 'visible',
      '& .hideWhenScrolled': {
        opacity: isScrolled ? 0 : 1,
        visibility: isScrolled ? 'hidden' : 'visible',
        transition: 'all 0.3s ease',
        height: isScrolled ? 0 : 'auto',
        overflow: 'hidden',
      },
    }}
  >
    {children}
    {calendar}
  </Paper>
); 