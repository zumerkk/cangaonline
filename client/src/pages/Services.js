import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  LinearProgress,
  Avatar,
  Stack
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Add as AddIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  Route as RouteIcon,
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  GetApp as GetAppIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

function Services() {
  // State'ler
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [stats, setStats] = useState({});

  // Yolcu yönetimi state'leri
  const [passengerDialog, setPassengerDialog] = useState(false);
  const [routePassengers, setRoutePassengers] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [passengerLoading, setPassengerLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedStopName, setSelectedStopName] = useState('');

  // ✏️ Düzenleme state'leri
  const [editDialog, setEditDialog] = useState(false);
  const [editRoute, setEditRoute] = useState({
    routeName: '',
    routeCode: '',
    color: '#1976d2',
    status: 'AKTIF',
    stops: []
  });
  const [editLoading, setEditLoading] = useState(false);

  // Component mount - güzergahları ve istatistikleri getir
  useEffect(() => {
    fetchRoutes();
    fetchStats();
  }, []);

  // Güzergahları getir
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      console.log('🔥 Frontend: Starting fetchRoutes...');
      
      const response = await fetch('http://localhost:5001/api/services/routes/test');
      console.log('🔥 Frontend: Response status:', response.status);
      console.log('🔥 Frontend: Response headers:', response.headers);
      
      const data = await response.json();
      console.log('🔥 Frontend: Response data:', data);
      
      if (data.success) {
        console.log('🔥 Frontend: Setting routes:', data.data);
        setRoutes(data.data || []);
      } else {
        console.error('🔥 Frontend: Güzergah verisi alınamadı:', data.message);
      }
    } catch (error) {
      console.error('🔥 Frontend: Güzergah fetch hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri getir
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/services/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('İstatistik fetch hatası:', error);
    }
  };

  // Güzergah detayını göster
  const handleViewDetails = (route) => {
    setSelectedRoute(route);
    setDetailDialog(true);
  };

  // Güzergah yolcuları yönetimi açık
  const handleManagePassengers = async (route) => {
    setSelectedRoute(route);
    setPassengerDialog(true);
    await fetchRoutePassengers(route._id);
    await fetchAvailableEmployees();
  };

  // ✏️ Güzergah düzenleme aç
  const handleEditRoute = (route) => {
    setEditRoute({
      ...route,
      stops: route.stops || []
    });
    setSelectedRoute(route);
    setEditDialog(true);
  };

  // ✏️ Güzergah güncelleme kaydet
  const handleSaveRoute = async () => {
    if (!editRoute.routeName || !editRoute.routeCode) {
      alert('Güzergah adı ve kodu zorunludur');
      return;
    }

    try {
      setEditLoading(true);
      
      const response = await fetch(`http://localhost:5001/api/services/routes/${selectedRoute._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editRoute)
      });

      const data = await response.json();

      if (data.success) {
        alert('Güzergah başarıyla güncellendi!');
        setEditDialog(false);
        fetchRoutes(); // Listeyi yenile
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Güzergah güncelleme hatası:', error);
      alert('Bir hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  // ✏️ Durak ekleme
  const handleAddStop = () => {
    const newStop = {
      name: '',
      order: editRoute.stops.length + 1
    };
    setEditRoute(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
  };

  // ✏️ Durak silme
  const handleRemoveStop = (index) => {
    setEditRoute(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  // ✏️ Durak güncelleme
  const handleUpdateStop = (index, field, value) => {
    setEditRoute(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => 
        i === index ? { ...stop, [field]: value } : stop
      )
    }));
  };

  // Güzergah yolcularını getir
  const fetchRoutePassengers = async (routeId) => {
    try {
      setPassengerLoading(true);
      const response = await fetch(`http://localhost:5001/api/services/routes/test/${routeId}/passengers`);
      const data = await response.json();
      
      if (data.success) {
        setRoutePassengers(data.data.passengers || []);
      } else {
        console.error('Yolcular getirilemedi:', data.message);
        setRoutePassengers([]);
      }
    } catch (error) {
      console.error('Yolcu getirme hatası:', error);
      setRoutePassengers([]);
    } finally {
      setPassengerLoading(false);
    }
  };

  // Tüm çalışanları getir
  const fetchAvailableEmployees = async (search = '') => {
    try {
      const url = new URL('http://localhost:5001/api/services/employees/available');
      if (search) url.searchParams.append('search', search);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAvailableEmployees(data.data || []);
      } else {
        console.error('Çalışanlar getirilemedi:', data.message);
        setAvailableEmployees([]);
      }
    } catch (error) {
      console.error('Çalışan getirme hatası:', error);
      setAvailableEmployees([]);
    }
  };

  // Güzergaha yolcu ekle
  const handleAddPassenger = async () => {
    if (!selectedEmployeeId || !selectedRoute) {
      alert('Lütfen bir çalışan seçin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/services/routes/${selectedRoute._id}/passengers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          stopName: selectedStopName || 'FABRİKA'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Yolcu listesini yenile
        await fetchRoutePassengers(selectedRoute._id);
        await fetchAvailableEmployees(employeeSearch);
        setSelectedEmployeeId('');
        setSelectedStopName('');
        alert('Yolcu başarıyla eklendi!');
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Yolcu ekleme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Güzergahtan yolcu çıkar
  const handleRemovePassenger = async (passenger) => {
    if (!window.confirm(`${passenger.fullName} adlı yolcuyu güzergahtan çıkarmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/services/routes/${selectedRoute._id}/passengers/${passenger._id}`, 
        {
          method: 'DELETE'
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Yolcu listesini yenile
        await fetchRoutePassengers(selectedRoute._id);
        await fetchAvailableEmployees(employeeSearch);
        alert('Yolcu başarıyla çıkarıldı!');
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Yolcu çıkarma hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Çalışan arama
  const handleEmployeeSearch = (searchValue) => {
    setEmployeeSearch(searchValue);
    // Debounce için timeout
    setTimeout(() => {
      fetchAvailableEmployees(searchValue);
    }, 500);
  };

  // Excel indir - Resimle birebir aynı format
  const handleDownloadExcel = async () => {
    if (!selectedRoute) {
      alert('Güzergah seçili değil');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/services/routes/${selectedRoute._id}/export-excel`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedRoute.routeName.replace(/[^\w\s]/gi, '')}_Yolcu_Listesi_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`${routePassengers.length} yolculu Excel listesi indirildi! 📋`);
      } else {
        alert('Excel dosyası indirilemedi');
      }
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Renk kodunu isime çevir
  const getColorName = (color) => {
    const colorMap = {
      '#1976d2': 'Mavi',
      '#388e3c': 'Yeşil', 
      '#f57c00': 'Turuncu',
      '#d32f2f': 'Kırmızı',
      '#7b1fa2': 'Mor'
    };
    return colorMap[color] || 'Özel';
  };

  // Güzergah durumu chip rengi
  const getStatusColor = (status) => {
    switch (status) {
      case 'AKTIF': return 'success';
      case 'PASIF': return 'default';
      case 'BAKIM': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Modern Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
              🚌 Servis Güzergahları
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Excel verilerine dayalı profesyonel servis yönetimi
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => alert('Bu özellik yakında eklenecek!')}
          >
            Yeni Güzergah
          </Button>
        </Box>
      </Paper>

      {/* Gelişmiş İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {routes.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Toplam Güzergah
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <RouteIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {routes.reduce((total, route) => total + route.stops.length, 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Toplam Durak
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <LocationIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {routes.reduce((total, route) => total + (route.passengerCount || 0), 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Toplam Yolcu
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {routes.filter(route => route.status === 'AKTIF').length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Aktif Güzergah
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <BusIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modern Güzergah Listesi */}
      {routes.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
          <BusIcon sx={{ fontSize: 64, color: '#ff6b6b', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Henüz güzergah eklenmemiş
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Excel'deki servis güzergahlarını sisteme eklemek için "Yeni Güzergah" butonunu kullanın.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} size="large">
            İlk Güzergahı Ekle
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {routes.map((route) => (
            <Grid item xs={12} md={6} lg={4} key={route._id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  borderLeft: `6px solid ${route.color}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Güzergah Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: route.color }}>
                        {route.routeName}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip 
                          label={route.routeCode}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: route.color, color: route.color }}
                        />
                        <Chip 
                          label={route.status}
                          size="small"
                          color={getStatusColor(route.status)}
                        />
                      </Stack>
                    </Box>
                    <Avatar sx={{ bgcolor: route.color, width: 48, height: 48 }}>
                      <BusIcon />
                    </Avatar>
                  </Box>

                  {/* Güzergah Metrikleri */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: route.color }}>
                          {route.stops.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Durak
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: route.color }}>
                          {route.passengerCount || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Yolcu
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: route.color }}>
                          {route.schedule?.filter(s => s.isActive).length || 2}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sefer
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* İlk 3 durak - Modern görünüm */}
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                    Ana Duraklar:
                  </Typography>
                  <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                    {route.stops.slice(0, 3).map((stop, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        py: 0.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'grey.50' }
                      }}>
                        <LocationIcon sx={{ fontSize: 16, color: route.color, mr: 1 }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {stop.name}
                        </Typography>
                        <Chip 
                          label={stop.order} 
                          size="small" 
                          variant="outlined"
                          sx={{ minWidth: 28, height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    ))}
                    {route.stops.length > 3 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                        ... ve {route.stops.length - 3} durak daha
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewDetails(route)}
                    sx={{ color: route.color }}
                  >
                    Detaylar
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<PeopleIcon />}
                    color="primary"
                    onClick={() => handleManagePassengers(route)}
                  >
                    Yolcular
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    color="secondary"
                    onClick={() => handleEditRoute(route)}
                  >
                    Düzenle
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Güzergah Detay Dialog - Gelişmiş */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: selectedRoute?.color || '#1976d2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6">
                {selectedRoute?.routeName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedRoute?.routeCode} • {getColorName(selectedRoute?.color)}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setDetailDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedRoute && (
            <Grid container spacing={3}>
              {/* Sol Taraf - Duraklar */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MapIcon sx={{ mr: 1, color: selectedRoute.color }} />
                    Duraklar ({selectedRoute.stops.length})
                  </Typography>
                  <List dense>
                    {selectedRoute.stops.map((stop, index) => (
                      <ListItem key={index} sx={{ 
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'grey.50' }
                      }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Avatar sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: selectedRoute.color,
                            fontSize: '0.8rem'
                          }}>
                            {stop.order}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={stop.name}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            fontWeight: stop.order <= 3 ? 600 : 400
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Sağ Taraf - İstatistikler */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {/* Genel Bilgiler */}
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AnalyticsIcon sx={{ mr: 1, color: selectedRoute.color }} />
                      Genel Bilgiler
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Durum
                        </Typography>
                        <Chip 
                          label={selectedRoute.status}
                          color={getStatusColor(selectedRoute.status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Renk
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            bgcolor: selectedRoute.color,
                            borderRadius: '50%',
                            mr: 1
                          }} />
                          <Typography variant="body2">
                            {getColorName(selectedRoute.color)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* İstatistikler */}
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, color: selectedRoute.color }} />
                      İstatistikler
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Toplam Yolcu</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedRoute.passengerCount || 0}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((selectedRoute.passengerCount || 0) * 2, 100)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: selectedRoute.color
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            startIcon={<PeopleIcon />}
            variant="contained"
            onClick={() => {
              setDetailDialog(false);
              handleManagePassengers(selectedRoute);
            }}
            sx={{ bgcolor: selectedRoute?.color }}
          >
            Yolcuları Yönet
          </Button>
          <Button onClick={() => setDetailDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yolcu Yönetimi Dialog */}
      <Dialog 
        open={passengerDialog} 
        onClose={() => setPassengerDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ 
          background: selectedRoute?.color || '#1976d2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6">
                Yolcu Yönetimi
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedRoute?.routeName}
              </Typography>
            </Box>
          </Box>
          <Badge badgeContent={routePassengers.length} color="error">
            <IconButton 
              onClick={() => setPassengerDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Badge>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Yeni Yolcu Ekleme */}
          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonAddIcon sx={{ mr: 1 }} />
              Yeni Yolcu Ekle
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Çalışan ara..."
                  value={employeeSearch}
                  onChange={(e) => handleEmployeeSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Çalışan Seç</InputLabel>
                  <Select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    label="Çalışan Seç"
                  >
                    {availableEmployees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.fullName} ({emp.department})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddPassenger}
                  disabled={!selectedEmployeeId}
                  sx={{ bgcolor: selectedRoute?.color }}
                >
                  Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Mevcut Yolcular Listesi */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1 }} />
            Mevcut Yolcular ({routePassengers.length})
          </Typography>

          {passengerLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : routePassengers.length === 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Henüz yolcu yok
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki formu kullanarak yolcu ekleyebilirsiniz
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ad Soyad</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Departman</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Durak</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {routePassengers.map((passenger, index) => (
                    <TableRow 
                      key={passenger._id}
                      sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                    >
                      <TableCell>
                        <Avatar sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: selectedRoute?.color,
                          fontSize: '0.8rem'
                        }}>
                          {passenger.orderNumber || index + 1}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {passenger.fullName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={passenger.department} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: selectedRoute?.color }} />
                          <Typography variant="body2">
                            {passenger.stopName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Yolcuyu Çıkar">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleRemovePassenger(passenger)}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button 
            startIcon={<GetAppIcon />}
            variant="contained"
            onClick={handleDownloadExcel}
            sx={{ bgcolor: selectedRoute?.color }}
          >
            Excel İndir
          </Button>
          <Button onClick={() => setPassengerDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✏️ Güzergah Düzenleme Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: editRoute?.color || '#1976d2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6">
                Güzergah Düzenle
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {editRoute?.routeName}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setEditDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Sol Taraf - Temel Bilgiler */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <RouteIcon sx={{ mr: 1 }} />
                  Temel Bilgiler
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Güzergah Adı"
                    value={editRoute.routeName}
                    onChange={(e) => setEditRoute(prev => ({ ...prev, routeName: e.target.value }))}
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Güzergah Kodu"
                    value={editRoute.routeCode}
                    onChange={(e) => setEditRoute(prev => ({ ...prev, routeCode: e.target.value }))}
                    required
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={editRoute.status}
                      onChange={(e) => setEditRoute(prev => ({ ...prev, status: e.target.value }))}
                      label="Durum"
                    >
                      <MenuItem value="AKTIF">AKTIF</MenuItem>
                      <MenuItem value="PASIF">PASIF</MenuItem>
                      <MenuItem value="BAKIM">BAKIM</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Güzergah Rengi
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'].map(color => (
                        <Box
                          key={color}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: color,
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: editRoute.color === color ? '3px solid #000' : 'none',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => setEditRoute(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Sağ Taraf - Duraklar */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    Duraklar ({editRoute.stops.length})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddStop}
                    variant="outlined"
                  >
                    Durak Ekle
                  </Button>
                </Box>
                
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {editRoute.stops.map((stop, index) => (
                    <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          label="Sıra"
                          type="number"
                          value={stop.order || index + 1}
                          onChange={(e) => handleUpdateStop(index, 'order', parseInt(e.target.value))}
                          sx={{ width: 80 }}
                        />
                        <TextField
                          size="small"
                          label="Durak Adı"
                          value={stop.name}
                          onChange={(e) => handleUpdateStop(index, 'name', e.target.value)}
                          fullWidth
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveStop(index)}
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                  
                  {editRoute.stops.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Henüz durak eklenmemiş. "Durak Ekle" butonunu kullanın.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button onClick={() => setEditDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveRoute}
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={16} /> : <EditIcon />}
            sx={{ bgcolor: editRoute?.color }}
          >
            {editLoading ? 'Kaydediliyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Services; 