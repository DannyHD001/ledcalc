# Admin Setup Instructions

## Firebase Authentication Setup

To complete the admin login system, you need to:

1. **Enable Firebase Authentication:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/ledcalc-78c5c/authentication)
   - Click "Get started" if Authentication is not enabled
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider

2. **Create Admin User:**
   - Go to "Users" tab
   - Click "Add user"
   - Use email: `lightmaster70@gmail.com` (or your preferred admin email)
   - Set a secure password
   - Remember the password for login

3. **Update Admin Emails:**
   - Edit `src/services/auth.ts`
   - Update the `adminEmails` array with your admin email(s)

## How It Works

- **🔒 Small lock icon** appears in top-right corner when not logged in
- **✅ Admin badge** shows when logged in as admin
- **🛡️ Protected features**: Only admins can add/edit/delete panels and controllers
- **🔄 Auto-fallback**: Uses localStorage if Firestore fails
- **🎯 Secure**: Only users in the admin email list can access admin features

## Testing

1. Open the app: http://localhost:5173/ledcalc/
2. Click the lock icon in top-right corner
3. Login with your admin credentials
4. Add/Edit/Delete panels and controllers will now be visible
