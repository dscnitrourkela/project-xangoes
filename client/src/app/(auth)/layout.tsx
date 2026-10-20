import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            {children}
        </div>
    );
}
