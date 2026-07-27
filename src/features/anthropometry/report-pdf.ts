export type PdfReportLine = {
  label: string;
  value: string;
};

export type AnthropometryPdfReport = {
  title: string;
  subtitle: string;
  issuedAt: string;
  professionalName: string;
  clientName: string;
  protocol: string;
  status: string;
  conditions: string;
  measurements: PdfReportLine[];
  calculations: PdfReportLine[];
  limitations: string[];
};

export function buildAnthropometryReportPdf(report: AnthropometryPdfReport): Buffer {
  const lines = [
    "Nutri-Oli",
    report.title,
    report.subtitle,
    `Emitido: ${report.issuedAt}`,
    `Profesional: ${report.professionalName}`,
    `Cliente: ${report.clientName}`,
    `Protocolo: ${report.protocol}`,
    `Estado: ${report.status}`,
    `Condiciones: ${report.conditions || "No registradas"}`,
    "",
    "Resultados",
    ...report.calculations.map((item) => `${item.label}: ${item.value}`),
    "",
    "Medidas finales y control de repeticiones",
    ...report.measurements.map((item) => `${item.label}: ${item.value}`),
    "",
    "Limitaciones",
    ...report.limitations.map((item) => `- ${item}`)
  ].flatMap(wrapPdfLine);

  return renderSimplePdf(lines);
}

function renderSimplePdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 11 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.slice(0, 52).map((line, index) => {
      const escaped = escapePdfText(line);
      return index === 0 ? `(${escaped}) Tj` : `T* (${escaped}) Tj`;
    }),
    "ET"
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(body, "utf8");
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body, "utf8");
}

function wrapPdfLine(line: string) {
  const normalized = line.replace(/[^\x20-\x7E]/g, "");
  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > 88) {
    chunks.push(remaining.slice(0, 88));
    remaining = `  ${remaining.slice(88)}`;
  }

  chunks.push(remaining);
  return chunks;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
