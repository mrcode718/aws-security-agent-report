# AWS Security Agent - Functional Testing Report

This repository contains a functional testing report of AWS Security Agent based on console testing and configuration analysis.

## Report Overview

The report documents the current state of AWS Security Agent in public preview, including:
- Agent Space configuration and capabilities
- Security requirements (AWS-managed and custom)
- Integration status (GitHub)
- Penetration testing configuration
- Observed limitations and recommendations

## View the Report

The report is available as a GitHub Pages site. Update this URL with your repository location.

## Report Data

All findings are based on actual console exploration conducted in December 2025.

## Repository Structure

```
.
├── docs/                   # GitHub Pages source
│   ├── index.html         # Main report page
│   ├── .nojekyll          # Disable Jekyll
│   └── assets/
│       ├── css/
│       │   └── report.css # Report styling
│       └── js/
│           └── export.js   # Export functionality
├── .github/
│   └── workflows/
│       └── pages.yml      # GitHub Pages deployment
└── README.md              # This file
```

## Review Date

December 2025

## Content Editing Guide

This guide explains how to edit the report content without touching any code.

## Quick Start

All report content is stored in **`content.json`** file. Simply edit this JSON file to update the report.

## File Location

- **Content File**: `docs/content.json`
- **Report Display**: `docs/index.html` (automatically generated from content.json)

## Editing Content

### 1. Basic Information (Metadata)

Edit the `metadata` section at the top of `content.json`:

```json
{
  "metadata": {
    "title": "Your Report Title",
    "author": "Author Name",
    "affiliation": "Organization Name",
    "date": "December 2025",
    "reviewDate": "December 2025",
    "region": "us-east-1",
    "status": "Public Preview"
  }
}
```

### 2. Abstract

Edit the `abstract` field:

```json
{
  "abstract": "Your abstract text here..."
}
```

### 3. Sections

Each section has this structure:

```json
{
  "number": 1,
  "title": "Section Title",
  "paragraphs": [
    "First paragraph text...",
    "Second paragraph text..."
  ]
}
```

### 4. Adding Lists

Add a `lists` array to any section:

```json
{
  "lists": [
    {
      "type": "ul",  // or "ol" for numbered list
      "items": [
        "First item",
        "Second item",
        "Third item"
      ]
    }
  ]
}
```

**For bold text in list items**, use format: `"Text: description"` - it will automatically format as bold.

### 5. Adding Tables

Add a `table` object to any section:

```json
{
  "table": {
    "caption": "Table 1: Your Table Title",
    "headers": ["Column 1", "Column 2", "Column 3"],
    "rows": [
      ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
      ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]
    ]
  }
}
```

For findings table (with special styling), add `"class": "findings-table"`:

```json
{
  "table": {
    "caption": "Table 3: Findings",
    "class": "findings-table",
    "headers": ["ID", "Severity", "Category", "Description", "Status"],
    "rows": [...]
  }
}
```

### 6. Adding Subsections

Add a `subsections` array:

```json
{
  "subsections": [
    {
      "number": "3.1",
      "title": "Subsection Title",
      "paragraphs": [
        "Paragraph text..."
      ],
      "lists": [...],  // Optional
      "table": {...}   // Optional
    }
  ]
}
```

### 7. References

Edit the `references` array:

```json
{
  "references": [
    "First reference",
    "Second reference"
  ]
}
```

## Examples

### Example: Adding a New Section

```json
{
  "number": 8,
  "title": "Future Work",
  "paragraphs": [
    "This section discusses future research directions.",
    "Additional testing will be conducted in the next phase."
  ],
  "lists": [
    {
      "type": "ul",
      "items": [
        "Item 1",
        "Item 2"
      ]
    }
  ]
}
```

### Example: Adding a Table

```json
{
  "number": 4,
  "title": "Performance Metrics",
  "paragraphs": [
    "Table 4 shows performance metrics."
  ],
  "table": {
    "caption": "Table 4: Performance Metrics",
    "headers": ["Metric", "Value", "Unit"],
    "rows": [
      ["Response Time", "150", "ms"],
      ["Throughput", "1000", "req/s"]
    ]
  }
}
```

## Important Notes

1. **JSON Syntax**: Make sure to:
   - Use double quotes `"` for all strings
   - Add commas between items (except the last one)
   - Match all brackets `{}` and `[]`

2. **Special Characters**: The system automatically escapes HTML, so you can use:
   - Regular text: `"Hello world"`
   - Quotes: `"He said \"Hello\""`
   - Ampersands: `"AT&T"` (will be converted to `AT&amp;T`)

3. **Line Breaks**: For line breaks within paragraphs, use separate paragraph entries:
   ```json
   "paragraphs": [
     "First part of paragraph.",
     "Second part of paragraph."
   ]
   ```

4. **Testing**: After editing `content.json`:
   - Save the file
   - Refresh the browser
   - The report will automatically update

## Need Help?

- Check JSON syntax with an online JSON validator
- Look at existing sections in `content.json` as examples
- The structure is designed to be intuitive - most edits are straightforward

## File Structure

```
docs/
├── content.json          ← Edit this file to change content
├── index.html            ← Auto-generated (don't edit)
└── assets/
    └── js/
        └── render.js     ← Generates HTML from content.json
```















