import * as http from 'http';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import open from 'open';

const BASE_URL = 'http://localhost:8000';       // URL where your app is running
const LOGIN_PATH = '/your/login/path';          // Path that starts the OAuth login flow
const REDIRECT_PARAM = 'next';                  // Query param your app uses for post-login redirect
const COOKIE_NAME = 'sessionid';                // Name of the session cookie your app sets
const TEST_ENDPOINT = '/your/protected/page';   // Any page that requires authentication
const CREDENTIALS_DIR = '.your-app';            // Folder name in home directory
const CREDENTIALS_FILE = '.credentials.json';   // Credentials filename

const credPath = path.join(os.homedir(), CREDENTIALS_DIR, CREDENTIALS_FILE);

// callback server
const server = http.createServer(async (req, res) => {
  const regex = new RegExp(`${COOKIE_NAME}=([^;]+)`);
  const cookie = req.headers.cookie?.match(regex)?.[1];

  if (!cookie) {
    res.end('No session cookie received.');
    return;
  }

  console.log('Session cookie:', cookie);

  // Save session cookie
  fs.mkdirSync(path.dirname(credPath), { recursive: true });
  fs.writeFileSync(credPath, JSON.stringify({ [COOKIE_NAME]: cookie }, null, 2));
  console.log('Saved to:', credPath);

  // Testing auth request
  const response = await fetch(`${BASE_URL}${TEST_ENDPOINT}`, {
    headers: { Cookie: `${COOKIE_NAME}=${cookie}` },
    redirect: 'manual',
  });

  console.log('Test request status:', response.status);
  res.end('Logged in. You can close this tab.');
  server.close();
  process.exit(0);
});


server.listen(0, 'localhost', () => {
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('No address');

  const port = (addr as { port: number }).port;
  const callbackUrl = encodeURIComponent(`http://localhost:${port}/callback`);
  const loginUrl = `${BASE_URL}${LOGIN_PATH}?${REDIRECT_PARAM}=${callbackUrl}`;

  console.log('Opening browser...');
  open(loginUrl);
});
