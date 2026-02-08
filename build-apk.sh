#!/bin/bash
# Build APK for direct installation
# This script builds a preview APK that can be installed directly on Android devices

echo "🚀 Building FinNest APK for direct installation..."
echo ""
echo "Build Profile: preview"
echo "Platform: Android"
echo "Output: APK file (can be installed directly)"
echo ""

# Check if logged in
if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please run: eas login"
    echo "Then run this script again"
    exit 1
fi

echo "✅ Logged in to EAS"
echo ""

# Start the build
eas build --platform android --profile preview

echo ""
echo "✅ Build command completed!"
echo ""
echo "Next steps:"
echo "1. Wait for the build to finish (5-15 minutes)"
echo "2. Click the build link to download the APK"
echo "3. Install on your Android device"
echo ""
echo "Or visit: https://expo.dev/accounts/kndevapp/projects/finnest/builds"
