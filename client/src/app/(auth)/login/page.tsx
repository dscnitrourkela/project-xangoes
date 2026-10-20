"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { loginSchema, LoginInput } from "@/types/api";
import { ApiClientError } from "@/lib/api-client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [formData, setFormData] = useState<LoginInput>({
        email: "",
        password: "",
        role: "user",
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const redirectUrl = searchParams.get("redirect");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        if (formError) setFormError(null);
    };

    const handleQuickFill = (role: "user" | "admin") => {
        if (role === "admin") {
            setFormData({
                email: "admin@xangoes.dscnitrourkela.org",
                password: "Password123",
                role: "admin",
            });
        } else {
            setFormData({
                email: "student@nitrourkela.ac.in",
                password: "Password123",
                role: "user",
            });
        }
        setFieldErrors({});
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFieldErrors({});

        // Client-side Zod validation
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const fieldName = issue.path[0];
                if (fieldName && !formattedErrors[String(fieldName)]) {
                    formattedErrors[String(fieldName)] = issue.message;
                }
            }
            setFieldErrors(formattedErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const loggedInUser = await login(result.data);

            // Redirect based on role or explicit redirect query parameter
            if (redirectUrl) {
                router.push(redirectUrl);
            } else if (
                loggedInUser.role === "admin" ||
                loggedInUser.role === "super_admin"
            ) {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err) {
            if (err instanceof ApiClientError) {
                if (Object.keys(err.fieldErrors).length > 0) {
                    setFieldErrors(err.fieldErrors);
                }
                setFormError(err.message || "Failed to sign in. Please verify your credentials.");
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError("An unexpected error occurred while logging in.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader className="text-center">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                    Sign in to your account with your credentials
                </CardDescription>
            </CardHeader>

            <CardContent>
                {formError && (
                    <div
                        role="alert"
                        className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2"
                    >
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>{formError}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Input
                        id="login-email"
                        name="email"
                        type="email"
                        label="Email address"
                        placeholder="name@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        error={fieldErrors.email}
                        required
                        disabled={isSubmitting}
                        autoComplete="email"
                    />

                    <Input
                        id="login-password"
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        isPassword
                        value={formData.password}
                        onChange={handleChange}
                        error={fieldErrors.password}
                        required
                        disabled={isSubmitting}
                        autoComplete="current-password"
                    />

                    <div className="space-y-1.5">
                        <label
                            htmlFor="login-role"
                            className="text-sm font-medium leading-none text-foreground"
                        >
                            Role Preference
                        </label>
                        <select
                            id="login-role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="user">Participant / Student (User)</option>
                            <option value="admin">Fest Organizer / Lead (Admin)</option>
                            <option value="super_admin">Institute Authority (Super Admin)</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Selecting Admin or Super Admin routes you to the Admin Dashboard upon signing in.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-2 font-medium"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                {/* Quick fill buttons for testing different roles */}
                <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground mb-2">
                        Quick Fill For Testing:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickFill("user")}
                            className="text-xs h-8"
                        >
                            <UserCheck className="mr-1 h-3.5 w-3.5" />
                            Fill as User
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickFill("admin")}
                            className="text-xs h-8"
                        >
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Fill as Admin
                        </Button>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border py-4">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="font-semibold text-foreground hover:underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <Link
                        href="/"
                        className="inline-block text-2xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
                    >
                        Project Xangoes
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Fest & Event Management Portal
                    </p>
                </div>

                <Suspense
                    fallback={
                        <Card className="p-8 text-center text-sm text-muted-foreground">
                            Loading login form...
                        </Card>
                    }
                >
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
