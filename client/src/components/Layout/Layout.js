import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
// Çanga logosunu import ediyoruz
import CangaLogo from '../../assets/7ff0dçanga_logo-removebg-preview.png';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
  DirectionsBus as DirectionsBusIcon,
  EventNote as EventNoteIcon,
  Storage as StorageIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

// Navigasyon menü öğeleri - Dinamik filtreleme ile
const getMenuItems = (user) => {
  const allMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      description: 'Genel görünüm ve istatistikler'
    },
    {
      text: 'Çalışanlar',
      icon: <PeopleIcon />,
      path: '/employees',
      description: 'Çalışan yönetimi ve bilgileri'
    },
    {
      text: '🚪 İşten Ayrılanlar',
      icon: <PeopleIcon />,
      path: '/former-employees',
      description: 'İşten ayrılmış çalışanlar listesi'
    },
    {
      text: '🎓 Stajyer ve Çıraklar',
      icon: <PeopleIcon />,
      path: '/trainees-apprentices',
      description: 'Stajyer ve çırak özel yönetim paneli'
    },
    {
      text: 'Yolcu Listesi',
      icon: <PeopleIcon />,
      path: '/passenger-list',
      description: 'Yolcu yönetimi ve düzenleme'
    },
    {
      text: 'Vardiyalar',
      icon: <ScheduleIcon />,
      path: '/shifts',
      description: 'Vardiya planları ve listeleri'
    },
    {
      text: 'Takvim & Ajanda',
      icon: <CalendarIcon />,
      path: '/calendar',
      description: 'Tüm etkinlikleri takvim görünümünde takip edin'
    },
    {
      text: 'Hızlı Liste Oluştur',
      icon: <EventNoteIcon />,
      path: '/quick-list',
      description: 'Hızlı imza listesi oluşturucu'
    },
    {
      text: 'Servis Güzergahları',
      icon: <DirectionsBusIcon />,
      path: '/services',
      description: 'Servis güzergah yönetimi'
    },
    {
      text: '📊 Analytics Dashboard',
      icon: <AssessmentIcon />,
      path: '/analytics',
      description: 'Sistem kullanım istatistikleri ve performans metrikleri'
    },
    {
      text: 'Veritabanı Yönetimi',
      icon: <StorageIcon />,
      path: '/database',
      description: 'MongoDB koleksiyonları ve veri yönetimi',
      requiresAdminAccess: true // 🔒 Sadece ADMIN-001 için
    },
  ];

  // 🔒 ADMIN-001 yetkilendirme kontrolü
  return allMenuItems.filter(item => {
    if (item.requiresAdminAccess) {
      return user?.employeeId === 'ADMIN-001';
    }
    return true;
  });
};

// Hızlı aksiyonlar
const quickActions = [
  {
    text: 'Yeni Vardiya Oluştur',
    icon: <AddIcon />,
    path: '/shifts/create',
    color: 'primary'
  },
];

function Layout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Drawer toggle - mobil cihazlar için
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Profil menüsü
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  // Logout işlemi
  const handleLogout = () => {
    logout();
    handleProfileClose();
  };

  // Bildirim sayısını yükle
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/unread-count?userId=admin');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Bildirim sayısı alınamadı:', error);
    }
  };

  // Component mount olduğunda ve her 30 saniyede bir bildirim sayısını kontrol et
  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30 saniye
    return () => clearInterval(interval);
  }, []);

  // Navigasyon
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Aktif sayfa kontrolü
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Sidebar içeriği
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Sadece Çanga logosu, metin yok */}
          <img 
            src={CangaLogo} 
            alt="Çanga Logo" 
            style={{ height: 60, width: 'auto' }}
          />
        </Box>
      </Box>

      {/* Ana Menü */}
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          Ana Menü
        </Typography>
        
        <List>
          {getMenuItems(user).map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
                  color: isActive(item.path) ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive(item.path) ? 'white' : 'text.secondary',
                    minWidth: 40 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={!isActive(item.path) ? item.description : null}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'text.disabled'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2, mx: 2 }} />

        {/* Hızlı Aksiyonlar */}
        <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          Hızlı Aksiyonlar
        </Typography>
        
        <List>
          {quickActions.map((action) => (
            <ListItem key={action.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(action.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  border: `1px solid ${theme.palette[action.color].main}`,
                  '&:hover': {
                    backgroundColor: `${theme.palette[action.color].main}08`,
                  },
                }}
              >
                <ListItemIcon sx={{ color: `${action.color}.main`, minWidth: 40 }}>
                  {action.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={action.text}
                  primaryTypographyProps={{
                    color: `${action.color}.main`,
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Alt bilgi */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          © 2024 Çanga Savunma Endüstrisi
        </Typography>
        <Typography variant="caption" color="text.secondary">
          v1.0.0 - Coded By KEKILLIOGLU
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {/* Mobil menü butonu */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Başlık */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getMenuItems(user).find(item => isActive(item.path))?.text || 'Çanga Vardiya Sistemi'}
          </Typography>

          {/* Sağ taraf - bildirimler ve profil */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Bildirim butonu */}
            <IconButton color="inherit" onClick={() => navigate('/notifications')}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profil menüsü */}
            <IconButton
              onClick={handleProfileClick}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || 'Ç'}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Box>
                  <Typography variant="body2">{user?.name || 'Çanga Yöneticisi'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.department || 'İdari Birim'}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Ayarlar
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobil drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mobil performans için
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#fafafa'
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#fafafa',
              borderRight: '1px solid #e0e0e0'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Ana içerik alanı */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* AppBar için boşluk */}
        {children}
      </Box>
    </Box>
  );
}

export default Layout; 