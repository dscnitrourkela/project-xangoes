"use client";

import React, { useState } from "react";
import { Download, Filter, Search, UserCheck } from "lucide-react";

import { H1, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RegistrationItem {
    id: string;
    studentName: string;
    email: string;
    rollNumber: string;
    college: string;
    event: string;
    teamName: string | null;
    timestamp: string;
    verified: boolean;
}

const SAMPLE_REGISTRATIONS: RegistrationItem[] = [
    {
        id: "reg_001",
        studentName: "Priyanshu Verma",
        email: "122cs0421@nitrourkela.ac.in",
        rollNumber: "122CS0421",
        college: "NIT Rourkela",
        event: "Innovision Hackathon 4.0",
        teamName: "ByteForce",
        timestamp: "Oct 18, 2026, 14:22",
        verified: true,
    },
    {
        id: "reg_002",
        studentName: "Aditi Mohapatra",
        email: "aditi.m@cet.edu.in",
        rollNumber: "2101032",
        college: "OUTR Bhubaneswar",
        event: "Innovision Hackathon 4.0",
        teamName: "ByteForce",
        timestamp: "Oct 18, 2026, 14:25",
        verified: true,
    },
    {
        id: "reg_003",
        studentName: "Tanmay Singhal",
        email: "123me0112@nitrourkela.ac.in",
        rollNumber: "123ME0112",
        college: "NIT Rourkela",
        event: "Death Race: Autonomous Bots",
        teamName: null,
        timestamp: "Oct 19, 2026, 09:15",
        verified: false,
    },
    {
        id: "reg_004",
        studentName: "Sneha Nair",
        email: "sneha.nair@vssut.ac.in",
        rollNumber: "2201099",
        college: "VSSUT Burla",
        event: "Voice of NITR: Solo Singing",
        teamName: null,
        timestamp: "Oct 19, 2026, 11:40",
        verified: true,
    },
];

export default function AdminRegistrationsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [verificationFilter, setVerificationFilter] = useState("ALL");

    const filteredRegistrations = SAMPLE_REGISTRATIONS.filter((reg) => {
        const matchesSearch =
            reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.event.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVerification =
            verificationFilter === "ALL" ||
            (verificationFilter === "VERIFIED" && reg.verified) ||
            (verificationFilter === "PENDING" && !reg.verified);
        return matchesSearch && matchesVerification;
    });

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <H1>Registrations</H1>
                    <P className="text-muted-foreground mt-1">
                        Track student sign-ups, team allocations, roll numbers, and entry credentials.
                    </P>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by participant name, roll number, college, or event..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="VERIFIED">Verified Only</option>
                        <option value="PENDING">Pending Check-in</option>
                    </select>
                </div>
            </div>

            {/* Registrations Table Placeholder Body */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Participant Registry</CardTitle>
                        <span className="text-xs text-muted-foreground font-mono">
                            Showing {filteredRegistrations.length} of {SAMPLE_REGISTRATIONS.length} entries
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <th className="py-3 px-4">Participant</th>
                                <th className="py-3 px-4">Roll &amp; College</th>
                                <th className="py-3 px-4">Event</th>
                                <th className="py-3 px-4">Team</th>
                                <th className="py-3 px-4">Registration Time</th>
                                <th className="py-3 px-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-accent/40 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-foreground">{reg.studentName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{reg.email}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-mono text-xs font-medium text-foreground">
                                            {reg.rollNumber}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{reg.college}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-foreground">{reg.event}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {reg.teamName ? (
                                            <Badge variant="outline" className="text-xs font-medium">
                                                {reg.teamName}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Individual</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                                        {reg.timestamp}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Badge
                                            variant={reg.verified ? "success" : "warning"}
                                            className="text-xs"
                                        >
                                            {reg.verified ? (
                                                <span className="flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" />
                                                    Verified
                                                </span>
                                            ) : (
                                                "Pending"
                                            )}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
