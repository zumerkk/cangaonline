import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CangaLogo from '../../assets/7ff0dçanga_logo-removebg-preview.png';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login } = useAuth();
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Enter tuşu ile giriş
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  // Giriş işlemi
  const handleLogin = async () => {
    if (!password.trim()) {
      setError('Lütfen şifrenizi girin');
      return;
    }

    try {
      const result = await login(password);
      
      if (!result.success) {
        setError(result.message || 'Giriş başarısız');
        // Şifre alanını temizle
        setPassword('');
      }
    } catch (error) {
      setError('Beklenmeyen bir hata oluştu');
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, 
            #1e3a8a 0%,     /* Koyu mavi - Çanga ana rengi */
            #2563eb 25%,    /* Parlak mavi */
            #dc2626 75%,    /* Çanga kırmızısı */
            #991b1b 100%    /* Koyu kırmızı */
          )
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Geometrik arka plan deseni - Çanga tarzı */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `
            radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 40px 40px',
          animation: 'float 8s ease-in-out infinite'
        }}
      />
      
      {/* Çanga logo pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(45deg, transparent 48%, rgba(220, 38, 38, 0.05) 49%, rgba(220, 38, 38, 0.05) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(30, 58, 138, 0.05) 49%, rgba(30, 58, 138, 0.05) 51%, transparent 52%)
          `,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Ana kontainer */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          zIndex: 1
        }}
      >
        {/* Çanga Logo - Profesyonel Tasarım */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: 4,
              p: 4,
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.15),
                0 8px 25px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent, rgba(30, 58, 138, 0.02), transparent)',
                borderRadius: 4,
                pointerEvents: 'none'
              }
            }}
          >
            <img 
              src={CangaLogo} 
              alt="Çanga Savunma Endüstrisi" 
              style={{ 
                height: isMobile ? 100 : 140, 
                width: 'auto',
                display: 'block',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
              }}
            />
          </Box>
        </Box>

        {/* Giriş kartı - Çanga Corporate Design */}
        <Fade in={true} timeout={1000}>
          <Paper
            sx={{
              background: `
                linear-gradient(145deg, 
                  rgba(255, 255, 255, 0.98) 0%,
                  rgba(248, 250, 252, 0.96) 100%
                )
              `,
              backdropFilter: 'blur(25px)',
              borderRadius: 3,
              boxShadow: `
                0 25px 80px rgba(30, 58, 138, 0.15),
                0 10px 40px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.9)
              `,
              border: '1px solid rgba(30, 58, 138, 0.1)',
              overflow: 'visible',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1e3a8a 0%, #dc2626 100%)',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Container sx={{ p: isMobile ? 4 : 5, pt: 6 }}>
              {/* Başlık - Çanga Corporate Style */}
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)',
                    mb: 3,
                    boxShadow: '0 8px 30px rgba(30, 58, 138, 0.3)'
                  }}
                >
                  <SecurityIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: '#ffffff'
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                    fontSize: isMobile ? '1.8rem' : '2.2rem'
                  }}
                >
                  Çanga Vardiya
                  <br />
                  Sistemi
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2,
                    color: '#475569',
                    fontWeight: 500,
                    fontSize: '1.1rem'
                  }}
                >
                  Savunma Endüstrisi - Güvenli Giriş
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: '#64748b',
                    fontSize: '0.95rem'
                  }}
                >
                  Sisteme erişim için şifrenizi girin
                </Typography>
              </Box>

              {/* Hata mesajı */}
              {error && (
                <Fade in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Şifre alanı - Çanga Corporate Style */}
              <TextField
                id="password-input"
                name="password"
                label="Şifre"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!error}
                helperText={error ? 'Geçersiz şifre' : 'Şifrenizi girin'}
                autoComplete="current-password"
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(30, 58, 138, 0.1)',
                    height: '60px',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      border: '2px solid rgba(30, 58, 138, 0.2)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      border: '2px solid #1e3a8a',
                      boxShadow: '0 0 0 4px rgba(30, 58, 138, 0.1)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b',
                    fontSize: '1.1rem',
                    '&.Mui-focused': {
                      color: '#1e3a8a'
                    }
                  }
                }}
              />

              {/* Giriş butonu - Çanga Corporate Style */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleLogin}
                disabled={!password.trim()}
                sx={{
                  borderRadius: 2,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  height: '56px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)',
                  boxShadow: '0 8px 30px rgba(30, 58, 138, 0.3)',
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #dc2626 100%)',
                    boxShadow: '0 12px 40px rgba(30, 58, 138, 0.4)',
                    transform: 'translateY(-3px)',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  '&:active': {
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #cbd5e1 0%, #9ca3af 100%)',
                    boxShadow: 'none',
                    transform: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                'Sisteme Giriş Yap'
              </Button>

              {/* Alt bilgi - Çanga Corporate Style */}
              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(30, 58, 138, 0.2), transparent)',
                    mb: 3
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  © 2025 Çanga Savunma Endüstrisi
                </Typography>
                <br />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    mt: 1
                  }}
                >
                  Vardiya Yönetim Sistemi v1.0
                </Typography>
                <br />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    mt: 1
                  }}
                >
                  Coded By KEKILLIOGLU
                </Typography>
                {/* Güvenlik rozetleri */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 2, 
                    mt: 2,
                    opacity: 0.6
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 12 }} />
                    SSL Korumalı
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 12 }} />
                    256-bit Şifreleme
                  </Box>
                </Box>
              </Box>
            </Container>
          </Paper>
        </Fade>
      </Box>

      {/* CSS Animasyonları - Çanga Corporate */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          25% {
            opacity: 0.15;
          }
          50% {
            transform: translateY(-15px) rotate(1deg);
            opacity: 0.2;
          }
          75% {
            opacity: 0.15;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(30, 58, 138, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(30, 58, 138, 0.4);
          }
        }
      `}</style>
    </Box>
  );
}

export default Login; 