import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, isFirebaseAvailable } from './firebase';

class AuthService {
  private adminEmails = [
    'lightmaster70@gmail.com', // Add your admin email here
    'oledaniel@mac.com',
    // Add more admin emails as needed
  ];

  // Check if Firebase Auth is available
  private isAuthAvailable(): boolean {
    return isFirebaseAvailable && auth !== null;
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> {
    if (!this.isAuthAvailable()) {
      return { success: false, error: 'Authentication not available. Running in offline mode.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);
      const isAdmin = this.isAdminUser(userCredential.user);
      
      if (!isAdmin) {
        await this.signOut();
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
      
      console.log('✅ Admin logged in successfully:', userCredential.user.email);
      return { success: true, isAdmin: true };
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      let errorMessage = 'Login failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (!this.isAuthAvailable()) {
      console.log('⚠️ Sign out attempted but auth not available');
      return;
    }

    try {
      await signOut(auth!);
      console.log('✅ Admin logged out successfully');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  }

  // Check if user is admin
  isAdminUser(user: User | null): boolean {
    if (!user || !user.email) return false;
    return this.adminEmails.includes(user.email.toLowerCase());
  }

  // Get current user
  getCurrentUser(): User | null {
    if (!this.isAuthAvailable()) {
      return null;
    }
    return auth!.currentUser;
  }

  // Check if current user is admin
  isCurrentUserAdmin(): boolean {
    return this.isAdminUser(this.getCurrentUser());
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null, isAdmin: boolean) => void): () => void {
    if (!this.isAuthAvailable()) {
      // If auth is not available, immediately call callback with null user
      callback(null, false);
      // Return a no-op unsubscribe function
      return () => {};
    }

    return onAuthStateChanged(auth!, (user) => {
      const isAdmin = this.isAdminUser(user);
      callback(user, isAdmin);
    });
  }
}

export const authService = new AuthService();
