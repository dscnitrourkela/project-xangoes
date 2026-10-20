"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Filter, Receipt, Search } from "lucide-react";

import { H1, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransactionItem {
    id: string;
    amount: number;
    userName: string;
    userEmail: string;
    transactionID: string;
    type: "REGISTRATION" | "MERCH" | "EVENT";
    festName: string;
    timestamp: string;
    comment: string | null;
    isVerified: boolean;
}

const SAMPLE_TRANSACTIONS: TransactionItem[] = [
    {
        id: "tx_01",
        amount: 499,
        userName: "Priyanshu Verma",
        userEmail: "122cs0421@nitrourkela.ac.in",
        transactionID: "UPI/329482910481/CR",
        type: "REGISTRATION",
        festName: "Innovision 2026",
        timestamp: "Oct 18, 2026, 14:20",
        comment: "Delegation Registration Pass",
        isVerified: true,
    },
    {
        id: "tx_02",
        amount: 350,
        userName: "Debashis Panda",
        userEmail: "debashis@gmail.com",
        transactionID: "PAYTM/849204918239",
        type: "MERCH",
        festName: "Innovision 2026",
        timestamp: "Oct 18, 2026, 16:05",
        comment: "Official Fest Hoodie (Size L)",
        isVerified: true,
    },
    {
        id: "tx_03",
        amount: 599,
        userName: "Kavita Sharma",
        userEmail: "kavita.s@kiit.ac.in",
        transactionID: "GPay/492019482012/REF",
        type: "REGISTRATION",
        festName: "Nitrutsav 2027",
        timestamp: "Oct 19, 2026, 10:12",
        comment: "Accomodation + Pass",
        isVerified: false,
    },
    {
        id: "tx_04",
        amount: 200,
        userName: "Rohan Das",
        userEmail: "rohan.d@nitrourkela.ac.in",
        transactionID: "PHONEPE/930193820194",
        type: "EVENT",
        festName: "Innovision 2026",
        timestamp: "Oct 19, 2026, 11:30",
        comment: "Roborace Entry Deposit",
        isVerified: false,
    },
];

export default function AdminTransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [verificationFilter, setVerificationFilter] = useState("ALL");

    const filteredTransactions = SAMPLE_TRANSACTIONS.filter((tx) => {
        const matchesSearch =
            tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.transactionID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.festName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
        const matchesVerified =
            verificationFilter === "ALL" ||
            (verificationFilter === "VERIFIED" && tx.isVerified) ||
            (verificationFilter === "PENDING" && !tx.isVerified);

        return matchesSearch && matchesType && matchesVerified;
    });

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <H1>Transactions &amp; Verification</H1>
                    <P className="text-muted-foreground mt-1">
                        Audit external payment references, reconcile receipts, and verify delegate registration fees.
                    </P>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <Receipt className="h-4 w-4" />
                        <span>Reconciliation Log</span>
                    </Button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by payer, email, external transaction ID, or fest..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="REGISTRATION">Registration</option>
                        <option value="MERCH">Merchandise</option>
                        <option value="EVENT">Event Fee</option>
                    </select>

                    <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="PENDING">Pending Verification</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table Placeholder Body */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Financial Audit Log</CardTitle>
                        <span className="text-xs text-muted-foreground font-mono">
                            Showing {filteredTransactions.length} of {SAMPLE_TRANSACTIONS.length} entries
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <th className="py-3 px-4">Payer &amp; Email</th>
                                <th className="py-3 px-4">External Transaction Ref</th>
                                <th className="py-3 px-4">Purpose &amp; Fest</th>
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">Timestamp</th>
                                <th className="py-3 px-4 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-accent/40 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-foreground">{tx.userName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{tx.userEmail}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-mono text-xs font-semibold text-foreground">
                                            {tx.transactionID}
                                        </div>
                                        {tx.comment && (
                                            <div className="text-xs text-muted-foreground italic truncate max-w-xs">
                                                {tx.comment}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-[10px]">
                                                {tx.type}
                                            </Badge>
                                            <span className="text-xs text-foreground">{tx.festName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="font-semibold text-foreground">₹{tx.amount}</span>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                                        {tx.timestamp}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {tx.isVerified ? (
                                            <Badge variant="success" className="text-xs">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5">
                                                <Badge variant="warning" className="text-xs">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-1.5">
                                                    Verify
                                                </Button>
                                            </div>
                                        )}
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
