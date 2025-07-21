import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Fab,
  Tooltip,
  LinearProgress,
  Container,
  Stack,
  Divider,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ViewModule as ViewModuleIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  List as ListIcon,
  Schedule as ScheduleIcon,
  DirectionsBus as BusIcon,
  Group as GroupIcon,
  Today as TodayIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Launch as LaunchIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

// CSS imports removed - using custom Material-UI styling instead

function Calendar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State'ler
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [eventDialog, setEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [stats, setStats] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Gelişmiş filtre state'leri
  const [filters, setFilters] = useState({
    shifts: true,
    services: true,
    employees: true,
    custom: true,
    events: true
  });

  // Yeni etkinlik state'leri
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
    description: '',
    location: '',
    type: 'custom'
  });

  // FullCalendar ref
  const calendarRef = useRef(null);

  // Component mount
  useEffect(() => {
    fetchCalendarData();
    fetchCalendarStats();
  }, [filters]);

  // Selected date değiştiğinde stats'ı güncelle
  useEffect(() => {
    fetchCalendarStats();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Takvim verilerini getir
  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Takvim verileri çekiliyor...');
      
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 4, 31);

      const activeTypes = Object.keys(filters).filter(key => filters[key]);
      if (activeTypes.length === 0) {
        activeTypes.push('shifts', 'services', 'employees', 'custom', 'events');
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        eventTypes: activeTypes.join(',')
      });

      const response = await fetch(`http://localhost:5001/api/calendar/events?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        // Etkinlikleri FullCalendar formatına dönüştür
        const formattedEvents = data.data.map(event => ({
          ...event,
          // Görsel iyileştirmeler
          backgroundColor: event.backgroundColor || getEventTypeColor(event.type),
          borderColor: event.borderColor || getEventTypeBorderColor(event.type),
          textColor: event.textColor || '#ffffff',
          classNames: [`event-${event.type}`, 'custom-event'],
          // Tooltip için extendedProps
          extendedProps: {
            ...event.extendedProps,
            type: event.type, // type'ı extendedProps'a ekle
            formattedDate: format(new Date(event.start), 'dd MMMM yyyy', { locale: tr }),
            formattedTime: format(new Date(event.start), 'HH:mm', { locale: tr })
          }
        }));

        setEvents(formattedEvents);
        console.log('📅 Takvim verileri yüklendi:', formattedEvents.length, 'etkinlik');
        
        // Başarılı yükleme mesajı
        if (formattedEvents.length > 0) {
          toast.success(`🎉 ${formattedEvents.length} etkinlik başarıyla yüklendi!`);
        }
      } else {
        console.error('Takvim verileri alınamadı:', data.message);
        toast.error('Takvim verileri alınamadı: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Takvim verileri alınamadı:', error);
      toast.error('Bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Etkinlik tipi renkleri
  const getEventTypeColor = (type) => {
    const colors = {
      shift: '#1976d2',
      shift_detail: '#42a5f5',
      service: '#7b1fa2',
      employee: '#388e3c',
      custom: '#f57c00',
      meeting: '#d32f2f',
      training: '#5d4037',
      vacation: '#00796b'
    };
    return colors[type] || '#1976d2';
  };

  const getEventTypeBorderColor = (type) => {
    const colors = {
      shift: '#0d47a1',
      shift_detail: '#1976d2',
      service: '#4a148c',
      employee: '#1b5e20',
      custom: '#e65100',
      meeting: '#b71c1c',
      training: '#3e2723',
      vacation: '#004d40'
    };
    return colors[type] || '#0d47a1';
  };

  // Takvim istatistiklerini getir
  const fetchCalendarStats = async () => {
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      console.log('📊 İstatistik çekiliyor:', { month, year });

      const response = await fetch(`http://localhost:5001/api/calendar/stats?month=${month}&year=${year}`);
      const data = await response.json();

      console.log('📊 İstatistik yanıtı:', data);

      if (data.success) {
        setStats(data.data);
        console.log('📊 Stats state güncellendi:', data.data);
      } else {
        console.error('İstatistik API hatası:', data.message);
      }
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };

  // Görünüm değiştir
  const handleViewChange = (view) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
    
    // Haptic feedback (mobilde)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Bugüne git
  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    setSelectedDate(new Date());
    toast.success('📅 Bugüne gidildi');
  };

  // Etkinlik tıklama - Geliştirilmiş
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }

    // Başlık zaten backend'de temizlenmiş durumda

    const eventData = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      type: event.extendedProps?.type || 'unknown',
      description: event.extendedProps?.description || '',
      location: event.extendedProps?.location || '',
      createdBy: event.extendedProps?.createdBy || '',
      status: event.extendedProps?.status || '',
      employeeCount: event.extendedProps?.employeeCount || 0,
      totalGroups: event.extendedProps?.totalGroups || 0,
      totalPassengers: event.extendedProps?.totalPassengers || 0,
      totalRoutes: event.extendedProps?.totalRoutes || 0,
      groupName: event.extendedProps?.groupName || '',
      timeSlot: event.extendedProps?.timeSlot || '',
      department: event.extendedProps?.department || '',
      ...event.extendedProps
    };
    
    setSelectedEvent(eventData);
    setEditMode(false);
    setEventDialog(true);
    
    console.log('🖱️ Etkinlik seçildi:', eventData);
  };

  // Tarih tıklama (yeni etkinlik)
  const handleDateClick = (selectInfo) => {
    const startDate = selectInfo.start ? new Date(selectInfo.start) : new Date();
    const endDate = selectInfo.end ? new Date(selectInfo.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    setNewEvent({
      title: '',
      start: startDate,
      end: endDate,
      description: '',
      location: '',
      type: 'custom'
    });
    setSelectedEvent(null);
    setEditMode(false);
    setEventDialog(true);
    
    toast.success('📅 Yeni etkinlik oluşturuluyor...');
  };

  // Hızlı etkinlik oluştur
  const createQuickEvent = (type) => {
    const now = new Date();
    const templates = {
      meeting: {
        title: 'Yeni Toplantı',
        start: now,
        end: new Date(now.getTime() + 60 * 60 * 1000),
        type: 'meeting',
        description: 'Toplantı açıklaması...',
        location: 'Toplantı Salonu'
      },
      training: {
        title: 'Eğitim Programı',
        start: now,
        end: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        type: 'training',
        description: 'Eğitim açıklaması...',
        location: 'Eğitim Salonu'
      },
      vacation: {
        title: 'İzin Talebi',
        start: now,
        end: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        type: 'vacation',
        description: 'İzin açıklaması...',
        location: ''
      }
    };

    setNewEvent(templates[type] || templates.meeting);
    setSelectedEvent(null);
    setEditMode(false);
    setEventDialog(true);
  };

  // Filtre güncelle
  const handleFilterChange = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
    
    toast.success(`🔍 ${filterType} filtresi ${filters[filterType] ? 'kapatıldı' : 'açıldı'}`);
  };

  // Yeni etkinlik kaydet
  const handleSaveEvent = async () => {
    // Validasyon
    if (!newEvent.title.trim()) {
      toast.error('❌ Etkinlik başlığı gerekli!');
      return;
    }

    if (!newEvent.start || !newEvent.end) {
      toast.error('❌ Başlangıç ve bitiş tarihleri gerekli!');
      return;
    }

    if (new Date(newEvent.start) >= new Date(newEvent.end)) {
      toast.error('❌ Bitiş tarihi başlangıç tarihinden sonra olmalı!');
      return;
    }

    try {
      console.log('💾 Etkinlik kaydediliyor:', newEvent);

      const response = await fetch('http://localhost:5001/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newEvent,
          createdBy: 'Kullanıcı', // Auth'dan gelecek
          createdAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Etkinlik başarıyla oluşturuldu!', {
          icon: '🎉',
          duration: 4000
        });
        
        setEventDialog(false);
        resetNewEvent();
        await fetchCalendarData();
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        toast.error('❌ Etkinlik oluşturulamadı: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Etkinlik kaydetme hatası:', error);
      toast.error('❌ Bir hata oluştu: ' + error.message);
    }
  };

  // Etkinlik güncelle
  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    if (!editingEvent.title.trim()) {
      toast.error('❌ Etkinlik başlığı gerekli!');
      return;
    }

    if (new Date(editingEvent.start) >= new Date(editingEvent.end)) {
      toast.error('❌ Bitiş tarihi başlangıç tarihinden sonra olmalı!');
      return;
    }

    try {
      console.log('✏️ Etkinlik güncelleniyor:', editingEvent);

      const response = await fetch(`http://localhost:5001/api/calendar/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editingEvent,
          updatedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Etkinlik başarıyla güncellendi!', {
          icon: '📝',
          duration: 4000
        });
        setEditMode(false);
        setEventDialog(false);
        await fetchCalendarData();
      } else {
        toast.error('❌ Etkinlik güncellenemedi: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Etkinlik güncelleme hatası:', error);
      toast.error('❌ Bir hata oluştu: ' + error.message);
    }
  };

  // Etkinlik sil
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      console.log('🗑️ Etkinlik siliniyor:', selectedEvent.id);

      const response = await fetch(`http://localhost:5001/api/calendar/events/${selectedEvent.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Etkinlik başarıyla silindi!', {
          icon: '🗑️',
          duration: 4000
        });
        setDeleteDialog(false);
        setEventDialog(false);
        await fetchCalendarData();
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([200]);
        }
      } else {
        toast.error('❌ Etkinlik silinemedi: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Etkinlik silme hatası:', error);
      toast.error('❌ Bir hata oluştu: ' + error.message);
    }
  };

  // Etkinlik düzenlemeye başla
  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditingEvent({
        id: selectedEvent.id,
        title: selectedEvent.title,
        start: new Date(selectedEvent.start),
        end: new Date(selectedEvent.end),
        description: selectedEvent.description || '',
        location: selectedEvent.location || '',
        type: selectedEvent.type || 'custom'
      });
      setEditMode(true);
    }
  };

  // State'leri sıfırla
  const resetNewEvent = () => {
    const now = new Date();
    setNewEvent({
      title: '',
      start: now,
      end: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      description: '',
      location: '',
      type: 'custom'
    });
  };

  const handleCloseDialog = () => {
    setEventDialog(false);
    setEditMode(false);
    setSelectedEvent(null);
    setEditingEvent(null);
    resetNewEvent();
  };

  // Etkinlik türü ikonu
  const getEventTypeIcon = (type) => {
    const icons = {
      shift: <ScheduleIcon />,
      shift_detail: <ScheduleIcon />,
      service: <BusIcon />,
      employee: <GroupIcon />,
      custom: <EventIcon />,
      meeting: <GroupIcon />,
      training: <ScheduleIcon />,
      vacation: <EventIcon />
    };
    return icons[type] || <EventIcon />;
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Modern Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              📅 Takvim & Ajanda
            </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Vardiyalar, servis programları ve tüm etkinlikleri modern arayüzle yönetin
            </Typography>
          </Box>
          
            {/* Hızlı İstatistikler */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[
                { label: 'Bu Ay Vardiya', value: stats.shifts || 0, icon: '📋', color: '#4fc3f7' },
                { label: 'Bu Ay Servis', value: stats.services || 0, icon: '🚌', color: '#81c784' },
                { label: 'Yeni Çalışan', value: stats.newEmployees || 0, icon: '👥', color: '#ffb74d' },
                { label: 'Toplam Etkinlik', value: events.length, icon: '📅', color: '#f06292' }
              ].map((stat, index) => (
                <Card key={index} sx={{ minWidth: 120, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center', color: 'white' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>{stat.icon}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{stat.label}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Kontrol Paneli */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            {/* Sol taraf - Görünüm kontrolleri */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <ButtonGroup variant="outlined" size="small" sx={{ borderRadius: 2 }}>
              <Tooltip title="Ay Görünümü">
                <Button
                  onClick={() => handleViewChange('dayGridMonth')}
                  variant={currentView === 'dayGridMonth' ? 'contained' : 'outlined'}
                    sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  <ViewModuleIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Hafta Görünümü">
                <Button
                  onClick={() => handleViewChange('timeGridWeek')}
                  variant={currentView === 'timeGridWeek' ? 'contained' : 'outlined'}
                    sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  <ViewWeekIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Gün Görünümü">
                <Button
                  onClick={() => handleViewChange('timeGridDay')}
                  variant={currentView === 'timeGridDay' ? 'contained' : 'outlined'}
                    sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  <ViewDayIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Liste Görünümü">
                <Button
                  onClick={() => handleViewChange('listWeek')}
                  variant={currentView === 'listWeek' ? 'contained' : 'outlined'}
                    sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  <ListIcon />
                </Button>
              </Tooltip>
            </ButtonGroup>

              <Divider orientation="vertical" flexItem />

            <Tooltip title="Bugün">
                <IconButton onClick={goToToday} color="primary">
                <TodayIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Yenile">
                <IconButton onClick={() => { fetchCalendarData(); fetchCalendarStats(); }} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            </Stack>

            {/* Sağ taraf - Filtre ve aksiyonlar */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {/* Filtre Menüsü */}
              <Badge badgeContent={Object.values(filters).filter(Boolean).length} color="primary">
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  size="small"
                >
                  Filtreler
                </Button>
              </Badge>

              {/* Hızlı Etkinlik Ekleme */}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
              >
                Ekle
              </Button>

              {/* Daha fazla seçenek */}
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress sx={{ borderRadius: 1 }} />
          </Box>
        )}

        {/* Ana Takvim */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            '& .fc': {
              fontFamily: theme.typography.fontFamily,
              fontSize: '0.875rem'
            },
            '& .fc-header-toolbar': {
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            },
            '& .fc-toolbar-title': {
              fontSize: '1.5rem',
              fontWeight: 700,
              color: theme.palette.primary.main,
              textAlign: 'center'
            },
            '& .fc-button': {
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              padding: '8px 16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              },
              '&.fc-button-active': {
                backgroundColor: theme.palette.primary.dark,
                borderColor: theme.palette.primary.dark
              }
            },
            '& .fc-today-button': {
              backgroundColor: theme.palette.secondary.main,
              borderColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark
              }
            },
            '& .fc-prev-button, & .fc-next-button': {
              backgroundColor: theme.palette.grey[100],
              borderColor: theme.palette.grey[300],
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.grey[200]
              }
            },
            '& .fc-daygrid-day': {
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                cursor: 'pointer'
              }
            },
            '& .fc-daygrid-day-number': {
              color: theme.palette.text.primary,
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: 'white'
              }
            },
            '& .fc-day-today': {
              backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
              border: `2px solid ${theme.palette.primary.main} !important`,
              '& .fc-daygrid-day-number': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 700,
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            },
            '& .fc-col-header-cell': {
              backgroundColor: theme.palette.grey[50],
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              fontWeight: 600,
              color: theme.palette.primary.main,
              padding: '12px 8px'
            },
            '& .fc-col-header-cell-cushion': {
              padding: '8px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px'
            },
                        '& .fc-event': {
              borderRadius: '6px',
              border: 'none',
              padding: '2px 6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              margin: '1px',
              minHeight: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                opacity: 0.9
              }
            },
            '& .fc-event-title': {
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'white'
            },
            '& .fc-event-time': {
              fontWeight: 500,
              fontSize: '0.7rem',
              opacity: 0.9
            },
            '& .custom-event': {
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '4px 4px 0 0'
              }
            },
            '& .event-shift': {
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
              }
            },
            '& .event-service': {
              background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)'
              }
            },
            '& .event-meeting': {
              background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)'
              }
            },
            '& .event-training': {
              background: 'linear-gradient(135deg, #5d4037 0%, #4e342e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4e342e 0%, #3e2723 100%)'
              }
            },
            '& .event-vacation': {
              background: 'linear-gradient(135deg, #00796b 0%, #00695c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)'
              }
            },
            '& .event-custom': {
              background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ef6c00 0%, #e65100 100%)'
              }
            },
            '& .fc-more-link': {
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.75rem',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: theme.palette.primary.light + '20',
              border: `1px solid ${theme.palette.primary.light}`,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: 'white'
              }
            },
            '& .fc-popover': {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: `1px solid ${theme.palette.divider}`,
              '& .fc-popover-header': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
                borderRadius: '12px 12px 0 0'
              },
              '& .fc-popover-body': {
                padding: '8px',
                '& .fc-event': {
                  margin: '4px 0',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }
              }
            },
            '& .fc-list': {
              borderRadius: '12px',
              overflow: 'hidden',
              '& .fc-list-table': {
                borderCollapse: 'separate',
                borderSpacing: 0
              },
              '& .fc-list-day': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '12px 16px',
                '& .fc-list-day-text': {
                  textTransform: 'capitalize'
                },
                '& .fc-list-day-side-text': {
                  fontWeight: 500,
                  opacity: 0.9
                }
              },
              '& .fc-list-event': {
                borderBottom: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'translateX(4px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                },
                '&:last-child': {
                  borderBottom: 'none'
                }
              },
              '& .fc-list-event-time': {
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light + '10',
                borderRight: `3px solid ${theme.palette.primary.main}`,
                minWidth: '120px',
                textAlign: 'center'
              },
              '& .fc-list-event-title': {
                padding: '12px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                '& .fc-list-event-dot': {
                  display: 'none'
                },
                '& a': {
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }
              },
              '& .fc-list-empty': {
                padding: '40px 20px',
                textAlign: 'center',
                color: theme.palette.text.secondary,
                fontSize: '1rem',
                fontStyle: 'italic'
              }
            },
            '& .fc-list-event-graphic': {
              display: 'none'
            },
            [theme.breakpoints.down('md')]: {
              '& .fc-list-event': {
                display: 'block !important',
                '& .fc-list-event-time': {
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  borderRight: 'none',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.75rem',
                  padding: '8px 12px'
                },
                '& .fc-list-event-title': {
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.8rem'
                }
              }
            },
            '& .fc-scrollgrid': {
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`
            },
            '& .fc-scrollgrid-section > td': {
              border: 'none'
            },
            '& .fc-daygrid-body': {
              '& tr:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.02)'
              }
            },
            // More link ve popover iyileştirmeleri
            '& .fc-more-link': {
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: theme.palette.primary.light + '20',
              border: `1px solid ${theme.palette.primary.light}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                transform: 'scale(1.05)'
              }
            },
            '& .fc-popover': {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: `1px solid ${theme.palette.divider}`,
              zIndex: 9999,
              '& .fc-popover-header': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
                borderRadius: '12px 12px 0 0',
                padding: '12px 16px',
                fontSize: '0.9rem'
              },
              '& .fc-popover-body': {
                padding: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                '& .fc-event': {
                  margin: '4px 0',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }
              }
            },
            // Responsive iyileştirmeleri
            [theme.breakpoints.down('sm')]: {
              padding: 2,
              '& .fc-toolbar': {
                flexDirection: 'column',
                gap: '8px',
                '& .fc-toolbar-chunk': {
                  display: 'flex',
                  justifyContent: 'center'
                }
              },
              '& .fc-button': {
                padding: '6px 12px',
                fontSize: '0.75rem'
              },
              '& .fc-event': {
                fontSize: '0.7rem',
                padding: '2px 4px'
              },
              '& .fc-more-link': {
                fontSize: '0.7rem',
                padding: '2px 6px'
              }
            }
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={currentView}
            locale="tr"
            height="auto"
            headerToolbar={{
              left: 'prev,next',
              center: 'title', 
              right: ''
            }}
            events={events}
            editable={true}
            selectable={true}
            eventClick={handleEventClick}
            select={handleDateClick}
            dayMaxEvents={isMobile ? 2 : 4}
            moreLinkClick="popover"
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            buttonText={{
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
              list: 'Liste'
            }}
            firstDay={1}
            weekends={true}
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '08:00',
              endTime: '18:00'
            }}

            // Liste görünümü için özel ayarlar
            listDayFormat={{
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }}
            listDaySideFormat={{
              weekday: 'long'
            }}
                        noEventsContent="Bu tarihte etkinlik bulunmuyor"
          />
        </Paper>

        {/* Hızlı Ekleme FAB (Mobilde) */}
        {isMobile && (
          <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="add"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000
              }}
              onClick={() => handleDateClick({ start: new Date() })}
        >
          <AddIcon />
        </Fab>
          </Zoom>
        )}

        {/* Filtre Menüsü */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
          PaperProps={{
            sx: { minWidth: 200, p: 1 }
          }}
        >
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
            Etkinlik Türleri
          </Typography>
          <Divider sx={{ mb: 1 }} />
          
          {Object.entries(filters).map(([key, value]) => (
            <MenuItem key={key} onClick={() => handleFilterChange(key)}>
              <ListItemIcon>
                {value ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={key === 'shifts' ? 'Vardiyalar' : 
                        key === 'services' ? 'Servisler' : 
                        key === 'employees' ? 'Çalışanlar' : 
                        key === 'custom' ? 'Özel Etkinlikler' : 'Tüm Etkinlikler'} 
              />
              <Chip 
                label={
                  key === 'shifts' ? events.filter(e => e.type === 'shift').length :
                  key === 'services' ? events.filter(e => e.type === 'service').length :
                  key === 'employees' ? events.filter(e => e.type === 'employee').length :
                  key === 'custom' ? events.filter(e => e.type === 'custom').length :
                  events.length // 'events' için toplam
                }
                size="small"
                color={value ? 'primary' : 'default'}
              />
            </MenuItem>
          ))}
        </Menu>

        {/* Hızlı Ekleme Menüsü */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <MenuItem onClick={() => { createQuickEvent('meeting'); setAnchorEl(null); }}>
            <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Toplantı" secondary="Hızlı toplantı oluştur" />
          </MenuItem>
          <MenuItem onClick={() => { createQuickEvent('training'); setAnchorEl(null); }}>
            <ListItemIcon><ScheduleIcon color="secondary" /></ListItemIcon>
            <ListItemText primary="Eğitim" secondary="Eğitim programı" />
          </MenuItem>
          <MenuItem onClick={() => { createQuickEvent('vacation'); setAnchorEl(null); }}>
            <ListItemIcon><EventIcon color="success" /></ListItemIcon>
            <ListItemText primary="İzin" secondary="İzin talebi oluştur" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleDateClick({ start: new Date() }); setAnchorEl(null); }}>
            <ListItemIcon><AddIcon /></ListItemIcon>
            <ListItemText primary="Özel Etkinlik" secondary="Detaylı etkinlik oluştur" />
          </MenuItem>
        </Menu>



        {/* Etkinlik Detay/Oluşturma Dialog */}
        <Dialog 
          open={eventDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: { 
              borderRadius: isMobile ? 0 : 3,
              maxHeight: isMobile ? '100vh' : '90vh',
              width: isMobile ? '100vw' : 'auto'
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedEvent ? getEventTypeIcon(selectedEvent.type) : <AddIcon />}
                <Typography variant="h6">
                  {selectedEvent ? 
                    (editMode ? 'Etkinlik Düzenle' : 'Etkinlik Detayı') : 
                    'Yeni Etkinlik Oluştur'
                  }
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ 
            pt: 2, 
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3
          }}>
            {selectedEvent && !editMode ? (
                  // Etkinlik Detay Görünümü
              <Box>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    background: `linear-gradient(135deg, ${getEventTypeColor(selectedEvent.type)}22, ${getEventTypeColor(selectedEvent.type)}11)`,
                    borderRadius: 2,
                    border: `2px solid ${getEventTypeColor(selectedEvent.type)}33`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: getEventTypeColor(selectedEvent.type), width: 56, height: 56 }}>
                      {getEventTypeIcon(selectedEvent.type)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {selectedEvent.title}
                      </Typography>
                      <Chip 
                        label={selectedEvent.type === 'shift' ? 'Vardiya' : 
                              selectedEvent.type === 'service' ? 'Servis' : 
                              selectedEvent.type === 'meeting' ? 'Toplantı' : 
                              selectedEvent.type === 'training' ? 'Eğitim' : 
                              selectedEvent.type === 'vacation' ? 'İzin' : 'Etkinlik'} 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Paper>
                    
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon color="primary" />
                        <Typography variant="subtitle2" color="primary" fontWeight={600}>
                          Başlangıç Tarihi
                      </Typography>
                      </Box>
                      <Typography variant="h6">
                        {selectedEvent.start ? format(new Date(selectedEvent.start), 'dd MMMM yyyy', { locale: tr }) : '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEvent.start ? format(new Date(selectedEvent.start), 'HH:mm', { locale: tr }) : '-'}
                      </Typography>
                    </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon color="secondary" />
                        <Typography variant="subtitle2" color="secondary" fontWeight={600}>
                          Bitiş Tarihi
                      </Typography>
                      </Box>
                      <Typography variant="h6">
                        {selectedEvent.end && selectedEvent.end !== selectedEvent.start ? 
                          format(new Date(selectedEvent.end), 'dd MMMM yyyy', { locale: tr }) : 
                          (selectedEvent.start ? format(new Date(selectedEvent.start), 'dd MMMM yyyy', { locale: tr }) : '-')
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEvent.end && selectedEvent.end !== selectedEvent.start ? 
                          format(new Date(selectedEvent.end), 'HH:mm', { locale: tr }) : 
                          'Tek günlük etkinlik'
                        }
                      </Typography>
                    </Card>
                    </Grid>
                    
                    {selectedEvent.location && (
                      <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationIcon color="success" />
                          <Typography variant="subtitle2" color="success" fontWeight={600}>
                            Lokasyon
                          </Typography>
                        </Box>
                        <Typography variant="body1">{selectedEvent.location}</Typography>
                      </Card>
                      </Grid>
                    )}
                    
                    {selectedEvent.description && (
                      <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EventIcon color="info" />
                          <Typography variant="subtitle2" color="info" fontWeight={600}>
                            Açıklama
                          </Typography>
                        </Box>
                        <Typography variant="body1">{selectedEvent.description}</Typography>
                      </Card>
                      </Grid>
                    )}
                    
                  {/* Durum Bilgisi */}
                  {selectedEvent.status && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckIcon color="info" />
                          <Typography variant="subtitle2" color="info" fontWeight={600}>
                            Durum
                          </Typography>
                        </Box>
                        <Chip 
                          label={selectedEvent.status} 
                          color={
                            selectedEvent.status === 'ONAYLANDI' || selectedEvent.status === 'AKTIF' ? 'success' :
                            selectedEvent.status === 'TAMAMLANDI' ? 'default' :
                            selectedEvent.status === 'İPTAL' ? 'error' : 'warning'
                          }
                          variant="filled"
                        />
                      </Card>
                      </Grid>
                    )}

                  {/* Vardiya Özel Bilgileri */}
                  {selectedEvent.type === 'shift' && selectedEvent.totalGroups > 0 && (
                      <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <GroupIcon color="primary" />
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            Vardiya Detayları
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Toplam Grup</Typography>
                            <Typography variant="h6" color="primary">{selectedEvent.totalGroups}</Typography>
                      </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Toplam Çalışan</Typography>
                            <Typography variant="h6" color="success.main">{selectedEvent.totalEmployees || 0}</Typography>
                  </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Lokasyon</Typography>
                            <Typography variant="h6">{selectedEvent.location}</Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Durum</Typography>
                            <Chip 
                              label={selectedEvent.status} 
                              size="small"
                              color={
                                selectedEvent.status === 'ONAYLANDI' || selectedEvent.status === 'YAYINLANDI' ? 'success' :
                                selectedEvent.status === 'TAMAMLANDI' ? 'default' :
                                selectedEvent.status === 'İPTAL' ? 'error' : 'warning'
                              }
                            />
                          </Grid>
                    </Grid>
                    
                        {/* Grup Detayları */}
                        {selectedEvent.groups && selectedEvent.groups.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                              Grup Detayları:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {selectedEvent.groups.map((group, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                                    {group.groupName}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {group.shifts?.map((shift, shiftIndex) => (
                                      <Chip
                                        key={shiftIndex}
                                        label={`${shift.timeSlot} (${shift.employeeCount} kişi)`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                    ))}
                                  </Box>
                                </Paper>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  )}
                    
                  {/* Servis Özel Bilgileri */}
                  {selectedEvent.type === 'service' && (selectedEvent.totalPassengers > 0 || selectedEvent.totalRoutes > 0) && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <BusIcon color="secondary" />
                          <Typography variant="subtitle2" color="secondary" fontWeight={600}>
                            Servis Bilgileri
                          </Typography>
                        </Box>
                        {selectedEvent.totalPassengers > 0 && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Toplam Yolcu:</strong> {selectedEvent.totalPassengers}
                          </Typography>
                        )}
                        {selectedEvent.totalRoutes > 0 && (
                          <Typography variant="body2">
                            <strong>Güzergah Sayısı:</strong> {selectedEvent.totalRoutes}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  )}

                  {/* Çalışan Bilgileri */}
                  {selectedEvent.type === 'employee' && selectedEvent.department && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon color="success" />
                          <Typography variant="subtitle2" color="success" fontWeight={600}>
                            Çalışan Bilgileri
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Departman:</strong> {selectedEvent.department}
                        </Typography>
                        {selectedEvent.employeeName && (
                          <Typography variant="body2">
                            <strong>Ad Soyad:</strong> {selectedEvent.employeeName}
                          </Typography>
                        )}
                      </Card>
                    </Grid>
                  )}

                  {selectedEvent.createdBy && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon color="warning" />
                          <Typography variant="subtitle2" color="warning" fontWeight={600}>
                            Oluşturan
                          </Typography>
                        </Box>
                        <Typography variant="body1">{selectedEvent.createdBy}</Typography>
                      </Card>
                    </Grid>
                  )}
                  </Grid>

                {/* Etkinlik Tipine Göre Ek Bilgiler */}
                {(selectedEvent.type === 'shift' || selectedEvent.type === 'service') && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      💡 Bu {selectedEvent.type === 'shift' ? 'vardiya' : 'servis'} etkinliğinin detaylarını görmek için ilgili sayfaya gidin.
                    </Typography>
                  </Alert>
                )}

                {/* Shift Detail için özel bilgi */}
                {selectedEvent.type === 'shift_detail' && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      👥 Bu bir vardiya grubu detayıdır. Ana vardiya bilgileri için vardiya sayfasını ziyaret edin.
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              // Yeni Etkinlik Oluşturma / Düzenleme Formu
              <Box>
                <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Etkinlik Başlığı"
                      value={editMode ? (editingEvent?.title || '') : (newEvent?.title || '')}
                      onChange={(e) => {
                        if (editMode) {
                          setEditingEvent(prev => ({ ...prev, title: e.target.value }));
                        } else {
                          setNewEvent(prev => ({ ...prev, title: e.target.value }));
                        }
                      }}
                    required
                      variant="outlined"
                      placeholder="Etkinlik başlığını girin..."
                      InputProps={{
                        startAdornment: <EventIcon color="action" sx={{ mr: 1 }} />
                      }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Başlangıç Tarihi"
                      value={editMode ? (editingEvent?.start || new Date()) : (newEvent?.start || new Date())}
                    onChange={(date) => {
                      const validDate = date || new Date();
                        if (editMode) {
                          setEditingEvent(prev => ({ 
                            ...prev, 
                            start: validDate,
                            end: prev.end < validDate ? new Date(validDate.getTime() + 2 * 60 * 60 * 1000) : prev.end
                          }));
                        } else {
                      setNewEvent(prev => ({ 
                        ...prev, 
                        start: validDate,
                            end: prev.end < validDate ? new Date(validDate.getTime() + 2 * 60 * 60 * 1000) : prev.end
                      }));
                        }
                    }}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                          variant: 'outlined'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Bitiş Tarihi"
                      value={editMode ? (editingEvent?.end || new Date()) : (newEvent?.end || new Date())}
                    onChange={(date) => {
                      const validDate = date || new Date();
                        if (editMode) {
                          setEditingEvent(prev => ({ ...prev, end: validDate }));
                        } else {
                          setNewEvent(prev => ({ ...prev, end: validDate }));
                        }
                      }}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                          variant: 'outlined'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Lokasyon"
                      value={editMode ? (editingEvent?.location || '') : (newEvent?.location || '')}
                      onChange={(e) => {
                        if (editMode) {
                          setEditingEvent(prev => ({ ...prev, location: e.target.value }));
                        } else {
                          setNewEvent(prev => ({ ...prev, location: e.target.value }));
                        }
                      }}
                      variant="outlined"
                      placeholder="Etkinlik lokasyonunu girin..."
                      InputProps={{
                        startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />
                      }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Açıklama"
                      value={editMode ? (editingEvent?.description || '') : (newEvent?.description || '')}
                      onChange={(e) => {
                        if (editMode) {
                          setEditingEvent(prev => ({ ...prev, description: e.target.value }));
                        } else {
                          setNewEvent(prev => ({ ...prev, description: e.target.value }));
                        }
                      }}
                    multiline
                    rows={3}
                      variant="outlined"
                      placeholder="Etkinlik açıklamasını girin..."
                  />
                </Grid>

                  {!editMode && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          💡 Etkinlik oluşturulduktan sonra takvimde görünecek ve düzenlenebilecektir.
                        </Typography>
                      </Alert>
              </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: isMobile ? 2 : 3, 
            gap: 1,
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            {selectedEvent && !editMode ? (
              // Detay görünümü aksiyonları
              <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(selectedEvent.type === 'shift' || selectedEvent.type === 'service') && (
                      <Button 
                        startIcon={<LaunchIcon />} 
                      onClick={() => { 
                        navigate(selectedEvent.type === 'shift' ? '/shifts' : '/services'); 
                        setEventDialog(false); 
                      }}
                        variant="outlined"
                      color="primary"
                      >
                      Detaya Git
                      </Button>
                    )}
                </Box>
                    
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedEvent.type === 'custom' && (
                    <>
                      <Button 
                        startIcon={<EditIcon />} 
                        onClick={handleEditEvent}
                        variant="outlined"
                        color="primary"
                      >
                        Düzenle
                      </Button>
                        <Button 
                          startIcon={<DeleteIcon />} 
                          onClick={() => setDeleteDialog(true)}
                        variant="outlined"
                          color="error"
                        >
                          Sil
                        </Button>
                      </>
                    )}
                  <Button onClick={handleCloseDialog} variant="outlined">
                    Kapat
                  </Button>
                </Box>
              </Box>
            ) : editMode ? (
              // Düzenleme modu aksiyonları
                  <>
                    <Button 
                      onClick={() => setEditMode(false)}
                  startIcon={<CancelIcon />}
                  variant="outlined"
                    >
                      İptal
                    </Button>
                    <Button 
                      onClick={handleUpdateEvent}
                  startIcon={<SaveIcon />}
                      variant="contained"
                  color="primary"
                    >
                  Güncelle
                    </Button>
              </>
            ) : (
              // Yeni etkinlik oluşturma aksiyonları
              <>
                <Button 
                  onClick={handleCloseDialog} 
                  startIcon={<CancelIcon />}
                  variant="outlined"
                >
                  İptal
                </Button>
                <Button 
                  onClick={handleSaveEvent}
                  startIcon={<SaveIcon />}
                  variant="contained"
                  color="primary"
                >
                  Oluştur
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Silme Onay Dialog'u */}
        <Dialog 
          open={deleteDialog} 
          onClose={() => setDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteIcon color="error" />
              Etkinliği Sil
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bu işlem geri alınamaz!
            </Alert>
            <Typography>
              <strong>"{selectedEvent?.title}"</strong> etkinliğini silmek istediğinizden emin misiniz?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setDeleteDialog(false)} 
              variant="outlined"
            >
              İptal
            </Button>
            <Button 
              onClick={handleDeleteEvent}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Evet, Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default Calendar; 