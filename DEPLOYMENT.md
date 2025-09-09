# 🚀 Kitebuddy Deployment Guide - Netlify

## 📋 Overview

This guide will help you deploy your Kitebuddy application to Netlify with proper configuration for Astro, React, and Supabase authentication.

## 🛠️ Prerequisites

- ✅ GitHub account
- ✅ Netlify account (free tier works)
- ✅ Supabase project set up
- ✅ Your project running locally

## 📦 Step 1: Prepare Your Project

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Test Local Build
```bash
npm run build
npm run preview
```

### 1.3 Verify Environment Variables
Make sure your `.env` file contains:
```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔧 Step 2: Configure Netlify

### 2.1 Create netlify.toml
✅ Already created! The `netlify.toml` file is configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js version: 18
- Redirect rules for SPA behavior
- Security headers
- Caching rules

### 2.2 Environment Variables Needed
You'll need to set these in Netlify dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🚀 Step 3: Deploy to Netlify

### 3.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Netlify deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/kitebuddy.git
git branch -M main
git push -u origin main
```

### 3.2 Connect to Netlify

1. **Go to Netlify Dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Sign in with your GitHub account

2. **Create New Site**
   - Click "New site from Git"
   - Choose "GitHub" as provider
   - Select your `kitebuddy` repository

3. **Configure Build Settings**
   - Build command: `npm run build` (should auto-detect)
   - Publish directory: `dist` (should auto-detect)
   - Node version: `18` (should auto-detect from netlify.toml)

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add each variable:
     ```
     PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
     PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
     ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (usually 2-3 minutes)

## 🔐 Step 4: Configure Supabase for Production

### 4.1 Update Supabase URLs
1. Go to your Supabase dashboard
2. Navigate to **Authentication → URL Configuration**
3. Update these URLs:

| Setting | URL |
|---------|-----|
| **Site URL** | `https://your-site-name.netlify.app` |
| **Redirect URLs** | `https://your-site-name.netlify.app/auth/callback` |

### 4.2 Test Authentication
1. Visit your live site: `https://your-site-name.netlify.app`
2. Try signing up with a test email
3. Check if you receive verification email
4. Test login/logout functionality

## 🎯 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. In Netlify dashboard → Domain settings
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### 5.2 Update Supabase URLs
Update your Supabase configuration with the new custom domain:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/auth/callback`

## 🔍 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Netlify dashboard

### Authentication Issues
- Verify environment variables are set correctly
- Check Supabase URL configuration
- Ensure redirect URLs match your domain

### Environment Variables Not Working
- Make sure variables start with `PUBLIC_` for client-side access
- Redeploy after adding new variables
- Check variable names match exactly

## 📊 Monitoring

### Netlify Analytics
- Enable Netlify Analytics in dashboard
- Monitor site performance and usage

### Supabase Monitoring
- Check Supabase dashboard for auth metrics
- Monitor database usage and performance

## 🎉 Success!

Your Kitebuddy application should now be live at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)

## 🔄 Continuous Deployment

Every time you push to your main branch, Netlify will automatically:
1. Pull the latest code
2. Install dependencies
3. Build the project
4. Deploy to production

## 📝 Next Steps

- Set up custom domain
- Configure SSL certificate
- Set up monitoring and alerts
- Optimize performance
- Add more features!

---

**Need help?** Check the [Netlify documentation](https://docs.netlify.com/) or [Supabase documentation](https://supabase.com/docs).
