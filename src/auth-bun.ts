import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync } from 'fs';
import open from 'open';

const BASE_URL = 'http://localhost:8000';       // URL where your app is running
const LOGIN_PATH = '/your/login/path';          // Path that starts the OAuth login flow
const REDIRECT_PARAM = 'next';                  // Query param your app uses for post-login redirect
const COOKIE_NAME = 'sessionid';                // Name of the session cookie your app sets
const TEST_ENDPOINT = '/your/protected/page';   // Any page that requires authentication
const CREDENTIALS_DIR = '.your-app';            // Folder name in home directory
const CREDENTIALS_FILE = '.credentials.json';   // Credentials filename

const credPath = join(homedir(), CREDENTIALS_DIR, CREDENTIALS_FILE);

// callback server
const server = Bun.serve({
  port: 0,
  hostname: 'localhost',

  async fetch(req) {
    const cookieHeader = req.headers.get('cookie');
    const regex = new RegExp(`${COOKIE_NAME}=([^;]+)`);
    const cookie = cookieHeader?.match(regex)?.[1];

    if (!cookie) {
      return new Response('No session cookie received.');
    }

    console.log('Session cookie:', cookie);

    // Save session cookie
    mkdirSync(join(homedir(), CREDENTIALS_DIR), { recursive: true });
    await Bun.write(credPath, JSON.stringify({ [COOKIE_NAME]: cookie }, null, 2));
    console.log('Saved to:', credPath);

    // Testing auth request
    const testResponse = await globalThis.fetch(`${BASE_URL}${TEST_ENDPOINT}`, {
      headers: { Cookie: `${COOKIE_NAME}=${cookie}` },
      redirect: 'manual',
    });

    console.log('Test request status:', testResponse.status);

    setTimeout(() => {
      server.stop();
      process.exit(0);
    }, 100);

    return new Response('Logged in. You can close this tab.');
  },
});

const callbackUrl = encodeURIComponent(`http://localhost:${server.port}/callback`);
const loginUrl = `${BASE_URL}${LOGIN_PATH}?${REDIRECT_PARAM}=${callbackUrl}`;

console.log('Opening browser...');
open(loginUrl);
