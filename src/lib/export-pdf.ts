import { jsPDF } from "jspdf";
export function downloadPdf(svg: string, fileName = "canva-frame-generator.pdf"): void {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.setFontSize(12);
    pdf.text("Canva Frame Generator SVG Fallback", 40, 48);
    pdf.setFontSize(8);
    const lines = pdf.splitTextToSize(svg, 515);
    pdf.text(lines, 40, 76);
    pdf.save(fileName);
}
