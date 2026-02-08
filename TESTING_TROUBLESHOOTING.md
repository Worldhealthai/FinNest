# FinNest Testing Troubleshooting Guide

## "Not Invited Yet" Error - Complete Fix

If you're seeing "not invited yet" when trying to test your app, follow these steps in order:

---

## Step 1: Verify App Build Exists

First, check if you've actually built and uploaded the app:

```bash
# Login to Expo (if not already logged in)
npx expo login

# Check your build history
eas build:list --platform android
```

**If you haven't built yet:**
```bash
# Build APK for testing
eas build --platform android --profile preview

# Wait for build to complete (10-20 minutes)
# EAS will provide a download link when done
```

---

## Step 2: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (FinNest)
3. Go to **Testing** → **Internal testing** (left sidebar)
4. Click **"Create new release"**
5. Upload your `.aab` or `.apk` file
6. Fill in release notes (can be simple: "Initial test release")
7. Click **"Review release"**
8. Click **"Start rollout to Internal testing"**

**⚠️ IMPORTANT:** If you don't click "Start rollout" or "Publish", the build won't be available to testers!

---

## Step 3: Add Testers Correctly

### Option A: Add Email List
1. Go to **Testing** → **Internal testing** → **Testers** tab
2. Click **"Create email list"** (if first time)
3. Give it a name (e.g., "Test Users")
4. Add email addresses (one per line):
   ```
   yourname@gmail.com
   friend@gmail.com
   ```
5. Click **"Save changes"** ← **DON'T FORGET THIS!**
6. Go back to **Testers** tab and make sure the list is selected

### Option B: Use Google Group
1. Create a Google Group first
2. Add group email in testers section
3. Add members to the Google Group

**Email Requirements:**
- Must be a valid Google account email
- Must match exactly (case-sensitive)
- Gmail works best (@gmail.com)

---

## Step 4: Share Testing Link

1. Go to **Testing** → **Internal testing** → **Testers** tab
2. Copy the **"Copy link"** URL (looks like this):
   ```
   https://play.google.com/apps/internaltest/4701234567890123456
   ```
3. Send this link to yourself/testers

---

## Step 5: Accept Invitation & Download

### For Testers:
1. Open the testing link on your phone or computer
2. Make sure you're logged into the **same Google account** used as tester email
3. Click **"Become a tester"**
4. You'll see a confirmation page
5. Click **"Download it on Google Play"** OR open Google Play Store on your phone
6. Search for "FinNest" in Play Store
7. Install the app

**⏱️ Timing:**
- After adding testers and publishing release: **Wait 5-10 minutes**
- Google needs time to process the tester list
- If it still doesn't work after 10 minutes, try the fixes below

---

## Common Issues & Fixes

### Issue 1: "Not invited yet" after 10+ minutes
**Fix:**
1. Remove your email from tester list
2. Save changes
3. Wait 2 minutes
4. Add your email back
5. Save changes again
6. Wait 5 minutes
7. Try the link again

### Issue 2: Email shows as tester but link doesn't work
**Fix:**
1. Check you're logged into the correct Google account
2. Try opening link in **incognito mode** then login
3. Make sure internal testing release is **published** (not draft)

### Issue 3: Testing link redirects to Play Store but no app
**Fix:**
- The release might not be published yet
- Go to Play Console → **Testing** → **Internal testing** → Check status
- Status should say "Available to X testers" not "Draft"

### Issue 4: No invitation email received
**Fix:**
- **This is normal!** Google doesn't always send email notifications
- Just use the testing link directly
- No email is required if you have the link and you're on the tester list

### Issue 5: "This app is not available for your account"
**Fix:**
- You're logged into wrong Google account
- The email on your device doesn't match tester list email
- Switch accounts: Play Store → Profile → Switch account

---

## Quick Checklist

Use this to verify everything is set up correctly:

- [ ] Built app using EAS (`eas build:list` shows completed build)
- [ ] Uploaded `.aab` or `.apk` to Play Console
- [ ] Created internal testing release in Play Console
- [ ] **Published/started rollout** of internal testing release (not draft)
- [ ] Added tester email to tester list
- [ ] Clicked **"Save changes"** after adding emails
- [ ] Status shows "Available to X testers" (not "Draft")
- [ ] Waited at least 5-10 minutes after publishing
- [ ] Opened testing link while logged into correct Google account
- [ ] Clicked "Become a tester" on the testing page

---

## Testing on Your Phone

**Method 1: Via Testing Link**
1. On your phone, open the testing link in Chrome
2. Make sure you're logged into the right Google account
3. Click "Become a tester"
4. Click "Download from Play Store"
5. Install app

**Method 2: Direct Play Store Search**
1. Make sure you're a tester (check Play Console)
2. Make sure release is published
3. Wait 10-15 minutes
4. Open Google Play Store on phone
5. Search "FinNest"
6. Install (should show as "Early access" or "Internal test")

---

## Still Not Working?

If you've tried everything above and it still doesn't work:

### Debug Steps:
1. **Check Play Console Status:**
   - Go to **Testing** → **Internal testing**
   - Status should say: "Available to X testers"
   - If it says "Draft" → Click "Review" → "Start rollout"

2. **Verify Build Upload:**
   - Go to **Release** → **Testing** → **Internal testing**
   - Should show a version number (e.g., 1.0.0)
   - Should show file size (e.g., 25 MB)

3. **Check Account Match:**
   - The Google account you're using on your phone must be in the tester list
   - Go to phone **Settings** → **Accounts** → Check which Google accounts are logged in
   - Make sure at least one matches the tester email

4. **Try Different Device:**
   - Sometimes device compatibility issues occur
   - Try on a different Android phone
   - Or try on Android emulator

5. **Check App Eligibility:**
   - Make sure app meets minimum SDK requirements
   - Check if your device meets minimum requirements
   - Try on a newer Android device (Android 5.0+)

---

## Alternative: Install APK Directly

If you just want to test the app without Play Store:

1. Build preview APK:
   ```bash
   eas build --platform android --profile preview
   ```

2. Download the `.apk` file from EAS

3. Transfer to your phone

4. Enable **"Install from unknown sources"** in phone settings

5. Open the `.apk` file and install

**Note:** This bypasses Play Store entirely - good for quick testing!

---

## Need Help?

If you're still stuck:
1. Check EAS build logs: `eas build:view [build-id]`
2. Review Play Console rejection reasons (if any)
3. Double-check all credentials are correct
4. Make sure Google Play Developer account is active ($25 fee paid)

---

## Next Steps After Testing Works

Once you can successfully test:
1. Test all app features thoroughly
2. Check for crashes or bugs
3. Verify Supabase backend connection works
4. Test ISA tracking functionality
5. When satisfied, promote to **Production** track
6. Submit for Google review (1-2 days)

Good luck with your testing! 🚀
