
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import FileSaver from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { LegalCase } from '../types';

const formatDataForExcel = (data: LegalCase[]) => {
  return data.map(item => ({
    "Fecha y Hora": item.dateTime.replace('T', ' '),
    "NUREJ": item.nurej,
    "Nro. de Caso": item.caseNumber,
    "Ciudad": item.city,
    "Delito": item.crime,
    "Partes Involucradas": item.parties,
    "Tipo de Audiencia": item.hearingType,
    "Juzgado / Sala": item.courtRoom,
    "Abogado Patrocinante": item.lawyer,
    "Modalidad": item.medium,
    "Características": item.characteristics,
    "Observaciones / Resumen IA": item.observations,
    "Fecha de Registro": new Date(item.createdAt).toLocaleString()
  }));
};

export const exportToXLSX = (data: LegalCase[]) => {
  const translatedData = formatDataForExcel(data);
  const worksheet = XLSX.utils.json_to_sheet(translatedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Casos Legales");
  XLSX.writeFile(workbook, `IurisData_Reporte_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (data: LegalCase[]) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const dateStr = new Date().toLocaleDateString();
  
  doc.setFontSize(18);
  doc.text("REPORTE DE CASOS LEGALES - IURISDATA", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generado el: ${dateStr}`, 14, 22);
  
  const tableColumn = [
    "Fecha/Hora", 
    "NUREJ", 
    "Nro Caso", 
    "Ciudad", 
    "Delito", 
    "Partes", 
    "Audiencia", 
    "Abogado", 
    "Modalidad"
  ];
  
  const tableRows = data.map(item => [
    item.dateTime.replace('T', ' '),
    item.nurej,
    item.caseNumber,
    item.city,
    item.crime,
    item.parties,
    item.hearingType,
    item.lawyer,
    item.medium
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    // Fix: removed fillStyle as it is not a property of Styles in jspdf-autotable
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 30 }
  });

  doc.save(`IurisData_Reporte_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToDOCX = async (data: LegalCase[]) => {
  const tableRows = [
    new TableRow({
      children: [
        "FECHA/HORA", "NUREJ", "NRO. CASO", "DELITO", "PARTES", "ABOGADO", "JUZGADO/SALA", "MODALIDAD", "OBSERVACIONES"
      ].map(text => new TableCell({
        // Fix: bold and size must be inside a TextRun, not directly on Paragraph
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text,
                bold: true,
                size: 32, // docx uses half-points (16pt = 32)
              }),
            ],
          })
        ],
        shading: { fill: "1e293b" }
      }))
    }),
    ...data.map(item => new TableRow({
      children: [
        item.dateTime.replace('T', ' '),
        item.nurej,
        item.caseNumber,
        item.crime,
        item.parties,
        item.lawyer,
        item.courtRoom,
        item.medium,
        item.observations
      ].map(text => new TableCell({
        // Fix: size must be inside a TextRun, not directly on Paragraph
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(text || ""),
                size: 28, // docx uses half-points (14pt = 28)
              }),
            ],
          })
        ]
      }))
    }))
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: { size: { orientation: "landscape" as any } }
      },
      children: [
        new Paragraph({
          text: "REPORTE LEGAL CONSOLIDADO - IURISDATA",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: `Fecha de Reporte: ${new Date().toLocaleString()}`, alignment: AlignmentType.RIGHT }),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `IurisData_Reporte_${new Date().toISOString().split('T')[0]}.docx`;
  
  if ((FileSaver as any).saveAs) {
    (FileSaver as any).saveAs(blob, fileName);
  } else {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }
};