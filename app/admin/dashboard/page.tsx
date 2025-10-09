"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus, FileText, Image as ImageIcon, Users, Settings, ExternalLink, ArrowRight, TrendingUp, Eye, MessageSquare } from "lucide-react";

// Demo data (replace with your API later)
const traffic = [
    { name: "Mon", views: 1240, visits: 820 },
    { name: "Tue", views: 1630, visits: 940 },
    { name: "Wed", views: 1420, visits: 910 },
    { name: "Thu", views: 1750, visits: 1050 },
    { name: "Fri", views: 2120, visits: 1210 },
    { name: "Sat", views: 980, visits: 600 },
    { name: "Sun", views: 1340, visits: 830 },
];

const contentByType = [
    { name: "Articles", value: 46 },
    { name: "Videos", value: 18 },
    { name: "Galleries", value: 9 },
    { name: "Pages", value: 12 },
];
const PIE_COLORS = ["#B5040F", "#f97316", "#06b6d4", "#22c55e"]; // brand + accents

const recentPosts = [
    { id: 1, title: "AMG Awards 2025 Highlights", status: "Published", author: "A. Ali", date: "Sep 1, 2025", views: 2310 },
    { id: 2, title: "Studio Lighting Setup Guide", status: "Draft", author: "R. Noor", date: "Aug 29, 2025", views: 120 },
    { id: 3, title: "Interview: Omar Artan", status: "Scheduled", author: "H. Warsame", date: "Sep 7, 2025", views: 0 },
    { id: 4, title: "Behind the Scenes: Asal TV", status: "Published", author: "M. Ahmed", date: "Aug 28, 2025", views: 980 },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-neutral-600">Overview of your content, audience and activity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/settings/general">
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/posts/new">
                            <Plus className="mr-2 h-4 w-4" /> New Post
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Views" value="9,480" helper="Past 7 days" icon={<Eye className="h-4 w-4 text-neutral-500" />} trend="+12.4%" />
                <StatCard title="Published Posts" value="426" helper="All time" icon={<FileText className="h-4 w-4 text-neutral-500" />} trend="+8 this week" />
                <StatCard title="Comments" value="1,239" helper="Past 30 days" icon={<MessageSquare className="h-4 w-4 text-neutral-500" />} trend="+5.1%" />
                <StatCard title="Active Users" value="58" helper="Editors & Authors" icon={<Users className="h-4 w-4 text-neutral-500" />} trend="-2 this week" />
            </div>

            {/* Charts */}
            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle>Traffic</CardTitle>
                            <CardDescription>Views vs visits (last 7 days)</CardDescription>
                        </div>
                        <Badge className="bg-[#B5040F] hover:bg-[#a1040e]">Live</Badge>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={traffic} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="views" stroke="#B5040F" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle>Content by type</CardTitle>
                        <CardDescription>Distribution of content formats</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={contentByType} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={4}>
                                    {contentByType.map((_, idx) => (
                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            {contentByType.map((c, i) => (
                                <div key={c.name} className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-neutral-700">{c.name}</span>
                                    <span className="ml-auto font-semibold">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent posts</CardTitle>
                        <CardDescription>Latest items across the newsroom</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-left text-neutral-500">
                                        <th className="py-2 pr-4 font-medium">Title</th>
                                        <th className="py-2 pr-4 font-medium">Status</th>
                                        <th className="py-2 pr-4 font-medium">Author</th>
                                        <th className="py-2 pr-4 font-medium">Date</th>
                                        <th className="py-2 pr-4 font-medium">Views</th>
                                        <th className="py-2 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPosts.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4 text-neutral-900">
                                                <Link href={`/admin/posts/${p.id}`} className="hover:underline">
                                                    {p.title}
                                                </Link>
                                            </td>
                                            <td className="py-2 pr-4">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="py-2 pr-4 text-neutral-700">{p.author}</td>
                                            <td className="py-2 pr-4 text-neutral-700">{p.date}</td>
                                            <td className="py-2 pr-4 text-neutral-700">{p.views}</td>
                                            <td className="py-2 text-right">
                                                <Button asChild size="sm" variant="ghost">
                                                    <Link href={`/admin/posts/${p.id}/edit`}>
                                                        Edit <ExternalLink className="ml-1 h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick actions</CardTitle>
                        <CardDescription>Jump into common workflows</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Button asChild variant="secondary" className="justify-start">
                            <Link href="/admin/media/upload">
                                <ImageIcon className="mr-2 h-4 w-4" /> Upload media
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" className="justify-start">
                            <Link href="/admin/users/new">
                                <Users className="mr-2 h-4 w-4" /> Add user
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" className="justify-start">
                            <Link href="/admin/settings/appearance">
                                <Settings className="mr-2 h-4 w-4" /> Appearance
                            </Link>
                        </Button>
                        <Separator className="my-2" />
                        <Button asChild className="justify-between">
                            <Link href="/admin/reports">
                                View reports <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// -----------------------------
// Components
// -----------------------------
function StatCard({ title, value, helper, icon, trend }: { title: string; value: string; helper?: string; icon?: React.ReactNode; trend?: string; }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="mt-1 text-xs text-green-600 inline-flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> {trend}
                </div>
                {helper && <p className="mt-2 text-xs text-neutral-500">{helper}</p>}
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        Published: "bg-green-100 text-green-700 border-green-200",
        Draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
        Scheduled: "bg-orange-100 text-orange-700 border-orange-200",
    };
    const cls = map[status] ?? "bg-neutral-100 text-neutral-700 border-neutral-200";
    return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
}
