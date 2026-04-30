import { jsPDF } from "jspdf";

export function generateCertificatePDF(userName: string, courseTitle: string) {
  // Create a landscape PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Dark background
  doc.setFillColor(5, 5, 16);
  doc.rect(0, 0, 297, 210, "F");

  // Neon green border
  doc.setDrawColor(0, 255, 159);
  doc.setLineWidth(1.5);
  doc.rect(12, 12, 273, 186);

  // Outer secondary subtle border
  doc.setDrawColor(0, 229, 255);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, 267, 180);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  // We use Helvetica since standard fonts are limited in jsPDF
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE OF COMPLETION", 148.5, 50, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("THIS CERTIFIES THAT", 148.5, 75, { align: "center" });

  // Name
  doc.setFontSize(44);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 255, 159);
  doc.text(userName.toUpperCase(), 148.5, 105, { align: "center" });

  // Course text
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("HAS SUCCESSFULLY COMPLETED THE COURSE", 148.5, 135, { align: "center" });

  // Course title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(courseTitle.toUpperCase(), 148.5, 155, { align: "center" });

  // Date and ID
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`ISSUED ON: ${dateStr}`, 148.5, 180, { align: "center" });
  
  // Footer branding
  doc.setTextColor(0, 229, 255);
  doc.text("LEARN MINT PLATFORM", 148.5, 190, { align: "center" });

  // Download
  doc.save(`${userName.replace(/\s+/g, '_')}_Certificate.pdf`);
}
