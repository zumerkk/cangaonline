import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

// 📤 Chart Export Utilities
export class ChartExporter {
  
  // 🖼️ PNG olarak export
  static async exportAsPNG(chartRef, filename = 'chart') {
    try {
      if (!chartRef.current) {
        toast.error('Grafik bulunamadı!');
        return;
      }

      // Loading toast
      const loadingToast = toast.loading('PNG oluşturuluyor...');

      // HTML2Canvas ile screenshot al
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Yüksek kalite için
        logging: false,
        useCORS: true
      });

      // Download link oluştur
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Otomatik download başlat
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(loadingToast);
      toast.success('PNG başarıyla indirildi! 📥');

    } catch (error) {
      console.error('PNG export error:', error);
      toast.error('PNG export başarısız!');
    }
  }

  // 📄 PDF olarak export
  static async exportAsPDF(chartRef, filename = 'chart', title = '') {
    try {
      if (!chartRef.current) {
        toast.error('Grafik bulunamadı!');
        return;
      }

      // Loading toast
      const loadingToast = toast.loading('PDF oluşturuluyor...');

      // HTML2Canvas ile screenshot al
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // PDF oluştur
      const pdf = new jsPDF({
        orientation: 'landscape', // Grafikler için landscape daha iyi
        unit: 'mm',
        format: 'a4'
      });

      // Başlık ekle
      if (title) {
        pdf.setFontSize(20);
        pdf.setTextColor(25, 118, 210); // Çanga mavi
        pdf.text(title, 20, 20);
        
        // Alt başlık
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30);
      }

      // Canvas'ı PDF'e ekle
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 250; // PDF genişliği
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 20, title ? 40 : 20, imgWidth, imgHeight);

      // Footer ekle
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Çanga Vardiya Sistemi - Veritabanı Analiz Raporu', 20, pageHeight - 10);

      // PDF'i kaydet
      pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.dismiss(loadingToast);
      toast.success('PDF başarıyla indirildi! 📄');

    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF export başarısız!');
    }
  }

  // 📊 Chart verilerini CSV olarak export
  static exportAsCSV(data, filename = 'chart_data') {
    try {
      if (!data || !Array.isArray(data)) {
        toast.error('Export edilecek veri bulunamadı!');
        return;
      }

      // CSV içeriği oluştur
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');

      // BOM ekle (Türkçe karakter desteği için)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Download link oluştur
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV başarıyla indirildi! 📊');

    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('CSV export başarısız!');
    }
  }

  // 📋 Çoklu export (ZIP olarak)
  static async exportAllFormats(chartRef, data, filename = 'chart', title = '') {
    try {
      const loadingToast = toast.loading('Tüm formatlar hazırlanıyor...');

      // PNG ve PDF export'ları paralel olarak yap
      await Promise.all([
        this.exportAsPNG(chartRef, filename),
        this.exportAsPDF(chartRef, filename, title)
      ]);

      // CSV export
      if (data && Array.isArray(data)) {
        this.exportAsCSV(data, filename);
      }

      toast.dismiss(loadingToast);
      toast.success('Tüm formatlar indirildi! 🎉');

    } catch (error) {
      console.error('Multi export error:', error);
      toast.error('Export işlemi başarısız!');
    }
  }
}

// 🎯 Export buton bileşeni
export function ExportButtons({ chartRef, data, filename, title, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={() => ChartExporter.exportAllFormats(chartRef, data, filename, title)}
        style={{
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        📤 Export
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={() => ChartExporter.exportAsPNG(chartRef, filename)}
        style={{
          background: '#2e7d32',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        🖼️ PNG
      </button>
      <button
        onClick={() => ChartExporter.exportAsPDF(chartRef, filename, title)}
        style={{
          background: '#d32f2f',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        📄 PDF
      </button>
      {data && (
        <button
          onClick={() => ChartExporter.exportAsCSV(data, filename)}
          style={{
            background: '#ed6c02',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          📊 CSV
        </button>
      )}
    </div>
  );
} 