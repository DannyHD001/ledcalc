import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

class AuthService {
  private adminEmails = [
    'lightmaster70@gmail.com', // Add your admin email here
    'oledaniel@mac.com',
    // Add more admin emails as needed
  ];

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    try {
      await signOut(auth);
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
    return auth.currentUser;
  }

  // Check if current user is admin
  isCurrentUserAdmin(): boolean {
    return this.isAdminUser(this.getCurrentUser());
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null, isAdmin: boolean) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      const isAdmin = this.isAdminUser(user);
      callback(user, isAdmin);
    });
  }
}

export const authService = new AuthService();
