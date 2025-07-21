import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Switch,
  Slider,
  Typography,
  Drawer,
  Button,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Badge,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  DateRange as DateRangeIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Save as SaveIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const SmartFilters = ({ 
  employees, 
  events, 
  onFilterChange, 
  onSearchChange,
  savedFilters,
  onSaveFilter 
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [quickSearchSuggestions, setQuickSearchSuggestions] = useState([]);
  
  // 🔍 Gelişmiş filtre state'leri
  const [filters, setFilters] = useState({
    // 📅 Tarih filtreleri
    dateRange: {
      start: null,
      end: null,
      preset: 'all' // all, today, week, month, custom
    },
    
    // 👥 Çalışan filtreleri
    employees: [], // Seçili çalışan ID'leri
    departments: [], // Seçili departmanlar
    locations: [], // Seçili lokasyonlar
    
    // 📋 Etkinlik tipleri
    eventTypes: {
      shifts: true,
      services: true,
      vacations: true,
      meetings: true,
      training: true
    },
    
    // ⭐ Durum filtreleri
    statuses: [], // pending, approved, completed vb.
    priorities: [], // low, normal, high, urgent
    
    // ⚠️ Özel durumlar
    showConflicts: false,
    showOvertime: false,
    showHolidays: true,
    showWeekends: true,
    
    // 📊 Kapasiteli filtreler
    capacityRange: [0, 100], // Doluluk oranı %
    durationRange: [1, 24], // Süre (saat)
    
    // 🔔 Bildirim filtreleri
    hasReminders: false,
    requiresApproval: false,
    overdue: false
  });

  // Kaydedilmiş filtreler
  const [savedFiltersList, setSavedFiltersList] = useState([
    {
      id: 1,
      name: 'Bu Hafta Vardiyaları',
      icon: '📅',
      filters: { /* filtre ayarları */ },
      usage: 45
    },
    {
      id: 2,
      name: 'Onay Bekleyenler',
      icon: '⏳',
      filters: { /* filtre ayarları */ },
      usage: 23
    },
    {
      id: 3,
      name: 'Çakışmalı Etkinlikler',
      icon: '⚠️',
      filters: { /* filtre ayarları */ },
      usage: 12
    }
  ]);

  // 🎯 Akıllı arama algoritması
  const performSmartSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    // 👤 Çalışan arama
    employees.forEach(employee => {
      const relevanceScore = calculateRelevanceScore(employee, lowerQuery);
      if (relevanceScore > 0) {
        results.push({
          type: 'employee',
          id: employee.id,
          title: employee.name,
          subtitle: `${employee.department} - ${employee.location}`,
          relevance: relevanceScore,
          icon: <PersonIcon />,
          avatar: employee.avatar,
          data: employee
        });
      }
    });

    // 📋 Etkinlik arama
    events.forEach(event => {
      const relevanceScore = calculateEventRelevance(event, lowerQuery);
      if (relevanceScore > 0) {
        results.push({
          type: 'event',
          id: event.id,
          title: event.title,
          subtitle: format(new Date(event.start), 'dd/MM/yyyy - HH:mm'),
          relevance: relevanceScore,
          icon: getEventIcon(event.type),
          data: event
        });
      }
    });

    // 🏢 Departman arama
    const departments = [...new Set(employees.map(e => e.department))];
    departments.forEach(dept => {
      if (dept.toLowerCase().includes(lowerQuery)) {
        const employeeCount = employees.filter(e => e.department === dept).length;
        results.push({
          type: 'department',
          id: dept,
          title: dept,
          subtitle: `${employeeCount} çalışan`,
          relevance: dept.toLowerCase().indexOf(lowerQuery) === 0 ? 100 : 50,
          icon: <BusinessIcon />
        });
      }
    });

    // Relevans puanına göre sırala
    results.sort((a, b) => b.relevance - a.relevance);
    setSearchResults(results.slice(0, 10)); // İlk 10 sonuç
  };

  // 🎯 Relevans puanı hesaplama
  const calculateRelevanceScore = (employee, query) => {
    let score = 0;
    
    // İsim eşleşmesi (en yüksek puan)
    if (employee.name.toLowerCase().includes(query)) {
      score += employee.name.toLowerCase().indexOf(query) === 0 ? 100 : 70;
    }
    
    // Departman eşleşmesi
    if (employee.department.toLowerCase().includes(query)) {
      score += 50;
    }
    
    // Pozisyon eşleşmesi
    if (employee.position && employee.position.toLowerCase().includes(query)) {
      score += 30;
    }
    
    // Employee ID eşleşmesi
    if (employee.employeeId && employee.employeeId.includes(query)) {
      score += 40;
    }

    return score;
  };

  // 📋 Etkinlik relevans hesaplama
  const calculateEventRelevance = (event, query) => {
    let score = 0;
    
    if (event.title.toLowerCase().includes(query)) {
      score += event.title.toLowerCase().indexOf(query) === 0 ? 100 : 70;
    }
    
    if (event.extendedProps?.description?.toLowerCase().includes(query)) {
      score += 40;
    }
    
    if (event.extendedProps?.location?.toLowerCase().includes(query)) {
      score += 50;
    }

    return score;
  };

  // Etkinlik tipi ikonu
  const getEventIcon = (type) => {
    const icons = {
      shift: <ScheduleIcon />,
      service: <BusinessIcon />,
      vacation: <PersonIcon />,
      meeting: <BusinessIcon />
    };
    return icons[type] || <ScheduleIcon />;
  };

  // 📅 Hızlı tarih filtreleri
  const applyDatePreset = (preset) => {
    const today = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = end = today;
        break;
      case 'week':
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      default:
        start = end = null;
    }

    setFilters(prev => ({
      ...prev,
      dateRange: { start, end, preset }
    }));
  };

  // 🔍 Arama önerileri oluştur
  const generateSearchSuggestions = () => {
    const suggestions = [];
    
    // Popüler aramalar
    suggestions.push(
      { text: 'Bu hafta vardiyaları', icon: '📅', type: 'preset' },
      { text: 'Onay bekleyen', icon: '⏳', type: 'preset' },
      { text: 'Çakışan etkinlikler', icon: '⚠️', type: 'preset' },
      { text: 'Gece vardiyası', icon: '🌙', type: 'preset' }
    );

    // Son aramalar (localStorage'dan alınabilir)
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    recentSearches.forEach(search => {
      suggestions.push({
        text: search,
        icon: '🕒',
        type: 'recent'
      });
    });

    setQuickSearchSuggestions(suggestions);
  };

  // Filtre değişikliği
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Arama değişikliği
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    performSmartSearch(query);
    onSearchChange(query);
    
    // Son aramaları kaydet
    if (query.length > 2) {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [query, ...recent.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  // Filtreleri temizle
  const clearAllFilters = () => {
    const defaultFilters = {
      dateRange: { start: null, end: null, preset: 'all' },
      employees: [],
      departments: [],
      locations: [],
      eventTypes: {
        shifts: true,
        services: true,
        vacations: true,
        meetings: true,
        training: true
      },
      statuses: [],
      priorities: [],
      showConflicts: false,
      showOvertime: false,
      showHolidays: true,
      showWeekends: true,
      capacityRange: [0, 100],
      durationRange: [1, 24],
      hasReminders: false,
      requiresApproval: false,
      overdue: false
    };
    
    setFilters(defaultFilters);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Filtre kaydet
  const saveCurrentFilter = (name) => {
    const newFilter = {
      id: Date.now(),
      name,
      icon: '⭐',
      filters: { ...filters },
      usage: 0,
      createdAt: new Date()
    };
    
    setSavedFiltersList(prev => [newFilter, ...prev]);
    onSaveFilter(newFilter);
  };

  useEffect(() => {
    generateSearchSuggestions();
  }, []);

  // Aktif filtre sayısını hesapla
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.dateRange.preset !== 'all') count++;
    if (filters.employees.length > 0) count++;
    if (filters.departments.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.showConflicts) count++;
    if (filters.showOvertime) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ mb: 2 }}>
        {/* 🔍 Akıllı Arama Çubuğu */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                freeSolo
                options={searchResults}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.avatar ? (
                      <Avatar src={option.avatar} sx={{ width: 24, height: 24 }} />
                    ) : (
                      option.icon
                    )}
                    <Box>
                      <Typography variant="body2">{option.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.subtitle}
                      </Typography>
                    </Box>
                    <Chip 
                      label={option.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Çalışan, vardiya, departman ara..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                )}
                inputValue={searchQuery}
                onInputChange={(e, value) => handleSearchChange(value)}
                noOptionsText="Sonuç bulunamadı"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Badge badgeContent={activeFilterCount} color="primary">
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setFilterDrawerOpen(true)}
                  >
                    Filtreler
                  </Button>
                </Badge>
                
                {activeFilterCount > 0 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ClearIcon />}
                    onClick={clearAllFilters}
                  >
                    Temizle
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Hızlı Öneriler */}
          {searchQuery.length === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Hızlı Erişim:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quickSearchSuggestions.slice(0, 6).map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={`${suggestion.icon} ${suggestion.text}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => handleSearchChange(suggestion.text)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* 📋 Aktif Filtreler Gösterimi */}
        {activeFilterCount > 0 && (
          <Paper sx={{ p: 1, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption">Aktif Filtreler:</Typography>
              
              {filters.dateRange.preset !== 'all' && (
                <Chip 
                  label={`📅 ${filters.dateRange.preset}`} 
                  size="small" 
                  onDelete={() => applyDatePreset('all')}
                />
              )}
              
              {filters.departments.map(dept => (
                <Chip 
                  key={dept}
                  label={`🏢 ${dept}`} 
                  size="small" 
                  onDelete={() => {
                    setFilters(prev => ({
                      ...prev,
                      departments: prev.departments.filter(d => d !== dept)
                    }));
                  }}
                />
              ))}

              {filters.showConflicts && (
                <Chip 
                  label="⚠️ Çakışmalı" 
                  size="small" 
                  color="warning"
                  onDelete={() => setFilters(prev => ({ ...prev, showConflicts: false }))}
                />
              )}
            </Box>
          </Paper>
        )}

        {/* 🎯 Gelişmiş Filtre Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: 400 } }}
        >
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">🔍 Akıllı Filtreler</Typography>
              <IconButton onClick={() => setFilterDrawerOpen(false)}>
                <ClearIcon />
              </IconButton>
            </Box>

            {/* Kaydedilmiş Filtreler */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>⭐ Kaydedilmiş Filtreler</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {savedFiltersList.map(saved => (
                    <ListItem 
                      key={saved.id}
                      button
                      onClick={() => {
                        setFilters(saved.filters);
                        handleFilterChange(saved.filters);
                      }}
                    >
                      <ListItemIcon>{saved.icon}</ListItemIcon>
                      <ListItemText 
                        primary={saved.name}
                        secondary={`${saved.usage} kez kullanıldı`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Tarih Filtreleri */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>📅 Tarih Aralığı</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {['today', 'week', 'month'].map(preset => (
                      <Button
                        key={preset}
                        size="small"
                        variant={filters.dateRange.preset === preset ? 'contained' : 'outlined'}
                        onClick={() => applyDatePreset(preset)}
                      >
                        {preset === 'today' ? 'Bugün' : 
                         preset === 'week' ? 'Bu Hafta' : 'Bu Ay'}
                      </Button>
                    ))}
                  </Box>
                </FormControl>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Başlangıç"
                      value={filters.dateRange.start}
                      onChange={(date) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: date, preset: 'custom' }
                      }))}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Bitiş"
                      value={filters.dateRange.end}
                      onChange={(date) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: date, preset: 'custom' }
                      }))}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Departman Filtreleri */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>🏢 Departmanlar</Typography>
                {filters.departments.length > 0 && (
                  <Badge badgeContent={filters.departments.length} color="primary" sx={{ ml: 1 }} />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {[...new Set(employees.map(e => e.department))].map(dept => (
                    <FormControlLabel
                      key={dept}
                      control={
                        <Checkbox
                          checked={filters.departments.includes(dept)}
                          onChange={(e) => {
                            const newDepts = e.target.checked
                              ? [...filters.departments, dept]
                              : filters.departments.filter(d => d !== dept);
                            setFilters(prev => ({ ...prev, departments: newDepts }));
                          }}
                        />
                      }
                      label={`${dept} (${employees.filter(e => e.department === dept).length})`}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Etkinlik Tipleri */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>📋 Etkinlik Tipleri</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {Object.entries(filters.eventTypes).map(([type, checked]) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Switch
                          checked={checked}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            eventTypes: { ...prev.eventTypes, [type]: e.target.checked }
                          }))}
                        />
                      }
                      label={type === 'shifts' ? '📋 Vardiyalar' :
                             type === 'services' ? '🚌 Servisler' :
                             type === 'vacations' ? '🏖️ İzinler' :
                             type === 'meetings' ? '🤝 Toplantılar' : '📚 Eğitimler'}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Özel Durumlar */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>⚠️ Özel Durumlar</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.showConflicts}
                        onChange={(e) => setFilters(prev => ({ ...prev, showConflicts: e.target.checked }))}
                      />
                    }
                    label="⚠️ Çakışmaları Göster"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.showOvertime}
                        onChange={(e) => setFilters(prev => ({ ...prev, showOvertime: e.target.checked }))}
                      />
                    }
                    label="⏰ Mesai Fazlalarını Göster"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.requiresApproval}
                        onChange={(e) => setFilters(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                      />
                    }
                    label="✅ Onay Bekleyenleri Göster"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Kaydet/Yükle Butonları */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  const name = prompt('Filtre adı:');
                  if (name) saveCurrentFilter(name);
                }}
                sx={{ mb: 1 }}
              >
                Bu Filtreyi Kaydet
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={clearAllFilters}
              >
                Tüm Filtreleri Temizle
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </LocalizationProvider>
  );
};

export default SmartFilters; 