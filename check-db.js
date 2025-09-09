const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('�� Vérification de la base de données...');
    
    // Vérifier la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`👥 Nombre d'utilisateurs: ${userCount}`);
    
    // Lister tous les utilisateurs (sans mot de passe)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Utilisateurs trouvés:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Créé: ${user.createdAt.toISOString()}`);
    });
    
    // Vérifier spécifiquement l'admin
    const admin = await prisma.user.findFirst({
      where: { email: 'aurore@degranier.fr' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });
    
    if (admin) {
      console.log(`\n👤 Admin trouvé: ${admin.email}`);
      console.log(`🔐 Hash du mot de passe présent: ${admin.password ? 'Oui' : 'Non'}`);
    } else {
      console.log('\n❌ Admin non trouvé !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
