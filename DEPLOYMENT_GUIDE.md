# FinNest Android Deployment Guide

Your app is now configured and ready for Android deployment! Follow these steps to build and publish to Google Play Store.

## Prerequisites

✅ Already completed:
- [x] App.json configured for Android
- [x] EAS configuration created
- [x] Privacy policy created
- [x] Console.logs removed in production builds
- [x] Babel configured for production

🔲 You need to do:
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Expo account (free)
- [ ] Privacy policy hosted online
- [ ] App store assets (screenshots, icons)

## Step 1: Create Required Accounts

### 1.1 Expo Account
```bash
npx expo login
```
Or create account at: https://expo.dev/signup

### 1.2 Google Play Developer Account
1. Go to: https://play.google.com/console/signup
2. Pay $25 registration fee
3. Complete developer profile

## Step 2: Host Privacy Policy

You need to host your privacy policy online. Options:

**Option 1: GitHub Pages (Free)**
1. Create a new public repo on GitHub
2. Upload `PRIVACY_POLICY.md` as `index.md`
3. Enable GitHub Pages in repo settings
4. Your URL will be: `https://yourusername.github.io/repo-name`

**Option 2: Custom Website**
- Host on your own domain
- Convert the markdown to HTML

**Update app.json** with the privacy URL once hosted.

## Step 3: Configure EAS Project

Run this command to link your app to Expo:
```bash
eas init
```

This will:
- Create a project ID
- Update your app.json with the project ID
- Link your local app to Expo servers

## Step 4: Build Your Android App

### 4.1 Test Build (APK - for testing)
```bash
eas build --platform android --profile preview
```
- Creates an APK file you can install on your phone
- Good for testing before submitting to store

### 4.2 Production Build (AAB - for Play Store)
```bash
eas build --platform android --profile production-aab
```
- Creates an Android App Bundle (.aab)
- This is what you'll upload to Play Store
- EAS will manage your signing keys automatically

**First-time build:**
- EAS will ask if you want it to manage signing keys → **Say YES**
- It will generate and securely store your keystore
- This takes about 10-20 minutes

## Step 5: Download Your Build

After the build completes:
1. EAS will provide a download link
2. Download the `.aab` file
3. Keep this file safe - you'll upload it to Play Store

## Step 6: Create Play Store Listing

### 6.1 App Information
- **App name:** FinNest
- **Short description:** Track all your ISAs in one place
- **Full description:**
```
FinNest is your smart ISA allowance tracker that helps you manage all your Individual Savings Accounts in one beautiful app.

FEATURES:
✓ Track Cash ISAs, Stocks & Shares ISAs, Lifetime ISAs, and Innovative Finance ISAs
✓ Monitor your £20,000 annual allowance
✓ See contributions across multiple providers
✓ Tax year countdown and reminders
✓ Lifetime ISA bonus calculator
✓ Beautiful, intuitive interface

BENEFITS:
• Never exceed your ISA allowance
• Track contributions from any provider
• Understand your limits at a glance
• Plan your tax-free savings strategy
• Maximize your annual allowance

Perfect for UK savers who want to make the most of their ISA allowances!
```

### 6.2 Required Assets

Create these graphics:

**App Icon:**
- Size: 512 x 512 pixels
- Format: PNG (32-bit)
- Use your existing logo with transparent background

**Feature Graphic:**
- Size: 1024 x 500 pixels
- Showcase the app name and key feature
- High quality banner for store listing

**Screenshots (Minimum 2, Maximum 8):**
- Phone: 1080 x 1920 pixels (or similar 16:9)
- Capture key screens:
  1. Welcome screen
  2. ISA Dashboard
  3. Add contribution screen
  4. Analytics/hub
  5. Profile/settings

**Optional:**
- Promo video (30 seconds to 2 minutes)

### 6.3 Content Rating
1. Fill out the content rating questionnaire
2. FinNest should get: **Everyone** or **PEGI 3**
3. No violence, gambling, or adult content

### 6.4 App Category
- **Category:** Finance
- **Tags:** ISA, savings, finance tracker, tax-free

## Step 7: Upload to Play Console

1. Log into Google Play Console
2. Create a new app
3. Fill in app details
4. Upload your `.aab` file to **Internal Testing** track first
5. Complete the content rating questionnaire
6. Add privacy policy URL
7. Set pricing (Free)
8. Select countries (UK + others)
9. Submit for review

## Step 8: Testing Track (Recommended)

Before going public:
1. Use **Internal Testing** track
2. Add yourself as a tester
3. Test the app thoroughly
4. Check for any crashes or issues
5. Once satisfied, promote to **Production**

## Step 9: Submit for Review

1. Complete all required sections in Play Console
2. Click "Send for Review"
3. Wait 1-2 days for Google's review
4. Fix any issues if rejected
5. Once approved, your app goes live!

## Building Updates

When you need to update your app:

1. Update version in `app.json`:
```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

2. Build new version:
```bash
eas build --platform android --profile production-aab
```

3. Upload new AAB to Play Console
4. Submit for review

## Useful Commands

```bash
# Login to Expo
npx expo login

# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Submit to Play Store (after setting up service account)
eas submit --platform android

# Check EAS configuration
eas config
```

## Cost Breakdown

**One-time:**
- Google Play Developer: $25

**Ongoing:**
- EAS Free tier: 30 builds/month (FREE)
- Or EAS Production: $29/month (unlimited builds)

For initial launch, the free tier is sufficient!

## Troubleshooting

**Build fails?**
- Check `eas build:view [build-id]` for logs
- Ensure all dependencies are in package.json
- Clear cache: `npm install` or `expo install`

**App crashes on device?**
- Check for console errors in development
- Test the preview APK before production build
- Verify all assets are included

**Google rejects app?**
- Read rejection reason carefully
- Common issues: missing privacy policy, content rating, or screenshots
- Fix and resubmit

## Next Steps After Android

Once Android is live, you can:
1. Submit to iOS App Store (needs Apple Developer account - $99/year)
2. Add analytics (Firebase, Amplitude)
3. Implement cloud sync with backend
4. Add push notifications
5. Monitor crashes with Sentry

## Support

- EAS Docs: https://docs.expo.dev/build/introduction/
- Play Console Help: https://support.google.com/googleplay/android-developer
- Expo Forums: https://forums.expo.dev/

Good luck with your launch! 🚀
