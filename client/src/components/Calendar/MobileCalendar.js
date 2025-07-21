import React, { useState, useEffect } from 'react';
import {
  Box,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Badge,
  Avatar,
  Fab,
  Snackbar,
  Alert,
  Slide,
  useMediaQuery,
  useTheme,
  Skeleton
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  Work as WorkIcon,
  DirectionsBus as BusIcon,
  BeachAccess as VacationIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
  DarkMode as DarkModeIcon,
  Vibration as VibrateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const MobileCalendar = ({ events, onEventCreate, onSettingsChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mobile state'ler
  const [bottomNavValue, setBottomNavValue] = useState('calendar');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [quickActionsDrawer, setQuickActionsDrawer] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('left');
  const [pullToRefresh, setPullToRefresh] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // PWA özellikleri
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');

  // Bildirim state'leri
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 📱 PWA Kurulum
  useEffect(() => {
    // PWA install prompt dinle
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    
    // PWA kurulu mu kontrol et
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isInStandaloneMode);

    // Service worker kaydet
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  // 🔔 Push Notification İzni İste
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        // Service worker ile push subscription oluştur
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'your-vapid-public-key' // VAPID key eklenecek
        });
        
        // Backend'e subscription gönder
        await fetch('http://localhost:5001/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      }
    }
  };

  // 📲 Uygulama Kurulum
  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    }
  };

  // 🔄 Pull to Refresh
  const handlePullToRefresh = () => {
    setPullToRefresh(true);
    
    // Verileri yenile
    setTimeout(() => {
      // API çağrısı simülasyonu
      console.log('📱 Mobil: Veriler yenilendi');
      setPullToRefresh(false);
    }, 1500);
  };

  // 📳 Haptic Feedback
  const triggerHapticFeedback = (type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [100, 50, 100]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  };

  // 📅 Hızlı Etkinlik Oluşturma
  const quickCreateEvent = (type) => {
    triggerHapticFeedback('light');
    
    const templates = {
      shift: {
        title: 'Yeni Vardiya',
        type: 'shift',
        color: '#1976d2'
      },
      vacation: {
        title: 'İzin Talebi',
        type: 'vacation',
        color: '#4caf50'
      },
      meeting: {
        title: 'Toplantı',
        type: 'meeting',
        color: '#ff9800'
      }
    };

    onEventCreate(templates[type]);
    setSpeedDialOpen(false);
  };

  // 📱 Bugünün Özeti (Widget tarzı)
  const TodayWidget = () => {
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    });

    return (
      <Card sx={{ m: 1, background: 'linear-gradient(45deg, #1976d2, #42a5f5)' }}>
        <CardContent sx={{ color: 'white', '&:last-child': { pb: 2 } }}>
          <Typography variant="h6" gutterBottom>
            📅 {format(new Date(), 'dd MMMM yyyy', { locale: tr })}
          </Typography>
          
          {todayEvents.length > 0 ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                {todayEvents.length} etkinlik
              </Typography>
              {todayEvents.slice(0, 3).map((event, index) => (
                <Chip
                  key={index}
                  label={event.title}
                  size="small"
                  sx={{ 
                    mr: 0.5, 
                    mb: 0.5, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                />
              ))}
              {todayEvents.length > 3 && (
                <Chip
                  label={`+${todayEvents.length - 3} daha`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Bugün etkinlik yok 🎉
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  // 📊 Hızlı İstatistikler
  const QuickStats = () => (
    <Box sx={{ display: 'flex', gap: 1, p: 1, overflowX: 'auto' }}>
      {[
        { icon: '📋', label: 'Vardiya', count: events.filter(e => e.type === 'shift').length, color: '#1976d2' },
        { icon: '🚌', label: 'Servis', count: events.filter(e => e.type === 'service').length, color: '#673ab7' },
        { icon: '🏖️', label: 'İzin', count: events.filter(e => e.type === 'vacation').length, color: '#4caf50' },
        { icon: '⏳', label: 'Bekleyen', count: events.filter(e => e.status === 'pending').length, color: '#ff9800' }
      ].map((stat, index) => (
        <Card key={index} sx={{ minWidth: 80, textAlign: 'center' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="h4">{stat.icon}</Typography>
            <Typography variant="h6" color={stat.color}>{stat.count}</Typography>
            <Typography variant="caption">{stat.label}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  if (!isMobile) return null; // Sadece mobilde göster

  return (
    <Box>
      {/* PWA Kurulum Banner */}
      {installPrompt && !isInstalled && (
        <Slide direction="down" in={Boolean(installPrompt)}>
          <Alert 
            severity="info" 
            action={
              <IconButton color="inherit" onClick={handleInstallApp}>
                <DownloadIcon />
              </IconButton>
            }
            sx={{ m: 1 }}
          >
            📱 Uygulamayı telefonunuza kurun!
          </Alert>
        </Slide>
      )}

      {/* Offline Modu Banner */}
      {offlineMode && (
        <Alert severity="warning" sx={{ m: 1 }}>
          📶 Çevrimdışı mod - Veriler senkronize edilecek
        </Alert>
      )}

      {/* Bugünün Özeti */}
      <TodayWidget />

      {/* Hızlı İstatistikler */}
      <QuickStats />

      {/* Pull to Refresh Göstergesi */}
      {pullToRefresh && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Skeleton animation="wave" width={200} height={40} />
        </Box>
      )}

      {/* Mobil Bottom Navigation */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
        <BottomNavigation
          value={bottomNavValue}
          onChange={(event, newValue) => {
            setBottomNavValue(newValue);
            triggerHapticFeedback('light');
          }}
          sx={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}
        >
          <BottomNavigationAction
            label="Takvim"
            value="calendar"
            icon={<CalendarIcon />}
          />
          <BottomNavigationAction
            label="Bugün"
            value="today"
            icon={<TodayIcon />}
          />
          <BottomNavigationAction
            label="Vardiyalar"
            value="shifts"
            icon={<ScheduleIcon />}
          />
          <BottomNavigationAction
            label="Bildirimler"
            value="notifications"
            icon={
              <Badge badgeContent={unreadCount} color="error">
                <NotificationIcon />
              </Badge>
            }
          />
        </BottomNavigation>
      </Box>

      {/* Hızlı Aksiyon Speed Dial */}
      <SpeedDial
        ariaLabel="Hızlı Aksiyonlar"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => {
          setSpeedDialOpen(true);
          triggerHapticFeedback('medium');
        }}
      >
        <SpeedDialAction
          icon={<WorkIcon />}
          tooltipTitle="Yeni Vardiya"
          onClick={() => quickCreateEvent('shift')}
        />
        <SpeedDialAction
          icon={<VacationIcon />}
          tooltipTitle="İzin Talebi"
          onClick={() => quickCreateEvent('vacation')}
        />
        <SpeedDialAction
          icon={<GroupIcon />}
          tooltipTitle="Toplantı"
          onClick={() => quickCreateEvent('meeting')}
        />
        <SpeedDialAction
          icon={<SyncIcon />}
          tooltipTitle="Senkronize Et"
          onClick={handlePullToRefresh}
        />
      </SpeedDial>

      {/* Hızlı Ayarlar Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={quickActionsDrawer}
        onClose={() => setQuickActionsDrawer(false)}
        onOpen={() => setQuickActionsDrawer(true)}
        disableSwipeToOpen={false}
      >
        <Box sx={{ p: 2, height: 200 }}>
          <Typography variant="h6" gutterBottom>⚙️ Hızlı Ayarlar</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Fab
              size="small"
              color={pushPermission === 'granted' ? 'primary' : 'default'}
              onClick={requestNotificationPermission}
            >
              <NotificationIcon />
            </Fab>
            
            <Fab size="small" onClick={() => triggerHapticFeedback('heavy')}>
              <VibrateIcon />
            </Fab>
            
            <Fab size="small" onClick={() => onSettingsChange('darkMode')}>
              <DarkModeIcon />
            </Fab>
            
            <Fab size="small" onClick={() => navigator.share?.({ 
              title: 'Canga Takvim', 
              url: window.location.href 
            })}>
              <ShareIcon />
            </Fab>
          </Box>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default MobileCalendar; 