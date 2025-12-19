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
    
    html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('AWS-Security-Agent-Review-Report.pdf');
    });
}


