import { AppShell } from "@/components/layout/app-shell";

export default function DevLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppShell>{children}</AppShell>;
}
