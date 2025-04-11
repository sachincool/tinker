# Multi-Domain Hugo Blog Setup

This repository contains a Hugo-based blog setup that supports multiple domains:
- harshit.cloud
- blog.harshit.cloud
- tinker.cloud

## GitHub Pages Deployment

The site is configured to deploy automatically to GitHub Pages using GitHub Actions.

## DNS Configuration

To configure your domains with Cloudflare:

### For harshit.cloud and blog.harshit.cloud

1. Log in to your Cloudflare dashboard
2. Select the `harshit.cloud` domain
3. Go to DNS settings
4. Add the following CNAME records:

```
# For apex domain (harshit.cloud)
Type: CNAME
Name: @
Target: [your-github-username].github.io.
Proxy status: Proxied

# For blog subdomain
Type: CNAME
Name: blog
Target: [your-github-username].github.io.
Proxy status: Proxied
```

### For tinker.cloud

1. Log in to your Cloudflare dashboard
2. Select the `tinker.cloud` domain
3. Go to DNS settings
4. Add the following CNAME record:

```
Type: CNAME
Name: @
Target: [your-github-username].github.io.
Proxy status: Proxied
```

### GitHub Pages Configuration

1. Go to your repository on GitHub
2. Go to Settings > Pages
3. Under "Custom domain", enter your primary domain (harshit.cloud)
4. Check the "Enforce HTTPS" option

The GitHub Actions workflow will handle the creation of proper CNAME files for each domain during deployment.

## Repository Structure

The Hugo site uses the PaperMod theme and is configured for multi-domain publishing.

## Local Development

To run the site locally:

```bash
hugo server -D
```

This will start a local development server at http://localhost:1313/ 