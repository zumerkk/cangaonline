import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
// Çanga logosunu import ediyoruz
import CangaLogo from '../assets/7ff0dçanga_logo-removebg-preview.png';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// İstatistik kartı bileşeni
function StatCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color="text.primary">
              {value}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: trend > 0 ? 'success.main' : 'error.main' }} />
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {trend > 0 ? '+' : ''}{trend}% bu ayda
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Hızlı aksiyon kartı
function QuickActionCard({ title, description, icon, color, onClick }) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.2s' }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56, mx: 'auto', mb: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeShifts: 0,
    pendingApprovals: 0,
    completionRate: 0,
    recentShifts: [],
    departmentStats: [],
    alerts: [],
    formerEmployees: 0, // İşten ayrılanlar toplam sayısı
    formerEmployeesLast30Days: 0 // Son 30 günde işten ayrılanlar
  });

  // Gerçek API verilerini yükle
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dashboard istatistiklerini backend API'sinden çek
      const [dashboardResponse, shiftsResponse, employeesResponse, notificationsResponse, formerEmployeesStatsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/dashboard/stats'),
        fetch('http://localhost:5001/api/shifts?limit=5'), // Son 5 vardiya
        fetch('http://localhost:5001/api/employees?limit=200'),
        fetch('http://localhost:5001/api/notifications/recent?limit=5'), // Son bildirimler
        fetch('http://localhost:5001/api/employees/former/stats') // İşten ayrılanlar istatistikleri
      ]);

      const dashboardStats = await dashboardResponse.json();
      const shiftsData = await shiftsResponse.json();
      const employeesData = await employeesResponse.json();
      const notificationsData = await notificationsResponse.json();
      const formerEmployeesStatsData = await formerEmployeesStatsResponse.json();

      // Backend'den gelen gerçek veriler
      const stats = dashboardStats.data || {};
      const shifts = shiftsData.data || [];
      const employees = employeesData.data || [];
      const notifications = notificationsData.data || [];
      const formerEmployeesStats = formerEmployeesStatsData.data || {};

      // İşten ayrılanlar istatistiklerini backend'den al
      const totalFormerEmployees = formerEmployeesStats.total || 0;
      const formerEmployeesLast30Days = formerEmployeesStats.last30Days || 0;
      const formerEmployeesLast7Days = formerEmployeesStats.last7Days || 0;
      const formerEmployeesThisMonth = formerEmployeesStats.thisMonth || 0;

      // Departman istatistiklerini backend'den gelen verilerle oluştur
      const departmentStats = (stats.departmentStats || []).map(dept => ({
        name: dept._id,
        count: dept.count,
        percentage: Math.round((dept.count / stats.totalEmployees) * 100)
      }));

      // Lokasyon istatistikleri
      const locationCounts = {};
      employees.forEach(emp => {
        locationCounts[emp.location] = (locationCounts[emp.location] || 0) + 1;
      });

      // Son vardiyaları formatla
      const recentShifts = shifts.map(shift => ({
        id: shift._id,
        title: shift.title || `${shift.location} Vardiya Listesi`,
        date: new Date(shift.createdAt).toLocaleDateString('tr-TR'),
        status: shift.status,
        employees: shift.shiftGroups?.reduce((total, group) => {
          return total + group.shifts?.reduce((groupTotal, shiftTime) => {
            return groupTotal + (shiftTime.employees?.length || 0);
          }, 0);
        }, 0) || 0
      }));

      // Tamamlanma oranını hesapla (onaylanan vardiya oranı)
      const approvedShifts = shifts.filter(s => s.status === 'ONAYLANDI').length;
      const completionRate = shifts.length > 0 ? Math.round((approvedShifts / shifts.length) * 100) : 0;

      setDashboardData({
        totalEmployees: stats.totalEmployees || 0,
        activeShifts: stats.activeShifts || 0,
        pendingApprovals: stats.pendingApprovals || 0,
        completionRate: completionRate,
        departmentStats,
        locationStats: Object.entries(locationCounts).map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / employees.length) * 100)
        })),
        recentShifts,
        formerEmployees: totalFormerEmployees, // İşten ayrılanlar toplam sayısı
        formerEmployeesLast30Days: formerEmployeesLast30Days, // Son 30 günde işten ayrılanlar
        // Gerçek bildirimler backend'den geldi
        alerts: notifications.length > 0 ? notifications.map(notif => ({
          id: notif._id,
          message: notif.message,
          type: notif.priority === 'KRITIK' ? 'error' : 
                notif.priority === 'YUKSEK' ? 'warning' : 
                notif.priority === 'NORMAL' ? 'info' : 'success',
          time: new Date(notif.createdAt).toLocaleDateString('tr-TR'),
          isRead: notif.isRead || false,
          title: notif.title
        })) : [
          {
            id: 'default-1',
            message: `Toplam ${stats.totalEmployees || 0} aktif çalışan sisteme kaydedildi`,
            type: 'success',
            time: 'Şimdi'
          },
          {
            id: 'default-2',
            message: `${stats.activeShifts || 0} aktif vardiya planlanmış`,
            type: 'info',
            time: 'Şimdi'
          }
        ]
      });
      
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler
      setDashboardData({
        totalEmployees: 0,
        activeShifts: 0,
        pendingApprovals: 0,
        completionRate: 0,
        departmentStats: [],
        recentShifts: [],
        formerEmployees: 0,
        formerEmployeesLast30Days: 0,
        alerts: [{
          id: 1,
          message: 'Veriler yüklenirken hata oluştu',
          type: 'error',
          time: 'Şimdi'
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sayfa yenileme
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Durum rengini belirle
  const getStatusColor = (status) => {
    switch (status) {
      case 'AKTIF': return 'success';
      case 'ONAYLANDI': return 'success';
      case 'TASLAK': return 'warning';
      case 'TAMAMLANDI': return 'primary';
      case 'İPTAL': return 'error';
      case 'BEKLEMEDE': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AKTIF': return 'Aktif';
      case 'ONAYLANDI': return 'Onaylandı';
      case 'TASLAK': return 'Taslak';
      case 'TAMAMLANDI': return 'Tamamlandı';
      case 'İPTAL': return 'İptal';
      case 'BEKLEMEDE': return 'Beklemede';
      default: return status;
    }
  };



  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Dashboard yükleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Logo'lu Başlık ve Hızlı Aksiyonlar */}
      <Box sx={{ mb: 3 }}>
        {/* Logo'lu Header */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
          color: 'white', 
          mb: 3,
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Çanga Logosu */}
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: 2, 
                  p: 1, 
                  mr: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={CangaLogo} 
                    alt="Çanga Logo" 
                    style={{ height: 60, width: 'auto' }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Çanga Vardiya Sistemi
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Savunma Endüstrisi - Personel ve Vardiya Yönetimi
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                    Hoş geldiniz! Sistemde {dashboardData.totalEmployees} aktif çalışan bulunmaktadır.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Hızlı Aksiyonlar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Dashboard Özeti
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Yenile">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/shifts/create')}
            >
              Yeni Vardiya
            </Button>
          </Box>
        </Box>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Toplam Çalışan"
            value={dashboardData.totalEmployees}
            icon={<PeopleIcon />}
            color="primary"
            subtitle="Aktif personel sayısı"
            trend={dashboardData.totalEmployees > 100 ? 5 : 0} // 100'den fazlaysa artış trendi
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Aktif Vardiyalar"
            value={dashboardData.activeShifts}
            icon={<ScheduleIcon />}
            color="success"
            subtitle="Onaylanmış vardiyalar"
            trend={dashboardData.activeShifts > 0 ? 12 : 0} // Aktif vardiya varsa pozitif trend
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/former-employees')}>
            <StatCard
              title="İşten Ayrılanlar"
              value={dashboardData.formerEmployeesLast30Days}
              icon={<PeopleIcon />}
              color="warning"
              subtitle="Son 30 gün"
              trend={dashboardData.formerEmployeesLast30Days > 0 ? -dashboardData.formerEmployeesLast30Days : 0} // Negatif trend
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sol Kolon */}
        <Grid item xs={12} lg={8}>
          {/* Hızlı Aksiyonlar */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hızlı Aksiyonlar
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="Yeni Vardiya"
                  description="Vardiya listesi oluştur"
                  icon={<AddIcon />}
                  color="primary"
                  onClick={() => navigate('/shifts/create')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="Çalışan Ekle"
                  description="Yeni personel kaydı"
                  icon={<PeopleIcon />}
                  color="success"
                  onClick={() => navigate('/employees')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="İşten Ayrılanlar"
                  description={`${dashboardData.formerEmployees} toplam • ${dashboardData.formerEmployeesLast30Days} son 30 gün`}
                  icon={<PeopleIcon />}
                  color="warning"
                  onClick={() => navigate('/former-employees')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="Analitik Raporlar"
                  description="Detaylı analiz ve grafikler"
                  icon={<DownloadIcon />}
                  color="info"
                  onClick={() => navigate('/analytics')}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Son Vardiyalar */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Son Vardiya Listeleri
            </Typography>
            <List>
              {dashboardData.recentShifts.map((shift) => (
                <ListItem
                  key={shift.id}
                  sx={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  secondaryAction={
                    <Chip
                      label={getStatusText(shift.status)}
                      color={getStatusColor(shift.status)}
                      size="small"
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={shift.title}
                    secondary={`${shift.date} • ${shift.employees} çalışan`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/shifts')}
            >
              Tüm Vardiyaları Görüntüle
            </Button>
          </Paper>
        </Grid>

        {/* Sağ Kolon */}
        <Grid item xs={12} lg={4}>
          {/* Departman Dağılımı */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Departman Dağılımı
            </Typography>
            <List dense>
              {dashboardData.departmentStats.map((dept) => (
                <ListItem key={dept.name} sx={{ px: 0 }}>
                  <ListItemText
                    primary={dept.name}
                    secondary={`${dept.count} çalışan (%${dept.percentage})`}
                  />
                  <Box sx={{ mt: 1, width: '100%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={dept.percentage}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Bildirimler */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Son Bildirimler
            </Typography>
            <List>
              {dashboardData.alerts.map((alert) => (
                <ListItem key={alert.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: alert.type === 'warning' ? 'warning.main' : 'info.main',
                      width: 32, 
                      height: 32 
                    }}>
                      <WarningIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 