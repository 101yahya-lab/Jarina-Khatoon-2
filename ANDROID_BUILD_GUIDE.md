# Android Build Script for Phone Deployment
# ============================================

## Step 1: Verify Connected Devices
```bash
flutter devices
```
Expected output: Your Android phone should be listed as "mobile"

## Step 2: Clean and Prepare
```bash
cd mobile_app
flutter clean
rm -rf pubspec.lock
rm -rf build/
```

## Step 3: Get Dependencies
```bash
flutter pub get
flutter pub upgrade
```

## Step 4: Check for Issues
```bash
flutter analyze
flutter test
```

## Step 5: Build Debug APK (Faster, for testing)
```bash
flutter build apk --debug
```
Output: mobile_app/build/app/outputs/apk/debug/app-debug.apk

## Step 6: Install on Connected Phone
```bash
flutter install
```
OR manually:
```bash
adb install build/app/outputs/apk/debug/app-debug.apk
```

## Step 7: Run App on Phone
```bash
flutter run
```

## Alternative: Build Release APK (for Production)
```bash
flutter build apk --release
```
Output: mobile_app/build/app/outputs/apk/release/app-release.apk

Then install:
```bash
adb install build/app/outputs/apk/release/app-release.apk
```

## Permissions Already Configured:
✅ image_picker - Camera & Gallery
✅ file_picker - File Access
✅ permission_handler - Runtime Permissions
✅ shared_preferences - Local Storage

All permissions are declared in AndroidManifest.xml

## Troubleshooting:

### If phone not detected:
```bash
adb devices
adb kill-server
adb start-server
flutter devices
```

### If build fails:
```bash
flutter clean
rm -rf pubspec.lock
flutter pub get
flutter build apk --debug
```

### To see real-time logs:
```bash
flutter logs
```

### To debug on phone:
```bash
flutter run --debug
```
Then use DevTools for debugging.
