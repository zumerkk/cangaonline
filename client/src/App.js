import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login/Login';

// Bileşenler
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import FormerEmployees from './pages/FormerEmployees';
import TraineesAndApprentices from './pages/TraineesAndApprentices';
import PassengerList from './pages/PassengerList';
import Shifts from './pages/Shifts';
import CreateShift from './pages/CreateShift';
import QuickList from './pages/QuickList';
import Services from './pages/Services';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import DatabaseManagement from './pages/DatabaseManagement';
import Calendar from './pages/Calendar';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Tema konfigürasyonu - Canga markasına uygun renkler
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Mavi - güven ve teknoloji
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // Kırmızı - dinamizm ve güç
      light: '#ff6d75',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Düğme metinlerini küçük harfe çevirme
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #e0e0e0',
          },
        },
      },
    },
  },
});

// Protected Routes Component
function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Box sx={{ textAlign: 'center' }}>
          Çanga Vardiya Sistemi Yükleniyor...
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          {/* Ana Sayfa - Dashboard'a yönlendir */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Çalışanlar */}
          <Route path="/employees" element={<Employees />} />
          
          {/* 🚪 İşten Ayrılanlar */}
          <Route path="/former-employees" element={<FormerEmployees />} />
          
          {/* 🎓 Stajyer ve Çıraklar */}
          <Route path="/trainees-apprentices" element={<TraineesAndApprentices />} />
          
          {/* Yolcu Listesi */}
          <Route path="/passenger-list" element={<PassengerList />} />
          
          {/* Vardiyalar */}
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/shifts/create" element={<CreateShift />} />
          <Route path="/shifts/edit/:id" element={<CreateShift />} />
          
          {/* Hızlı Liste Oluştur */}
          <Route path="/quick-list" element={<QuickList />} />
          
          {/* Servis Yönetimi */}
          <Route path="/services" element={<Services />} />
          
          {/* Bildirimler */}
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Profil Yönetimi */}
          <Route path="/profile" element={<Profile />} />
          
          {/* MongoDB Veritabanı Yönetimi - Sadece ADMIN-001 için */}
          <Route path="/database" element={<DatabaseManagement />} />
          
          {/* Takvim/Ajanda */}
          <Route path="/calendar" element={<Calendar />} />
          
          {/* 📊 Analytics Dashboard */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          
          {/* 404 - Sayfa bulunamadı */}
          <Route path="*" element={
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '50vh',
                textAlign: 'center'
              }}
            >
              <h1>404 - Sayfa Bulunamadı</h1>
              <p>Aradığınız sayfa mevcut değil.</p>
            </Box>
          } />
        </Routes>
      </Layout>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ProtectedRoutes />
          
          {/* Toast bildirimleri */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#2e7d32',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#d32f2f',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 