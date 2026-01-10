# Deployment Guide for Kubb Counter

This guide will help you deploy the Kubb Counter app to Netlify.

## Prerequisites

- GitHub account
- Netlify account (sign up at https://netlify.com)
- Airtable account with configured base and table
- Git installed on your computer

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Kubb Counter app"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "kubb-counter")
3. Don't initialize with README (we already have files)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/kubb-counter.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify UI (Recommended)

1. **Login to Netlify**
   - Go to https://app.netlify.com
   - Sign in with your account

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select your `kubb-counter` repository

3. **Configure Build Settings**

   Netlify should auto-detect these settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** `netlify/functions`

   If not auto-detected, enter them manually.

4. **Add Environment Variables**

   Before deploying, click "Show advanced" → "New variable" and add:

   ```
   AIRTABLE_API_KEY = your_airtable_api_key
   AIRTABLE_BASE_ID = your_airtable_base_id
   AIRTABLE_TABLE_NAME = Kubb
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at a Netlify URL (e.g., `https://your-site-name.netlify.app`)

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI** (if not already installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name or leave blank for random
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

4. **Set Environment Variables**
   ```bash
   netlify env:set AIRTABLE_API_KEY your_airtable_api_key
   netlify env:set AIRTABLE_BASE_ID your_airtable_base_id
   netlify env:set AIRTABLE_TABLE_NAME Kubb
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Verify Deployment

1. **Test the App**
   - Visit your Netlify URL
   - Complete a test game session
   - Verify data is saved to Airtable
   - Check if celebration screen appears on record breaks

2. **Check Function Logs**
   - Go to Netlify dashboard → Your site → Functions
   - Monitor function invocations and errors

## Step 4: Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS

## Build Configuration Summary

The build is configured in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = "netlify/functions"
```

## Environment Variables

Make sure these are set in Netlify:

| Variable | Value | Description |
|----------|-------|-------------|
| `AIRTABLE_API_KEY` | Your Airtable API key | Authentication for Airtable |
| `AIRTABLE_BASE_ID` | Your Airtable Base ID | Identifies your Airtable base |
| `AIRTABLE_TABLE_NAME` | `Kubb` | Name of your Airtable table |

## Continuous Deployment

Netlify automatically deploys when you push to your `main` branch:

```bash
git add .
git commit -m "Update app"
git push origin main
```

Netlify will automatically build and deploy the changes.

## Troubleshooting

### Build Fails

**Error:** `Module not found` or `Cannot find package`
- **Solution:** Make sure all dependencies are in `package.json` and committed to Git

**Error:** `Build exceeded maximum allowed runtime`
- **Solution:** Check for infinite loops or increase build timeout in Netlify settings

### Functions Not Working

**Error:** 404 on function calls
- **Solution:** Verify functions directory is set to `netlify/functions` in Netlify settings

**Error:** Environment variables not found
- **Solution:** Double-check environment variables are set in Netlify dashboard under Site settings → Environment variables

### Airtable Connection Issues

**Error:** Failed to create record
- **Solution:** Verify your Airtable API key is correct and has write permissions
- **Solution:** Check that Base ID and Table Name match your Airtable setup

### Next.js Image Optimization

If you see image optimization errors:
- Add to `next.config.ts`:
  ```typescript
  images: {
    domains: ['media.giphy.com'],
  }
  ```

## Monitoring

- **Analytics:** Enable Netlify Analytics in Site settings
- **Function Logs:** Monitor in Netlify dashboard → Functions
- **Real-time Logs:** Run `netlify logs` in your terminal

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://www.netlify.com/support/
- Airtable Docs: https://airtable.com/developers/web/api/introduction

## Success!

Your Kubb Counter app is now live on Netlify! 🎉

Share your app URL with others and start tracking those Kubb game statistics!
