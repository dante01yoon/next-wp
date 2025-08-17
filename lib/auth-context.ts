// WordPress User Authentication Context
// Handles user authentication state and provides user info for Tutor LMS

export interface WordPressUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  roles: string[];
  capabilities: string[];
  meta?: Record<string, any>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: WordPressUser | null;
  token?: string;
  nonce?: string;
  isLoading: boolean;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

// ============= Mock Authentication (for development) =============

/**
 * Mock user for development/testing
 */
const MOCK_USER: WordPressUser = {
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  display_name: 'Demo User',
  first_name: 'Demo',
  last_name: 'User',
  avatar_url: 'https://www.gravatar.com/avatar/default?s=96',
  roles: ['subscriber'],
  capabilities: ['read'],
  meta: {}
};

// ============= Local Storage Keys =============

const AUTH_STORAGE_KEYS = {
  USER: 'wp_user',
  TOKEN: 'wp_token',
  NONCE: 'wp_nonce',
  EXPIRES: 'wp_auth_expires',
} as const;

// ============= Storage Utilities =============

function getStorageData(key: string): any {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading auth data from localStorage:', error);
    return null;
  }
}

function setStorageData(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing auth data to localStorage:', error);
  }
}

function removeStorageData(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ============= Authentication Class =============

class WordPressAuth {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: undefined,
    nonce: undefined,
    isLoading: false,
  };

  private listeners: Array<(state: AuthState) => void> = [];
  private apiBase: string;

  constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || '';
    this.initializeAuth();
  }

  // ============= State Management =============

  private initializeAuth(): void {
    if (typeof window === 'undefined') return;

    const user = getStorageData(AUTH_STORAGE_KEYS.USER);
    const token = getStorageData(AUTH_STORAGE_KEYS.TOKEN);
    const nonce = getStorageData(AUTH_STORAGE_KEYS.NONCE);
    const expires = getStorageData(AUTH_STORAGE_KEYS.EXPIRES);

    // Check if auth is expired
    if (expires && new Date(expires) < new Date()) {
      this.clearAuth();
      return;
    }

    if (user && (token || nonce)) {
      this.authState = {
        isAuthenticated: true,
        user,
        token,
        nonce,
        isLoading: false,
      };
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // ============= Authentication Methods =============

  public async login(credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      // For development, use mock authentication
      if (process.env.NODE_ENV === 'development' && credentials.username === 'demo') {
        return this.mockLogin(credentials);
      }

      // Real WordPress authentication
      const response = await fetch(`${this.apiBase}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      const user: WordPressUser = {
        id: data.user_id,
        username: data.user_login,
        email: data.user_email,
        display_name: data.user_display_name,
        first_name: data.user_first_name,
        last_name: data.user_last_name,
        avatar_url: data.avatar_url,
        roles: data.roles || [],
        capabilities: data.capabilities || [],
      };

      this.setAuthData(user, data.token, undefined, data.expires);

      return { success: true };
    } catch (error) {
      this.authState.isLoading = false;
      this.notifyListeners();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  private async mockLogin(credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.password === 'demo123') {
      this.setAuthData(MOCK_USER, 'mock_token_' + Date.now(), 'mock_nonce_' + Date.now());
      return { success: true };
    } else {
      this.authState.isLoading = false;
      this.notifyListeners();
      return { success: false, error: 'Invalid credentials' };
    }
  }

  public async logout(): Promise<void> {
    this.clearAuth();
  }

  public async refreshAuth(): Promise<boolean> {
    if (!this.authState.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiBase}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.authState.token}`,
        },
      });

      if (!response.ok) {
        this.clearAuth();
        return false;
      }

      const userData = await response.json();
      
      const user: WordPressUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        display_name: userData.name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar_url: userData.avatar_urls?.['96'],
        roles: userData.roles || [],
        capabilities: userData.capabilities || [],
        meta: userData.meta,
      };

      this.authState.user = user;
      setStorageData(AUTH_STORAGE_KEYS.USER, user);
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      this.clearAuth();
      return false;
    }
  }

  // ============= Helper Methods =============

  private setAuthData(
    user: WordPressUser, 
    token?: string, 
    nonce?: string, 
    expires?: string
  ): void {
    this.authState = {
      isAuthenticated: true,
      user,
      token,
      nonce,
      isLoading: false,
    };

    // Store in localStorage
    setStorageData(AUTH_STORAGE_KEYS.USER, user);
    if (token) setStorageData(AUTH_STORAGE_KEYS.TOKEN, token);
    if (nonce) setStorageData(AUTH_STORAGE_KEYS.NONCE, nonce);
    
    // Set expiry (default 24 hours)
    const expiryDate = expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setStorageData(AUTH_STORAGE_KEYS.EXPIRES, expiryDate);

    this.notifyListeners();
  }

  private clearAuth(): void {
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: undefined,
      nonce: undefined,
      isLoading: false,
    };

    // Clear localStorage
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      removeStorageData(key);
    });

    this.notifyListeners();
  }

  // ============= Getters =============

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public getUser(): WordPressUser | null {
    return this.authState.user;
  }

  public getCredentials(): { token?: string; nonce?: string } {
    return {
      token: this.authState.token,
      nonce: this.authState.nonce,
    };
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public getUserId(): number | undefined {
    return this.authState.user?.id;
  }
}

// ============= Global Instance =============

let authInstance: WordPressAuth | null = null;

export function getAuthInstance(): WordPressAuth {
  if (!authInstance) {
    authInstance = new WordPressAuth();
  }
  return authInstance;
}

// ============= Convenience Functions =============

export function getCurrentUser(): WordPressUser | null {
  return getAuthInstance().getUser();
}

export function getCurrentUserId(): number | undefined {
  return getAuthInstance().getUserId();
}

export function isUserAuthenticated(): boolean {
  return getAuthInstance().isAuthenticated();
}

export function getAuthCredentials(): { token?: string; nonce?: string } {
  return getAuthInstance().getCredentials();
}

export function subscribeToAuth(listener: (state: AuthState) => void): () => void {
  return getAuthInstance().subscribe(listener);
}

export async function loginUser(credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> {
  return getAuthInstance().login(credentials);
}

export async function logoutUser(): Promise<void> {
  return getAuthInstance().logout();
}

export async function refreshUserAuth(): Promise<boolean> {
  return getAuthInstance().refreshAuth();
}

export { WordPressAuth };
