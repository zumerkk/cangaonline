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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

// ⚙️ Advanced Chart Filters Bileşeni
export function AdvancedChartFilters({ 
  open, 
  onClose, 
  onApplyFilters, 
  collection,
  currentFilters = {}
}) {
  const [filters, setFilters] = useState({
    // Tarih filtreleri
    dateRange: {
      start: null,
      end: null,
      preset: ''
    },
    // Kategori filtreleri
    departments: [],
    locations: [],
    statuses: [],
    // Sayısal filtreler
    employeeCount: { min: 0, max: 100 },
    // Boolean filtreler
    activeOnly: false,
    recentOnly: false,
    // Özel filtreler
    customFields: {}
  });

  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');

  // Mevcut filtreleri yükle
  useEffect(() => {
    if (currentFilters && Object.keys(currentFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...currentFilters }));
    }
    
    // Kaydedilmiş filtreleri localStorage'dan yükle
    const saved = localStorage.getItem(`chartFilters_${collection}`);
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, [currentFilters, collection]);

  // Departman seçenekleri
  const departmentOptions = [
    'TORNA GRUBU', 'FREZE GRUBU', 'TESTERE', 'İDARİ BİRİM',
    'GENEL ÇALIŞMA GRUBU', 'TEKNİK OFİS', 'KALİTE KONTROL',
    'BAKIM VE ONARIM', 'KAYNAK', 'MONTAJ', 'PLANLAMA'
  ];

  // Lokasyon seçenekleri
  const locationOptions = ['MERKEZ ŞUBE', 'IŞIL ŞUBE', 'OSB ŞUBE'];

  // Status seçenekleri
  const statusOptions = collection === 'employees' 
    ? ['AKTIF', 'PASIF', 'İZINLI', 'AYRILDI']
    : ['TASLAK', 'ONAYLANDI', 'YAYINLANDI', 'TAMAMLANDI', 'İPTAL'];

  // Tarih preset'leri
  const datePresets = [
    { label: 'Son 7 Gün', value: 'last7days' },
    { label: 'Son 30 Gün', value: 'last30days' },
    { label: 'Bu Ay', value: 'thisMonth' },
    { label: 'Geçen Ay', value: 'lastMonth' },
    { label: 'Bu Yıl', value: 'thisYear' },
    { label: 'Son 12 Ay', value: 'last12months' }
  ];

  // Preset tarih uygula
  const applyDatePreset = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      case 'last12months':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        end = now;
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      dateRange: { start, end, preset }
    }));
  };

  // Filtreleri MongoDB query'sine çevir
  const buildMongoQuery = () => {
    const query = {};

    // Tarih filtreleri
    if (filters.dateRange.start || filters.dateRange.end) {
      const dateField = collection === 'employees' ? 'hireDate' : 'createdAt';
      query[dateField] = {};
      
      if (filters.dateRange.start) {
        query[dateField].$gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        query[dateField].$lte = filters.dateRange.end;
      }
    }

    // Kategori filtreleri
    if (filters.departments.length > 0) {
      query.department = { $in: filters.departments };
    }
    if (filters.locations.length > 0) {
      query.location = { $in: filters.locations };
    }
    if (filters.statuses.length > 0) {
      query.status = { $in: filters.statuses };
    }

    // Boolean filtreler
    if (filters.activeOnly) {
      query.status = collection === 'employees' ? 'AKTIF' : { $in: ['ONAYLANDI', 'YAYINLANDI'] };
    }

    // Recent only filter
    if (filters.recentOnly) {
      const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: recentDate };
    }

    return query;
  };

  // Filtreleri uygula
  const handleApplyFilters = () => {
    const mongoQuery = buildMongoQuery();
    onApplyFilters(mongoQuery, filters);
    toast.success('Filtreler uygulandı! 🎯');
    onClose();
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null, preset: '' },
      departments: [],
      locations: [],
      statuses: [],
      employeeCount: { min: 0, max: 100 },
      activeOnly: false,
      recentOnly: false,
      customFields: {}
    });
    toast.info('Filtreler temizlendi');
  };

  // Filtreyi kaydet
  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Filtre adı gerekli!');
      return;
    }

    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(`chartFilters_${collection}`, JSON.stringify(updated));
    
    setFilterName('');
    toast.success('Filtre kaydedildi! 💾');
  };

  // Kaydedilmiş filtreyi yükle
  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    toast.success(`"${savedFilter.name}" filtresi yüklendi!`);
  };

  // Kaydedilmiş filtreyi sil
  const deleteSavedFilter = (filterId) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem(`chartFilters_${collection}`, JSON.stringify(updated));
    toast.success('Filtre silindi!');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Gelişmiş Filtreler
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          
          {/* 📅 Tarih Filtreleri */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Tarih Aralığı</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Preset'ler */}
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>Hızlı Seçim:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {datePresets.map(preset => (
                      <Chip
                        key={preset.value}
                        label={preset.label}
                        onClick={() => applyDatePreset(preset.value)}
                        color={filters.dateRange.preset === preset.value ? 'primary' : 'default'}
                        clickable
                        size="small"
                      />
                    ))}
                  </Stack>
                </Grid>
                
                {/* Özel tarih seçimi */}
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Başlangıç Tarihi"
                    value={filters.dateRange.start}
                    onChange={(date) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: date, preset: '' }
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Bitiş Tarihi"
                    value={filters.dateRange.end}
                    onChange={(date) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: date, preset: '' }
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 🏢 Kategori Filtreleri */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Kategoriler</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Departmanlar */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Departmanlar</InputLabel>
                    <Select
                      multiple
                      value={filters.departments}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        departments: e.target.value
                      }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {departmentOptions.map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Lokasyonlar */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Lokasyonlar</InputLabel>
                    <Select
                      multiple
                      value={filters.locations}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        locations: e.target.value
                      }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {locationOptions.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Durumlar */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Durumlar</InputLabel>
                    <Select
                      multiple
                      value={filters.statuses}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        statuses: e.target.value
                      }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {statusOptions.map(status => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* ⚙️ Hızlı Filtreler */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Hızlı Filtreler</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.activeOnly}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        activeOnly: e.target.checked
                      }))}
                    />
                  }
                  label="Sadece Aktif Kayıtlar"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.recentOnly}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        recentOnly: e.target.checked
                      }))}
                    />
                  }
                  label="Sadece Son 30 Günün Kayıtları"
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 2 }} />

          {/* 💾 Kaydedilmiş Filtreler */}
          {savedFilters.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Kaydedilmiş Filtreler
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {savedFilters.map(savedFilter => (
                  <Chip
                    key={savedFilter.id}
                    label={savedFilter.name}
                    onClick={() => loadSavedFilter(savedFilter)}
                    onDelete={() => deleteSavedFilter(savedFilter.id)}
                    color="primary"
                    variant="outlined"
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* 💾 Filtre Kaydetme */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Filtre adı..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveFilter}
              disabled={!filterName.trim()}
            >
              Kaydet
            </Button>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClearFilters} 
          startIcon={<ClearIcon />}
          color="error"
        >
          Temizle
        </Button>
        <Button onClick={onClose} color="inherit">
          İptal
        </Button>
        <Button 
          onClick={handleApplyFilters} 
          variant="contained"
          startIcon={<FilterListIcon />}
        >
          Filtreleri Uygula
        </Button>
      </DialogActions>
    </Dialog>
  );
} 