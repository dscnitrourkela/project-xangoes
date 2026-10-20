"use client";

import React, { useState } from "react";
import {
    Calendar,
    Filter,
    MapPin,
    Plus,
    Search,
    Trophy,
} from "lucide-react";

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

interface EventItem {
    id: string;
    name: string;
    subHeading: string;
    club: string;
    type: string;
    prizePool: string;
    location: string;
    date: string;
    status: "ACTIVE" | "DRAFT" | "EXPIRED";
    priority: number;
    coordinators: string[];
}

const SAMPLE_EVENTS: EventItem[] = [
    {
        id: "evt_hackathon_2026",
        name: "Innovision Hackathon 4.0",
        subHeading: "36-Hour Flagship Software & Hardware Sprint",
        club: "DSC NIT Rourkela",
        type: "Technical",
        prizePool: "₹75,000",
        location: "LA Complex / CS Hall",
        date: "Nov 07, 2026",
        status: "ACTIVE",
        priority: 1,
        coordinators: ["Ayush (+91 9876543210)", "Siddharth (+91 9123456780)"],
    },
    {
        id: "evt_roborace_2026",
        name: "Death Race: Autonomous Bots",
        subHeading: "Fastest maze solver obstacle course race",
        club: "Robotics Society",
        type: "Robotics",
        prizePool: "₹40,000",
        location: "SAC Indoor Quad",
        date: "Nov 08, 2026",
        status: "ACTIVE",
        priority: 2,
        coordinators: ["Rohan (+91 9988776655)"],
    },
    {
        id: "evt_voice_of_nitr",
        name: "Voice of NITR: Solo Singing",
        subHeading: "Flagship Eastern & Western vocal showdown",
        club: "Euphony",
        type: "Cultural",
        prizePool: "₹25,000",
        location: "BBA Auditorium",
        date: "Nov 08, 2026",
        status: "DRAFT",
        priority: 3,
        coordinators: ["Ananya (+91 9776655443)"],
    },
];

export default function AdminEventsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [clubFilter, setClubFilter] = useState("ALL");

    const filteredEvents = SAMPLE_EVENTS.filter((evt) => {
        const matchesSearch =
            evt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evt.club.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClub = clubFilter === "ALL" || evt.type === clubFilter;
        return matchesSearch && matchesClub;
    });

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <H1>Events Management</H1>
                    <P className="text-muted-foreground mt-1">
                        Catalog competitions, allocate prize pools, assign POCs, and configure event rules.
                    </P>
                </div>
                <Button className="flex items-center gap-1.5 self-start sm:self-auto">
                    <Plus className="h-4 w-4" />
                    <span>Create New Event</span>
                </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search events by name, club or topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    <select
                        value={clubFilter}
                        onChange={(e) => setClubFilter(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="Technical">Technical</option>
                        <option value="Robotics">Robotics</option>
                        <option value="Cultural">Cultural</option>
                    </select>
                </div>
            </div>

            {/* Events Grid Placeholder Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                    <Card key={evt.id} interactive className="flex flex-col justify-between">
                        <div>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {evt.club}
                                    </Badge>
                                    <Badge
                                        variant={evt.status === "ACTIVE" ? "success" : "warning"}
                                        className="text-xs"
                                    >
                                        {evt.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl mt-3">{evt.name}</CardTitle>
                                <CardDescription className="text-xs">{evt.subHeading}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-0 text-sm">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                        Prize Pool:
                                    </span>
                                    <span className="font-semibold text-foreground">{evt.prizePool}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Venue:
                                    </span>
                                    <span className="text-foreground">{evt.location}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Date:
                                    </span>
                                    <span className="text-foreground">{evt.date}</span>
                                </div>

                                <div className="border-t border-border pt-2">
                                    <p className="text-[11px] font-medium text-muted-foreground mb-1">
                                        Point of Contacts:
                                    </p>
                                    <div className="space-y-0.5">
                                        {evt.coordinators.map((c) => (
                                            <p key={c} className="text-xs text-foreground font-mono">
                                                {c}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </div>

                        <div className="p-6 pt-0 mt-2 flex items-center gap-2 border-t border-border/50">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                                Edit Event
                            </Button>
                            <Button variant="secondary" size="sm" className="w-full text-xs">
                                View Entries
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
