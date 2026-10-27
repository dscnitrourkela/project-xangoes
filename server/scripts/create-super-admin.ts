/**
 * Bootstraps (or restores) a super admin so the first administrator can exist.
 *
 * Usage: npm run admin:seed -- you@example.com
 *
 * The email must already have a Firebase account (sign in once first); the Firebase uid
 * is looked up with the Admin SDK. Requires DATABASE_URL and FIREBASE_* in server/.env.
 */
import { adminService } from '../src/services/admin.service';

async function main() {
    const email = process.argv[2];
    if (!email || !email.includes('@')) {
        console.error('Usage: npm run admin:seed -- <email>');
        process.exitCode = 1;
        return;
    }

    const existing = await adminService.provision({ email, isSuperAdmin: true }).catch((error) => {
        if (error?.statusCode === 409) return null;
        throw error;
    });

    console.log(
        existing
            ? `Super admin ready: ${existing.email} (id ${existing.id})`
            : `${email} is already an active admin. Use PATCH /admins/:id to change their access.`
    );
}

main()
    .catch((error) => {
        console.error('Failed to create super admin:', error?.message ?? error);
        process.exitCode = 1;
    })
    .finally(() => process.exit());
