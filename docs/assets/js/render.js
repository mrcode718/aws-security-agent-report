// Report Content Renderer
// This script dynamically generates the report HTML from content.json

async function loadAndRenderReport() {
    try {
        // Check if a custom content file is specified (e.g., for appendix page)
        const contentFile = window.CONTENT_FILE || 'content.json';
        const response = await fetch(contentFile);
        if (!response.ok) {
            throw new Error(`Failed to load ${contentFile}`);
        }
        const content = await response.json();
        renderReport(content);
    } catch (error) {
        console.error('Error loading report content:', error);
        const contentFile = window.CONTENT_FILE || 'content.json';
        document.getElementById('report-content').innerHTML = 
            `<p style="color: red; padding: 20px;">Error loading report content. Please ensure ${contentFile} exists.</p>`;
    }
}

async function renderReport(content) {
    const reportContent = document.getElementById('report-content');
    
    // Render header and abstract first
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
            <p>Loading sections...</p>
        </div>

        <footer class="paper-footer">
            <p><em>Review completed: ${escapeHtml(content.metadata.date)} | Status: ${escapeHtml(content.metadata.status)}</em></p>
        </footer>
    `;
    
    // Render sections asynchronously
    const sectionPromises = content.sections.map(section => renderSection(section, content.references));
    const sectionHtmls = await Promise.all(sectionPromises);
    const paperContent = reportContent.querySelector('.paper-content');
    if (paperContent) {
        paperContent.innerHTML = sectionHtmls.join('');
    }
}

async function renderSection(section, references) {
    // Check if section has tables
    const hasTable = !!(section.table || section.tables || section.tableFile || section.tableFiles);
    // Check if any subsections have tables, charts, or heatmaps
    const hasSubsectionTable = !!(section.subsections && section.subsections.some(sub => sub.table || sub.chart || sub.tableFile || sub.heatmap));
    // Check if section itself has chart or heatmap
    const hasChartOrHeatmap = !!(section.chart || section.heatmap);
    // Section 6 should use full width (no columns) like sections with tables
    const isSection6 = section.number === 6;
    // Sections with tables should use full width (no columns)
    const useFullWidth = hasTable || hasSubsectionTable || isSection6 || hasChartOrHeatmap;
    // Section 7 (References) should be breakable across columns
    const isReferences = section.references === true;
    let sectionClass = useFullWidth ? 'section section-with-table' : 'section';
    if (isReferences) {
        sectionClass += ' section-references';
    }
    
    let html = `<section class="${sectionClass}" id="section-${section.number}">
        <h2>${section.number}. ${escapeHtml(section.title)}</h2>`;
    
    // Render paragraphs
    if (section.paragraphs) {
        html += section.paragraphs.map(p => `<p>${processCitations(escapeHtml(p), references)}</p>`).join('');
    }
    
    // Render lists before subsections
    if (section.lists) {
        html += section.lists.map(list => renderList(list, references)).join('');
    }
    
    // Render subsections before tables
    if (section.subsections) {
        const subsectionPromises = section.subsections.map(subsection => renderSubsection(subsection, references));
        const subsectionResults = await Promise.all(subsectionPromises);
        html += subsectionResults.join('');
    }
    
    // Render chart if present (section-level chart)
    if (section.chart) {
        html += renderChart(section.chart);
    }
    
    // Render heatmap if present (section-level heatmap)
    if (section.heatmap) {
        html += renderHeatmap(section.heatmap);
    }
    
    // Render table if present
    if (section.table) {
        html += renderTable(section.table, references);
    }
    
    // Render table from file if present
    if (section.tableFile) {
        try {
            const table = await loadTableFromFile(section.tableFile);
            html += renderTable(table, references);
        } catch (error) {
            console.error(`Error loading table from ${section.tableFile}:`, error);
            html += `<p style="color: red;">Error loading table from ${section.tableFile}</p>`;
        }
    }
    
    // Render tables array if present
    if (section.tables) {
        html += section.tables.map(table => renderTable(table, references)).join('');
    }
    
    // Render tables from files if present
    if (section.tableFiles) {
        try {
            const tablePromises = section.tableFiles.map(file => loadTableFromFile(file));
            const tables = await Promise.all(tablePromises);
            html += tables.map(table => renderTable(table, references)).join('');
        } catch (error) {
            console.error(`Error loading tables from files:`, error);
            html += `<p style="color: red;">Error loading tables from files</p>`;
        }
    }
    
    // Render paragraphs after lists
    if (section.paragraphsAfter) {
        html += section.paragraphsAfter.map(p => `<p>${processCitations(escapeHtml(p), references)}</p>`).join('');
    }
    
    // Render references if this section is the references section
    if (section.references && references) {
        html += `<div class="references-list">${references.map(ref => renderReference(ref)).join('')}</div>`;
    }
    
    html += '</section>';
    return html;
}

async function renderSubsection(subsection, references) {
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
    
    // Render table from file if present
    if (subsection.tableFile) {
        try {
            const table = await loadTableFromFile(subsection.tableFile);
            html += renderTable(table, references);
        } catch (error) {
            console.error(`Error loading table from ${subsection.tableFile}:`, error);
            html += `<p style="color: red;">Error loading table from ${subsection.tableFile}</p>`;
        }
    }
    
    if (subsection.chart) {
        html += renderChart(subsection.chart);
    }
    
    // Render heatmap if present (subsection-level heatmap)
    if (subsection.heatmap) {
        html += renderHeatmap(subsection.heatmap);
    }
    
    return html;
}

function renderList(list, references) {
    const tag = list.type === 'ul' ? 'ul' : 'ol';
    const items = list.items.map(item => {
        // Check if item contains a link marker [text](url)
        let processedItem = item;
        const linkPattern = /\[([^\]]+)\]\(([^\)]+)\)/g;
        processedItem = processedItem.replace(linkPattern, (match, text, url) => {
            return `<a href="${url}">${text}</a>`;
        });
        
        // Check if item contains bold text (format: "Text: description")
        if (processedItem.includes(':') && !processedItem.includes('<a')) {
            const parts = processedItem.split(':');
            if (parts.length === 2) {
                return `<li><strong>${processCitations(escapeHtml(parts[0].trim()), references)}:</strong> ${processCitations(escapeHtml(parts[1].trim()), references)}</li>`;
            }
        }
        
        // If we added links, don't escape the HTML
        if (processedItem !== item) {
            return `<li>${processCitations(processedItem, references)}</li>`;
        }
        
        return `<li>${processCitations(escapeHtml(item), references)}</li>`;
    }).join('');
    return `<${tag}>${items}</${tag}>`;
}

function renderTable(table, references) {
    const tableClass = table.class ? ` class="${table.class}"` : '';
    const separatorRows = table.separatorRows || [];
    let html = `<table class="academic-table${table.class ? ' ' + table.class : ''}">
        <caption>${escapeHtml(table.caption)}</caption>
        <thead>
            <tr>
                ${table.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${table.rows.map((row, index) => {
                const hasSeparator = separatorRows.includes(index);
                const rowClass = hasSeparator ? ' class="row-separator"' : '';
                return `<tr${rowClass}>${row.map((cell, cellIndex) => {
                    // Allow HTML in the last column (Comments column) for formatting
                    const isLastColumn = cellIndex === row.length - 1;
                    if (isLastColumn && cell.includes('<strong>')) {
                        // Process citations but don't escape HTML for the Comments column
                        const processedCell = processCitations(cell.replace(/\n/g, '<br>'), references);
                        return `<td>${processedCell}</td>`;
                    }
                    return `<td>${processCitations(escapeHtml(cell), references)}</td>`;
                }).join('')}</tr>`;
            }).join('')}
        </tbody>
    </table>`;
    if (table.note) {
        html += `<p class="table-note">${processCitations(escapeHtml(table.note), references)}</p>`;
    }
    return html;
}

// Heatmap configuration - OWASP categories with their table files
const OWASP_CATEGORIES = [
    { id: 'A01', title: 'Broken Access Control', tableFile: 'tables/table-3a-a01-broken-access-control.json' },
    { id: 'A02', title: 'Security Misconfiguration', tableFile: 'tables/table-3b-a02-security-misconfiguration.json' },
    { id: 'A03', title: 'Supply Chain', tableFile: 'tables/table-3c-a03-software-supply-chain.json' },
    { id: 'A04', title: 'Cryptographic Failures', tableFile: 'tables/table-3d-a04-cryptographic-failures.json' },
    { id: 'A05', title: 'Injection', tableFile: 'tables/table-3e-a05-injection.json' },
    { id: 'A06', title: 'Insecure Design', tableFile: 'tables/table-3f-a06-insecure-design.json' },
    { id: 'A07', title: 'Authentication Failures', tableFile: 'tables/table-3g-a07-authentication-failures.json' },
    { id: 'A08', title: 'Data Integrity Failures', tableFile: 'tables/table-3h-a08-data-integrity-failures.json' },
    { id: 'A09', title: 'Logging Failures', tableFile: 'tables/table-3i-a09-security-logging-failures.json' },
    { id: 'A10', title: 'Exceptional Conditions', tableFile: 'tables/table-3j-a10-exceptional-conditions.json' }
];

// Coverage status to color mapping
const COVERAGE_COLORS = {
    'Covered': '#4CAF50',      // Green
    'Partial': '#FFC107',       // Amber/Yellow
    'Not Covered': '#FF9800',   // Orange
    'Not Tested': '#9E9E9E'     // Grey
};

function renderHeatmap(heatmap) {
    const heatmapId = `heatmap-${Math.random().toString(36).substr(2, 9)}`;
    const caption = heatmap.caption ? `<p class="chart-caption">${escapeHtml(heatmap.caption)}</p>` : '';
    
    // Create placeholder that will be filled with data
    const placeholder = `
        <div class="heatmap-container" id="${heatmapId}">
            <div class="heatmap-loading">Loading heatmap data...</div>
        </div>
        ${caption}
    `;
    
    // Load data and render heatmap after DOM is ready
    setTimeout(async () => {
        const container = document.getElementById(heatmapId);
        if (!container) return;
        
        try {
            const heatmapData = await loadHeatmapData();
            renderHeatmapContent(container, heatmapData);
        } catch (error) {
            console.error('Error loading heatmap data:', error);
            container.innerHTML = '<p style="color: red;">Error loading heatmap data</p>';
        }
    }, 100);
    
    return placeholder;
}

async function loadHeatmapData() {
    const categories = [];
    
    for (const category of OWASP_CATEGORIES) {
        try {
            const response = await fetch(category.tableFile);
            if (!response.ok) throw new Error(`Failed to load ${category.tableFile}`);
            const table = await response.json();
            
            const cwes = table.rows.map(row => {
                // Extract CWE number from first column (e.g., "CWE-1275: Description" -> "1275")
                const cweMatch = row[0].match(/CWE-(\d+)/);
                const cweNumber = cweMatch ? cweMatch[1] : row[0];
                const fullCwe = row[0]; // Full CWE text
                const coverage = row[1]; // Coverage status
                const comments = row[2]; // Comments with description, evidence, limitations
                
                return {
                    number: cweNumber,
                    fullText: fullCwe,
                    coverage: coverage,
                    comments: comments
                };
            });
            
            categories.push({
                id: category.id,
                title: category.title,
                cwes: cwes
            });
        } catch (error) {
            console.error(`Error loading ${category.tableFile}:`, error);
            categories.push({
                id: category.id,
                title: category.title,
                cwes: []
            });
        }
    }
    
    return categories;
}

function renderHeatmapContent(container, categories) {
    // Create legend
    const legendHtml = `
        <div class="heatmap-legend">
            <span class="heatmap-legend-title">Legend (CWE-IDs):</span>
            <span class="heatmap-legend-item">
                <span class="heatmap-legend-color" style="background-color: ${COVERAGE_COLORS['Covered']};"></span>
                Covered
            </span>
            <span class="heatmap-legend-item">
                <span class="heatmap-legend-color" style="background-color: ${COVERAGE_COLORS['Partial']};"></span>
                Partial
            </span>
            <span class="heatmap-legend-item">
                <span class="heatmap-legend-color" style="background-color: ${COVERAGE_COLORS['Not Covered']};"></span>
                Not Covered
            </span>
            <span class="heatmap-legend-item">
                <span class="heatmap-legend-color" style="background-color: ${COVERAGE_COLORS['Not Tested']};"></span>
                Not Tested
            </span>
        </div>
    `;
    
    // Create heatmap grid - each category is a row
    let gridHtml = '<div class="heatmap-grid">';
    
    for (const category of categories) {
        gridHtml += `
            <div class="heatmap-row">
                <div class="heatmap-category-label">${escapeHtml(category.id)}: ${escapeHtml(category.title)}</div>
                <div class="heatmap-cells">
        `;
        
        for (const cwe of category.cwes) {
            const color = COVERAGE_COLORS[cwe.coverage] || COVERAGE_COLORS['Not Tested'];
            const tooltipData = encodeURIComponent(JSON.stringify({
                cwe: cwe.fullText,
                coverage: cwe.coverage,
                comments: cwe.comments
            }));
            
            gridHtml += `
                <div class="heatmap-cell" 
                     style="background-color: ${color};"
                     data-tooltip="${tooltipData}"
                     onmouseenter="showHeatmapTooltip(event, this)"
                     onmouseleave="hideHeatmapTooltip()">
                    ${escapeHtml(cwe.number)}
                </div>
            `;
        }
        
        gridHtml += `
                </div>
            </div>
        `;
    }
    
    gridHtml += '</div>';
    
    // Create tooltip container (hidden by default)
    const tooltipHtml = '<div id="heatmap-tooltip" class="heatmap-tooltip"></div>';
    
    container.innerHTML = legendHtml + gridHtml + tooltipHtml;
}

// Global tooltip functions
function showHeatmapTooltip(event, element) {
    const tooltip = document.getElementById('heatmap-tooltip');
    if (!tooltip) return;
    
    try {
        const data = JSON.parse(decodeURIComponent(element.getAttribute('data-tooltip')));
        
        // Parse comments to extract sections
        let tooltipContent = `
            <div class="heatmap-tooltip-header">
                <strong>${escapeHtmlForTooltip(data.cwe)}</strong>
            </div>
            <div class="heatmap-tooltip-coverage">
                <span class="heatmap-tooltip-status" style="background-color: ${COVERAGE_COLORS[data.coverage] || '#9E9E9E'};">
                    ${escapeHtmlForTooltip(data.coverage)}
                </span>
            </div>
        `;
        
        // Parse the comments (HTML formatted with <strong> tags)
        if (data.comments) {
            const commentsHtml = data.comments
                .replace(/\\n/g, '\n')
                .replace(/\n/g, '<br>');
            tooltipContent += `<div class="heatmap-tooltip-comments">${commentsHtml}</div>`;
        }
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = 'block';
        
        // Position tooltip near the mouse
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = event.clientX + 15;
        let top = event.clientY + 15;
        
        // Adjust if tooltip would go off screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - 15;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = event.clientY - tooltipRect.height - 15;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    } catch (error) {
        console.error('Error showing tooltip:', error);
    }
}

function hideHeatmapTooltip() {
    const tooltip = document.getElementById('heatmap-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function escapeHtmlForTooltip(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderChart(chart) {
    const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;
    const canvas = `<canvas id="${chartId}" style="min-height: 400px;"></canvas>`;
    const caption = chart.caption ? `<p class="chart-caption">${escapeHtml(chart.caption)}</p>` : '';
    
    // Store chart config for initialization after DOM is ready
    // Use a longer timeout to ensure DOM is fully updated after async rendering
    setTimeout(() => {
        const ctx = document.getElementById(chartId);
        if (ctx && typeof Chart !== 'undefined') {
            // Merge default options with chart-specific options
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: true,
                scales: chart.type === 'line' ? {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                } : undefined,
                plugins: {
                    legend: {
                        display: chart.showLegend !== false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            };
            
            // Deep merge options
            const mergedOptions = chart.options ? deepMerge(defaultOptions, chart.options) : defaultOptions;
            
            new Chart(ctx, {
                type: chart.type || 'line',
                data: {
                    labels: chart.labels || [],
                    datasets: chart.datasets || []
                },
                options: mergedOptions
            });
        } else {
            console.error(`Chart.js not loaded or canvas element #${chartId} not found in DOM`);
        }
    }, 500);
    
    return `<div class="chart-container">${canvas}${caption}</div>`;
}

