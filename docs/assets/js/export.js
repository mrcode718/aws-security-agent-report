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
    
    // Add exporting class to body for CSS changes
    document.body.classList.add('pdf-exporting');
    element.classList.add('exporting');
    
    // Wait for styles to apply
    setTimeout(() => {
        // PDF page dimensions in mm (A4)
        const pageWidth = 210;  // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 25;      // Margin on all sides in mm
        const contentWidth = pageWidth - (margin * 2);  // Available width (160mm)
        
        // Get element dimensions
        const elementWidth = element.offsetWidth || 800; // Use fixed width for consistency
        const elementHeight = element.scrollHeight;
        
        // Calculate optimal scale for readability
        // Target: content should fit in 160mm width
        // At 96dpi: 1mm = 3.779527559px
        const targetWidthPx = contentWidth * 3.779527559; // ~605px
        const scale = Math.min(2, Math.max(1.5, targetWidthPx / elementWidth));
        
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
            letterRendering: true,
            allowTaint: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Calculate image dimensions to fit within margins
            const imgWidth = contentWidth; // 160mm
            const imgHeight = (canvas.height / canvas.width) * imgWidth; // Maintain aspect ratio
            
            let heightLeft = imgHeight;
            let position = margin;
            let pageNum = 0;
            const contentHeight = pageHeight - (margin * 2); // 247mm per page

            // Add first page
            if (heightLeft <= contentHeight) {
                // Fits on one page
                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
            } else {
                // Multiple pages needed
                while (heightLeft > 0.5) { // Small threshold to avoid floating point issues
                    if (pageNum > 0) {
                        pdf.addPage();
                    }
                    
                    const segmentHeight = Math.min(heightLeft, contentHeight);
                    const sourceY = (imgHeight - heightLeft) * (canvas.height / imgHeight);
                    const sourceHeight = segmentHeight * (canvas.height / imgHeight);
                    
                    // Create temporary canvas for this page segment
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = Math.ceil(sourceHeight);
                    const ctx = pageCanvas.getContext('2d');
                    
                    // Draw the segment
                    ctx.drawImage(
                        canvas,
                        0, sourceY, canvas.width, sourceHeight,
                        0, 0, canvas.width, sourceHeight
                    );
                    
                    const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                    pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, segmentHeight);
                    
                    heightLeft -= contentHeight;
                    pageNum++;
                }
            }

            pdf.save('AWS-Security-Agent-Functional-Testing-Report.pdf');
            
            // Clean up
            document.body.classList.remove('pdf-exporting');
            element.classList.remove('exporting');
            btn.textContent = originalText;
            btn.disabled = false;
        }).catch(error => {
            console.error('Error generating PDF:', error);
            document.body.classList.remove('pdf-exporting');
            element.classList.remove('exporting');
            alert('Error generating PDF. Please try again.');
            btn.textContent = originalText;
            btn.disabled = false;
        });
    }, 200);
}
