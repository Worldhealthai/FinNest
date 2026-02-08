# Build & Install APK Directly - Quick Guide

This guide shows you how to build and install the FinNest APK directly on your Android device for testing, without going through the Play Store.

## Prerequisites

- ✅ EAS CLI installed (already set up)
- ✅ EAS account authenticated
- 📱 Android device with USB debugging enabled OR access to download APK

## Step 1: Build the APK

Run one of these commands depending on your needs:

### Option A: Preview Build (Recommended for Testing)
```bash
eas build --platform android --profile preview
```

**What it does:**
- Builds an APK file (not AAB)
- No signing required for Play Store
- Can be installed directly on any device
- Perfect for testing

### Option B: Production Build
```bash
eas build --platform android --profile production
```

**What it does:**
- Production-ready APK
- Optimized for release
- Can still be installed directly

### Option C: Development Build
```bash
eas build --platform android --profile development
```

**What it does:**
- Includes development tools
- Useful for debugging
- Can connect to Metro bundler

## Step 2: Wait for Build to Complete

EAS Build will:
1. Upload your code to Expo servers
2. Build the APK in the cloud
3. Provide you with a download link

**Build time:** Usually 5-15 minutes

You'll see output like:
```
✔ Build finished
https://expo.dev/accounts/kndevapp/projects/finnest/builds/XXXXX
```

## Step 3: Download the APK

Once the build completes:

1. Click the build link in your terminal
2. Or visit: https://expo.dev/accounts/kndevapp/projects/finnest/builds
3. Find your latest build
4. Click "Download" to get the APK file

## Step 4: Install on Your Device

### Method A: Direct Download on Device
1. Open the download link on your Android device
2. Click "Download APK"
3. Open the downloaded file
4. Tap "Install" (you may need to enable "Install from Unknown Sources")

### Method B: Install via ADB (USB)
```bash
# Download APK to your computer first
adb install path/to/finnest.apk

# Or if device is connected:
adb install ~/Downloads/finnest.apk
```

### Method C: Share via QR Code
1. On the build page, click "QR Code"
2. Scan with your Android device
3. Download and install

## Step 5: Enable Installation from Unknown Sources

If you get a security warning:

1. Go to **Settings** → **Security**
2. Enable **"Unknown Sources"** or **"Install Unknown Apps"**
3. Allow installation from your browser/file manager
4. Return and install the APK

On newer Android versions (8.0+):
1. When prompted, tap **"Settings"**
2. Enable **"Allow from this source"**
3. Return and install

## Troubleshooting

### Build Fails
- Check your EAS authentication: `eas whoami`
- Re-login if needed: `eas login`
- Check app.json for configuration errors

### Can't Install APK
- Enable "Unknown Sources" in device settings
- Make sure you downloaded the complete APK file
- Try uninstalling any previous version first

### App Crashes on Launch
- Check the build logs in EAS dashboard
- Try a development build for better error messages
- Check that all required permissions are granted

## Quick Commands Reference

```bash
# Check EAS authentication
eas whoami

# Login to EAS
eas login

# Build preview APK
eas build --platform android --profile preview

# View all builds
eas build:list

# View specific build details
eas build:view <build-id>

# Check build status
eas build:list --status in-progress
```

## Build Profiles Explained

Your `eas.json` has these profiles:

- **preview**: Internal APK for testing (fastest for direct install)
- **production**: Production APK (optimized, ready for release)
- **production-aab**: AAB format for Play Store submission
- **development**: Development build with debugging tools

## Next Steps

After installing and testing:
1. If everything works → proceed with Play Store deployment
2. If issues found → fix them and rebuild
3. Share APK with testers → send them the download link

## Resources

- EAS Build Dashboard: https://expo.dev/accounts/kndevapp/projects/finnest/builds
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Android Debug Bridge (ADB): https://developer.android.com/tools/adb
