const { PrismaClient } = require('@prisma/client');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const fs = require('fs');

const prisma = new PrismaClient();

async function setup2FA() {
    const email = process.argv[2] || 'tejas@keystonedatahq.com';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }

        // Generate a new 2FA secret
        const secret = speakeasy.generateSecret({
            name: `KeystoneDataHQ (${user.email})`,
            issuer: 'KeystoneDataHQ'
        });

        // Update the user record
        await prisma.user.update({
            where: { email },
            data: {
                twoFactorEnabled: true,
                twoFactorMethod: 'APP',
                twoFactorSecret: secret.base32
            }
        });

        // Generate QR code data URL
        const dataUrl = await qrcode.toDataURL(secret.otpauth_url);

        // Create an HTML file to display the QR code
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>KeystoneDataHQ 2FA Setup</title>
            <style>
                body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f9fafb; }
                .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                img { border: 4px solid #f3f4f6; border-radius: 0.5rem; margin: 1rem 0; }
                .secret { font-family: monospace; background: #f3f4f6; padding: 0.5rem; border-radius: 0.5rem; margin-top: 1rem; font-size: 1.2rem; letter-spacing: 0.1em;}
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Scan this QR Code</h2>
                <p>Open Google Authenticator and scan this image:</p>
                <img src="${dataUrl}" alt="2FA QR Code" width="256" height="256" />
                <p>Or enter this secret manually:</p>
                <div class="secret">${secret.base32}</div>
                <p style="margin-top: 2rem; color: #6b7280; font-size: 0.875rem;">You can close this file when done.</p>
            </div>
        </body>
        </html>
        `;

        fs.writeFileSync('2fa_qr.html', htmlContent);

        console.log(`✅ Success! 2FA enabled for ${email}.`);
        console.log(`--------------------------------------------------`);
        console.log(`Secret Key: ${secret.base32}`);
        console.log(`--------------------------------------------------`);
        console.log(`I have generated a file named "2fa_qr.html" in the backend folder.`);
        console.log(`Please open: c:\\KeystoneData\\backend\\2fa_qr.html in your browser to scan the code.`);

    } catch (err) {
        console.error('❌ Error setting up 2FA:', err);
    } finally {
        await prisma.$disconnect();
    }
}

setup2FA();
