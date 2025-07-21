import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Alert,
  Tooltip,
  TablePagination,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Restore as RestoreIcon,
  Person as PersonIcon,
  WorkOff as WorkOffIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// 🎨 Avatar renk fonksiyonu - İsme göre tutarlı renk üretir
const getRandomColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
};

// 📊 İstatistik kartı bileşeni
function StatCard({ title, value, icon, color, subtitle }) {
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
      </CardContent>
    </Card>
  );
}

// 🚪 İşten ayrılan çalışan kartı bileşeni
function FormerEmployeeCard({ employee, onRestore }) {
  // Ayrılma süresi hesapla
  const calculateDaysSinceTermination = (terminationDate) => {
    if (!terminationDate) return null;
    const today = new Date();
    const termDate = new Date(terminationDate);
    const diffTime = Math.abs(today - termDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceTermination = calculateDaysSinceTermination(employee.ayrilmaTarihi);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: getRandomColor(employee.adSoyad || employee.employeeId), width: 56, height: 56 }}>
            {employee.adSoyad ? employee.adSoyad.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA'}
          </Avatar>
          <Box ml={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {employee.adSoyad || 'İsimsiz Çalışan'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.employeeId} • {employee.pozisyon || 'Pozisyon Belirtilmemiş'}
            </Typography>
          </Box>
        </Box>

        {/* İş Bilgileri */}
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <WorkOffIcon sx={{ mr: 1, color: 'error.main', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Departman:</strong> {employee.departman || '-'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Lokasyon:</strong> {employee.lokasyon || '-'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <ScheduleIcon sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>İşe Giriş:</strong> {employee.iseGirisTarihi ? new Date(employee.iseGirisTarihi).toLocaleDateString('tr-TR') : '-'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <TrendingDownIcon sx={{ mr: 1, color: 'error.main', fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Ayrılma:</strong> {employee.ayrilmaTarihi ? new Date(employee.ayrilmaTarihi).toLocaleDateString('tr-TR') : '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Ayrılma Bilgileri */}
        {employee.ayrilmaSebebi && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              📝 Ayrılma Sebebi
            </Typography>
            <Typography variant="body2">
              {employee.ayrilmaSebebi}
            </Typography>
          </Box>
        )}

        {/* Alt Bilgiler ve Eylemler */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1}>
            <Chip 
              label="İŞTEN AYRILDI" 
              size="small"
              color="error"
              icon={<WorkOffIcon />}
            />
            {daysSinceTermination && (
              <Chip 
                label={`${daysSinceTermination} gün önce`} 
                size="small"
                variant="outlined"
                color="warning"
              />
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Tekrar İşe Al">
              <IconButton size="small" color="primary" onClick={() => onRestore(employee)}>
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function FormerEmployees() {
  const navigate = useNavigate();
  const [formerEmployees, setFormerEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // 10, 25, 50, 100 değerlerinden biri olmalı
  const [viewMode, setViewMode] = useState('cards'); // 'cards' veya 'table'
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // 🏢 Departman listesi
  const [departments, setDepartments] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    last30Days: 0,
    last7Days: 0,
    thisMonth: 0
  });

  // Alert göster
  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  // İşten ayrılanları yükle
  const fetchFormerEmployees = async () => {
    try {
      setLoading(true);
      
      // İşten ayrılanları ve istatistikleri paralel olarak yükle
      const [employeesResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/employees/former?limit=500'),
        fetch('http://localhost:5001/api/employees/former/stats')
      ]);
      
      if (employeesResponse.ok && statsResponse.ok) {
        const employeesData = await employeesResponse.json();
        const statsData = await statsResponse.json();
        
        const employees = employeesData.data || employeesData;
        const stats = statsData.data || statsData;
        
        setFormerEmployees(employees);
        
        // Backend'den gelen istatistikleri kullan
        setStatistics({
          total: stats.total || 0,
          last30Days: stats.last30Days || 0,
          last7Days: stats.last7Days || 0,
          thisMonth: stats.thisMonth || 0
        });
      } else {
        showAlert('İşten ayrılanlar yüklenirken hata oluştu', 'error');
      }
    } catch (error) {
      console.error('API Hatası:', error);
      showAlert('Bağlantı hatası oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri hesapla (artık backend'den geliyor)
  // calculateStatistics fonksiyonu kaldırıldı - backend'den direkt alınıyor

  // Departman listesini yükle
  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/employees/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Departman listesi yükleme hatası:', error);
    }
  };

  useEffect(() => {
    fetchFormerEmployees();
    fetchDepartments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // İşten ayrılanları filtrele
  const filteredEmployees = formerEmployees.filter(employee => {
    const matchesSearch = (employee.adSoyad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.departman || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.pozisyon || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === '' || employee.departman === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Sayfalama için veriyi ayır
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Çalışanı tekrar işe al
  const handleRestoreEmployee = async (employee) => {
    const fullName = employee.adSoyad || 'İsimsiz çalışan';
    const confirmMessage = `${fullName} adlı çalışanı tekrar işe almak istediğinize emin misiniz?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const restoreData = {
          durum: 'AKTIF',
          ayrilmaTarihi: null,
          ayrilmaSebebi: null
        };

        const response = await fetch(`http://localhost:5001/api/employees/${employee._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(restoreData),
        });

        if (response.ok) {
          showAlert(`${fullName} tekrar işe alındı`, 'success');
          fetchFormerEmployees(); // Listeyi yenile
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'İşe alma işlemi başarısız', 'error');
        }
      } catch (error) {
        console.error('İşe alma hatası:', error);
        showAlert('İşe alma işlemi başarısız', 'error');
      }
    }
  };

  // Excel'e aktar
  const handleExportExcel = async () => {
    try {
      showAlert('Excel dosyası oluşturuluyor...', 'info');
      
      const params = new URLSearchParams();
      params.append('durum', 'AYRILDI');
      if (searchTerm) params.append('search', searchTerm);
      if (departmentFilter) params.append('departman', departmentFilter);
      
      const response = await fetch(`http://localhost:5001/api/excel/employees/filtered?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        const fileName = `Canga_Isten_Ayrilanlar_${currentDate}.xlsx`;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        showAlert('Excel dosyası başarıyla indirildi!', 'success');
      } else {
        showAlert('Excel oluşturma başarısız', 'error');
      }
    } catch (error) {
      console.error('Excel export hatası:', error);
      showAlert('Excel oluşturma işlemi başarısız', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>İşten ayrılanlar yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Başlık ve İstatistikler */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🚪 İşten Ayrılanlar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Toplam {formerEmployees.length} çalışan • {filteredEmployees.length} sonuç gösteriliyor
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            📊 İşten ayrılmış çalışanların listesi ve istatistikleri
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            color="warning"
          >
            Excel'e Aktar
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/employees')}
            color="primary"
          >
            Aktif Çalışanlara Dön
          </Button>
        </Box>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam İşten Ayrılan"
            value={statistics.total}
            icon={<WorkOffIcon />}
            color="error"
            subtitle="Tüm zamanlar"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Son 30 Gün"
            value={statistics.last30Days}
            icon={<TrendingDownIcon />}
            color="warning"
            subtitle="Aylık ayrılma"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bu Ay"
            value={statistics.thisMonth}
            icon={<ScheduleIcon />}
            color="info"
            subtitle="Mevcut ay"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Son 7 Gün"
            value={statistics.last7Days}
            icon={<PersonIcon />}
            color="secondary"
            subtitle="Haftalık ayrılma"
          />
        </Grid>
      </Grid>

      {/* Filtreler ve Arama */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="İşten Ayrılan Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Departman</InputLabel>
              <Select
                value={departmentFilter}
                label="Departman"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('cards')}
                size="small"
              >
                Kartlar
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Tablo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* İşten Ayrılanlar Listesi - Kart Görünümü */}
      {viewMode === 'cards' && (
        <Grid container spacing={2}>
          {paginatedEmployees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={employee._id}>
              <FormerEmployeeCard
                employee={employee}
                onRestore={handleRestoreEmployee}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* İşten Ayrılanlar Listesi - Tablo Görünümü */}
      {viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Çalışan</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Departman</TableCell>
                <TableCell>Pozisyon</TableCell>
                <TableCell>Ayrılma Tarihi</TableCell>
                <TableCell>Ayrılma Süresi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => {
                const daysSinceTermination = employee.ayrilmaTarihi ? 
                  Math.ceil((new Date() - new Date(employee.ayrilmaTarihi)) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: getRandomColor(employee.adSoyad || employee.employeeId) }}>
                          {employee.adSoyad ? employee.adSoyad.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {employee.adSoyad || 'İsimsiz'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.cepTelefonu || 'İletişim bilgisi yok'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.departman} 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{employee.pozisyon}</TableCell>
                    <TableCell>
                      {employee.ayrilmaTarihi ? new Date(employee.ayrilmaTarihi).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell>
                      {daysSinceTermination ? (
                        <Chip 
                          label={`${daysSinceTermination} gün`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Tekrar İşe Al">
                        <IconButton size="small" color="primary" onClick={() => handleRestoreEmployee(employee)}>
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Sayfalama */}
      <TablePagination
        component="div"
        count={filteredEmployees.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Sayfa başına:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />

      {/* Boş durum */}
      {filteredEmployees.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <WorkOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            İşten ayrılan çalışan bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filtreleri temizleyerek tekrar deneyebilirsiniz.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default FormerEmployees; 