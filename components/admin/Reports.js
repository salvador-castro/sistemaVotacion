// components/admin/Reports.js
import jsPDF from 'jspdf';

// Función auxiliar mejorada para crear tablas en PDF
const autoTable = (doc, options) => {
  const { startY = 20, head = [], body = [], styles = {}, headStyles = {} } = options;
  
  let currentY = startY;
  const lineHeight = 10;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const availableWidth = pageWidth - (margin * 2);
  const colCount = Math.max(head.length, body[0]?.length || 0);
  const colWidth = availableWidth / colCount;
  
  // Establecer estilos
  doc.setFontSize(styles.fontSize || 10);
  
  // Dibujar encabezado
  if (head.length > 0) {
    doc.setFillColor(...(headStyles.fillColor || [59, 130, 246]));
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, currentY, availableWidth, lineHeight * 1.5, 'F');
    
    head.forEach((cell, index) => {
      const x = margin + (colWidth * index);
      doc.text(String(cell), x + 2, currentY + lineHeight);
    });
    
    currentY += lineHeight * 1.5;
  }
  
  // Dibujar cuerpo
  doc.setTextColor(0, 0, 0);
  body.forEach((row, rowIndex) => {
    // Verificar si necesitamos nueva página
    if (currentY > doc.internal.pageSize.height - 30) {
      doc.addPage();
      currentY = 20;
    }
    
    row.forEach((cell, cellIndex) => {
      const x = margin + (colWidth * cellIndex);
      doc.text(String(cell), x + 2, currentY + lineHeight);
    });
    
    currentY += lineHeight * 1.2;
    
    // Línea separadora
    if (rowIndex < body.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 2;
    }
  });
  
  // Devolver la posición Y final para la siguiente tabla
  return currentY;
};

