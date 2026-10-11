"use client";

import * as React from "react";
import {
    Calendar,
    Download,
    FileText,
    FolderKanban,
    Home,
    Layers,
    Plus,
    Settings,
    Users,
} from "lucide-react";

import {
    Button,
    Input,
    Textarea,
    FormField,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    Spinner,
    LoadingState,
    Skeleton,
    EmptyState,
    ErrorState,
    FileUploader,
    H2,
    P,
    Small,
} from "@/components/ui";
import { PageHeader, AppShell, type NavGroup } from "@/components/shell";

const sampleNavGroups: NavGroup[] = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", href: "/(dev)/playground", icon: Home, active: true },
            { label: "Fests", href: "/admin/fests", icon: Layers, badge: "2" },
            { label: "Events", href: "/admin/events", icon: Calendar, badge: "5", badgeVariant: "info" },
        ],
    },
    {
        title: "Management",
        items: [
            { label: "Registrations", href: "/admin/registrations", icon: Users, badge: "128", badgeVariant: "success" },
            { label: "Transactions", href: "/admin/transactions", icon: FileText },
            { label: "Settings", href: "/settings", icon: Settings },
        ],
    },
];

export default function Playground() {
    const [isLoadingDemo, setIsLoadingDemo] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [demoInput, setDemoInput] = React.useState("");
    const [hasInputError, setHasInputError] = React.useState(false);

    const handleSimulateLoad = () => {
        setIsLoadingDemo(true);
        setTimeout(() => setIsLoadingDemo(false), 2000);
    };

    return (
        <AppShell
            appName="Xangoes Component System"
            user={{
                name: "Puneet Sharma",
                email: "puneet@xangoes.dev",
                role: "Frontend Engineer",
            }}
            navGroups={sampleNavGroups}
            topbarRight={
                <Button variant="outline" size="sm" onClick={() => alert("Quick action clicked")}>
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export
                </Button>
            }
        >
            <PageHeader
                title="Component Library Playground"
                description="Comprehensive audit and showcase of Puneet's reusable frontend design system components."
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Developer", href: "/typography" },
                    { label: "Playground" },
                ]}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setHasInputError((prev) => !prev)}
                        >
                            Toggle Form Errors
                        </Button>
                        <Button
                            variant="default"
                            isLoading={isLoadingDemo}
                            onClick={handleSimulateLoad}
                        >
                            <Plus className="h-4 w-4" />
                            Trigger Loading State
                        </Button>
                    </>
                }
            />

            {/* SECTION 1: BUTTONS & BADGES */}
            <section className="space-y-4">
                <H2>1. Buttons & Badges</H2>
                <P className="text-muted-foreground">
                    Consistent button variants, loading states, and semantic badge indicators.
                </P>

                <Card>
                    <CardHeader>
                        <CardTitle>Button Variants & Sizes</CardTitle>
                        <CardDescription>
                            Supporting default, secondary, outline, destructive, ghost, link, and success states.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="default">Default</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                            <Button variant="success">Success</Button>
                            <Button isLoading>Loading</Button>
                            <Button disabled>Disabled</Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm">Small (sm)</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large (lg)</Button>
                            <Button size="icon" aria-label="Icon only">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="border-t border-border pt-4">
                            <Small className="block mb-2 text-muted-foreground">Semantic Badges</Small>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="default">Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="info">Info</Badge>
                                <Badge variant="destructive">Destructive / Rejected</Badge>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border bg-muted/20 py-3 text-xs text-muted-foreground">
                        All button styles conform to DESIGN.md focus rings and minimum touch targets.
                    </CardFooter>
                </Card>
            </section>

            {/* SECTION 2: FORM FIELDS & INPUTS */}
            <section className="space-y-4">
                <H2>2. Form Fields & Inputs</H2>
                <P className="text-muted-foreground">
                    Form elements styled for clean Zod integration with validation messages, descriptions, and error states.
                </P>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inputs & Validation</CardTitle>
                            <CardDescription>Form controls with helper text and validation errors.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                label="Event Name"
                                required
                                description="The public title of your fest event"
                                error={hasInputError ? "Event name must be at least 3 characters." : undefined}
                            >
                                <Input
                                    placeholder="e.g. Hackathon 2026"
                                    value={demoInput}
                                    onChange={(e) => setDemoInput(e.target.value)}
                                />
                            </FormField>

                            <FormField
                                label="Contact Email"
                                description="We will send registration confirmations here."
                            >
                                <Input type="email" placeholder="team@example.com" />
                            </FormField>

                            <FormField
                                label="Event Description"
                                error={hasInputError ? "Please provide event guidelines." : undefined}
                            >
                                <Textarea placeholder="Describe the rules, venue, and timings..." />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dialogs & Dropdowns</CardTitle>
                            <CardDescription>Accessible modals and action menus.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                {/* Dialog */}
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">Open Dialog Modal</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Register for Event</DialogTitle>
                                            <DialogDescription>
                                                Confirm your participation details below.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                            <FormField label="Full Name" required>
                                                <Input defaultValue="Puneet Sharma" />
                                            </FormField>
                                            <FormField label="College / Organization">
                                                <Input defaultValue="Engineering Institute" />
                                            </FormField>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setDialogOpen(false)}>
                                                Confirm Registration
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Dropdown Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Actions Menu</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>Event Options</DropdownMenuLabel>
                                        <DropdownMenuItem>
                                            <Calendar className="mr-2 h-4 w-4" />
                                            View Schedule
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Users className="mr-2 h-4 w-4" />
                                            Manage Teams
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Cancel Event
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="rounded-md border border-border p-4 bg-muted/20">
                                <Small className="font-semibold block mb-1">Accessibility Highlights</Small>
                                <p className="text-xs text-muted-foreground">
                                    Dialog manages focus trap, escape key exit, and backdrop opacity. Dropdowns offer keyboard arrow navigation and ARIA landmarks.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* SECTION 3: TABLES & DATA DISPLAY */}
            <section className="space-y-4">
                <H2>3. Tables & Data Display</H2>
                <P className="text-muted-foreground">
                    Responsive tables for dashboard lists (Fests, Events, Registrations, Transactions).
                </P>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Sample data table showing status badges and actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono text-xs">TXN_982341</TableCell>
                                    <TableCell>Aarav Patel</TableCell>
                                    <TableCell>Coding Marathon</TableCell>
                                    <TableCell>₹499</TableCell>
                                    <TableCell>
                                        <Badge variant="success">completed</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Details</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono text-xs">TXN_982342</TableCell>
                                    <TableCell>Rohan Mehta</TableCell>
                                    <TableCell>Robotics Arena</TableCell>
                                    <TableCell>₹799</TableCell>
                                    <TableCell>
                                        <Badge variant="warning">pending</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Details</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono text-xs">TXN_982343</TableCell>
                                    <TableCell>Priya Sharma</TableCell>
                                    <TableCell>Design Sprint</TableCell>
                                    <TableCell>₹350</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">rejected</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Details</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>

            {/* SECTION 4: FILE UPLOADER */}
            <section className="space-y-4">
                <H2>4. File Uploader UI</H2>
                <P className="text-muted-foreground">
                    Drag-and-drop zone with image previews, file size validation, upload progress, and removal controls.
                </P>

                <Card>
                    <CardHeader>
                        <CardTitle>Asset & Document Uploader</CardTitle>
                        <CardDescription>
                            Accepts images and PDFs up to 5MB with live client-side validation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileUploader
                            accept="image/*,application/pdf"
                            maxSizeInMb={5}
                            maxFiles={4}
                            helperText="Supported formats: PNG, JPG, WEBP, PDF (Max 5MB per file)"
                        />
                    </CardContent>
                </Card>
            </section>

            {/* SECTION 5: STATES & FEEDBACK */}
            <section className="space-y-4">
                <H2>5. Loading, Skeleton, Empty & Error States</H2>
                <P className="text-muted-foreground">
                    Prebuilt feedback states for asynchronous data fetching and edge cases.
                </P>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Skeletons & Loading */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading & Skeleton States</CardTitle>
                            <CardDescription>Pulsing place-holders for cards and feeds.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-24 w-full" />
                            </div>

                            <div className="border-t border-border pt-4">
                                <Small className="block mb-2 text-muted-foreground">Inline Spinners & Full Loading State</Small>
                                <div className="flex items-center gap-4 mb-3">
                                    <Spinner size="sm" />
                                    <Spinner size="default" />
                                    <Spinner size="lg" />
                                </div>
                                <div className="rounded-md border border-dashed border-border bg-muted/10">
                                    <LoadingState
                                        minHeight="min-h-[140px]"
                                        message="Fetching event registrations..."
                                        description="Please wait while we synchronize with the server."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Empty & Error */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Empty & Error States</CardTitle>
                            <CardDescription>Clean UX for zero data and network errors.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <EmptyState
                                compact
                                icon={FolderKanban}
                                title="No registrations found"
                                description="There are no users registered for this event yet."
                                action={
                                    <Button size="sm" variant="outline">
                                        Invite Participants
                                    </Button>
                                }
                            />

                            <ErrorState
                                compact
                                code={403}
                                title="Permission Denied"
                                message="You do not have administrative privileges to manage this club."
                                onRetry={() => alert("Retrying request...")}
                            />
                        </CardContent>
                    </Card>
                </div>
            </section>
        </AppShell>
    );
}
