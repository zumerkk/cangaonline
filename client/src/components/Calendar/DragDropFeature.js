import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const DragDropFeature = ({ calendarRef, events, setEvents }) => {
  const [conflictDialog, setConflictDialog] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [pendingMove, setPendingMove] = useState(null);

  // ✨ Çakışma Kontrolü - Gelişmiş Algoritma
  const checkAdvancedConflicts = (movedEvent, newStart, newEnd) => {
    const conflicts = [];
    
    events.forEach(existingEvent => {
      if (existingEvent.id === movedEvent.id) return; // Kendisi ile karşılaştırma
      
      // 📅 Tarih çakışması kontrolü
      const hasDateOverlap = newStart < new Date(existingEvent.end) && 
                            newEnd > new Date(existingEvent.start);
      
      if (!hasDateOverlap) return;

      // 👥 Aynı çalışan kontrolü
      if (movedEvent.extendedProps?.employees && existingEvent.extendedProps?.employees) {
        const movedEmployees = movedEvent.extendedProps.employees;
        const existingEmployees = existingEvent.extendedProps.employees;
        
        const commonEmployees = movedEmployees.filter(emp => 
          existingEmployees.some(existing => existing.employeeId === emp.employeeId)
        );

        if (commonEmployees.length > 0) {
          conflicts.push({
            type: 'EMPLOYEE_CONFLICT',
            severity: 'high',
            message: `${commonEmployees.length} çalışan çakışması tespit edildi!`,
            employees: commonEmployees,
            conflictingEvent: existingEvent,
            icon: <PersonIcon color="error" />
          });
        }
      }

      // 🏢 Aynı departman/lokasyon kapasitesi kontrolü
      if (movedEvent.extendedProps?.location === existingEvent.extendedProps?.location) {
        const totalEmployees = (movedEvent.extendedProps?.employeeCount || 0) + 
                              (existingEvent.extendedProps?.employeeCount || 0);
        const maxCapacity = getLocationCapacity(movedEvent.extendedProps.location);
        
        if (totalEmployees > maxCapacity) {
          conflicts.push({
            type: 'CAPACITY_OVERFLOW',
            severity: 'medium',
            message: `${movedEvent.extendedProps.location} lokasyonunda kapasite aşımı!`,
            currentTotal: totalEmployees,
            maxCapacity: maxCapacity,
            icon: <WarningIcon color="warning" />
          });
        }
      }

      // ⏰ Vardiya türü çakışması (gece vardiyası sonrası gündüz vardiyası gibi)
      if (movedEvent.extendedProps?.type === 'shift' && existingEvent.extendedProps?.type === 'shift') {
        const isNightShift = movedEvent.extendedProps?.timeSlot?.includes('24:00') || 
                           movedEvent.extendedProps?.timeSlot?.includes('00:');
        const existingNightShift = existingEvent.extendedProps?.timeSlot?.includes('24:00') || 
                                 existingEvent.extendedProps?.timeSlot?.includes('00:');
        
        if (isNightShift && !existingNightShift) {
          const timeDiff = Math.abs(newStart - new Date(existingEvent.start)) / (1000 * 60 * 60);
          if (timeDiff < 8) { // 8 saatten az dinlenme
            conflicts.push({
              type: 'REST_TIME_VIOLATION',
              severity: 'medium',
              message: 'Gece vardiyası sonrası yeterli dinlenme süresi yok!',
              restHours: timeDiff.toFixed(1),
              requiredRest: 8,
              icon: <ScheduleIcon color="warning" />
            });
          }
        }
      }
    });

    return conflicts;
  };

  // 🏢 Lokasyon kapasitesi hesaplama
  const getLocationCapacity = (location) => {
    const capacities = {
      'MERKEZ ŞUBE': 50,
      'IŞIL ŞUBE': 30,
      'OSB ŞUBE': 20
    };
    return capacities[location] || 25;
  };

  // 🎯 Event sürükleme handler
  const handleEventDrop = (dropInfo) => {
    const { event, delta, revert } = dropInfo;
    
    console.log('🎯 Event sürüklendi:', {
      eventId: event.id,
      title: event.title,
      oldStart: event.start,
      newStart: event.start,
      delta: delta
    });

    // Yeni tarih aralığını hesapla
    const newStart = event.start;
    const newEnd = event.end;

    // Gelişmiş çakışma kontrolü
    const detectedConflicts = checkAdvancedConflicts(event, newStart, newEnd);
    
    if (detectedConflicts.length > 0) {
      console.log('⚠️ Çakışma tespit edildi:', detectedConflicts);
      
      setConflicts(detectedConflicts);
      setPendingMove({ event, newStart, newEnd, revert });
      setConflictDialog(true);
      
      // İşlemi şimdilik geri al - kullanıcı onay verirse ilerleyeceğiz
      revert();
      return;
    }

    // ✅ Çakışma yok - güncellemeyi uygula
    confirmEventMove(event, newStart, newEnd);
  };

  // ✅ Event taşımayı onayla
  const confirmEventMove = async (event, newStart, newEnd) => {
    try {
      // Backend API güncelleme
      const response = await fetch(`http://localhost:5001/api/calendar/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          movedAt: new Date().toISOString(),
          movedBy: 'current_user' // Gerçek sistemde auth'dan gelecek
        })
      });

      if (response.ok) {
        // Local state güncelle
        setEvents(prev => prev.map(e => 
          e.id === event.id 
            ? { ...e, start: newStart, end: newEnd }
            : e
        ));

        toast.success('✅ Etkinlik başarıyla taşındı!', {
          icon: '🎯',
          duration: 3000
        });

        // Otomatik bildirim gönder
        sendMoveNotification(event, newStart, newEnd);
      } else {
        throw new Error('API güncelleme başarısız');
      }
    } catch (error) {
      console.error('❌ Etkinlik taşıma hatası:', error);
      toast.error('Etkinlik taşınamadı! Tekrar deneyin.');
    }
  };

  // 📢 Taşıma bildirimi gönder
  const sendMoveNotification = async (event, newStart, newEnd) => {
    try {
      // Etkilenen çalışanlara bildirim gönder
      if (event.extendedProps?.employees) {
        const notification = {
          type: 'SHIFT_MOVED',
          title: 'Vardiya Tarihi Değişti',
          message: `${event.title} vardiyası ${format(newStart, 'dd MMMM yyyy', { locale: tr })} tarihine taşındı.`,
          recipients: event.extendedProps.employees.map(emp => emp.employeeId),
          priority: 'high',
          actionRequired: false
        };

        await fetch('http://localhost:5001/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
      }
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
    }
  };

  // ⚠️ Çakışmaya rağmen taşımayı onayla
  const forceMove = () => {
    if (pendingMove) {
      confirmEventMove(pendingMove.event, pendingMove.newStart, pendingMove.newEnd);
      setConflictDialog(false);
      setPendingMove(null);
      
      toast.warning('⚠️ Çakışmaya rağmen taşındı!', {
        duration: 5000
      });
    }
  };

  // ❌ Taşımayı iptal et
  const cancelMove = () => {
    if (pendingMove) {
      pendingMove.revert(); // FullCalendar'ın revert fonksiyonu
    }
    setConflictDialog(false);
    setPendingMove(null);
  };

  // 🎨 Çakışma türüne göre renk
  const getConflictColor = (type) => {
    const colors = {
      'EMPLOYEE_CONFLICT': 'error',
      'CAPACITY_OVERFLOW': 'warning',
      'REST_TIME_VIOLATION': 'info'
    };
    return colors[type] || 'default';
  };

  return (
    <>
      {/* Drag & Drop ayarları FullCalendar'a props olarak geçirilecek */}
      
      {/* ⚠️ Çakışma Dialog */}
      <Dialog 
        open={conflictDialog} 
        onClose={cancelMove}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            🚨 Çakışma Tespit Edildi!
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Alert severity="warning" sx={{ m: 2, mb: 0 }}>
            Bu etkinliği taşımak {conflicts.length} adet çakışmaya neden olacak!
          </Alert>

          <List>
            {conflicts.map((conflict, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {conflict.icon}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" color="error">
                        {conflict.message}
                      </Typography>
                      
                      {/* Çalışan çakışması detayı */}
                      {conflict.type === 'EMPLOYEE_CONFLICT' && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Çakışan çalışanlar:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {conflict.employees?.map((emp, i) => (
                              <Chip
                                key={i}
                                avatar={<Avatar sx={{ bgcolor: 'error.main' }}>{emp.name?.[0]}</Avatar>}
                                label={emp.name}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Kapasite aşımı detayı */}
                      {conflict.type === 'CAPACITY_OVERFLOW' && (
                        <Typography variant="body2" color="text.secondary">
                          Mevcut: {conflict.currentTotal} / Maksimum: {conflict.maxCapacity}
                        </Typography>
                      )}

                      {/* Dinlenme süresi detayı */}
                      {conflict.type === 'REST_TIME_VIOLATION' && (
                        <Typography variant="body2" color="text.secondary">
                          Dinlenme süresi: {conflict.restHours} saat (En az {conflict.requiredRest} saat gerekli)
                        </Typography>
                      )}
                    </Box>
                    
                    <Chip 
                      label={conflict.severity === 'high' ? 'Kritik' : 'Orta'}
                      color={getConflictColor(conflict.type)}
                      size="small"
                    />
                  </Box>
                </ListItem>
                {index < conflicts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={cancelMove} variant="outlined">
            ❌ İptal Et
          </Button>
          <Button 
            onClick={forceMove} 
            variant="contained" 
            color="warning"
            startIcon={<SwapIcon />}
          >
            ⚠️ Yine de Taşı
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DragDropFeature; 