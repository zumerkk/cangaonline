import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Badge,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Schedule as ScheduleIcon,
  DirectionsBus as DirectionsBusIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalRead: 0,
    totalUnread: 0,
    readPercentage: 0
  });

  // Bildirim türü ikonları
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'VARDIYA_DEGISIKLIGI':
        return <ScheduleIcon />;
      case 'SERVIS_GUNCELLEME':
        return <DirectionsBusIcon />;
      case 'CALISAN_EKLENDI':
      case 'CALISAN_AYRILDI':
        return <PeopleIcon />;
      case 'SISTEM_BAKIMI':
      case 'ACIL_DURUM':
        return <WarningIcon />;
      case 'GENEL_DUYURU':
        return <InfoIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Öncelik renkleri
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'KRITIK':
        return 'error';
      case 'YUKSEK':
        return 'warning';
      case 'NORMAL':
        return 'info';
      case 'DUSUK':
        return 'default';
      default:
        return 'default';
    }
  };

  // Bildirimleri yükle
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Filtreler
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (filterType) params.append('type', filterType);
      if (filterPriority) params.append('priority', filterPriority);
      
      // Tab'e göre status filtresi
      if (tabValue === 1) {
        // Sadece okunmamışlar
        params.append('status', 'AKTIF');
      }

      const response = await fetch(`http://localhost:5001/api/notifications?${params}`);
      const data = await response.json();
      
      if (data.success) {
        // Okunma durumunu kontrol et
        const notificationsWithReadStatus = data.data.notifications.map(notif => ({
          ...notif,
          isRead: notif.readBy.some(read => read.userId === 'admin')
        }));
        
        // Tab'e göre filtrele
        let filteredNotifications = notificationsWithReadStatus;
        if (tabValue === 1) {
          filteredNotifications = notificationsWithReadStatus.filter(n => !n.isRead);
        } else if (tabValue === 2) {
          filteredNotifications = notificationsWithReadStatus.filter(n => n.isRead);
        }
        
        // Arama terimi ile filtrele
        if (searchTerm) {
          filteredNotifications = filteredNotifications.filter(n => 
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.message.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setNotifications(filteredNotifications);
        
        // Okunmamış sayısını hesapla
        const unread = notificationsWithReadStatus.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/stats/summary');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.summary);
      }
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'admin',
          userName: 'Çanga Yöneticisi'
        })
      });
      
      if (response.ok) {
        // Listeyi güncelle
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };

  // Tümünü okundu olarak işaretle
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'admin',
          userName: 'Çanga Yöneticisi'
        })
      });
      
      if (response.ok) {
        // Tüm bildirimleri okundu olarak işaretle
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Tümü okundu işaretlenirken hata:', error);
    }
  };

  // Bildirimi sil
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Listeden kaldır
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        setAnchorEl(null);
      }
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  };

  // Test bildirimleri oluştur
  const createTestNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/test/create', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Listeyi yenile
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error('Test bildirimleri oluşturulurken hata:', error);
    }
  };

  // Menü işlemleri
  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setFilterType('');
    setFilterPriority('');
    setSearchTerm('');
    setTabValue(0);
  };

  // Component mount
  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [tabValue, filterType, filterPriority, searchTerm]);

  // Otomatik yenileme (30 saniye)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [tabValue, filterType, filterPriority, searchTerm]);

  return (
    <Box>
      {/* Başlık */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Bildirimler
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistem bildirimleri ve duyuruları
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { fetchNotifications(); fetchStats(); }}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Tümünü Okundu İşaretle
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={createTestNotifications}
          >
            Test Bildirimleri
          </Button>
        </Box>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalActive}
              </Typography>
              <Typography color="text.secondary">
                Toplam Bildirim
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <NotificationsActiveIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {unreadCount}
              </Typography>
              <Typography color="text.secondary">
                Okunmamış
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalRead}
              </Typography>
              <Typography color="text.secondary">
                Okunmuş
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InfoIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                %{stats.readPercentage}
              </Typography>
              <Typography color="text.secondary">
                Okunma Oranı
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Bildirim ara..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tür</InputLabel>
            <Select
              value={filterType}
              label="Tür"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="VARDIYA_DEGISIKLIGI">Vardiya Değişikliği</MenuItem>
              <MenuItem value="SERVIS_GUNCELLEME">Servis Güncelleme</MenuItem>
              <MenuItem value="CALISAN_EKLENDI">Çalışan Eklendi</MenuItem>
              <MenuItem value="SISTEM_BAKIMI">Sistem Bakımı</MenuItem>
              <MenuItem value="GENEL_DUYURU">Genel Duyuru</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Öncelik</InputLabel>
            <Select
              value={filterPriority}
              label="Öncelik"
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="KRITIK">Kritik</MenuItem>
              <MenuItem value="YUKSEK">Yüksek</MenuItem>
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="DUSUK">Düşük</MenuItem>
            </Select>
          </FormControl>

          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            size="small"
          >
            Temizle
          </Button>
        </Box>
      </Paper>

      {/* Tab'lar */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={`Tümü (${stats.totalActive})`}
            icon={<NotificationsIcon />}
          />
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="error">
                Okunmamış
              </Badge>
            }
            icon={<NotificationsActiveIcon />}
          />
          <Tab 
            label={`Okunmuş (${stats.totalRead})`}
            icon={<NotificationsOffIcon />}
          />
        </Tabs>
      </Paper>

      {/* Bildirim Listesi */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bildirim bulunamadı
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Seçilen kriterlere uygun bildirim bulunmuyor
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isRead ? 'none' : '4px solid',
                    borderLeftColor: notification.isRead ? 'transparent' : `${getPriorityColor(notification.priority)}.main`,
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={notification.priority}
                        color={getPriorityColor(notification.priority)}
                        size="small"
                      />
                      <IconButton
                        onClick={(e) => handleMenuClick(e, notification)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: `${getPriorityColor(notification.priority)}.main`,
                      opacity: notification.isRead ? 0.6 : 1
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            color: notification.isRead ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Badge color="primary" variant="dot" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                      </Box>
                    }
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                    sx={{ cursor: !notification.isRead ? 'pointer' : 'default' }}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Menü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          {selectedNotification && !selectedNotification.isRead && (
            <MenuItemComponent
              onClick={() => {
                markAsRead(selectedNotification._id);
                handleMenuClose();
              }}
            >
              <MarkAsUnreadIcon sx={{ mr: 1 }} />
              Okundu İşaretle
            </MenuItemComponent>
          )}
          <MenuItemComponent
            onClick={() => {
              deleteNotification(selectedNotification._id);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Sil
          </MenuItemComponent>
        </MenuList>
      </Menu>
    </Box>
  );
}

export default Notifications; 