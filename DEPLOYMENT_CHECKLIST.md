# ✅ Netlify Deployment Checklist

## 🚀 Quick Deployment Steps

### 1. ✅ Project Setup Complete
- [x] `package.json` created with all dependencies
- [x] `netlify.toml` configured for Astro + React
- [x] `.gitignore` set up properly
- [x] Build tested successfully (`npm run build` works)

### 2. 🔧 Environment Variables to Set in Netlify

Go to **Netlify Dashboard → Site Settings → Environment Variables** and add:

```
PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

### 3. 📤 Deploy to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit for Netlify deployment"

# Create GitHub repo and push 
git remote add origin https://github.com/yourusername/kitebuddy.git
git branch -M main
git push -u origin main
```

### 4. 🌐 Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub → Select your `kitebuddy` repo
4. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### 5. 🔐 Configure Supabase for Production

In your **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | URL |
|---------|-----|
| **Site URL** | `https://your-site-name.netlify.app` |
| **Redirect URLs** | `https://your-site-name.netlify.app/auth/callback` |

### 6. 🎯 Test Your Deployment

- [ ] Visit your live site
- [ ] Test user registration
- [ ] Test user login
- [ ] Test logout functionality
- [ ] Verify weather forecasts work
- [ ] Check all pages load correctly

## 🔍 Troubleshooting

### Build Fails
- Check Node.js version is 18+
- Verify all dependencies installed
- Check build logs in Netlify dashboard

### Authentication Issues
- Verify environment variables are set
- Check Supabase URL configuration
- Ensure redirect URLs match your domain

### Environment Variables Not Working
- Variables must start with `PUBLIC_` for client-side access
- Redeploy after adding new variables
- Check variable names match exactly

## 📊 Your Live URLs

After deployment, your app will be available at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)

## 🎉 Success!

Your Kitebuddy application is now live and ready for users!

---

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed instructions.
