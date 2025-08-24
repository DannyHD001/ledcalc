# Firestore Permissions Setup

## Problem
The panels aren't storing in Firestore because of security rules that block writes.

## Quick Fix Options

### Option 1: Update Firestore Rules (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ledcalc-78c5c`
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read and write access for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

### Option 2: Use Firebase CLI (Alternative)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy rules: `firebase deploy --only firestore:rules`

### Option 3: Force localStorage (Temporary)
If you want to use localStorage for now, we can disable Firestore attempts.

## Files Created
- `firestore.rules` - Security rules for Firestore
- `.firebaserc` - Firebase project configuration
- `firestore.indexes.json` - Firestore indexes configuration

## Testing
After updating the rules:
1. Refresh your app
2. Try clicking "Add Default Data" in the Database Status component
3. Check if panels and controllers are created in Firestore
