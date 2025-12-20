// Export functionality for PDF

document.addEventListener('DOMContentLoaded', function() {
    const exportPdfBtn = document.getElementById('export-pdf');

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }
});

function exportToPDF() {
    const element = document.getElementById('report-content');
    
    if (!element) {
        console.error('Report content element not found');
        return;
    }
    
    if (typeof html2pdf === 'undefined') {
        alert('PDF export library not loaded. Please refresh the page.');
        return;
    }
    
    // Show loading indicator
    const btn = document.getElementById('export-pdf');
    const originalText = btn.textContent;
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;
    
    // Temporarily add class to element for export styling
    element.classList.add('exporting');
    
    // Wait a moment for styles to apply
    setTimeout(() => {
        // Configure PDF options
        const opt = {
            margin: [20, 20, 20, 20], // Top, Right, Bottom, Left in mm
            filename: 'AWS-Security-Agent-Functional-Testing-Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                letterRendering: true,
                allowTaint: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { 
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.section',
                after: ['.academic-table', '.paper-footer', '.references'],
                avoid: ['.academic-table', 'table', 'thead', 'tbody', 'tr', 'h2', 'h3']
            }
        };
        
        // Generate PDF
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                // Remove export class
                element.classList.remove('exporting');
                // Restore button
                btn.textContent = originalText;
                btn.disabled = false;
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                element.classList.remove('exporting');
                alert('Error generating PDF. Please try again.');
                btn.textContent = originalText;
                btn.disabled = false;
            });
    }, 100);
}
