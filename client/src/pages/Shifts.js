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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Fab,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  Checklist as ChecklistIcon,
  DirectionsBus as BusIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Shifts() {
  const navigate = useNavigate();
  
  // State'ler
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuShift, setMenuShift] = useState(null);

  // Component mount
  useEffect(() => {
    fetchShifts();
  }, []);

  // Vardiyaları getir - gelişmiş hata yönetimi ile
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
      
      const response = await fetch('http://localhost:5001/api/shifts?limit=50', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setShifts(data.data || []);
      } else {
        console.error('Vardiya verisi alınamadı:', data.message);
      }
    } catch (error) {
      console.error('Vardiya verisi alınamadı:', error.message || error);
      
      // Demo veriler - backend çalışmadığında
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        console.log('⚠️ Backend bağlantısı yok, demo veriler yükleniyor...');
        setShifts([
          {
            _id: 'demo-1',
            title: 'MERKEZ ŞUBE - Haftalık Vardiya',
            location: 'MERKEZ ŞUBE',
            startDate: new Date(),
            endDate: new Date(),
            status: 'TASLAK',
            shiftGroups: [
              { groupName: 'MERKEZ FABRİKA', shifts: [{ employees: [{name: 'Demo Çalışan'}] }] }
            ],
            createdAt: new Date()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Menü açma/kapama
  const handleMenuOpen = (event, shift) => {
    setAnchorEl(event.currentTarget);
    setMenuShift(shift);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuShift(null);
  };

  // Vardiya görüntüle
  const handleViewShift = (shift) => {
    setSelectedShift(shift);
    setViewDialog(true);
    handleMenuClose();
  };

  // İmza listesi indir
  const handleDownloadSignature = async (shift) => {
    try {
      const response = await fetch('http://localhost:5001/api/excel/export/shift/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftId: shift._id
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `imza-listesi-${shift.location}-${new Date(shift.startDate).toLocaleDateString('tr-TR')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('İmza listesi dosyası indirilemedi');
      }
    } catch (error) {
      console.error('İmza listesi indirme hatası:', error);
      alert('Bir hata oluştu');
    }
    handleMenuClose();
  };

  // 🚌 Servis programı indir - YENİ ÖZELLİK!
  const handleDownloadServiceSchedule = async (shift) => {
    try {
      const response = await fetch('http://localhost:5001/api/excel/export/shift-service-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftId: shift._id
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `servis-programi-${shift.location}-${new Date(shift.startDate).toLocaleDateString('tr-TR')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Servis programı dosyası indirilemedi');
      }
    } catch (error) {
      console.error('Servis programı indirme hatası:', error);
      alert('Bir hata oluştu');
    }
    handleMenuClose();
  };

  // Excel indir
  const handleDownloadExcel = async (shift) => {
    try {
      const response = await fetch('http://localhost:5001/api/excel/export/shift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shiftId: shift._id
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vardiya-listesi-${shift.location}-${new Date(shift.startDate).toLocaleDateString('tr-TR')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Excel dosyası indirilemedi');
      }
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      alert('Bir hata oluştu');
    }
    handleMenuClose();
  };

  // Vardiya sil
  const handleDeleteShift = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/shifts/${selectedShift._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setShifts(shifts.filter(s => s._id !== selectedShift._id));
        setDeleteDialog(false);
        setSelectedShift(null);
      } else {
        alert('Vardiya silinemedi: ' + result.message);
      }
    } catch (error) {
      console.error('Vardiya silme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Durum rengi
  const getStatusColor = (status) => {
    switch (status) {
      case 'TASLAK': return 'warning';
      case 'ONAYLANDI': return 'info';
      case 'YAYINLANDI': return 'success';
      case 'TAMAMLANDI': return 'default';
      case 'İPTAL': return 'error';
      default: return 'default';
    }
  };

  // Durum metni
  const getStatusText = (status) => {
    switch (status) {
      case 'TASLAK': return 'Taslak';
      case 'ONAYLANDI': return 'Onaylandı';
      case 'YAYINLANDI': return 'Yayınlandı';
      case 'TAMAMLANDI': return 'Tamamlandı';
      case 'İPTAL': return 'İptal';
      default: return status;
    }
  };

  // Toplam çalışan sayısı hesapla
  const getTotalEmployees = (shift) => {
    let total = 0;
    shift.shiftGroups?.forEach(group => {
      group.shifts?.forEach(s => {
        total += s.employees?.length || 0;
      });
    });
    return total;
  };

  return (
    <Box>
      {/* Başlık ve Aksiyonlar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📅 Vardiya Listeleri
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Oluşturulan vardiya listelerini görüntüleyin ve yönetin
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={fetchShifts}>
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

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Vardiya Kartları */}
      {shifts.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Henüz vardiya listesi oluşturulmamış
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            İlk vardiya listenizi oluşturmak için "Yeni Vardiya" butonuna tıklayın.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/shifts/create')}
          >
            İlk Vardiyayı Oluştur
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {shifts.map((shift) => (
            <Grid item xs={12} md={6} lg={4} key={shift._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Başlık ve Durum */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                      {shift.title}
                    </Typography>
                    <Chip
                      label={getStatusText(shift.status)}
                      color={getStatusColor(shift.status)}
                      size="small"
                    />
                  </Box>

                  {/* Bilgiler */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {shift.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(shift.startDate).toLocaleDateString('tr-TR')} - {new Date(shift.endDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {getTotalEmployees(shift)} çalışan, {shift.shiftGroups?.length || 0} grup
                      </Typography>
                    </Box>
                  </Box>

                  {/* Departmanlar */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {shift.shiftGroups?.slice(0, 3).map((group, index) => (
                      <Chip
                        key={index}
                        label={group.groupName}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {shift.shiftGroups?.length > 3 && (
                      <Chip
                        label={`+${shift.shiftGroups.length - 3} daha`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>

                  {/* Oluşturma Tarihi */}
                  <Typography variant="caption" color="text.secondary">
                    Oluşturulma: {new Date(shift.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewShift(shift)}
                  >
                    Görüntüle
                  </Button>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      color="success"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadExcel(shift)}
                    >
                      Excel
                    </Button>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<ChecklistIcon />}
                      onClick={() => handleDownloadSignature(shift)}
                    >
                      İmza
                    </Button>
                    <Button
                      size="small"
                      color="warning"
                      startIcon={<BusIcon />}
                      onClick={() => handleDownloadServiceSchedule(shift)}
                    >
                      Servis
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, shift)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/shifts/create')}
      >
        <AddIcon />
      </Fab>

      {/* Menü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewShift(menuShift)}>
          <ViewIcon sx={{ mr: 1 }} />
          Görüntüle
        </MenuItem>
        <MenuItem onClick={() => handleDownloadExcel(menuShift)}>
          <DownloadIcon sx={{ mr: 1 }} />
          Excel İndir
        </MenuItem>
        <MenuItem onClick={() => handleDownloadSignature(menuShift)}>
          <ChecklistIcon sx={{ mr: 1 }} />
          İmza Listesi İndir
        </MenuItem>
        <MenuItem onClick={() => handleDownloadServiceSchedule(menuShift)}>
          <BusIcon sx={{ mr: 1 }} />
          Servis Programı İndir
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSelectedShift(menuShift);
            setDeleteDialog(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Vardiya Görüntüleme Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📋 {selectedShift?.title}
          <Chip 
            label={getStatusText(selectedShift?.status)} 
            color={getStatusColor(selectedShift?.status)}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Box>
              {/* Temel Bilgiler */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Lokasyon</Typography>
                    <Typography variant="body1">{selectedShift.location}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tarih Aralığı</Typography>
                    <Typography variant="body1">
                      {new Date(selectedShift.startDate).toLocaleDateString('tr-TR')} - {new Date(selectedShift.endDate).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
                    <Typography variant="body1">{selectedShift.description || 'Açıklama yok'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Vardiya Grupları */}
              <Typography variant="h6" gutterBottom>Vardiya Grupları</Typography>
              {selectedShift.shiftGroups?.map((group, groupIndex) => (
                <Paper key={groupIndex} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {group.groupName}
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Vardiya Saati</TableCell>
                          <TableCell>Çalışan Sayısı</TableCell>
                          <TableCell>Çalışanlar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.shifts?.map((shift, shiftIndex) => (
                          <TableRow key={shiftIndex}>
                            <TableCell>
                              <Chip label={shift.timeSlot} size="small" color="primary" />
                            </TableCell>
                            <TableCell>{shift.employees?.length || 0}</TableCell>
                            <TableCell>
                              {shift.employees?.map(emp => emp.name).join(', ') || 'Atama yok'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Kapat</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleDownloadExcel(selectedShift)}
            startIcon={<DownloadIcon />}
          >
            Excel İndir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onayı Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>🗑️ Vardiya Silme Onayı</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz!
          </Alert>
          <Typography variant="body1">
            <strong>{selectedShift?.title}</strong> adlı vardiya listesini silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteShift}
            startIcon={<DeleteIcon />}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Shifts; 