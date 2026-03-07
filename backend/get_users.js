const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany({ select: { email: true } });
    console.log(users.map(u => u.email));
    await prisma.$disconnect();
}
checkUsers();
