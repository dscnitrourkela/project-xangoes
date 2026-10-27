import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-8 text-center">
            <h1 className="text-3xl font-semibold">Project Xangoes</h1>
            <p className="text-sm">Register or log in to get started.</p>
            <div className="flex gap-3">
                <Button asChild>
                    <Link href="/sign-up">Sign up</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/login">Log in</Link>
                </Button>
            </div>
        </main>
    );
}
