"use client";

import Link from "next/link";
import {
    Calendar,
    CreditCard,
    Plus,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { H1, H4, Muted, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOverviewPage() {
    const { user, role } = useAuth();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <H1>Admin Overview</H1>
                    <P className="text-muted-foreground mt-1">
                        Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here is the operational summary for Project Xangoes.
                    </P>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                        Role: {role.toUpperCase()}
                    </Badge>
                    <Button asChild size="sm">
                        <Link href="/admin/fests">
                            <Plus className="mr-1.5 h-4 w-4" />
                            New Fest
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card interactive>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Fests
                        </CardTitle>
                        <Sparkles className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">3</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                            <span>Innovision, ISM, Nitrutsav</span>
                        </p>
                    </CardContent>
                </Card>

                <Card interactive>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Scheduled Events
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">28</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across 12 technical and cultural clubs
                        </p>
                    </CardContent>
                </Card>

                <Card interactive>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Registrations
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">1,420</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            842 verified &bull; 578 awaiting check-in
                        </p>
                    </CardContent>
                </Card>

                <Card interactive>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Verified Payments
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">₹3,84,500</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            94% verification completion rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Management Shortcuts</CardTitle>
                        <CardDescription>
                            Jump directly to core administrative workflows
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/admin/fests"
                            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors duration-200 block"
                        >
                            <H4 className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Fest Management
                            </H4>
                            <Muted className="text-xs mt-1">
                                Configure festival dates, registration fees, and status
                            </Muted>
                        </Link>

                        <Link
                            href="/admin/events"
                            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors duration-200 block"
                        >
                            <H4 className="text-base font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Events Catalog
                            </H4>
                            <Muted className="text-xs mt-1">
                                Setup rules, prize pools, and point-of-contact lists
                            </Muted>
                        </Link>

                        <Link
                            href="/admin/registrations"
                            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors duration-200 block"
                        >
                            <H4 className="text-base font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                Registrations
                            </H4>
                            <Muted className="text-xs mt-1">
                                View student participants and export team registries
                            </Muted>
                        </Link>

                        <Link
                            href="/admin/transactions"
                            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors duration-200 block"
                        >
                            <H4 className="text-base font-semibold flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Transactions
                            </H4>
                            <Muted className="text-xs mt-1">
                                Verify screenshots and external payment IDs
                            </Muted>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System &amp; Permission Status</CardTitle>
                        <CardDescription>
                            Active admin session environment and backend endpoints
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/20">
                            <div>
                                <p className="text-sm font-medium">Logged In Operator</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                            <Badge variant="secondary">{role}</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/20">
                            <div>
                                <p className="text-sm font-medium">Server API Base</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {process.env.NEXT_PUBLIC_API_URL || "/api"}
                                </p>
                            </div>
                            <Badge variant="success">Connected</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/20">
                            <div>
                                <p className="text-sm font-medium">Auth Envelope</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    ApiResponse&lt;AuthResponseData&gt;
                                </p>
                            </div>
                            <Badge variant="outline">Validated</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
