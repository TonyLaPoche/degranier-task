// Script de diagnostic pour identifier l'erreur 500
const http = require('http')

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
}

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  console.log(`Headers:`, res.headers)

  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    if (res.statusCode === 500) {
      console.log('\nErreur 500 détectée!')
      console.log('Contenu de la réponse:')
      console.log(data.substring(0, 1000))
    } else {
      console.log('✅ Réponse OK')
    }
  })
})

req.on('error', (e) => {
  console.error(`Erreur de requête: ${e.message}`)
})

req.end()
