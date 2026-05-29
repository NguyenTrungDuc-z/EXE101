/**
 * FacebookLogin class
 * Provides a simple wrapper around the Facebook JavaScript SDK for login functionality.
 *
 * Usage:
 *   const fbLogin = new FacebookLogin('YOUR_FACEBOOK_APP_ID');
 *   fbLogin.login()
 *     .then(authResponse => {
 *       // authResponse contains accessToken, userID, etc.
 *     })
 *     .catch(err => console.error(err));
 *
 * The Facebook App ID (key) is: 1969315983727979
 */

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default class FacebookLogin {
  private appId: string;

  /**
   * Creates a new FacebookLogin instance and loads the SDK.
   * @param appId - Facebook App ID (e.g., "1969315983727979")
   */
  constructor(appId: string) {
    this.appId = appId;
    this.loadSdk();
  }

  /**
   * Dynamically loads the Facebook SDK script if it hasn't been loaded yet.
   */
  private loadSdk(): void {
    const init = () => {
      if (window.FB) {
        window.FB.init({
          appId: this.appId,
          cookie: true,
          xfbml: true,
          version: 'v12.0',
        });
        console.log('Facebook SDK initialized');
      }
    };

    // If FB is already loaded, initialize it immediately
    if (window.FB) {
      init();
      return;
    }

    // Set the callback for when the script finishes loading
    window.fbAsyncInit = init;

    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    js.async = true;
    js.defer = true;
    document.body.appendChild(js);
  }

  /**
   * Triggers the Facebook login dialog.
   * @returns Promise that resolves with the auth response if login succeeds.
   */
  public login(): Promise<{
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    email?: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded.'));
        return;
      }

      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            resolve(response.authResponse);
          } else {
            reject(new Error('User cancelled login or did not fully authorize.'));
          }
        },
        { scope: 'email' } // Request email permission; adjust scopes as needed.
      );
    });
  }

  /**
   * Logs the user out of Facebook.
   * @returns Promise that resolves when logout is complete.
   */
  public logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded.'));
        return;
      }

      window.FB.logout(() => {
        resolve();
      });
    });
  }
}