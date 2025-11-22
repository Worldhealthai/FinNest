# Deploying FinNest to Vercel

This guide will walk you through deploying your FinNest app to Vercel.

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your GitHub repository connected to Vercel

### Steps

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Your Repository**
   - Select "Import Git Repository"
   - Choose `Worldhealthai/FinNest-Real`
   - Select the branch: `claude/finnest-app-recreation-011CV2vNbU7EHwCsWjKaAPXf`

3. **Configure Project**
   - **Framework Preset**: Select "Other" or "Expo"
   - **Build Command**: `expo export -p web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables (Optional)**
   - Add any environment variables from `.env.example` if needed
   - Click "Add" for each variable

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

## Option 2: Deploy via Vercel CLI

### Prerequisites
- Node.js installed
- Vercel CLI installed globally

### Steps

1. **Install Vercel CLI** (if not already installed)
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Navigate to Project Directory**
```bash
cd /home/user/FinNest-Real
```

4. **Deploy to Vercel**
```bash
# For production deployment
vercel --prod

# Or for preview deployment
vercel
```

5. **Follow the Prompts**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (first time) or `Y` (subsequent deploys)
   - What's your project's name? `finnest` or your preferred name
   - In which directory is your code located? `./`
   - Want to override the settings? `N` (the vercel.json will be used)

6. **Access Your Deployment**
   - The CLI will provide a URL once deployment is complete
   - Visit the URL to see your live app

## Option 3: Deploy via GitHub Integration

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Auto-Deployments**
   - Every push to your branch will automatically deploy
   - Pull requests will get preview deployments
   - Production deployments happen on merge to main

3. **Custom Domain (Optional)**
   - Go to project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain (e.g., `www.finnest.app`)
   - Follow DNS configuration instructions

## Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "buildCommand": "expo export -p web",
  "outputDirectory": "dist",
  "devCommand": "expo start --web",
  "cleanUrls": true,
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

## Troubleshooting

### Build Fails
- **Issue**: Dependencies not installing
- **Solution**: Make sure `package.json` is in the root directory
- **Solution**: Check that Node.js version is compatible (use Node 18+)

### Blank Page After Deploy
- **Issue**: App shows blank page
- **Solution**: Check browser console for errors
- **Solution**: Ensure all imports use correct paths with aliases

### Assets Not Loading
- **Issue**: Images/fonts not displaying
- **Solution**: Make sure assets are in the `assets/` folder
- **Solution**: Check that asset paths are correct in the code

### Routing Issues
- **Issue**: Direct URLs don't work (404 errors)
- **Solution**: The `rewrites` in `vercel.json` should handle this
- **Solution**: Clear Vercel cache and redeploy

## Performance Optimization

1. **Enable Vercel Analytics**
   - Go to project settings
   - Enable "Analytics" to track performance

2. **Add Custom Headers**
   - Configure caching headers in `vercel.json` if needed

3. **Optimize Images**
   - Use Vercel's Image Optimization
   - Add images to the `public/` folder if needed

## Production Checklist

Before deploying to production:

- [ ] Update environment variables
- [ ] Replace mock data with real API calls
- [ ] Add proper error handling
- [ ] Test on multiple devices/browsers
- [ ] Configure custom domain
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Add privacy policy and terms
- [ ] Configure analytics
- [ ] Test all user flows
- [ ] Optimize bundle size

## Post-Deployment

1. **Monitor Performance**
   - Check Vercel Analytics dashboard
   - Monitor error rates

2. **Set Up Continuous Deployment**
   - Connect GitHub repository for auto-deploys
   - Configure deployment branches

3. **Share Your App**
   - Your Vercel URL: `https://finnest-real.vercel.app`
   - Share with users and gather feedback

## Support

For Vercel-specific issues:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

For FinNest app issues:
- Check the main README.md
- Review the codebase documentation
