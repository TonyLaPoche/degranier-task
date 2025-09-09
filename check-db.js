// Script pour vérifier les données admin dans la base de données
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Vérification de l\'utilisateur admin...');

    const admin = await prisma.user.findFirst({
      where: {
        email: 'aurore@degranier.fr',
        role: 'ADMIN'
      }
    });

    if (admin) {
      console.log('✅ Utilisateur admin trouvé :', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        hasPassword: !!admin.password
      });
    } else {
      console.log('❌ Aucun utilisateur admin trouvé');
    }

    // Vérifier le nombre total d'utilisateurs
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre total d'utilisateurs : ${userCount}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();