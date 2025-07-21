import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// 🎨 Validation renkleri
const getValidationColor = (isValid, hasError) => {
  if (hasError) return 'error.light';
  if (isValid) return 'success.light';
  return 'grey.100';
};

// 📋 Excel benzeri tablo satırı komponenti
function EmployeeRow({ 
  employee, 
  index, 
  onUpdate, 
  onDelete, 
  departments, 
  locations, 
  serviceRoutes,
  availableStops,
  onServiceRouteChange,
  errors = {},
  isValid = true 
}) {
  const [localData, setLocalData] = useState(employee);

  // Değişiklikleri parent'a bildir
  const handleChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(index, updatedData);
  };

  // Servis güzergahı değiştiğinde durakları yükle
  const handleServiceRouteChange = (value) => {
    handleChange('servisGuzergahi', value);
    handleChange('durak', ''); // Durak seçimini sıfırla
    onServiceRouteChange(value);
  };

  return (
    <TableRow 
      sx={{ 
        backgroundColor: getValidationColor(isValid, Object.keys(errors).length > 0),
        '&:hover': { backgroundColor: 'action.hover' }
      }}
    >
      {/* Sıra No */}
      <TableCell 
        sx={{ 
          width: 60, 
          textAlign: 'center',
          fontWeight: 'bold',
          bgcolor: 'grey.50'
        }}
      >
        {index + 1}
      </TableCell>

      {/* Ad Soyad */}
      <TableCell sx={{ minWidth: 200 }}>
        <TextField
          fullWidth
          variant="standard"
          value={localData.adSoyad || ''}
          onChange={(e) => handleChange('adSoyad', e.target.value)}
          placeholder="Ad Soyad"
          error={!!errors.adSoyad}
          helperText={errors.adSoyad}
          InputProps={{
            startAdornment: errors.adSoyad ? (
              <InputAdornment position="start">
                <ErrorIcon color="error" fontSize="small" />
              </InputAdornment>
            ) : null
          }}
        />
      </TableCell>

      {/* TC No */}
      <TableCell sx={{ minWidth: 150 }}>
        <TextField
          fullWidth
          variant="standard"
          value={localData.tcNo || ''}
          onChange={(e) => handleChange('tcNo', e.target.value)}
          placeholder="TC Kimlik No"
          inputProps={{ maxLength: 11 }}
          error={!!errors.tcNo}
          helperText={errors.tcNo}
        />
      </TableCell>

      {/* Telefon */}
      <TableCell sx={{ minWidth: 150 }}>
        <TextField
          fullWidth
          variant="standard"
          value={localData.cepTelefonu || ''}
          onChange={(e) => handleChange('cepTelefonu', e.target.value)}
          placeholder="0555 123 45 67"
          error={!!errors.cepTelefonu}
          helperText={errors.cepTelefonu}
        />
      </TableCell>

      {/* Doğum Tarihi */}
      <TableCell sx={{ minWidth: 130 }}>
        <TextField
          fullWidth
          variant="standard"
          type="date"
          value={localData.dogumTarihi || ''}
          onChange={(e) => handleChange('dogumTarihi', e.target.value)}
          error={!!errors.dogumTarihi}
          helperText={errors.dogumTarihi}
          InputLabelProps={{ shrink: true }}
        />
      </TableCell>

      {/* Departman */}
      <TableCell sx={{ minWidth: 200 }}>
        <FormControl fullWidth variant="standard" error={!!errors.departman}>
          <Select
            value={localData.departman || ''}
            onChange={(e) => handleChange('departman', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Departman Seçin</em>
            </MenuItem>
            {departments.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>

      {/* Pozisyon */}
      <TableCell sx={{ minWidth: 150 }}>
        <TextField
          fullWidth
          variant="standard"
          value={localData.pozisyon || ''}
          onChange={(e) => handleChange('pozisyon', e.target.value)}
          placeholder="Görev/Pozisyon"
          error={!!errors.pozisyon}
          helperText={errors.pozisyon}
        />
      </TableCell>

      {/* Lokasyon */}
      <TableCell sx={{ minWidth: 120 }}>
        <FormControl fullWidth variant="standard" error={!!errors.lokasyon}>
          <Select
            value={localData.lokasyon || ''}
            onChange={(e) => handleChange('lokasyon', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Lokasyon</em>
            </MenuItem>
            {locations.map(loc => (
              <MenuItem key={loc} value={loc}>{loc}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>

      {/* Servis Tarihi */}
      <TableCell sx={{ minWidth: 130 }}>
        <TextField
          fullWidth
          variant="standard"
          type="date"
          value={localData.servisTarihi || ''}
          onChange={(e) => handleChange('servisTarihi', e.target.value)}
          error={!!errors.servisTarihi}
          helperText={errors.servisTarihi}
          InputLabelProps={{ shrink: true }}
        />
      </TableCell>

      {/* Servis Güzergahı */}
      <TableCell sx={{ minWidth: 200 }}>
        <Autocomplete
          fullWidth
          options={serviceRoutes}
          value={localData.servisGuzergahi || ''}
          onChange={(e, value) => handleServiceRouteChange(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="Servis Güzergahı"
              error={!!errors.servisGuzergahi}
              helperText={errors.servisGuzergahi}
            />
          )}
          freeSolo
        />
      </TableCell>

      {/* Durak */}
      <TableCell sx={{ minWidth: 150 }}>
        <Autocomplete
          fullWidth
          options={availableStops}
          value={localData.durak || ''}
          onChange={(e, value) => handleChange('durak', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="Durak"
              error={!!errors.durak}
              helperText={errors.durak}
            />
          )}
          freeSolo
          disabled={!localData.servisGuzergahi}
        />
      </TableCell>

      {/* Durum */}
      <TableCell sx={{ minWidth: 100 }}>
        <FormControl fullWidth variant="standard">
          <Select
            value={localData.durum || 'AKTIF'}
            onChange={(e) => handleChange('durum', e.target.value)}
          >
            <MenuItem value="AKTIF">AKTIF</MenuItem>
            <MenuItem value="PASIF">PASIF</MenuItem>
            <MenuItem value="İZINLI">İZINLI</MenuItem>
            <MenuItem value="AYRILDI">AYRILDI</MenuItem>
          </Select>
        </FormControl>
      </TableCell>

      {/* İşlemler */}
      <TableCell sx={{ width: 100, textAlign: 'center' }}>
        <Tooltip title="Satırı Sil">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(index)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        {isValid ? (
          <CheckIcon color="success" fontSize="small" />
        ) : (
          <WarningIcon color="warning" fontSize="small" />
        )}
      </TableCell>
    </TableRow>
  );
}

// 🎯 Ana hızlı ekleme komponenti
function BulkEmployeeEditor({ onSave, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Form verileri
  const [serviceRoutes, setServiceRoutes] = useState([]);
  const [availableStops, setAvailableStops] = useState([]);

  // Sabitler
  const departments = [
    'MERKEZ FABRİKA',
    'İŞL FABRİKA',
    'TEKNİK OFİS / BAKIM MÜHENDİSİ',
    'İDARİ',
    'CNC TORNA İŞLİYATÇISI'
  ];

  const locations = ['MERKEZ', 'İŞL'];

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // 🚀 Component mount olduğunda başlangıç verilerini yükle
  useEffect(() => {
    fetchServiceRoutes();
    // Başlangıç için 5 boş satır ekle
    addEmptyRows(5);
  }, []);

  // 🚌 Servis güzergahlarını yükle
  const fetchServiceRoutes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/services/routes/names');
      if (response.ok) {
        const data = await response.json();
        setServiceRoutes(data.data || []);
      }
    } catch (error) {
      console.error('Servis güzergahları yükleme hatası:', error);
    }
  };

  // 🚏 Seçilen güzergahın duraklarını yükle
  const fetchStopsForRoute = async (routeName) => {
    if (!routeName) {
      setAvailableStops([]);
      return;
    }

    try {
      const encodedRouteName = encodeURIComponent(routeName);
      const response = await fetch(`http://localhost:5001/api/services/routes/${encodedRouteName}/stops`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailableStops(data.data.stops || []);
      } else {
        setAvailableStops([]);
      }
    } catch (error) {
      console.error('Durak yükleme hatası:', error);
      setAvailableStops([]);
    }
  };

  // 📝 Boş satırlar ekle
  const addEmptyRows = (count = 1) => {
    const newRows = Array(count).fill(null).map((_, index) => ({
      id: Date.now() + index,
      adSoyad: '',
      tcNo: '',
      cepTelefonu: '',
      dogumTarihi: '',
      departman: '',
      pozisyon: '',
      lokasyon: '',
      servisTarihi: '',
      servisGuzergahi: '',
      durak: '',
      durum: 'AKTIF'
    }));
    
    setEmployees(prev => [...prev, ...newRows]);
  };

  // 🗑️ Satır sil
  const deleteRow = (index) => {
    setEmployees(prev => prev.filter((_, i) => i !== index));
    
    // Errors'dan da sil
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  // ✏️ Satır güncelle
  const updateRow = (index, data) => {
    setEmployees(prev => {
      const newEmployees = [...prev];
      newEmployees[index] = data;
      return newEmployees;
    });

    // Real-time validation
    validateRow(index, data);
  };

  // ✅ Satır validation
  const validateRow = (index, data) => {
    const rowErrors = {};

    // Zorunlu alanlar
    if (!data.adSoyad?.trim()) {
      rowErrors.adSoyad = 'Ad Soyad zorunlu';
    }

    if (!data.departman) {
      rowErrors.departman = 'Departman zorunlu';
    }

    if (!data.pozisyon?.trim()) {
      rowErrors.pozisyon = 'Pozisyon zorunlu';
    }

    if (!data.lokasyon) {
      rowErrors.lokasyon = 'Lokasyon zorunlu';
    }

    // TC No validation (11 hane)
    if (data.tcNo && !/^\d{11}$/.test(data.tcNo)) {
      rowErrors.tcNo = 'TC No 11 haneli olmalı';
    }

    // Telefon validation
    if (data.cepTelefonu && !/^[\d\s\-\(\)]+$/.test(data.cepTelefonu)) {
      rowErrors.cepTelefonu = 'Geçerli telefon numarası girin';
    }

    // Errors state'i güncelle
    setErrors(prev => ({
      ...prev,
      [index]: rowErrors
    }));

    // Validation results güncelle
    setValidationResults(prev => ({
      ...prev,
      [index]: Object.keys(rowErrors).length === 0
    }));

    return Object.keys(rowErrors).length === 0;
  };

  // 🎯 Tüm satırları validate et
  const validateAllRows = () => {
    let allValid = true;

    employees.forEach((employee, index) => {
      const isValid = validateRow(index, employee);
      allValid = allValid && isValid;
    });

    return allValid;
  };

  // 💾 Kaydet
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation kontrolü
      if (!validateAllRows()) {
        showAlert('Lütfen tüm hataları düzeltin', 'error');
        return;
      }

      // Boş satırları filtrele
      const validEmployees = employees.filter(emp => 
        emp.adSoyad?.trim() && emp.departman && emp.pozisyon?.trim() && emp.lokasyon
      );

      if (validEmployees.length === 0) {
        showAlert('En az bir geçerli çalışan girişi yapın', 'warning');
        return;
      }

      // Backend'e gönder
      const response = await fetch('http://localhost:5001/api/employees/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employees: validEmployees }),
      });

      if (response.ok) {
        const result = await response.json();
        showAlert(
          `${result.data.success} çalışan başarıyla eklendi${result.data.failed > 0 ? `, ${result.data.failed} hata` : ''}`,
          'success'
        );
        
        if (onSave) {
          onSave(result);
        }
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || 'Kaydetme işlemi başarısız', 'error');
      }

    } catch (error) {
      console.error('Kaydetme hatası:', error);
      showAlert('Kaydetme işlemi başarısız', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 📋 Şablon doldur
  const fillTemplate = (templateType) => {
    const templates = {
      merkez: {
        departman: 'MERKEZ FABRİKA',
        lokasyon: 'MERKEZ',
        servisGuzergahi: 'DİSPANSER SERVİS GÜZERGAHI',
        durum: 'AKTIF'
      },
      isl: {
        departman: 'İŞL FABRİKA',
        lokasyon: 'İŞL',
        servisGuzergahi: 'SANAYİ MAHALLESİ SERVİS GÜZERGAHI',
        durum: 'AKTIF'
      },
      teknik: {
        departman: 'TEKNİK OFİS / BAKIM MÜHENDİSİ',
        lokasyon: 'MERKEZ',
        durum: 'AKTIF'
      },
      cnc: {
        departman: 'CNC TORNA İŞLİYATÇISI',
        lokasyon: 'MERKEZ',
        pozisyon: 'CNC TORNA OPERATÖRÜ',
        durum: 'AKTIF'
      }
    };

    const template = templates[templateType];
    if (template) {
      const updatedEmployees = employees.map(emp => {
        if (!emp.adSoyad) { // Sadece boş satırları doldur
          return { ...emp, ...template };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
      setTemplateDialogOpen(false);
      showAlert('Şablon uygulandı', 'success');
    }
  };

  // 📄 Copy-paste desteği
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const rows = pastedText.split('\n');
    
    const newEmployees = rows.map(row => {
      const cells = row.split('\t'); // Tab ile ayrılmış Excel verisi
      return {
        id: Date.now() + Math.random(),
        adSoyad: cells[0] || '',
        tcNo: cells[1] || '',
        cepTelefonu: cells[2] || '',
        dogumTarihi: cells[3] || '',
        departman: cells[4] || '',
        pozisyon: cells[5] || '',
        lokasyon: cells[6] || '',
        servisTarihi: cells[7] || '',
        servisGuzergahi: cells[8] || '',
        durak: cells[9] || '',
        durum: cells[10] || 'AKTIF'
      };
    }).filter(emp => emp.adSoyad); // Boş satırları filtrele

    if (newEmployees.length > 0) {
      setEmployees(prev => [...prev, ...newEmployees]);
      showAlert(`${newEmployees.length} satır yapıştırıldı`, 'success');
    }
  }, []);

  // 🚨 Alert göster
  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  return (
    <Box>
      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="primary">
              🚀 Hızlı Çalışan Ekleme
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Excel benzeri tablo ile toplu çalışan ekleme • {employees.length} satır
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addEmptyRows(5)}
              size="small"
            >
              5 Satır Ekle
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              size="small"
            >
              Şablon
            </Button>

            <Tooltip title="Excel'den yapıştır (Ctrl+V)">
              <Button
                variant="outlined"
                startIcon={<PasteIcon />}
                onClick={() => showAlert('Excel verisini tabloya yapıştırın (Ctrl+V)', 'info')}
                size="small"
              >
                Yapıştır
              </Button>
            </Tooltip>

            <Button
              variant="outlined"
              onClick={() => setEmployees([])}
              size="small"
              color="warning"
            >
              Temizle
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Excel benzeri tablo */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 600, 
          border: '2px solid',
          borderColor: 'primary.main',
          '& .MuiTableCell-root': {
            borderRight: '1px solid #e0e0e0'
          }
        }}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Ad Soyad *</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>TC No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Telefon</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Doğum Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Departman *</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Pozisyon *</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Lokasyon *</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Servis Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Servis Güzergahı</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Durak</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', bgcolor: 'primary.main' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee, index) => (
              <EmployeeRow
                key={employee.id || index}
                employee={employee}
                index={index}
                onUpdate={updateRow}
                onDelete={deleteRow}
                departments={departments}
                locations={locations}
                serviceRoutes={serviceRoutes}
                availableStops={availableStops}
                onServiceRouteChange={fetchStopsForRoute}
                errors={errors[index] || {}}
                isValid={validationResults[index] !== false}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alt toolbar */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          💡 Excel'den veri kopyalayıp tabloya yapıştırabilirsiniz (Ctrl+V)
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={saving}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || employees.length === 0}
          >
            {saving ? 'Kaydediliyor...' : `${employees.filter(e => e.adSoyad).length} Çalışanı Kaydet`}
          </Button>
        </Stack>
      </Box>

      {/* Şablon Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)}>
        <DialogTitle>📋 Hızlı Şablon Seç</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Boş satırlara otomatik değerler doldurur:
          </Typography>
          <Stack spacing={1}>
            <Button
              variant="outlined"
              onClick={() => fillTemplate('merkez')}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              🏢 Merkez Fabrika Şablonu
            </Button>
            <Button
              variant="outlined"
              onClick={() => fillTemplate('isl')}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              🏭 İşl Fabrika Şablonu
            </Button>
            <Button
              variant="outlined"
              onClick={() => fillTemplate('teknik')}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              ⚙️ Teknik Ofis Şablonu
            </Button>
            <Button
              variant="outlined"
              onClick={() => fillTemplate('cnc')}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              🔧 CNC Torna Şablonu
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BulkEmployeeEditor; 