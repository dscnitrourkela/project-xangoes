"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    type User,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { createSession, type SessionData } from "@/lib/api";
import { auth } from "@/lib/firebase";

type Mode = "login" | "sign-up";

/** Minimal Firebase auth UI: signs in, then registers the user with the server. */
export function AuthPanel({ mode }: { mode: Mode }) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<SessionData | null>(null);

    // Keep the server in sync whenever Firebase reports a signed-in user
    useEffect(
        () =>
            onAuthStateChanged(auth, async (next) => {
                setUser(next);
                setReady(true);
                if (!next) return setSession(null);

                const { status, body } = await createSession();
                if (body.success && body.data) {
                    setSession(body.data);
                    setError(null);
                } else {
                    setError(`Server rejected session (${status}): ${body.message}`);
                }
            }),
        []
    );

    async function run(action: () => Promise<unknown>) {
        setBusy(true);
        setError(null);
        try {
            await action();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setBusy(false);
        }
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        run(() =>
            mode === "sign-up"
                ? createUserWithEmailAndPassword(auth, email, password)
                : signInWithEmailAndPassword(auth, email, password)
        );
    };

    const google = () => run(() => signInWithPopup(auth, new GoogleAuthProvider()));

    if (!ready) return <p className="p-8">Loading…</p>;

    if (user) {
        return (
            <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
                <h1 className="text-2xl font-semibold">Signed in</h1>
                <p className="text-sm">
                    Firebase user: <strong>{user.email}</strong>
                </p>
                {session ? (
                    <div className="rounded-md border p-4 text-sm">
                        <p className="mb-2 font-medium">Server session</p>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(session, null, 2)}
                        </pre>
                    </div>
                ) : (
                    !error && <p className="text-sm">Contacting server…</p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button variant="outline" onClick={() => signOut(auth)}>
                    Sign out
                </Button>
            </main>
        );
    }

    const isSignUp = mode === "sign-up";
    return (
        <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
            <h1 className="text-2xl font-semibold">{isSignUp ? "Create account" : "Log in"}</h1>
            <form onSubmit={submit} className="flex flex-col gap-3">
                <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                />
                <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                />
                <Button type="submit" disabled={busy}>
                    {isSignUp ? "Sign up" : "Log in"}
                </Button>
            </form>
            <Button variant="outline" onClick={google} disabled={busy}>
                Continue with Google
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-sm">
                {isSignUp ? "Already have an account? " : "New here? "}
                <Link className="underline" href={isSignUp ? "/login" : "/sign-up"}>
                    {isSignUp ? "Log in" : "Sign up"}
                </Link>
            </p>
        </main>
    );
}
