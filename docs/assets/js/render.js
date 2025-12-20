// Report Content Renderer
// This script dynamically generates the report HTML from content.json

async function loadAndRenderReport() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) {
            throw new Error('Failed to load content.json');
        }
        const content = await response.json();
        renderReport(content);
    } catch (error) {
        console.error('Error loading report content:', error);
        document.getElementById('report-content').innerHTML = 
            '<p style="color: red; padding: 20px;">Error loading report content. Please ensure content.json exists.</p>';
    }
}

function renderReport(content) {
    const reportContent = document.getElementById('report-content');
    
    // Render header
    reportContent.innerHTML = `
        <header class="paper-header">
            <h1 class="paper-title">${escapeHtml(content.metadata.title)}</h1>
            <div class="author-block">
                <div class="author">${escapeHtml(content.metadata.author)}</div>
                <div class="affiliation">${escapeHtml(content.metadata.affiliation)}</div>
            </div>
            <div class="date">${escapeHtml(content.metadata.date)}</div>
        </header>

        <section class="abstract">
            <h2>Abstract</h2>
            <p>${escapeHtml(content.abstract)}</p>
        </section>

        <div class="paper-content">
            ${content.sections.map(section => renderSection(section)).join('')}
        </div>

        <section class="references">
            <h2>References</h2>
            <ol>
                ${content.references.map(ref => `<li>${escapeHtml(ref)}</li>`).join('')}
            </ol>
        </section>

        <footer class="paper-footer">
            <p><em>Review completed: ${escapeHtml(content.metadata.reviewDate)} | Region: ${escapeHtml(content.metadata.region)} | Status: ${escapeHtml(content.metadata.status)}</em></p>
        </footer>
    `;
}

function renderSection(section) {
    let html = `<section class="section">
        <h2>${section.number}. ${escapeHtml(section.title)}</h2>`;
    
    // Render paragraphs
    if (section.paragraphs) {
        html += section.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }
    
    // Render lists before subsections
    if (section.lists) {
        html += section.lists.map(list => renderList(list)).join('');
    }
    
    // Render table if present
    if (section.table) {
        html += renderTable(section.table);
    }
    
    // Render subsections
    if (section.subsections) {
        html += section.subsections.map(subsection => renderSubsection(subsection)).join('');
    }
    
    // Render paragraphs after lists
    if (section.paragraphsAfter) {
        html += section.paragraphsAfter.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }
    
    html += '</section>';
    return html;
}

function renderSubsection(subsection) {
    let html = `<h3>${subsection.number} ${escapeHtml(subsection.title)}</h3>`;
    
    if (subsection.paragraphs) {
        html += subsection.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }
    
    if (subsection.lists) {
        html += subsection.lists.map(list => renderList(list)).join('');
    }
    
    if (subsection.table) {
        html += renderTable(subsection.table);
    }
    
    return html;
}

function renderList(list) {
    const tag = list.type === 'ul' ? 'ul' : 'ol';
    const items = list.items.map(item => {
        // Check if item contains bold text (format: "Text: description")
        if (item.includes(':')) {
            const parts = item.split(':');
            if (parts.length === 2) {
                return `<li><strong>${escapeHtml(parts[0].trim())}:</strong> ${escapeHtml(parts[1].trim())}</li>`;
            }
        }
        return `<li>${escapeHtml(item)}</li>`;
    }).join('');
    return `<${tag}>${items}</${tag}>`;
}

function renderTable(table) {
    const tableClass = table.class ? ` class="${table.class}"` : '';
    let html = `<table class="academic-table${table.class ? ' ' + table.class : ''}">
        <caption>${escapeHtml(table.caption)}</caption>
        <thead>
            <tr>
                ${table.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${table.rows.map(row => 
                `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
            ).join('')}
        </tbody>
    </table>`;
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load and render when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRenderReport);
} else {
    loadAndRenderReport();
}