function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function renderReference(ref) {
    if (typeof ref === 'string') {
        // Legacy format - plain string
        return `<p>${escapeHtml(ref)}</p>`;
    } else {
        // New format - object with id, title, url, description, citations
        const url = ref.url || '#';
        const title = ref.title || '';
        const description = ref.description || '';
        // Show all citation numbers that map to this reference
        let citationNumbers = '';
        if (ref.citations && ref.citations.length > 0) {
            if (ref.citations.length === 1) {
                citationNumbers = `[${ref.citations[0]}]`;
            } else {
                citationNumbers = `[${ref.citations.join(', ')}]`;
            }
        } else {
            citationNumbers = `[${ref.id}]`;
        }
        return `<p id="ref-${ref.id}"><span class="reference-number">${citationNumbers}</span> <a href="${url}" target="_blank" rel="noopener noreferrer" class="reference-link">${escapeHtml(title)}</a>. ${escapeHtml(description)} <a href="${url}" target="_blank" rel="noopener noreferrer" class="reference-url">${escapeHtml(url)}</a></p>`;
    }
}

function processCitations(text, references) {
    if (!references || references.length === 0) {
        return text;
    }
    
    // Create a mapping from old citation numbers to new unified reference IDs
    const citationToRefMap = {};
    references.forEach(ref => {
        if (typeof ref === 'object' && ref.citations) {
            // Map all old citation numbers to the new unified reference ID
            ref.citations.forEach(oldNum => {
                citationToRefMap[oldNum] = ref.id;
            });
        } else if (typeof ref === 'object' && ref.id) {
            // Fallback: if no citations array, map ID to itself
            citationToRefMap[ref.id] = ref.id;
        }
    });
    
    // Pattern to match citations: [1], [2], [1,2], [1-3], [1, 2, 3], etc.
    // This regex matches [ followed by numbers, commas, spaces, and hyphens, then ]
    const citationPattern = /\[(\d+(?:[,\s-]+\d+)*)\]/g;
    
    return text.replace(citationPattern, (match, citationNumbers) => {
        // Parse citation numbers (handle ranges like 1-3, lists like 1,2,3, etc.)
        const numbers = citationNumbers.split(/[,\s-]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        // Map old citation numbers to new unified reference IDs
        const refIds = numbers.map(num => citationToRefMap[num] || num);
        // Remove duplicates while preserving order
        const uniqueRefIds = [...new Set(refIds)];
        
        // Create citation links - keep original numbers in text but link to unified references
        const citationLinks = numbers.map(num => {
            const refId = citationToRefMap[num] || num;
            const ref = references.find(r => (typeof r === 'object' ? r.id : null) === refId);
            if (ref) {
                return `<a href="#ref-${refId}" class="citation-link" title="${escapeHtml(ref.title || ref.description || '')}" onclick="event.preventDefault(); document.getElementById('ref-${refId}').scrollIntoView({behavior: 'smooth', block: 'center'}); return false;">${num}</a>`;
            }
            return `<a href="#ref-${refId}" class="citation-link" onclick="event.preventDefault(); document.getElementById('ref-${refId}').scrollIntoView({behavior: 'smooth', block: 'center'}); return false;">${num}</a>`;
        });
        
        // Join multiple citations with commas
        return `<sup class="citation">[${citationLinks.join(', ')}]</sup>`;
    });
}

async function loadTableFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load table from ${filePath}: ${response.statusText}`);
        }
        const table = await response.json();
        return table;
    } catch (error) {
        console.error(`Error loading table from ${filePath}:`, error);
        throw error;
    }
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

// Handle hash navigation after content is loaded
window.addEventListener('load', function() {
    // Give render time to complete
    setTimeout(function() {
        if (window.location.hash) {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 300);
});
