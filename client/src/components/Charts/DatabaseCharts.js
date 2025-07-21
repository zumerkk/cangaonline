import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Radar, Doughnut } from 'react-chartjs-2';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  Chip,
  Stack,
  CardActions,
  IconButton,
  Tooltip as MuiTooltip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';

// Import export utilities
import { ExportButtons } from './ChartExporter';

// Chart.js kayıt işlemleri
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

// 🎨 Çanga temasına uygun renkler
const CHART_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e', 
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  // Departman renkleri
  departments: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#FFB347', '#87CEEB',
    '#F0E68C', '#FFA07A', '#98D8C8', '#B19CD9'
  ],
  // Lokasyon renkleri  
  locations: ['#1976d2', '#dc004e', '#2e7d32'],
  // Status renkleri
  status: {
    'AKTIF': '#2e7d32',
    'PASIF': '#d32f2f', 
    'İZINLİ': '#ed6c02',
    'AYRILDI': '#757575',
    'ONAYLANDI': '#2e7d32',
    'TASLAK': '#ed6c02',
    'İPTAL': '#d32f2f'
  }
};

// 📊 Departman Dağılım Pasta Grafiği
export function DepartmentDistributionChart({ 
  data, 
  title = "Departman Dağılımı",
  onDrilldown 
}) {
  const theme = useTheme();
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography color="text.secondary">Veri bulunamadı</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => item._id || item.name),
    datasets: [
      {
        data: data.map(item => item.count || item.value),
        backgroundColor: CHART_COLORS.departments.slice(0, data.length),
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    // 🔍 Interactive onClick - Drill-down için
    onClick: (event, elements) => {
      if (elements.length > 0 && onDrilldown) {
        const elementIndex = elements[0].index;
        const selectedData = {
          label: chartData.labels[elementIndex],
          value: chartData.datasets[0].data[elementIndex],
          _id: data[elementIndex]._id
        };
        onDrilldown(selectedData, 'department');
      }
    }
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={1}>
            {onDrilldown && (
              <MuiTooltip title="Grafiğe tıklayarak detaya inin">
                <IconButton size="small">
                  <ZoomInIcon />
                </IconButton>
              </MuiTooltip>
            )}
            <ExportButtons 
              chartRef={chartRef}
              data={data}
              filename="departman_dagilimi"
              title={title}
              compact
            />
          </Stack>
        </Box>
        <Box ref={chartRef} sx={{ height: 300 }}>
          <Pie data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

// 📈 Trend Analizi Line Chart
export function TrendAnalysisChart({ 
  data, 
  title = "Trend Analizi",
  onDrilldown 
}) {
  const theme = useTheme();
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography color="text.secondary">Veri bulunamadı</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => {
      if (item._id && item._id.month && item._id.year) {
        return `${item._id.month}/${item._id.year}`;
      }
      return item.label || item._id;
    }),
    datasets: [
      {
        label: 'Sayı',
        data: data.map(item => item.count || item.newHires || item.value),
        borderColor: CHART_COLORS.primary,
        backgroundColor: `${CHART_COLORS.primary}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      x: {
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      }
    },
    // 🔍 Interactive onClick
    onClick: (event, elements) => {
      if (elements.length > 0 && onDrilldown) {
        const elementIndex = elements[0].index;
        const selectedData = {
          label: chartData.labels[elementIndex],
          value: chartData.datasets[0].data[elementIndex],
          _id: data[elementIndex]._id
        };
        onDrilldown(selectedData, 'trends');
      }
    }
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={1}>
            {onDrilldown && (
              <MuiTooltip title="Noktaya tıklayarak o dönemi analiz edin">
                <IconButton size="small">
                  <ZoomInIcon />
                </IconButton>
              </MuiTooltip>
            )}
            <ExportButtons 
              chartRef={chartRef}
              data={data}
              filename="trend_analizi"
              title={title}
              compact
            />
          </Stack>
        </Box>
        <Box ref={chartRef} sx={{ height: 300 }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

// 📊 Lokasyon Karşılaştırma Bar Chart
export function LocationComparisonChart({ 
  data, 
  title = "Lokasyon Karşılaştırması",
  onDrilldown 
}) {
  const theme = useTheme();
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography color="text.secondary">Veri bulunamadı</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => item._id || item.name),
    datasets: [
      {
        label: 'Çalışan Sayısı',
        data: data.map(item => item.totalEmployees || item.count),
        backgroundColor: CHART_COLORS.locations,
        borderColor: CHART_COLORS.locations.map(color => color + 'DD'),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      }
    },
    // 🔍 Interactive onClick
    onClick: (event, elements) => {
      if (elements.length > 0 && onDrilldown) {
        const elementIndex = elements[0].index;
        const selectedData = {
          label: chartData.labels[elementIndex],
          value: chartData.datasets[0].data[elementIndex],
          _id: data[elementIndex]._id
        };
        onDrilldown(selectedData, 'location');
      }
    }
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={1}>
            {onDrilldown && (
              <MuiTooltip title="Bara tıklayarak lokasyon detayını görün">
                <IconButton size="small">
                  <ZoomInIcon />
                </IconButton>
              </MuiTooltip>
            )}
            <ExportButtons 
              chartRef={chartRef}
              data={data}
              filename="lokasyon_karsilastirmasi"
              title={title}
              compact
            />
          </Stack>
        </Box>
        <Box ref={chartRef} sx={{ height: 300 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

// 🎯 Verimlilik Radar Chart
export function EfficiencyRadarChart({ 
  data, 
  title = "Departman Verimliliği",
  onDrilldown 
}) {
  const theme = useTheme();
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography color="text.secondary">Veri bulunamadı</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => item._id || item.name),
    datasets: [
      {
        label: 'Verimlilik %',
        data: data.map(item => item.efficiency || item.value || 0),
        backgroundColor: `${CHART_COLORS.primary}30`,
        borderColor: CHART_COLORS.primary,
        borderWidth: 3,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: CHART_COLORS.primary,
        pointRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: theme.palette.divider
        },
        angleLines: {
          color: theme.palette.divider
        },
        pointLabels: {
          color: theme.palette.text.primary,
          font: {
            size: 12
          }
        },
        ticks: {
          color: theme.palette.text.secondary,
          backdropColor: 'transparent'
        }
      }
    },
    // 🔍 Interactive onClick
    onClick: (event, elements) => {
      if (elements.length > 0 && onDrilldown) {
        const elementIndex = elements[0].index;
        const selectedData = {
          label: chartData.labels[elementIndex],
          value: chartData.datasets[0].data[elementIndex],
          _id: data[elementIndex]._id
        };
        onDrilldown(selectedData, 'efficiency');
      }
    }
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={1}>
            {onDrilldown && (
              <MuiTooltip title="Departmana tıklayarak detayını görün">
                <IconButton size="small">
                  <ZoomInIcon />
                </IconButton>
              </MuiTooltip>
            )}
            <ExportButtons 
              chartRef={chartRef}
              data={data}
              filename="verimlilik_analizi"
              title={title}
              compact
            />
          </Stack>
        </Box>
        <Box ref={chartRef} sx={{ height: 300 }}>
          <Radar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

// 🎨 Status Dağılım Doughnut Chart
export function StatusDistributionChart({ 
  data, 
  title = "Durum Dağılımı",
  onDrilldown 
}) {
  const theme = useTheme();
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography color="text.secondary">Veri bulunamadı</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => item._id || item.name),
    datasets: [
      {
        data: data.map(item => item.count || item.value),
        backgroundColor: data.map(item => CHART_COLORS.status[item._id] || CHART_COLORS.info),
        borderColor: theme.palette.background.paper,
        borderWidth: 3,
        hoverBorderWidth: 4,
        cutout: '60%'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    // 🔍 Interactive onClick
    onClick: (event, elements) => {
      if (elements.length > 0 && onDrilldown) {
        const elementIndex = elements[0].index;
        const selectedData = {
          label: chartData.labels[elementIndex],
          value: chartData.datasets[0].data[elementIndex],
          _id: data[elementIndex]._id
        };
        onDrilldown(selectedData, 'status');
      }
    }
  };

  // Merkez kısmında toplam sayı göster
  const totalCount = data.reduce((sum, item) => sum + (item.count || item.value), 0);

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={1}>
            {onDrilldown && (
              <MuiTooltip title="Dilime tıklayarak o durumun detayını görün">
                <IconButton size="small">
                  <ZoomInIcon />
                </IconButton>
              </MuiTooltip>
            )}
            <ExportButtons 
              chartRef={chartRef}
              data={data}
              filename="durum_dagilimi"
              title={title}
              compact
            />
          </Stack>
        </Box>
        <Box ref={chartRef} sx={{ height: 300, position: 'relative' }}>
          <Doughnut data={chartData} options={options} />
          {/* Merkez toplam sayı */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {totalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// 📊 Analytics Summary Card
export function AnalyticsSummaryCard({ insights, predictions }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Analiz Özeti
        </Typography>
        
        {/* Insights */}
        {insights?.departmentEfficiency && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              🎯 En Verimli Departman:
            </Typography>
            <Chip 
              label={`${insights.departmentEfficiency[0]?._id} (${Math.round(insights.departmentEfficiency[0]?.efficiency)}%)`}
              color="success"
              size="small"
            />
          </Box>
        )}

        {/* Predictions */}
        {predictions?.staffingNeeds && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="secondary" gutterBottom>
              🔮 Personel Tahmin:
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={predictions.staffingNeeds.recommendation}
                color="info"
                size="small"
              />
              <Chip 
                label={`${predictions.staffingNeeds.nextMonthPrediction} kişi`}
                color="warning"
                size="small"
              />
            </Stack>
          </Box>
        )}

        {/* Risk Areas */}
        {predictions?.staffingNeeds?.riskAreas?.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="error" gutterBottom>
              ⚠️ Risk Alanları:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {predictions.staffingNeeds.riskAreas.map((area, index) => (
                <Chip 
                  key={index}
                  label={`${area._id} (${area.count})`}
                  color="error"
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 