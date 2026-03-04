# cli-auth-spike

Spike (proof of concept) for CLI authentication via browser-based OAuth login.

Proves that a CLI tool can authenticate a user through the browser and obtain a session cookie — the same pattern used by [GitHub CLI](https://github.com/cli/cli), Firebase CLI, and other tools.

## How it works

1. CLI starts a temporary HTTP server on a random local port
2. CLI opens the browser with the app's login page
3. User logs in (e.g. via Auth0, Google, etc.)
4. After login, the app redirects to the CLI's local server
5. CLI intercepts the session cookie from the redirect
6. CLI saves the cookie to a credentials file
7. CLI verifies the cookie with an authenticated request to a protected page

## Setup

```bash
npm install
```

## Configuration

Edit the constants at the top of `src/auth.ts`:

```typescript
const BASE_URL = 'http://localhost:8000';       // URL where your app is running
const LOGIN_PATH = '/your/login/path';          // Path that starts the OAuth login flow
const REDIRECT_PARAM = 'next';                  // Query param your app uses for post-login redirect
const COOKIE_NAME = 'sessionid';                // Name of the session cookie your app sets
const TEST_ENDPOINT = '/your/protected/page';   // Any page that requires authentication
const CREDENTIALS_DIR = '.your-app';            // Folder name in home directory
const CREDENTIALS_FILE = '.credentials.json';   // Credentials filename
```

## Usage

1. Start your app locally
2. Fill in the configuration values
3. Run the spike:

```bash
npx ts-node src/auth.ts
```

4. Log in when the browser opens
5. Check the output — `Test request status: 200` means success

## Requirements

- Node.js 18+
- A web app that:
  - Uses browser-based OAuth login (Auth0, Google, etc.)
  - Sets a session cookie after login
  - Supports a redirect parameter (e.g. `?next=URL`) after login

## How does the cookie reach the CLI?

The app sets a session cookie on the `localhost` domain. When the app redirects to the CLI's local server (also on `localhost`, just a different port), the browser includes the cookie in the request. The CLI reads it from the request headers.

## Next steps

- Integrate this flow into a proper CLI tool
- Handle session expiry and re-authentication