export default function Reports() {
  // Función para obtener datos de la API
  const fetchReportData = async (reportType) => {
    try {
      const response = await fetch(`/api/reports/${reportType}`);
      if (!response.ok) throw new Error('Error fetching data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert('Error al obtener los datos del reporte');
      return null;
    }
  };

  const generateGeneralReport = async () => {
    const data = await fetchReportData('general');
    if (!data) return;

    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE GENERAL DE VOTACIÓN', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 30, { align: 'center' });
    
    // Estadísticas principales
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('ESTADÍSTICAS PRINCIPALES', 20, 50);
    
    // Primera tabla - guardar la posición Y final
    let currentY = autoTable(doc, {
      startY: 55,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de votantes registrados', data.totalVoters],
        ['Votos emitidos', data.votedVoters],
        ['Porcentaje de participación', `${data.participation}%`],
        ['Votantes pendientes', data.totalVoters - data.votedVoters],
        ['Cambios de presidente realizados', data.presidentChanges]
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Resumen por sede
    if (data.byLocation && data.byLocation.length > 0) {
      const sedeBody = data.byLocation.map(location => [
        location.sede,
        location.total_registrados,
        location.total_votados,
        location.total_registrados > 0 ? 
          Math.round((location.total_votados / location.total_registrados) * 100) + '%' : '0%'
      ]);
      
      // Segunda tabla - usar la posición Y final de la primera + espacio
      autoTable(doc, {
        startY: currentY + 15,
        head: [['Sede', 'Registrados', 'Votados', 'Participación']],
        body: sedeBody,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94] }
      });
    }
    
    doc.save('reporte_general_votacion.pdf');
  };

  const generateSedeReport = async () => {
    const data = await fetchReportData('sede');
    if (!data) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE POR SEDE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    if (data.length > 0) {
      const sedeBody = data.map(item => [
        item.sede,
        item.registrados,
        item.votados,
        item.pendientes,
        item.participacion + '%'
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Sede', 'Registrados', 'Votados', 'Pendientes', 'Participación']],
        body: sedeBody,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [34, 197, 94] }
      });
    } else {
      doc.text('No hay datos de sedes disponibles', 20, 50);
    }
    
    doc.save('reporte_por_sede.pdf');
  };

  const generateHorarioReport = async () => {
    const data = await fetchReportData('horario');
    if (!data) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE POR FRANJA HORARIA', 105, 20, { align: 'center' });
    
    const totalVoted = data.reduce((sum, item) => sum + item.votos_emitidos, 0);
    const horarioBody = data.map(item => [
      item.franja_horaria,
      item.votos_emitidos,
      totalVoted > 0 ? Math.round((item.votos_emitidos / totalVoted) * 100) + '%' : '0%'
    ]);
    
    autoTable(doc, {
      startY: 35,
      head: [['Franja Horaria', 'Votos Emitidos', 'Porcentaje']],
      body: horarioBody,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [147, 51, 234] }
    });
    
    doc.save('reporte_por_franja_horaria.pdf');
  };

  const generateEspecialidadReport = async () => {
    const data = await fetchReportData('especialidad');
    if (!data) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE POR ESPECIALIDAD', 105, 20, { align: 'center' });
    
    const especialidadBody = data.map(item => [
      item.especialidad,
      item.registrados,
      item.votados,
      item.pendientes,
      item.participacion + '%'
    ]);
    
    if (especialidadBody.length > 0) {
      autoTable(doc, {
        startY: 35,
        head: [['Especialidad', 'Registrados', 'Votados', 'Pendientes', 'Participación']],
        body: especialidadBody,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [249, 115, 22] }
      });
    } else {
      doc.text('No hay datos de especialidades disponibles', 20, 50);
    }
    
    doc.save('reporte_por_especialidad.pdf');
  };

  const generateCambiosPresidenteReport = async () => {
    const data = await fetchReportData('cambios-presidente');
    if (!data) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE DE CAMBIOS DE PRESIDENTE DE MESA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total de cambios realizados: ${data.length}`, 105, 30, { align: 'center' });
    
    if (data.length > 0) {
      const cambiosBody = data.map(item => [
        `${item.old_president_nombre} ${item.old_president_apellido}`,
        `${item.new_president_nombre} ${item.new_president_apellido}`,
        item.table_name || 'N/A',
        item.sede || 'N/A',
        item.changed_at ? new Date(item.changed_at).toLocaleDateString() : 'N/A',
        item.change_reason || 'No especificado'
      ]);
      
      autoTable(doc, {
        startY: 45,
        head: [['Presidente Anterior', 'Nuevo Presidente', 'Mesa', 'Sede', 'Fecha Cambio', 'Motivo']],
        body: cambiosBody,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] }
      });
    } else {
      doc.setFontSize(12);
      doc.text('No se registraron cambios de presidente de mesa', 20, 50);
    }
    
    doc.save('reporte_cambios_presidente.pdf');
  };

  const exportPDF = async (type) => {
    try {
      switch (type) {
        case 'general':
          await generateGeneralReport();
          break;
        case 'sede':
          await generateSedeReport();
          break;
        case 'horario':
          await generateHorarioReport();
          break;
        case 'especialidad':
          await generateEspecialidadReport();
          break;
        case 'cambios-presidente':
          await generateCambiosPresidenteReport();
          break;
        default:
          alert('Tipo de reporte no válido');
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Reportes y Estadísticas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => exportPDF('general')}>
          <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-blue-600 text-xl">📊</span>
          </div>
          <h3 className="font-semibold mb-2">Reporte General</h3>
          <p className="text-sm text-gray-600 mb-4">Resumen completo de la votación</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => exportPDF('sede')}>
          <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-green-600 text-xl">🏛️</span>
          </div>
          <h3 className="font-semibold mb-2">Por Sede</h3>
          <p className="text-sm text-gray-600 mb-4">Votos por Medrano y Campus</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => exportPDF('horario')}>
          <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-purple-600 text-xl">⏰</span>
          </div>
          <h3 className="font-semibold mb-2">Por Franja Horaria</h3>
          <p className="text-sm text-gray-600 mb-4">Mañana, tarde y noche</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => exportPDF('especialidad')}>
          <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-orange-600 text-xl">🎓</span>
          </div>
          <h3 className="font-semibold mb-2">Por Especialidad</h3>
          <p className="text-sm text-gray-600 mb-4">Distribución por carrera</p>
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm">
            Descargar PDF
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => exportPDF('cambios-presidente')}>
          <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-600 text-xl">🔄</span>
          </div>
          <h3 className="font-semibold mb-2">Cambios de Presidente</h3>
          <p className="text-sm text-gray-600 mb-4">Modificaciones en mesas</p>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}