import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

// 🔍 Drill-down Modal Bileşeni
export function ChartDrilldownModal({ 
  open, 
  onClose, 
  selectedData, 
  chartType, 
  collection 
}) {
  const [drilldownData, setDrilldownData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLevel, setDetailLevel] = useState(1); // 1: basic, 2: detailed, 3: deep

  // Drill-down verilerini yükle
  const fetchDrilldownData = async () => {
    if (!selectedData || !open) return;

    try {
      setLoading(true);
      
      // API endpoint'i oluştur
      const params = new URLSearchParams({
        drilldown: 'true',
        level: detailLevel,
        filter: JSON.stringify({
          [getFilterField()]: selectedData.label || selectedData._id
        })
      });

      const response = await axios.get(
        `http://localhost:5001/api/database/collection/${collection}?${params}`
      );

      if (response.data.success) {
        setDrilldownData(response.data.data);
      }
    } catch (error) {
      console.error('Drilldown data error:', error);
      toast.error('Detay verileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  // Filtre alanını belirle
  const getFilterField = () => {
    switch (chartType) {
      case 'department': return 'department';
      case 'location': return 'location';
      case 'status': return 'status';
      default: return 'department';
    }
  };

  // Modal açıldığında verileri yükle
  useEffect(() => {
    if (open && selectedData) {
      fetchDrilldownData();
    }
  }, [open, selectedData, detailLevel]);

  // Drill-down başlığını oluştur
  const getTitle = () => {
    const label = selectedData?.label || selectedData?._id || 'Detay';
    const count = selectedData?.value || selectedData?.count || 0;
    return `${label} (${count} kayıt)`;
  };

  // İstatistik kartı
  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', p: 2 }}>
        <Box sx={{ 
          color: `${color}.main`, 
          mb: 1, 
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          {icon}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white'
      }}>
        <Box>
          <Typography variant="h6">
            🔍 Detaylı Analiz
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            {getTitle()}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300 
          }}>
            <CircularProgress size={50} />
            <Typography sx={{ ml: 2 }}>Detaylar yükleniyor...</Typography>
          </Box>
        ) : drilldownData ? (
          <Box>
            {/* 📊 Özet İstatistikler */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Toplam Kayıt"
                  value={drilldownData.pagination?.totalDocuments || 0}
                  icon={<AssessmentIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Aktif Durumda"
                  value={drilldownData.documents?.filter(doc => 
                    doc.status === 'AKTIF' || doc.status === 'ONAYLANDI'
                  ).length || 0}
                  icon={<CheckCircleIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pasif Durumda"
                  value={drilldownData.documents?.filter(doc => 
                    doc.status !== 'AKTIF' && doc.status !== 'ONAYLANDI'
                  ).length || 0}
                  icon={<WarningIcon />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Detay Seviyesi"
                  value={`Level ${detailLevel}`}
                  icon={<InfoIcon />}
                  color="info"
                />
              </Grid>
            </Grid>

            {/* 🎛️ Detay Seviyesi Kontrolleri */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ mr: 2, alignSelf: 'center' }}>
                Detay Seviyesi:
              </Typography>
              {[1, 2, 3].map(level => (
                <Chip
                  key={level}
                  label={`Level ${level}`}
                  color={detailLevel === level ? 'primary' : 'default'}
                  onClick={() => setDetailLevel(level)}
                  clickable
                  size="small"
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 📋 Detaylı Veriler */}
            {collection === 'employees' ? (
              <EmployeeDrilldown 
                data={drilldownData.documents} 
                level={detailLevel}
                filterType={chartType}
              />
            ) : collection === 'shifts' ? (
              <ShiftDrilldown 
                data={drilldownData.documents} 
                level={detailLevel}
                filterType={chartType}
              />
            ) : (
              <GenericDrilldown 
                data={drilldownData.documents} 
                level={detailLevel}
              />
            )}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
            Detay verileri bulunamadı
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Kapat
        </Button>
        <Button 
          onClick={fetchDrilldownData} 
          variant="contained"
          disabled={loading}
        >
          Yenile
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// 👥 Çalışan Drill-down Bileşeni
function EmployeeDrilldown({ data, level, filterType }) {
  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        Bu kategoride çalışan bulunamadı
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PeopleIcon sx={{ mr: 1 }} />
        Çalışan Detayları ({data.length} kişi)
      </Typography>

      {level >= 2 && (
        <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Ad Soyad</strong></TableCell>
                <TableCell><strong>Sicil No</strong></TableCell>
                <TableCell><strong>Departman</strong></TableCell>
                <TableCell><strong>Pozisyon</strong></TableCell>
                <TableCell><strong>Lokasyon</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                {level >= 3 && <TableCell><strong>Telefon</strong></TableCell>}
                {level >= 3 && <TableCell><strong>Servis</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, level >= 3 ? 50 : 20).map((employee, index) => (
                <TableRow key={employee._id || index}>
                  <TableCell>{employee.fullName || `${employee.firstName} ${employee.lastName}`}</TableCell>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.status}
                      color={employee.status === 'AKTIF' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {level >= 3 && <TableCell>{employee.phone || '-'}</TableCell>}
                  {level >= 3 && (
                    <TableCell>
                      <Chip 
                        label={employee.serviceInfo?.usesService ? 'Evet' : 'Hayır'}
                        color={employee.serviceInfo?.usesService ? 'info' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Özet bilgiler */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                📍 Lokasyon Dağılımı
              </Typography>
              <List dense>
                {getDistribution(data, 'location').map(item => (
                  <ListItem key={item.key}>
                    <ListItemText 
                      primary={item.key}
                      secondary={`${item.count} kişi`}
                    />
                    <Chip label={`%${item.percentage}`} size="small" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                🎯 Departman Dağılımı
              </Typography>
              <List dense>
                {getDistribution(data, 'department').slice(0, 5).map(item => (
                  <ListItem key={item.key}>
                    <ListItemText 
                      primary={item.key}
                      secondary={`${item.count} kişi`}
                    />
                    <Chip label={`%${item.percentage}`} size="small" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// 🕐 Vardiya Drill-down Bileşeni
function ShiftDrilldown({ data, level, filterType }) {
  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        Bu kategoride vardiya bulunamadı
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ScheduleIcon sx={{ mr: 1 }} />
        Vardiya Detayları ({data.length} vardiya)
      </Typography>

      {level >= 2 && (
        <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Başlık</strong></TableCell>
                <TableCell><strong>Lokasyon</strong></TableCell>
                <TableCell><strong>Başlangıç</strong></TableCell>
                <TableCell><strong>Bitiş</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                {level >= 3 && <TableCell><strong>Oluşturan</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, level >= 3 ? 30 : 15).map((shift, index) => (
                <TableRow key={shift._id || index}>
                  <TableCell>{shift.title}</TableCell>
                  <TableCell>{shift.location}</TableCell>
                  <TableCell>{new Date(shift.startDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{new Date(shift.endDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={shift.status}
                      color={shift.status === 'ONAYLANDI' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {level >= 3 && <TableCell>{shift.createdBy || '-'}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// 📋 Genel Drill-down Bileşeni
function GenericDrilldown({ data, level }) {
  return (
    <Box>
      <Typography variant="body1">
        {data?.length || 0} kayıt bulundu
      </Typography>
    </Box>
  );
}

// 📊 Dağılım hesaplama utility
function getDistribution(data, field) {
  const counts = {};
  const total = data.length;

  data.forEach(item => {
    const value = item[field] || 'Belirtilmemiş';
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([key, count]) => ({
      key,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
} 