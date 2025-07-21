import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  Avatar,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// 🎓 Stajyer ve Çıraklar Sayfası - Özel Yönetim Paneli
function TraineesAndApprentices() {
  // State'ler
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    stajyerlik: 0,
    cirakLise: 0,
    active: 0
  });
  const [editDialog, setEditDialog] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    department: 'STAJYERLİK',
    location: 'MERKEZ ŞUBE',
    position: '',
    startDate: '',
    endDate: '',
    supervisor: '',
    status: 'AKTIF'
  });

  // Stajyer/Çırak departmanları
  const TRAINEE_DEPARTMENTS = ['STAJYERLİK', 'ÇIRAK LİSE'];
  // 📍 Lokasyonlar - Sadece 2 şube
const LOCATIONS = ['MERKEZ ŞUBE', 'IŞIL ŞUBE'];

  // 📊 Verileri yükle
  const fetchTrainees = async () => {
    try {
      setLoading(true);
      
      // Önce özel endpoint'i dene
      try {
        const response = await axios.get('http://localhost:5001/api/employees/trainees-apprentices');
        if (response.data.success) {
          setTrainees(response.data.data.trainees);
          setStats(response.data.data.stats);
          toast.success('🎓 Stajyer ve Çıraklar yüklendi');
          return;
        }
      } catch (endpointError) {
        console.log('Özel endpoint kullanılamadı, fallback yapılıyor...');
      }
      
      // Fallback: Normal database endpoint'den filtrele
      const response = await axios.get('http://localhost:5001/api/database/collection/employees?limit=200');
      const allEmployees = response.data.data.documents;
      const filtered = allEmployees.filter(emp => 
        TRAINEE_DEPARTMENTS.includes(emp.department)
      );
      
      setTrainees(filtered);
      setStats({
        total: filtered.length,
        stajyerlik: filtered.filter(emp => emp.department === 'STAJYERLİK').length,
        cirakLise: filtered.filter(emp => emp.department === 'ÇIRAK LİSE').length,
        active: filtered.filter(emp => emp.status === 'AKTIF').length
      });
      toast.success('🎓 Stajyer ve Çıraklar yüklendi');
    } catch (error) {
      console.error('Trainees fetch error:', error);
      toast.error('Stajyer/Çırak verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // 💾 Stajyer/Çırak kaydet
  const saveTrainee = async () => {
    try {
      setLoading(true);
      
      if (editingTrainee) {
        await axios.put(
          `http://localhost:5001/api/database/collection/employees/${editingTrainee._id}`,
          formData
        );
        toast.success('✅ Stajyer/Çırak güncellendi');
      } else {
        await axios.post(
          'http://localhost:5001/api/database/collection/employees',
          formData
        );
        toast.success('✅ Yeni Stajyer/Çırak eklendi');
      }
      
      setEditDialog(false);
      setEditingTrainee(null);
      fetchTrainees();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme hatası!');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Stajyer/Çırak sil
  const deleteTrainee = async (id) => {
    if (window.confirm('Bu stajyer/çırağı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5001/api/database/collection/employees/${id}`);
        toast.success('🗑️ Stajyer/Çırak silindi');
        fetchTrainees();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Silme hatası!');
      }
    }
  };

  // ✏️ Düzenle
  const editTrainee = (trainee) => {
    setEditingTrainee(trainee);
    setFormData({
      firstName: trainee.firstName || '',
      lastName: trainee.lastName || '',
      employeeId: trainee.employeeId || '',
      department: trainee.department || 'STAJYERLİK',
      location: trainee.location || 'MERKEZ ŞUBE',
      position: trainee.position || '',
      startDate: trainee.startDate ? trainee.startDate.split('T')[0] : '',
      endDate: trainee.endDate ? trainee.endDate.split('T')[0] : '',
      supervisor: trainee.supervisor || '',
      status: trainee.status || 'AKTIF'
    });
    setEditDialog(true);
  };

  // 📊 Excel Export
  const exportToExcel = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/excel/export/custom', {
        data: filteredTrainees,
        filename: 'Stajyer_ve_Ciraklar',
        sheetName: 'Stajyer ve Çıraklar',
        collection: 'trainees_apprentices'
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Stajyer_ve_Ciraklar_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('📊 Excel raporu indirildi!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Excel export hatası!');
    }
  };

  // Filtreleme
  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = 
      trainee.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || trainee.department === selectedDepartment;
    const matchesLocation = !selectedLocation || trainee.location === selectedLocation;
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  // DataGrid kolonları
  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ bgcolor: params.row.department === 'STAJYERLİK' ? '#1976d2' : '#ff9800' }}>
          {params.row.department === 'STAJYERLİK' ? '🎓' : '🔧'}
        </Avatar>
      ),
      sortable: false
    },
    { field: 'firstName', headerName: 'Ad', width: 120 },
    { field: 'lastName', headerName: 'Soyad', width: 120 },
    { field: 'employeeId', headerName: 'Sicil No', width: 100 },
    { 
      field: 'department', 
      headerName: 'Departman', 
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'STAJYERLİK' ? 'primary' : 'warning'}
          size="small"
          icon={params.value === 'STAJYERLİK' ? <SchoolIcon /> : <WorkIcon />}
        />
      )
    },
    { field: 'location', headerName: 'Lokasyon', width: 120 },
    { field: 'position', headerName: 'Pozisyon', width: 150 },
    { field: 'supervisor', headerName: 'Sorumlu', width: 140 },
    { 
      field: 'startDate', 
      headerName: 'Başlangıç', 
      width: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'
    },
    { 
      field: 'endDate', 
      headerName: 'Bitiş', 
      width: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'
    },
    { 
      field: 'status', 
      headerName: 'Durum', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'AKTIF' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => editTrainee(params.row)}>
            ✏️
          </IconButton>
          <IconButton size="small" onClick={() => deleteTrainee(params.row._id)}>
            🗑️
          </IconButton>
        </Box>
      ),
      sortable: false
    }
  ];

  useEffect(() => {
    fetchTrainees();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* 🎓 Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon fontSize="large" color="primary" />
          🎓 Stajyer ve Çıraklar Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stajyer ve çırakların özel yönetim paneli - Eğitim ve gelişim takibi
        </Typography>
      </Box>

      {/* 📊 İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2">
                    Toplam Stajyer/Çırak
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.stajyerlik}
                  </Typography>
                  <Typography variant="body2">
                    Stajyerler
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.cirakLise}
                  </Typography>
                  <Typography variant="body2">
                    Çırak Lise
                  </Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2">
                    Aktif Durumda
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🔍 Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="🔍 Ad, Soyad veya Sicil No ile ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Departman</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                label="Departman"
              >
                <MenuItem value="">Tümü</MenuItem>
                {TRAINEE_DEPARTMENTS.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Lokasyon</InputLabel>
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                label="Lokasyon"
              >
                <MenuItem value="">Tümü</MenuItem>
                {LOCATIONS.map(loc => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Yenile">
                <IconButton onClick={fetchTrainees}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excel Export">
                <IconButton onClick={exportToExcel}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 📋 Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTrainees}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          checkboxSelection
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row._id}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        />
      </Paper>

      {/* ➕ Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          setEditingTrainee(null);
          setFormData({
            firstName: '',
            lastName: '',
            employeeId: '',
            department: 'STAJYERLİK',
            location: 'MERKEZ ŞUBE',
            position: '',
            startDate: '',
            endDate: '',
            supervisor: '',
            status: 'AKTIF'
          });
          setEditDialog(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* ✏️ Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTrainee ? '✏️ Stajyer/Çırak Düzenle' : '➕ Yeni Stajyer/Çırak Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sicil No (Otomatik oluşturulur)"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                placeholder="Otomatik: STAJ-001, CIRAK-025..."
                helperText="Boş bırakırsanız sistem otomatik oluşturur"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  label="Departman"
                >
                  {TRAINEE_DEPARTMENTS.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lokasyon</InputLabel>
                <Select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  label="Lokasyon"
                >
                  {LOCATIONS.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pozisyon"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sorumlu/Mentor"
                value={formData.supervisor}
                onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  label="Durum"
                >
                  <MenuItem value="AKTIF">AKTIF</MenuItem>
                  <MenuItem value="AYRILDI">AYRILDI</MenuItem>
                  <MenuItem value="TAMAMLANDI">TAMAMLANDI</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={saveTrainee} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TraineesAndApprentices; 