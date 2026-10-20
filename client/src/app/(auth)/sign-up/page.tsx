"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

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
import { signUpSchema, SignUpInput } from "@/types/api";
import { ApiClientError } from "@/lib/api-client";

export default function SignUpPage() {
    const router = useRouter();
    const { signup } = useAuth();

    const [formData, setFormData] = useState<SignUpInput>({
        name: "",
        email: "",
        mobile: "",
        role: "user",
        password: "",
        confirmPassword: "",
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        if (formError) setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFieldErrors({});

        // Client-side Zod validation
        const result = signUpSchema.safeParse(formData);
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
            const createdUser = await signup(result.data);

            // Redirect based on role
            if (
                createdUser.role === "admin" ||
                createdUser.role === "super_admin"
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
                setFormError(
                    err.message || "Failed to create account. Please check your information."
                );
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError("An unexpected error occurred during sign up.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center space-y-2">
                    <Link
                        href="/"
                        className="inline-block text-2xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
                    >
                        Project Xangoes
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Create your account to get started
                    </p>
                </div>

                <Card className="shadow-md">
                    <CardHeader className="text-center">
                        <CardTitle>Create an Account</CardTitle>
                        <CardDescription>
                            Join college fests, register for events, and manage activities
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
                                id="signup-name"
                                name="name"
                                label="Full Name"
                                placeholder="Jane Doe"
                                value={formData.name}
                                onChange={handleChange}
                                error={fieldErrors.name}
                                required
                                disabled={isSubmitting}
                                autoComplete="name"
                            />

                            <Input
                                id="signup-email"
                                name="email"
                                type="email"
                                label="Email address"
                                placeholder="jane@nitrourkela.ac.in"
                                value={formData.email}
                                onChange={handleChange}
                                error={fieldErrors.email}
                                required
                                disabled={isSubmitting}
                                autoComplete="email"
                            />

                            <Input
                                id="signup-mobile"
                                name="mobile"
                                type="tel"
                                label="Mobile Number"
                                placeholder="9876543210"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={fieldErrors.mobile}
                                helperText="10-digit primary mobile contact"
                                required
                                disabled={isSubmitting}
                                autoComplete="tel"
                            />

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="signup-role"
                                    className="text-sm font-medium leading-none text-foreground flex items-center justify-between"
                                >
                                    <span>
                                        Account Role <span className="text-destructive">*</span>
                                    </span>
                                </label>
                                <select
                                    id="signup-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="user">Participant / Student</option>
                                    <option value="admin">Fest Organizer / Admin</option>
                                </select>
                            </div>

                            <Input
                                id="signup-password"
                                name="password"
                                label="Password"
                                placeholder="••••••••"
                                isPassword
                                value={formData.password}
                                onChange={handleChange}
                                error={fieldErrors.password}
                                helperText="At least 8 chars, 1 uppercase, 1 lowercase, 1 number"
                                required
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />

                            <Input
                                id="signup-confirm-password"
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="••••••••"
                                isPassword
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={fieldErrors.confirmPassword}
                                required
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />

                            <Button
                                type="submit"
                                className="w-full mt-2 font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center border-t border-border py-4">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-foreground hover:underline underline-offset-4"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
