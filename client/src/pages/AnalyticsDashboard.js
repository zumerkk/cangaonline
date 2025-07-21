import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  ButtonGroup,
  Skeleton
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  FileDownload as DownloadIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

// 📊 Chart.js için gerekli importlar
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Chart.js registerları
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsDashboard() {
  // 📊 State'ler
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [dashboardStats, setDashboardStats] = useState({});
  const [templateUsage, setTemplateUsage] = useState([]);
  const [departmentUsage, setDepartmentUsage] = useState([]);
  const [hourlyUsage, setHourlyUsage] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [performanceData, setPerformanceData] = useState({});

  // 🚀 Component Mount
  useEffect(() => {
    fetchAllAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // 📊 Tüm analytics verilerini getir
  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [
        dashboardRes,
        templateRes,
        departmentRes,
        hourlyRes,
        dailyRes,
        topUsersRes,
        performanceRes
      ] = await Promise.all([
        fetch(`http://localhost:5001/api/analytics/dashboard?timeRange=${timeRange}`),
        fetch(`http://localhost:5001/api/analytics/templates?timeRange=${timeRange}`),
        fetch(`http://localhost:5001/api/analytics/departments?timeRange=${timeRange}`),
        fetch(`http://localhost:5001/api/analytics/hourly?days=7`),
        fetch(`http://localhost:5001/api/analytics/daily?days=30`),
        fetch(`http://localhost:5001/api/analytics/top-users?timeRange=${timeRange}`),
        fetch(`http://localhost:5001/api/analytics/performance?timeRange=7d`)
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardStats(data.data);
      }

      if (templateRes.ok) {
        const data = await templateRes.json();
        setTemplateUsage(data.data);
      }

      if (departmentRes.ok) {
        const data = await departmentRes.json();
        setDepartmentUsage(data.data);
      }

      if (hourlyRes.ok) {
        const data = await hourlyRes.json();
        setHourlyUsage(data.data);
      }

      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailyUsage(data.data);
      }

      if (topUsersRes.ok) {
        const data = await topUsersRes.json();
        setTopUsers(data.data);
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        setPerformanceData(data.data);
      }

    } catch (error) {
      console.error('Analytics verisi alınamadı:', error);
      toast.error('Analytics verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // 📊 Zaman aralığı değiştirme
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  // 📊 Chart verilerini hazırla
  const prepareHourlyChartData = () => ({
    labels: hourlyUsage.map(item => `${item.hour}:00`),
    datasets: [{
      label: 'Saatlik Kullanım',
      data: hourlyUsage.map(item => item.count),
      borderColor: 'rgb(25, 118, 210)',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      fill: true,
      tension: 0.4
    }]
  });

  const prepareDailyChartData = () => ({
    labels: dailyUsage.map(item => new Date(item.date).toLocaleDateString('tr-TR')),
    datasets: [{
      label: 'Günlük Liste Oluşturma',
      data: dailyUsage.map(item => item.count),
      backgroundColor: 'rgba(46, 125, 50, 0.8)',
      borderColor: 'rgb(46, 125, 50)',
      borderWidth: 1
    }]
  });

  const prepareTemplateChartData = () => ({
    labels: templateUsage.map(item => {
      const names = {
        corporate: 'Kurumsal',
        premium: 'Premium', 
        executive: 'Yönetici'
      };
      return names[item.template] || item.template;
    }),
    datasets: [{
      data: templateUsage.map(item => item.count),
      backgroundColor: [
        'rgba(25, 118, 210, 0.8)',
        'rgba(46, 125, 50, 0.8)',
        'rgba(123, 31, 162, 0.8)'
      ],
      borderColor: [
        'rgb(25, 118, 210)',
        'rgb(46, 125, 50)',
        'rgb(123, 31, 162)'
      ],
      borderWidth: 2
    }]
  });

  const prepareDepartmentChartData = () => ({
    labels: departmentUsage.slice(0, 8).map(item => item.department),
    datasets: [{
      label: 'Departman Kullanımı',
      data: departmentUsage.slice(0, 8).map(item => item.count),
      backgroundColor: 'rgba(237, 108, 2, 0.8)',
      borderColor: 'rgb(237, 108, 2)',
      borderWidth: 1
    }]
  });

  // 📊 İstatistik Kartları
  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{dashboardStats.totalEvents || 0}</Typography>
                <Typography variant="body2">Toplam Event</Typography>
              </Box>
              <AnalyticsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{dashboardStats.listsCreated || 0}</Typography>
                <Typography variant="body2">Liste Oluşturuldu</Typography>
              </Box>
              <DescriptionIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{dashboardStats.uniqueUsers || 0}</Typography>
                <Typography variant="body2">Aktif Kullanıcı</Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">{dashboardStats.avgEmployeeCount || 0}</Typography>
                <Typography variant="body2">Ort. Çalışan</Typography>
              </Box>
              <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 📊 Performans Kartları
  const renderPerformanceCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SpeedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{performanceData.avgGenerationTime || 0}ms</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ortalama Oluşturma Süresi
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <DownloadIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{dashboardStats.totalFileSize || 0} MB</Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Dosya Boyutu
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <TimeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{performanceData.totalLists || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Liste Sayısı
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 📊 En Aktif Kullanıcılar
  const renderTopUsers = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          En Aktif Kullanıcılar
        </Typography>
        
        {loading ? (
          <Box>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <List>
            {topUsers.slice(0, 10).map((user, index) => (
              <ListItem key={user.userId} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.userName?.charAt(0) || index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.userName || 'Kullanıcı'}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {user.totalEvents} olay • {user.listsCreated} liste
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Son: {new Date(user.lastActivity).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  }
                />
                <Chip 
                  label={`#${index + 1}`} 
                  size="small" 
                  color={index < 3 ? 'primary' : 'default'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* 🏷️ Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontWeight: 'bold'
        }}>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Sistem kullanım istatistikleri ve performans metrikleri
        </Typography>
      </Box>

      {/* ⏰ Zaman Aralığı Seçici */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
          {[
            { value: '24h', label: 'Son 24 Saat' },
            { value: '7d', label: 'Son 7 Gün' },
            { value: '30d', label: 'Son 30 Gün' },
            { value: '90d', label: 'Son 90 Gün' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'contained' : 'outlined'}
              onClick={() => handleTimeRangeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* 📈 Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* 📊 Ana İstatistikler */}
      {renderStatsCards()}

      {/* 📊 Performans Metrikleri */}
      {renderPerformanceCards()}

      {/* 📈 Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Saatlik Kullanım */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Saatlik Kullanım (Son 7 Gün)
              </Typography>
              {hourlyUsage.length > 0 && (
                <Line 
                  data={prepareHourlyChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Günlük Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" />
                Günlük Trend (Son 30 Gün)
              </Typography>
              {dailyUsage.length > 0 && (
                <Bar 
                  data={prepareDailyChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Şablon Kullanımı */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" />
                Şablon Kullanımı
              </Typography>
              {templateUsage.length > 0 && (
                <Doughnut 
                  data={prepareTemplateChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* En Aktif Kullanıcılar */}
        <Grid item xs={12} md={6}>
          {renderTopUsers()}
        </Grid>
      </Grid>

      {/* 📊 Departman Analizi */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Departman Bazlı Kullanım
              </Typography>
              {departmentUsage.length > 0 && (
                <Bar 
                  data={prepareDepartmentChartData()} 
                  options={{
                    responsive: true,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Hızlı İstatistikler
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  En Popüler Şablon
                </Typography>
                <Typography variant="h6">
                  {templateUsage[0]?.template === 'corporate' ? '🏢 Kurumsal' : 
                   templateUsage[0]?.template === 'premium' ? '⭐ Premium' : 
                   templateUsage[0]?.template === 'executive' ? '👔 Yönetici' : 'N/A'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  En Aktif Departman
                </Typography>
                <Typography variant="h6">
                  {departmentUsage[0]?.department || 'N/A'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Toplam Download
                </Typography>
                <Typography variant="h6">
                  {dashboardStats.listsDownloaded || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsDashboard; 