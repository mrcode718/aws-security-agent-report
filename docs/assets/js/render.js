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
            <p>${processCitations(escapeHtml(content.abstract), content.references)}</p>
        </section>

        <div class="paper-content">
            ${content.sections.map(section => renderSection(section, content.references)).join('')}
        </div>

        <section class="references" id="references">
            <h2>References</h2>
            <ol>
                ${content.references.map(ref => renderReference(ref)).join('')}
            </ol>
        </section>

        <footer class="paper-footer">
            <p><em>Review completed: ${escapeHtml(content.metadata.date)} | Region: ${escapeHtml(content.metadata.region)} | Status: ${escapeHtml(content.metadata.status)}</em></p>
        </footer>
    `;
}

function renderSection(section, references) {
    let html = `<section class="section">
        <h2>${section.number}. ${escapeHtml(section.title)}</h2>`;
    
    // Render paragraphs
    if (section.paragraphs) {
        html += section.paragraphs.map(p => `<p>${processCitations(escapeHtml(p), references)}</p>`).join('');
    }
    
    // Render lists before subsections
    if (section.lists) {
        html += section.lists.map(list => renderList(list, references)).join('');
    }
    
    // Render table if present
    if (section.table) {
        html += renderTable(section.table, references);
    }
    
    // Render tables array if present
    if (section.tables) {
        html += section.tables.map(table => renderTable(table, references)).join('');
    }
    
    // Render subsections
    if (section.subsections) {
        html += section.subsections.map(subsection => renderSubsection(subsection, references)).join('');
    }
    
    // Render paragraphs after lists
    if (section.paragraphsAfter) {
        html += section.paragraphsAfter.map(p => `<p>${processCitations(escapeHtml(p), references)}</p>`).join('');
    }
    
    html += '</section>';
    return html;
}

function renderSubsection(subsection, references) {
    let html = `<h3>${subsection.number} ${escapeHtml(subsection.title)}</h3>`;
    
    if (subsection.paragraphs) {
        html += subsection.paragraphs.map(p => `<p>${processCitations(escapeHtml(p), references)}</p>`).join('');
    }
    
    if (subsection.lists) {
        html += subsection.lists.map(list => renderList(list, references)).join('');
    }
    
    if (subsection.table) {
        html += renderTable(subsection.table, references);
    }
    
    return html;
}

function renderList(list, references) {
    const tag = list.type === 'ul' ? 'ul' : 'ol';
    const items = list.items.map(item => {
        // Check if item contains bold text (format: "Text: description")
        if (item.includes(':')) {
            const parts = item.split(':');
            if (parts.length === 2) {
                return `<li><strong>${processCitations(escapeHtml(parts[0].trim()), references)}:</strong> ${processCitations(escapeHtml(parts[1].trim()), references)}</li>`;
            }
        }
        return `<li>${processCitations(escapeHtml(item), references)}</li>`;
    }).join('');
    return `<${tag}>${items}</${tag}>`;
}

function renderTable(table, references) {
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
                `<tr>${row.map(cell => `<td>${processCitations(escapeHtml(cell), references)}</td>`).join('')}</tr>`
            ).join('')}
        </tbody>
    </table>`;
    return html;
}

function renderReference(ref) {
    if (typeof ref === 'string') {
        // Legacy format - plain string
        return `<li>${escapeHtml(ref)}</li>`;
    } else {
        // New format - object with id, title, url, description
        const url = ref.url || '#';
        const title = ref.title || '';
        const description = ref.description || '';
        return `<li id="ref-${ref.id}"><a href="${url}" target="_blank" rel="noopener noreferrer" class="reference-link">${escapeHtml(title)}</a>. ${escapeHtml(description)} <a href="${url}" target="_blank" rel="noopener noreferrer" class="reference-url">${escapeHtml(url)}</a></li>`;
    }
}

function processCitations(text, references) {
    if (!references || references.length === 0) {
        return text;
    }
    
    // Pattern to match citations: [1], [2], [1,2], [1-3], [1, 2, 3], etc.
    // This regex matches [ followed by numbers, commas, spaces, and hyphens, then ]
    const citationPattern = /\[(\d+(?:[,\s-]+\d+)*)\]/g;
    
    return text.replace(citationPattern, (match, citationNumbers) => {
        // Parse citation numbers (handle ranges like 1-3, lists like 1,2,3, etc.)
        const numbers = citationNumbers.split(/[,\s-]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        // Create citation links
        const citationLinks = numbers.map(num => {
            const ref = references.find(r => (typeof r === 'object' ? r.id : null) === num);
            if (ref) {
                return `<a href="#ref-${num}" class="citation-link" title="${escapeHtml(ref.title || ref.description || '')}" onclick="event.preventDefault(); document.getElementById('ref-${num}').scrollIntoView({behavior: 'smooth', block: 'center'}); return false;">${num}</a>`;
            }
            return `<a href="#ref-${num}" class="citation-link" onclick="event.preventDefault(); document.getElementById('ref-${num}').scrollIntoView({behavior: 'smooth', block: 'center'}); return false;">${num}</a>`;
        });
        
        // Join multiple citations with commas
        return `<sup class="citation">[${citationLinks.join(', ')}]</sup>`;
    });
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
