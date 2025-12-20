// Export functionality for PDF

document.addEventListener('DOMContentLoaded', function() {
    const exportPdfBtn = document.getElementById('export-pdf');

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }
});

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('report-content');
    
    if (!element) {
        console.error('Report content element not found');
        return;
    }
    
    // Show loading indicator
    const btn = document.getElementById('export-pdf');
    const originalText = btn.textContent;
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;
    
    // PDF page dimensions in mm (A4)
    const pageWidth = 210;  // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20;       // Margin on all sides in mm
    const contentWidth = pageWidth - (margin * 2);  // Available width for content (170mm)
    const contentHeight = pageHeight - (margin * 2); // Available height for content (257mm)
    
    // Get element dimensions in pixels
    const elementWidth = element.offsetWidth || element.scrollWidth;
    const elementHeight = element.scrollHeight;
    
    // Calculate scale to fit content within margins
    // A4 page: 210mm wide, we want 170mm for content (210 - 40mm margins)
    // Convert mm to pixels: at 96dpi, 1mm = 3.779527559px
    const targetWidthPx = contentWidth * 3.779527559; // ~642px
    const scale = Math.min(2.5, Math.max(1, targetWidthPx / elementWidth));
    
    html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: elementWidth,
        height: elementHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        removeContainer: false,
        letterRendering: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Calculate image dimensions to fit within margins
        // Canvas is in pixels, we need to convert to mm
        // At scale, 1 CSS pixel = scale canvas pixels
        // 1mm = 3.779527559px at 96dpi
        const imgWidth = contentWidth; // Fit exactly to content width (170mm)
        const imgHeight = (canvas.height / canvas.width) * imgWidth; // Maintain aspect ratio
        
        let heightLeft = imgHeight;
        let position = margin; // Start at top margin

        // Add first page
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;

        // Add additional pages if needed
        while (heightLeft > 0) {
            position = margin - (imgHeight - heightLeft);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= contentHeight;
        }

        pdf.save('AWS-Security-Agent-Functional-Testing-Report.pdf');
        
        // Restore button
        btn.textContent = originalText;
        btn.disabled = false;
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        btn.textContent = originalText;
        btn.disabled = false;
    });
}


