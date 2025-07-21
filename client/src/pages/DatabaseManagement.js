import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Alert,
  AlertTitle,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  GetApp as GetAppIcon,
  FilterList as FilterIcon,
  ShowChart as ShowChartIcon,
  AccessTime as AccessTimeIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// 📊 Chart bileşenlerini import et
import {
  DepartmentDistributionChart,
  StatusDistributionChart,
  LocationComparisonChart,
  TrendAnalysisChart,
  EfficiencyRadarChart,
  AnalyticsSummaryCard
} from '../components/Charts/DatabaseCharts';
import { ChartDrilldownModal } from '../components/Charts/ChartDrilldown';
import { AdvancedChartFilters } from '../components/Charts/ChartFilters';



// 📊 Quick Stats Card component
const QuickStatsCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card 
    sx={{ 
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 3 } : {},
      background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'} 10%, white 100%)`
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: `${color}.main`, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);



// ✏️ Edit/Create Data Dialog
function EditDataDialog({ open, data, mode, collection, onSave, onClose }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
      setErrors({});
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (collection === 'employees') {
      if (!formData.firstName?.trim()) newErrors.firstName = 'Ad gerekli';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Soyad gerekli';
      // employeeId artık opsiyonel - sistem otomatik oluşturacak
      if (!formData.department) newErrors.department = 'Departman gerekli';
      if (!formData.location) newErrors.location = 'Lokasyon gerekli';
    } else if (collection === 'shifts') {
      if (!formData.title?.trim()) newErrors.title = 'Başlık gerekli';
      if (!formData.location) newErrors.location = 'Lokasyon gerekli';
      if (!formData.startDate) newErrors.startDate = 'Başlangıç tarihi gerekli';
      if (!formData.endDate) newErrors.endDate = 'Bitiş tarihi gerekli';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const cleanData = { ...formData };
      if (mode === 'create') {
        delete cleanData._id;
      }
      onSave(cleanData);
    }
  };

  const getTitle = () => {
    if (mode === 'create') return `Yeni ${collection === 'employees' ? 'Çalışan' : 'Vardiya'} Ekle`;
    if (mode === 'edit') return `${collection === 'employees' ? 'Çalışan' : 'Vardiya'} Düzenle`;
    return `${collection === 'employees' ? 'Çalışan' : 'Vardiya'} Detayları`;
  };

  const isReadOnly = mode === 'view';

  const departmentOptions = [
    'TORNA GRUBU', 'FREZE GRUBU', 'TESTERE', 'İDARİ BİRİM', 
    'GENEL ÇALIŞMA GRUBU', 'TEKNİK OFİS', 'KALİTE KONTROL', 'BAKIM VE ONARIM'
  ];

  const locationOptions = ['MERKEZ ŞUBE', 'IŞIL ŞUBE']; // OSB ŞUBE kaldırıldı
  const statusOptions = collection === 'employees' 
    ? ['AKTIF', 'PASIF', 'İZINLI', 'AYRILDI']
    : ['TASLAK', 'ONAYLANDI', 'YAYINLANDI', 'TAMAMLANDI', 'İPTAL'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {mode === 'create' ? <AddIcon /> : mode === 'edit' ? <EditIcon /> : <VisibilityIcon />}
        {getTitle()}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {collection === 'employees' ? (
            // Çalışan formu
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Soyad"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sicil No (Otomatik oluşturulur)"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  error={!!errors.employeeId}
                  helperText={errors.employeeId || "Boş bırakırsanız sistem otomatik oluşturur"}
                  placeholder="Otomatik: TORNA-001, TEKNIK-025..."
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.department} disabled={isReadOnly}>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    label="Departman"
                  >
                    {departmentOptions.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.location} disabled={isReadOnly}>
                  <InputLabel>Lokasyon</InputLabel>
                  <Select
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    label="Lokasyon"
                  >
                    {locationOptions.map(loc => (
                      <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isReadOnly}>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.status || 'AKTIF'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Durum"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pozisyon"
                  value={formData.position || ''}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isReadOnly}
                />
              </Grid>
            </>
          ) : (
            // Vardiya formu
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Başlık"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.location} disabled={isReadOnly}>
                  <InputLabel>Lokasyon</InputLabel>
                  <Select
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    label="Lokasyon"
                  >
                    {locationOptions.map(loc => (
                      <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isReadOnly}>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.status || 'TASLAK'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Durum"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  type="date"
                  value={formData.startDate?.split('T')[0] || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  disabled={isReadOnly}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  type="date"
                  value={formData.endDate?.split('T')[0] || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  disabled={isReadOnly}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isReadOnly}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          {isReadOnly ? 'Kapat' : 'İptal'}
        </Button>
        {!isReadOnly && (
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<GetAppIcon />}
          >
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function DatabaseManagement() {
  const { user } = useAuth();

  // 📊 Temel state'ler - React Hooks kuralları gereği en üstte olmalı
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedCollection, setSelectedCollection] = useState('employees');
  const [stats, setStats] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editMode, setEditMode] = useState('view');
  const [editingData, setEditingData] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // 🚀 Performance optimized state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // 🚀 Chart state'ler
  const [chartData, setChartData] = useState({});
  const [chartLoading, setChartLoading] = useState(false);
  const [realtimeData, setRealtimeData] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  // 🚀 Advanced features state'ler
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedDrilldownData, setSelectedDrilldownData] = useState(null);
  const [drilldownChartType, setDrilldownChartType] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filterQuery, setFilterQuery] = useState({});

  // Additional required states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [insights, setInsights] = useState({});
  const [predictions, setPredictions] = useState({});
  const [processing, setProcessing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 🚀 OPTIMIZE: Stats loading with better error handling
  const fetchDatabaseStats = async () => {
    try {
      setStatsLoading(true);
      console.log('🔄 Fetching database stats...');
      
      const response = await axios.get('http://localhost:5001/api/database/stats');
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdateTime(new Date().toLocaleTimeString('tr-TR'));
        
        // Show cache status
        if (response.data.data.cached) {
          console.log('⚡ Stats loaded from cache');
        } else {
          console.log('🔄 Stats loaded from database');
        }
      }
    } catch (error) {
      console.error('❌ Database stats error:', error);
      toast.error('İstatistikler yüklenemedi! Bağlantı kontrolü yapın.');
    } finally {
      setStatsLoading(false);
    }
  };

  // 🚀 OPTIMIZE: Collection data loading
  const fetchCollectionData = async (collectionName, filter = {}) => {
    try {
      setDataLoading(true);
      console.log(`🔄 Fetching ${collectionName} data...`);

      const params = new URLSearchParams({
        limit: '100', // Reasonable limit
        search: searchQuery,
        filter: JSON.stringify(filter)
      });

      const response = await axios.get(
        `http://localhost:5001/api/database/collection/${collectionName}?${params}`
      );
      
      if (response.data.success) {
        setData(response.data.data.documents);
        
        // Show performance info
        if (response.data.data.cached) {
          toast.success('⚡ Veriler cache\'den yüklendi!');
        } else {
          toast.success('📊 Veriler güncellendi!');
        }
      }
    } catch (error) {
      console.error('❌ Collection data error:', error);
      toast.error(`${collectionName} verileri yüklenemedi!`);
      setData([]); // Reset data on error
    } finally {
      setDataLoading(false);
    }
  };

  // 🚀 OPTIMIZE: Chart data loading with timeout
  const fetchChartData = async (collectionName, chartType = null, customQuery = {}) => {
    try {
      setChartLoading(true);
      console.log(`📊 Fetching charts for ${collectionName}...`);
      
      const params = new URLSearchParams();
      if (chartType) params.append('chartType', chartType);
      
      if (Object.keys(customQuery).length > 0) {
        params.append('filter', JSON.stringify(customQuery));
      }
      
      // Add timeout for chart requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get(
        `http://localhost:5001/api/database/charts/${collectionName}?${params}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (response.data.success) {
        setChartData(prev => ({
          ...prev,
          [collectionName]: response.data.data.charts
        }));
        
        // Debug: Trend data kontrol
        console.log(`🔍 Chart data for ${collectionName}:`, response.data.data.charts);
        console.log(`🔍 hiringTrends:`, response.data.data.charts.hiringTrends);
        console.log(`🔍 creationTrends:`, response.data.data.charts.creationTrends);
        
        // Performance feedback
        if (response.data.data.cached) {
          toast.success('⚡ Grafikler cache\'den yüklendi!');
        } else {
          toast.success('📊 Grafikler güncellendi!');
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('⏰ Grafik yükleme zaman aşımına uğradı!');
      } else {
        console.error('📊 Chart data fetch error:', error);
        toast.error('Grafik verileri yüklenemedi');
      }
    } finally {
      setChartLoading(false);
    }
  };

  // 🚀 OPTIMIZE: Realtime data with longer intervals
  const fetchRealtimeChartData = async (collectionName) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/database/charts/${collectionName}/realtime`);
      
      if (response.data.success) {
        setRealtimeData(prev => ({
          ...prev,
          [collectionName]: response.data.data.realtime
        }));
        
        if (response.data.data.cached) {
          console.log('⚡ Realtime data from cache');
        }
      }
    } catch (error) {
      console.error('⚡ Realtime chart data error:', error);
      // Don't show error toast for realtime data - it's not critical
    }
  };

  // 🚀 OPTIMIZE: Debounced search
  const debouncedFetchData = useCallback(
    debounce((collectionName, filter) => {
      fetchCollectionData(collectionName, filter);
    }, 500),
    []
  );

  // 🚀 Monitoring with optimized intervals
  const startRealtimeMonitoring = () => {
    const interval = setInterval(async () => {
      try {
        // Only update if user is on charts tab and page is visible
        if (currentTab === 'charts' && !document.hidden) {
          const start = performance.now();
          await fetchRealtimeChartData(selectedCollection);
          const end = performance.now();
          
          setPerformanceMetrics(prev => ({
            ...prev,
            lastQueryTime: Math.round(end - start),
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Realtime monitoring error:', error);
      }
    }, 60000); // Increased to 60 seconds for better performance

    return () => clearInterval(interval);
  };

  // 🚀 Initial load optimization
  useEffect(() => {
    const initializeData = async () => {
      setIsInitialLoad(true);
      
      try {
        // Load critical data first
        await fetchDatabaseStats();
        
        if (currentTab === 'charts') {
          // Load chart data if needed
          await fetchChartData(selectedCollection, null, filterQuery);
          await fetchRealtimeChartData(selectedCollection);
        }
        
        // Load insights and predictions in background
        if (selectedCollection) {
          fetchInsights(selectedCollection);
          fetchPredictions(selectedCollection);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Sistem başlatılırken hata oluştu!');
      } finally {
        setIsInitialLoad(false);
      }
    };

    initializeData();
    
    // Start monitoring
    const cleanup = startRealtimeMonitoring();
    return cleanup;
  }, []);

  // Collection change optimization
  useEffect(() => {
    if (selectedCollection && currentTab === 'charts' && !isInitialLoad) {
      fetchChartData(selectedCollection, null, filterQuery);
      fetchRealtimeChartData(selectedCollection);
    }
  }, [selectedCollection, currentTab]);

  // Search optimization with debounce
  useEffect(() => {
    if (searchQuery && selectedCollection) {
      debouncedFetchData(selectedCollection, filters);
    }
  }, [searchQuery, debouncedFetchData]);

  // 🚀 Cache clearing function
  const clearCache = async () => {
    try {
      await axios.delete('http://localhost:5001/api/database/cache');
      toast.success('🧹 Cache temizlendi! Veriler yenileniyor...');
      
      // Reload all data
      await fetchDatabaseStats();
      if (currentTab === 'charts') {
        await fetchChartData(selectedCollection, null, filterQuery);
        await fetchRealtimeChartData(selectedCollection);
      }
    } catch (error) {
      toast.error('Cache temizlenemedi!');
    }
  };

  // 🧠 Advanced Analytics Functions
  const fetchInsights = async (collectionName) => {
    try {
      // Mock insights data for now - can be replaced with real API
      const mockInsights = {
        employees: {
          totalEmployees: 150,
          activeEmployees: 120,
          departments: 8,
          averageAge: 32,
          trends: 'positive',
          departmentEfficiency: [
            { _id: 'TEKNİK OFİS', efficiency: 95, totalEmployees: 25 },
            { _id: 'KALİTE KONTROL', efficiency: 88, totalEmployees: 15 },
            { _id: 'İDARİ BİRİM', efficiency: 82, totalEmployees: 30 }
          ]
        },
        shifts: {
          totalShifts: 200,
          activeShifts: 45,
          locations: 5,
          averageDuration: 8,
          trends: 'stable',
          departmentEfficiency: [
            { _id: 'MERKEZ ŞUBE', efficiency: 90, totalShifts: 120 },
            { _id: 'IŞIL ŞUBE', efficiency: 88, totalShifts: 100 }
            // OSB ŞUBE verisi kaldırıldı
          ]
        }
      };
      
      setInsights(mockInsights[collectionName] || {});
      console.log(`📊 Insights loaded for ${collectionName}`);
    } catch (error) {
      console.error('Insights fetch error:', error);
      toast.error('Analiz verileri yüklenemedi');
    }
  };

  const fetchPredictions = async (collectionName) => {
    try {
      // Mock predictions data for now - can be replaced with real API
      const mockPredictions = {
        employees: {
          nextMonthHiring: 12,
          departmentGrowth: 'TEKNİK OFİS',
          seasonalTrends: 'increasing',
          staffingNeeds: {
            recommendation: 'Personel Artırımı',
            nextMonthPrediction: 15,
            riskAreas: [
              { _id: 'TORNA GRUBU', count: 5 },
              { _id: 'FREZE GRUBU', count: 3 }
            ]
          }
        },
        shifts: {
          nextWeekShifts: 35,
          peakDays: 'Pazartesi-Cuma',
          demandTrend: 'stable',
          staffingNeeds: {
            recommendation: 'Vardiya Optimizasyonu',
            nextMonthPrediction: 40,
            riskAreas: [
              { _id: 'Gece Vardiyası', count: 8 },
              { _id: 'Hafta Sonu', count: 6 }
            ]
          }
        }
      };
      
      setPredictions(mockPredictions[collectionName] || {});
      console.log(`🔮 Predictions loaded for ${collectionName}`);
    } catch (error) {
      console.error('Predictions fetch error:', error);
      toast.error('Tahmin verileri yüklenemedi');
    }
  };

  // 🔍 Drill-down handler
  const handleDrilldown = (selectedData, chartType) => {
    console.log('Drilldown triggered:', selectedData, chartType);
    setSelectedDrilldownData(selectedData);
    setDrilldownChartType(chartType);
    setDrilldownOpen(true);
    
    // Success feedback
    toast.info(`🔍 ${selectedData.label || selectedData._id} detayları açılıyor...`);
  };

  // ⚙️ Advanced filters handler
  const handleApplyFilters = (mongoQuery, filterData) => {
    console.log('Filters applied:', mongoQuery, filterData);
    setAppliedFilters(filterData);
    setFilterQuery(mongoQuery);
    
    // Chart verilerini filtrelenmiş halde yeniden yükle
    fetchChartData(selectedCollection, null, mongoQuery);
    toast.success('🔍 Filtreler uygulandı!');
  };

  // Filtre temizleme
  const handleClearFilters = () => {
    setAppliedFilters({});
    setFilterQuery({});
    fetchChartData(selectedCollection);
    toast.info('🧹 Filtreler temizlendi');
  };

  // 📊 Excel export işlemi
  const exportToExcel = async (template) => {
    try {
      setProcessing(true);
      
      // Filtrelenmiş veriyi hazırla
      const exportData = data.map(item => {
        const exportItem = {};
        template.fields.forEach(field => {
          // Nested field desteği (örn: address.fullAddress)
          const fieldValue = field.includes('.') 
            ? field.split('.').reduce((obj, key) => obj?.[key], item)
            : item[field];
          exportItem[field] = fieldValue || '';
        });
        return exportItem;
      });

      // Backend'e export isteği gönder
      const response = await axios.post('http://localhost:5001/api/excel/export/custom', {
        data: exportData,
        filename: template.filename,
        sheetName: template.name,
        collection: selectedCollection,
        filter: Object.keys(filters).length > 0 ? JSON.stringify(filters) : 'Özel Filtre'
      }, {
        responseType: 'blob'
      });

      // Excel dosyasını indir
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${template.filename}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${template.name} başarıyla indirildi!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Excel export işlemi başarısız!');
    } finally {
      setProcessing(false);
    }
  };

  // 🎯 CRUD İşlemleri
  const handleView = (row) => {
    setEditingData(row);
    setEditMode('view');
  };

  const handleEdit = (row) => {
    setEditingData(row);
    setEditMode('edit');
  };

  const handleDelete = (row) => {
    setDeletingItem(row);
    setDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    const itemsToDelete = data.filter(item => selectedRows.includes(item._id));
    setDeletingItem(null);
    setDeleteConfirmOpen(true);
  };

  const handleCreate = () => {
    // Koleksiyona göre varsayılan veri şablonu
    const defaultData = selectedCollection === 'employees' 
      ? {
          firstName: '',
          lastName: '',
          employeeId: '',
          department: 'TORNA GRUBU',
          location: 'MERKEZ ŞUBE',
          position: '',
          status: 'AKTIF'
        }
      : {
          title: '',
          location: 'MERKEZ ŞUBE',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          status: 'TASLAK'
        };
    
    setEditingData(defaultData);
    setEditMode('create');
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      
      if (editMode === 'create') {
        await axios.post(
          `http://localhost:5001/api/database/collection/${selectedCollection}`,
          formData
        );
        toast.success('Kayıt başarıyla oluşturuldu!');
      } else {
        await axios.put(
          `http://localhost:5001/api/database/collection/${selectedCollection}/${editingData._id}`,
          formData
        );
        toast.success('Kayıt başarıyla güncellendi!');
      }
      
      setEditingData(null);
      setEditMode('view');
      fetchCollectionData(selectedCollection, filters);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Kaydetme işlemi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      
      // Tekli veya toplu silme
      const deletePromises = [
        axios.delete(`http://localhost:5001/api/database/collection/${selectedCollection}/${deletingItem._id}`)
      ];
      
      await Promise.all(deletePromises);
      
      toast.success(`${deletingItem._id} kayıt başarıyla silindi!`);
      setDeletingItem(null);
      setDeleteConfirmOpen(false);
      fetchCollectionData(selectedCollection, filters);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  // 📊 DataGrid kolonları
  const getColumns = () => {
    const baseColumns = selectedCollection === 'employees' 
      ? [
          { field: 'firstName', headerName: 'Ad', width: 120, editable: true },
          { field: 'lastName', headerName: 'Soyad', width: 120, editable: true },
          { field: 'employeeId', headerName: 'Sicil No', width: 100, editable: true },
          { field: 'department', headerName: 'Departman', width: 180, editable: true },
          { field: 'location', headerName: 'Lokasyon', width: 120, editable: true },
          { field: 'position', headerName: 'Pozisyon', width: 150, editable: true },
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
          }
        ]
      : [
          { field: 'title', headerName: 'Başlık', width: 200, editable: true },
          { field: 'location', headerName: 'Lokasyon', width: 120, editable: true },
          { 
            field: 'startDate', 
            headerName: 'Başlangıç', 
            width: 120,
            renderCell: (params) => new Date(params.value).toLocaleDateString('tr-TR')
          },
          { 
            field: 'endDate', 
            headerName: 'Bitiş', 
            width: 120,
            renderCell: (params) => new Date(params.value).toLocaleDateString('tr-TR')
          },
          { 
            field: 'status', 
            headerName: 'Durum', 
            width: 120,
            renderCell: (params) => (
              <Chip 
                label={params.value} 
                color={
                  params.value === 'ONAYLANDI' ? 'success' :
                  params.value === 'TASLAK' ? 'warning' : 'default'
                }
                size="small"
              />
            )
          }
        ];

    // Action kolonu ekle
    const actionColumn = {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Görüntüle">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleView(params.row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Düzenle">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    };

    return [...baseColumns, actionColumn];
  };

  // 🎨 Enhanced Chart Dashboard Render Function
  const renderChartDashboard = () => {
    const currentChartData = chartData[selectedCollection] || {};
    const currentRealtimeData = realtimeData[selectedCollection] || {};

    return (
      <Box>
        {/* 🎛️ Chart Controls with performance indicators */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Koleksiyon Seç</InputLabel>
              <Select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                label="Koleksiyon Seç"
                disabled={chartLoading || statsLoading}
              >
                <MenuItem value="employees">👥 Çalışanlar</MenuItem>
                <MenuItem value="shifts">🕐 Vardiyalar</MenuItem>
                <MenuItem value="users">👤 Kullanıcılar</MenuItem>
                <MenuItem value="notifications">🔔 Bildirimler</MenuItem>
              </Select>
            </FormControl>
            
            <Chip 
              icon={<ShowChartIcon />}
              label={`${selectedCollection === 'employees' ? 'Personel' : 'Vardiya'} Analizi`}
              color="primary"
              variant="outlined"
            />
            
            {/* Performance indicator */}
            {lastUpdateTime && (
              <Chip 
                icon={<AccessTimeIcon />}
                label={`Son güncelleme: ${lastUpdateTime}`}
                color="info"
                size="small"
                variant="outlined"
              />
            )}
            
            {/* Filter indicator */}
            {Object.keys(appliedFilters).length > 0 && (
              <Chip 
                icon={<FilterIcon />}
                label={`${Object.keys(appliedFilters).length} filtre aktif`}
                color="warning"
                onDelete={handleClearFilters}
                size="small"
              />
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFiltersOpen(true)}
              color="primary"
              disabled={chartLoading}
            >
              Gelişmiş Filtreler
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchChartData(selectedCollection, null, filterQuery);
                fetchRealtimeChartData(selectedCollection);
                fetchDatabaseStats();
              }}
              disabled={chartLoading || statsLoading}
            >
              {chartLoading || statsLoading ? 'Yükleniyor...' : 'Yenile'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearCache}
              color="warning"
              size="small"
            >
              Cache Temizle
            </Button>
          </Stack>
        </Box>

        {/* Loading overlay for charts */}
        {chartLoading && (
          <Box sx={{ 
            position: 'relative', 
            mb: 3,
            p: 2,
            bgcolor: 'primary.light',
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress size={24} color="inherit" />
            <Typography>
              📊 Grafikler yükleniyor... Bu işlem birkaç saniye sürebilir.
            </Typography>
          </Box>
        )}

        {/* 📊 Realtime Metrics with loading states */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickStatsCard
              title="Toplam Kayıt"
              value={statsLoading ? '...' : (currentRealtimeData.totalRecords || 0)}
              icon={<StorageIcon />}
              color="primary"
              subtitle="Veritabanındaki toplam kayıt"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickStatsCard
              title="Son 24 Saat"
              value={statsLoading ? '...' : (currentRealtimeData.recentAdditions || 0)}
              icon={<AddIcon />}
              color="success"
              subtitle="Yeni eklenen kayıtlar"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickStatsCard
              title="Güncellemeler"
              value={statsLoading ? '...' : (currentRealtimeData.recentUpdates || 0)}
              icon={<EditIcon />}
              color="warning"
              subtitle="Son 24 saatte güncellenen"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickStatsCard
              title="Aktif Kayıt"
              value={statsLoading ? '...' : (selectedCollection === 'employees' 
                ? currentRealtimeData.activeEmployees || 0
                : currentRealtimeData.activeShifts || 0
              )}
              icon={<CheckCircleIcon />}
              color="info"
              subtitle={selectedCollection === 'employees' ? 'Aktif çalışanlar' : 'Aktif vardiyalar'}
            />
          </Grid>
        </Grid>

        {/* 📈 Interactive Charts Grid */}
        <Grid container spacing={3}>
          {/* 🥧 Departman/Status Dağılımı */}
          <Grid item xs={12} md={6}>
                          {selectedCollection === 'employees' && currentChartData.departmentDistribution ? (
                <DepartmentDistributionChart
                  data={currentChartData.departmentDistribution}
                  title="Departman Dağılımı"
                  onDrilldown={handleDrilldown}
                />
              ) : selectedCollection === 'shifts' && currentChartData.statusDistribution ? (
                <StatusDistributionChart
                  data={currentChartData.statusDistribution}
                  title="Vardiya Durum Dağılımı"
                  onDrilldown={handleDrilldown}
                />
              ) : (
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Dağılım Grafiği</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography color="text.secondary">Veri yükleniyor...</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 📊 Lokasyon Karşılaştırması */}
          <Grid item xs={12} md={6}>
                          {currentChartData.locationComparison || currentChartData.locationDistribution ? (
                <LocationComparisonChart
                  data={currentChartData.locationComparison || currentChartData.locationDistribution}
                  title="Lokasyon Analizi"
                  onDrilldown={handleDrilldown}
                />
              ) : (
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Lokasyon Analizi</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography color="text.secondary">Veri yükleniyor...</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 📈 Trend Analizi */}
          <Grid item xs={12} md={8}>
                          {currentChartData.hiringTrends || currentChartData.creationTrends ? (
                <TrendAnalysisChart
                  data={currentChartData.hiringTrends || currentChartData.creationTrends}
                  title={selectedCollection === 'employees' ? 'İşe Alım Trendleri' : 'Vardiya Oluşturma Trendleri'}
                  onDrilldown={handleDrilldown}
                />
              ) : (
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Trend Analizi</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography color="text.secondary">Veri yükleniyor...</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 📋 Analytics Summary */}
          <Grid item xs={12} md={4}>
            <AnalyticsSummaryCard
              insights={insights}
              predictions={predictions}
            />
          </Grid>

          {/* 🎯 Verimlilik Radar (sadece employees için) */}
          {selectedCollection === 'employees' && (
            <Grid item xs={12} md={6}>
                              {currentChartData.departmentEfficiency ? (
                  <EfficiencyRadarChart
                    data={currentChartData.departmentEfficiency}
                    title="Departman Verimlilik Analizi"
                    onDrilldown={handleDrilldown}
                  />
                ) : (
                <Card sx={{ height: 400 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Verimlilik Analizi</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography color="text.secondary">Veri yükleniyor...</Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          )}

          {/* 📊 İş Yükü Analizi (sadece shifts için) */}
          {selectedCollection === 'shifts' && currentChartData.workloadAnalysis && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Haftalık İş Yükü Dağılımı</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography color="text.secondary">Veri yükleniyor...</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* 📊 Chart Footer with performance info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>İpucu:</strong> Grafiklere tıklayarak detaylı analiz görüntüleyebilirsiniz
              </Typography>
              {performanceMetrics.lastQueryTime && (
                <Typography variant="caption" color="text.secondary" display="block">
                  ⚡ Son sorgu süresi: {performanceMetrics.lastQueryTime}ms
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Son güncelleme: {currentRealtimeData.lastUpdate 
                  ? new Date(currentRealtimeData.lastUpdate.updatedAt).toLocaleString('tr-TR')
                  : lastUpdateTime || 'Bilinmiyor'
                }
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  // 🔒 ADMIN-001 Yetkilendirme Kontrolü
  const isAuthorized = user?.employeeId === 'ADMIN-001';

  // 🔒 Yetkisiz erişim durumunda gösterilecek içerik
  if (!isAuthorized) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, backgroundColor: '#fff3e0', border: '2px solid #ff9800' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <LockIcon sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#e65100', fontWeight: 'bold' }}>
              🔒 Erişim Engellendi
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Veritabanı Yönetimi Sayfası
            </Typography>
            <Alert severity="warning" sx={{ mb: 2, maxWidth: '600px' }}>
              <AlertTitle>Yetkisiz Erişim</AlertTitle>
              Bu sayfaya yalnızca <strong>Çanga Ana Yöneticisi (ADMIN-001)</strong> erişebilir.
            </Alert>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Şu anki kullanıcı: <strong>{user?.employeeId || 'Bilinmiyor'}</strong> - <strong>{user?.name || 'Bilinmiyor'}</strong>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <AdminIcon sx={{ color: '#1976d2' }} />
              <Typography variant="body2" color="text.secondary">
                Erişim için sistem yöneticisi ile iletişime geçin
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Enhanced loading state for initial load
  if (isInitialLoad) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh',
          gap: 3
        }}>
          <CircularProgress size={80} thickness={2} />
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
            🗄️ Veritabanı Sistemi Yükleniyor...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Veriler optimize ediliyor, lütfen bekleyin...
          </Typography>
          <LinearProgress sx={{ width: '300px', mt: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* 🎯 Header */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            🗄️ Veritabanı Yönetim Sistemi
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            MongoDB Atlas - Çanga Vardiya Sistemi Veritabanı
          </Typography>
          {lastUpdateTime && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              ⚡ Optimized Performance • Son güncelleme: {lastUpdateTime}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* 📊 Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickStatsCard
            title="Toplam Çalışan"
            value={statsLoading ? <CircularProgress size={20} /> : (stats.collections?.employees || 0)}
            icon={<PeopleIcon />}
            color="primary"
            subtitle="Sistem kayıtlı personel"
            onClick={() => {
              setSelectedCollection('employees');
              setCurrentTab('data');
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickStatsCard
            title="Aktif Vardiyalar"
            value={statsLoading ? <CircularProgress size={20} /> : (stats.collections?.shifts || 0)}
            icon={<ScheduleIcon />}
            color="success"
            subtitle="Vardiya listeleri"
            onClick={() => {
              setSelectedCollection('shifts');
              setCurrentTab('data');
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickStatsCard
            title="Veritabanı Boyutu"
            value={statsLoading ? <CircularProgress size={20} /> : (`${stats.database?.size || 0} MB`)}
            icon={<StorageIcon />}
            color="info"
            subtitle="MongoDB Atlas"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickStatsCard
            title="Toplam Doküman"
            value={statsLoading ? <CircularProgress size={20} /> : (stats.totalDocuments || 0)}
            icon={<BusinessIcon />}
            color="warning"
            subtitle="Tüm koleksiyonlar"
          />
        </Grid>
      </Grid>

      {/* 🎛️ Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(event, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="📋 Genel Bakış" 
            value="overview" 
            icon={<StorageIcon />}
            iconPosition="start"
          />
          <Tab 
            label="🗃️ Veri Yönetimi" 
            value="data" 
            icon={<BusinessIcon />}
            iconPosition="start"
          />
          <Tab 
            label="📊 Grafikler" 
            value="charts" 
            icon={<ShowChartIcon />}
            iconPosition="start"
          />
          <Tab 
            label="📤 Export" 
            value="export" 
            icon={<GetAppIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* 📱 Tab Content */}
      {currentTab === 'charts' && (
        <Paper sx={{ p: 3 }}>
          {renderChartDashboard()}
        </Paper>
      )}

      {/* ... existing tab content for other tabs ... */}
      {currentTab !== 'charts' && (
        <Typography variant="h6" sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
          🔧 Diğer tab içerikleri burada olacak...
          <br />
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setCurrentTab('charts')}
          >
            📊 Grafikleri Görüntüle
          </Button>
        </Typography>
      )}

      {/* 🔍 Drill-down Modal */}
      <ChartDrilldownModal
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        selectedData={selectedDrilldownData}
        chartType={drilldownChartType}
        collection={selectedCollection}
      />

      {/* ⚙️ Advanced Filters Modal */}
      <AdvancedChartFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        collection={selectedCollection}
        currentFilters={appliedFilters}
      />

      {/* 🎯 CRUD İşlemleri */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              {selectedCollection === 'employees' ? 'Personel Listesi' : 'Vardiya Listesi'}
              <Chip label={`${data.length} kayıt`} sx={{ ml: 2 }} />
            </Typography>
            
            {/* Toplu işlem butonları */}
            {selectedRows.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`${selectedRows.length} seçili`} 
                  color="primary" 
                  size="small"
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setSelectedRows(data.map(item => item._id))}
                  sx={{ mr: 1 }}
                >
                  Tümünü Seç ({data.length})
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                >
                  Toplu Sil
                </Button>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => fetchCollectionData(selectedCollection, filters)}
              startIcon={<RefreshIcon />}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              startIcon={<AddIcon />}
              color="success"
            >
              Yeni Ekle
            </Button>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data}
            columns={getColumns()}
            getRowId={(row) => row._id}
            loading={loading}
            checkboxSelection
            disableSelectionOnClick={false}
            density="compact"
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                borderBottom: '2px solid #e0e0e0',
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                }
              }
            }}
            slots={{
              toolbar: null // Toolbar'ı kaldır, kendi butonlarımızı kullanıyoruz
            }}
          />
        </Box>
      </Paper>

      {/* 📊 Excel Export Dialog */}
      <EditDataDialog
        open={editMode === 'create'}
        data={editingData}
        mode={editMode}
        collection={selectedCollection}
        onSave={handleSave}
        onClose={() => setEditingData(null)}
      />

      {/* 🗑️ Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>
          <Alert severity="error">
            <AlertTitle>Silme Onayı</AlertTitle>
          </Alert>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {deletingItem 
              ? `Bu kaydı silmek istediğinizden emin misiniz?`
              : 'Kayıt silmek istediğinizden emin misiniz?'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu işlem geri alınamaz.
          </Typography>
          
          {deletingItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" display="block">
                • {selectedCollection === 'employees' 
                    ? `${deletingItem.firstName} ${deletingItem.lastName} (${deletingItem.employeeId})`
                    : deletingItem.title
                  }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* 💡 Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress sx={{ width: 300, mb: 2 }} />
            <Typography>İşlem yapılıyor...</Typography>
          </Box>
        </Box>
      )}

      {/* 🚀 Floating Action Button - Hızlı Ekleme */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={handleCreate}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}

// 🚀 Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default DatabaseManagement; 