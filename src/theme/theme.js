import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
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
      fontSize: { xs: '24px', sm: '32px' },
      background: 'linear-gradient(45deg, #007AFF, #5856D6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      fontSize: { xs: '16px', sm: '18px' },
    },
    body1: {
      fontSize: { xs: '15px', sm: '17px' },
    },
    body2: {
      fontSize: { xs: '13px', sm: '15px' },
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: { xs: '12px', sm: '16px' },
          maxWidth: '100%',
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