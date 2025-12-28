# Custom Domain Setup for GitHub Pages with Route53

This guide will help you set up a custom domain for your GitHub Pages site using AWS Route53.

## Prerequisites
- A Route53 hosted zone for your domain
- Access to your GitHub repository settings
- Your custom domain name (e.g., `example.com` or `www.example.com`)

## Step 1: Create CNAME File

A `CNAME` file has been created in the `docs/` directory. Edit it and add your custom domain name.

**Important:** The CNAME file should contain ONLY your domain name (no `http://` or `https://`), for example:
- `example.com` (for apex domain)
- `www.example.com` (for subdomain)
- `report.example.com` (for subdomain)

## Step 2: Configure DNS Records in Route53

### Option A: Using a Subdomain (Recommended - Easier)

If you're using a subdomain like `www.example.com` or `report.example.com`:

1. Go to your Route53 hosted zone
2. Create a **CNAME record**:
   - **Record name**: Your subdomain (e.g., `www` or `report`)
   - **Record type**: CNAME
   - **Value**: `your-username.github.io` (replace `your-username` with your GitHub username)
   - **TTL**: 300 (or your preferred value)

### Option B: Using Apex Domain (example.com)

If you want to use the apex domain (e.g., `example.com` without www):

1. Go to your Route53 hosted zone
2. Create **A records** pointing to GitHub's IP addresses:
   - **Record name**: Leave empty (for apex domain) or `@`
   - **Record type**: A
   - **Value**: Create 4 separate A records with these IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - **TTL**: 300

**Note:** GitHub's IP addresses may change. Check [GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) for the latest IPs.

### Option C: Using Route53 ALIAS Record (Best for Apex Domain)

Route53 supports ALIAS records which automatically update if GitHub's IPs change:

1. Go to your Route53 hosted zone
2. Create an **ALIAS record**:
   - **Record name**: Leave empty (for apex domain) or `@`
   - **Record type**: A (ALIAS)
   - **Alias**: Yes
   - **Alias target**: Select "Alias to another record in this hosted zone"
   - **Route traffic to**: Create a CNAME record first (e.g., `www.example.com` → `your-username.github.io`), then point the ALIAS to that CNAME

**OR** use Route53's ability to create an ALIAS directly:
- **Record name**: `@` or leave empty
- **Record type**: A (ALIAS)
- **Alias**: Yes
- **Alias target**: Select "Alias to CloudFront distribution" or use the CNAME approach above

## Step 3: Configure Custom Domain in GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under **Custom domain**, enter your domain name (e.g., `example.com` or `www.example.com`)
4. Click **Save**
5. GitHub will automatically:
   - Verify the DNS configuration
   - Enable HTTPS (may take a few minutes to hours)
   - Create an SSL certificate via Let's Encrypt

## Step 4: Enable Enforce HTTPS (Recommended)

1. After GitHub verifies your domain and enables HTTPS (you'll see a green checkmark)
2. Check the **Enforce HTTPS** checkbox in the Pages settings
3. This ensures all HTTP traffic redirects to HTTPS

## Step 5: Commit and Push Changes

1. Edit the `docs/CNAME` file with your domain name
2. Commit the changes:
   ```bash
   git add docs/CNAME
   git commit -m "Add custom domain configuration"
   git push
   ```

## Step 6: Verify Setup

1. Wait for DNS propagation (can take a few minutes to 48 hours, usually much faster)
2. Check your domain in a browser
3. Verify HTTPS is working (look for the lock icon)
4. Test both `http://yourdomain.com` and `https://yourdomain.com`

## Troubleshooting

### DNS Not Resolving
- Check DNS propagation: Use `dig yourdomain.com` or online tools like `dnschecker.org`
- Verify Route53 records are correct
- Ensure TTL is set appropriately (lower TTL = faster updates but more queries)

### HTTPS Not Enabled
- Wait up to 24 hours for GitHub to provision the SSL certificate
- Ensure DNS is correctly configured
- Check GitHub Pages settings for any error messages

### Mixed Content Warnings
- Ensure all resources (CSS, JS, images) use HTTPS or relative URLs
- Check browser console for mixed content errors

## Current GitHub Pages IP Addresses (as of 2024)

For A records, use these IPs:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**Note:** Always verify current IPs in [GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) as they may change.

## Quick Reference: Route53 Record Types

| Domain Type | Route53 Record Type | Target Value |
|------------|-------------------|--------------|
| Subdomain (www.example.com) | CNAME | your-username.github.io |
| Apex (example.com) | A (4 records) | GitHub IPs (see above) |
| Apex (example.com) | ALIAS | Point to CNAME or use CloudFront |















