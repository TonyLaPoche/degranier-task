// Script pour tester l'accès aux pages de dashboard
const puppeteer = require('playwright')

async function testDashboard() {
  const browser = await puppeteer.chromium.launch()
  const page = await browser.newPage()

  try {
    console.log('🧪 Test des pages de dashboard...')

    // Test de la page d'accueil
    console.log('📄 Test de la page d\'accueil...')
    await page.goto('http://localhost:3000')
    const title = await page.title()
    console.log(`✅ Page d'accueil: ${title}`)

    // Test de la page de connexion
    console.log('🔐 Test de la page de connexion...')
    await page.goto('http://localhost:3000/auth/signin')
    const signinTitle = await page.title()
    console.log(`✅ Page de connexion: ${signinTitle}`)

    console.log('🎉 Tests terminés avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  } finally {
    await browser.close()
  }
}

testDashboard()
