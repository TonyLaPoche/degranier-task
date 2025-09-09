// Script de test pour diagnostiquer l'authentification sur Vercel
const https = require('https');

const BASE_URL = 'https://degranier-task-tonylapoches-projects.vercel.app';

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`🔍 Test ${method} ${url}`);

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`✅ ${method} ${path} - Status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
          console.log(`❌ Response:`, body.substring(0, 200) + '...');
        }
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${method} ${path} - Error: ${err.message}`);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Début des tests d\'authentification sur Vercel\n');

  try {
    // Test 1: Page de connexion
    await testEndpoint('/auth/signin');

    // Test 2: Session (devrait retourner null)
    await testEndpoint('/api/auth/session');

    // Test 3: Providers
    await testEndpoint('/api/auth/providers');

    // Test 4: CSRF token
    await testEndpoint('/api/auth/csrf');

    // Test 5: Tentative de connexion (avec mauvais credentials d'abord)
    console.log('\n🔐 Test de connexion avec mauvais credentials...');
    const badCredentials = {
      email: 'test@test.com',
      password: 'wrongpassword',
      csrfToken: 'test'
    };
    await testEndpoint('/api/auth/callback/credentials', 'POST', badCredentials);

    // Test 6: Tentative de connexion avec bons credentials
    console.log('\n🔐 Test de connexion avec bons credentials...');
    const goodCredentials = {
      email: 'aurore@degranier.fr',
      password: 'admin123',
      csrfToken: 'test'
    };
    await testEndpoint('/api/auth/callback/credentials', 'POST', goodCredentials);

    console.log('\n✅ Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

runTests();
