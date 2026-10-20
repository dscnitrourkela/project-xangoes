"use client";

import React, { useState } from "react";
import { Calendar, Filter, Plus, Search, Sparkles } from "lucide-react";

import { H1, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FestItem {
    id: string;
    name: string;
    tagline: string;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "DRAFT" | "EXPIRED";
    registrationFee: number;
    collegeStatus: "ALLOWED" | "BLACKLISTED" | "OTHER";
    societies: string[];
}

const SAMPLE_FESTS: FestItem[] = [
    {
        id: "fest_innovision_2026",
        name: "Innovision 2026",
        tagline: "Eastern India's Largest Techno-Management Fest",
        startDate: "Nov 06, 2026",
        endDate: "Nov 08, 2026",
        status: "ACTIVE",
        registrationFee: 499,
        collegeStatus: "ALLOWED",
        societies: ["Technical Society", "SAC"],
    },
    {
        id: "fest_nitrutsav_2027",
        name: "Nitrutsav 2027",
        tagline: "The Annual Cultural Extravaganza of NIT Rourkela",
        startDate: "Feb 05, 2027",
        endDate: "Feb 07, 2027",
        status: "DRAFT",
        registrationFee: 599,
        collegeStatus: "ALLOWED",
        societies: ["Cultural Society"],
    },
    {
        id: "fest_ism_2026",
        name: "International Students Meet (ISM) 2026",
        tagline: "Celebrating Global Diversity & Leadership",
        startDate: "Mar 13, 2026",
        endDate: "Mar 15, 2026",
        status: "EXPIRED",
        registrationFee: 299,
        collegeStatus: "ALLOWED",
        societies: ["Literary Society", "Film and Music Society"],
    },
];

export default function AdminFestsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const filteredFests = SAMPLE_FESTS.filter((fest) => {
        const matchesSearch =
            fest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fest.tagline.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "ALL" || fest.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <H1>Fests Management</H1>
                    <P className="text-muted-foreground mt-1">
                        Configure festival editions, eligibility rules, societies, and registration passes.
                    </P>
                </div>
                <Button className="flex items-center gap-1.5 self-start sm:self-auto">
                    <Plus className="h-4 w-4" />
                    <span>Create New Fest</span>
                </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search fests by name or tagline..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </div>
            </div>

            {/* Fests Grid Placeholder Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFests.map((fest) => (
                    <Card key={fest.id} interactive className="flex flex-col justify-between">
                        <div>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <Badge
                                        variant={
                                            fest.status === "ACTIVE"
                                                ? "success"
                                                : fest.status === "DRAFT"
                                                ? "warning"
                                                : "secondary"
                                        }
                                        className="text-xs"
                                    >
                                        {fest.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl mt-3">{fest.name}</CardTitle>
                                <CardDescription className="text-xs">{fest.tagline}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-0 text-sm">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                        {fest.startDate} &ndash; {fest.endDate}
                                    </span>
                                </div>

                                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pass Fee:</span>
                                        <span className="font-semibold text-foreground">₹{fest.registrationFee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">College Rule:</span>
                                        <span className="font-mono text-foreground">{fest.collegeStatus}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-wrap gap-1">
                                    {fest.societies.map((soc) => (
                                        <Badge key={soc} variant="outline" className="text-[10px] py-0">
                                            {soc}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </div>

                        <div className="p-6 pt-0 mt-2 flex items-center gap-2 border-t border-border/50">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                                Edit Details
                            </Button>
                            <Button variant="secondary" size="sm" className="w-full text-xs">
                                Manage Events
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
