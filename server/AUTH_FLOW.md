# 🔐 Authentication Flow

This document outlines the authentication flow for **Project Xangoes**. We use Firebase Authentication and handle all auth operations securely on the backend with the Firebase Admin SDK.

---

## ✅ Overview

We use Firebase for user authentication and the Firebase Admin SDK on the backend to verify tokens, manage users, and control access. The frontend's primary role is to get an ID token from Firebase. All other operations, including token verification, session management, and authorization, are handled server-side.

---

## 🧩 Key Concepts

| Component                        | Description                                                                    |
| :------------------------------- | :----------------------------------------------------------------------------- |
| **Firebase Auth**                | Handles user sign-up/sign-in and issues JWT ID tokens.                         |
| **Firebase Admin SDK**           | Verifies ID tokens and manages users on the backend.                           |
| **JWT Token**                    | Sent from the frontend to the backend in the `Authorization` header.           |
| **Role-based Access** (optional) | Implemented by storing user roles in a database or via Firebase custom claims. |

---

## 🔁 Auth Flow: Step by Step

#### 1. 🔑 User Signs In on Frontend

A user logs in via the Firebase SDK (`firebase/auth`) using Email/Password, Google, or another configured provider. Upon successful authentication, Firebase returns an ID Token (JWT).

```ts
const idToken = await firebase.auth().currentUser.getIdToken();
```

#### 2. 📬 Frontend Sends Token to Backend

The token is attached to every request to protected backend routes in the `Authorization` header.

```http
Authorization: Bearer <ID_TOKEN>
```

#### 3. ✅ Backend Verifies Token

For every protected backend route, the server verifies the ID token.

```ts
import { getAuth } from "firebase-admin/auth";

const verifyFirebaseToken = async (token: string) => {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken; // contains uid, email, etc.
};
```

If the token is invalid or expired, the server should return a `401 Unauthorized` response.

#### 4. 👤 User Record Sync (Optional but Recommended)

After verification, check if the user exists in your PostgreSQL database. If not, create a new record in the `users` table using details from the `decodedToken`.

```ts
const { uid, email, name, picture } = decodedToken;
```

This allows you to associate app-specific data (e.g., registrations, transactions) with the user.

#### 5. 🔒 Protecting Routes (Middleware)

Use a Hono middleware to extract and verify the Firebase token for protected API routes.

```ts
app.use("/api/*", async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.text("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = await getAuth().verifyIdToken(token);
        c.set("user", decoded);
        await next();
    } catch {
        return c.text("Invalid or expired token", 401);
    }
});
```

Now, in any subsequent handler, you can access the user's data:

```ts
const user = c.get("user"); // contains uid, email, etc.
```

---

## 🧠 Optional Features

-   **Custom Claims**: Implement role-based access control (e.g., `admin: true`) using Firebase custom claims.
-   **Refresh Tokens**: Managed entirely by the Firebase SDK, so you don't need to handle them manually.
-   **Revoke Access**: Use `getAuth().revokeRefreshTokens(uid)` to revoke a user's session.

---

## 🔐 Security Notes

-   All token verification must be performed exclusively on the backend.
-   Never trust user information sent directly from the frontend without verification.
-   Use HTTPS and secure storage for your `.env` secrets and Firebase service account credentials.

---

## 🔧 Dev Setup

Ensure your `.env` file contains the Firebase Admin credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## 📚 References

-   [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
-   [Firebase ID Token Verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
