import type { DecodedIdToken } from 'firebase-admin/auth';

import type { Admin, User } from '@/db/schema';

/**
 * Identity attached to a request by the `authenticate` middleware.
 * - `firebase`: verified Firebase ID token claims
 * - `user`: participant record for the Firebase identity (null until provisioned)
 * - `admin`: admin record for the Firebase identity (null if none; may be soft-deleted)
 */
export interface AuthContext {
    firebase: DecodedIdToken;
    user: User | null;
    admin: Admin | null;
}
