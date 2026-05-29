/**
 * GoogleLogin class
 * Renders Google's official Sign-In button and handles authentication.
 *
 * Usage:
 *   const googleLogin = new GoogleLogin('YOUR_GOOGLE_CLIENT_ID');
 *   // After DOM is ready:
 *   googleLogin.renderButton('element-id');
 *   // The button handles sign-in automatically when clicked.
 */

declare global {
  interface Window {
    google?: any;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default class GoogleLogin {
  private clientId: string;
  private onLoginSuccess: ((response: { credential: string; select_by: string }) => void) | null = null;
  private onLoginError: ((error: Error) => void) | null = null;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.loadSdk();
  }

  /**
   * Sets the callback for when login succeeds.
   */
  public setOnLoginSuccess(callback: (response: { credential: string; select_by: string }) => void): void {
    this.onLoginSuccess = callback;
  }

  /**
   * Sets the callback for when login fails.
   */
  public setOnLoginError(callback: (error: Error) => void): void {
    this.onLoginError = callback;
  }

  /**
   * Renders the Google Sign-In button into the specified element.
   * When the user clicks this button, Google's sign-in flow is triggered automatically.
   */
  public renderButton(elementId: string): void {
    const tryRender = () => {
      if (!window.google) {
        console.error('Google SDK not loaded yet');
        return;
      }

      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID "${elementId}" not found`);
        return;
      }

      // Initialize with callback
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          console.log('Google credential response received');
          if (response.credential && this.onLoginSuccess) {
            this.onLoginSuccess({
              credential: response.credential,
              select_by: response.select_by || 'btn',
            });
          } else if (!response.credential && this.onLoginError) {
            this.onLoginError(new Error('Không nhận được thông tin đăng nhập từ Google.'));
          }
        },
      });

      // Get the width of the container
      const width = element.offsetWidth || 400;

      // Render the official Google button
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: width,
      });

      console.log('Google Sign-In button rendered successfully');
    };

    // If SDK is already loaded, render immediately
    if (window.google) {
      tryRender();
    } else {
      // Wait for SDK to load, then render
      const checkInterval = setInterval(() => {
        if (window.google) {
          clearInterval(checkInterval);
          tryRender();
        }
      }, 100);

      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }

  /**
   * Dynamically loads the Google Sign-In SDK script.
   */
  private loadSdk(): void {
    if (window.google) return;
    if (document.getElementById('google-signin-script')) return;

    const script = document.createElement('script');
    script.id = 'google-signin-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  /**
   * Decodes the JWT credential to extract user information.
   */
  public decodeCredential(credential: string): any {
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode credential:', error);
      return null;
    }
  }

  /**
   * Logs the user out of Google.
   */
  public logout(): Promise<void> {
    return new Promise((resolve) => {
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      resolve();
    });
  }
}