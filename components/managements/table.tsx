"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    ArrowUpDown,
    Plus,
} from "lucide-react";

interface RecordItem {
    id: string;
    title: string;
    category: string;
    status: string;
    author: string;
    date: string;
    views: number;
}
type RecordStatus = "Published" | "Draft" | "Scheduled";

function StatusBadge({ status }: { status: RecordStatus }) {
    const map: Record<RecordStatus, string> = {
        Published: "bg-green-100 text-green-700 border-green-200",
        Draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
        Scheduled: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", map[status])}>{status}</span>;
}

function useDebouncedValue<T>(value: T, delay = 250) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const BRAND = "#B5040F";

export default function DataTable({
    rows,
    onEdit,
    onDelete,
    onCreate,
}: {
    rows: RecordItem[];
    onEdit: (row: RecordItem) => void;
    onDelete: (ids: string[]) => void;
    onCreate?: () => void;
}) {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 250);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [sortKey, setSortKey] = useState<keyof RecordItem>("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [visibleCols, setVisibleCols] = useState<Record<keyof RecordItem | "select" | "actions", boolean>>({
        select: true,
        id: true,
        title: true,
        category: true,
        status: true,
        author: true,
        date: true,
        views: true,
        actions: true,
    });

    const toggleSort = (key: keyof RecordItem) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const sortIndicator = (key: keyof RecordItem) => (
        <ArrowUpDown className={cn("ml-1 inline h-3.5 w-3.5 align-[-2px] text-neutral-400", sortKey === key && "text-[#B5040F]")} />
    );

    const filtered = useMemo(() => {
        let out = rows.filter((r) =>
            [r.id, r.title, r.author, r.category].join(" ").toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        out.sort((a, b) => {
            const A = a[sortKey] as any;
            const B = b[sortKey] as any;
            if (typeof A === "number" && typeof B === "number") return sortDir === "asc" ? A - B : B - A;
            return sortDir === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
        });
        return out;
    }, [rows, debouncedQuery, sortKey, sortDir]);

    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const pageSafe = Math.min(page, pageCount);
    const start = (pageSafe - 1) * pageSize;
    const current = filtered.slice(start, start + pageSize);

    const toggleAll = (checked: boolean | "indeterminate") => {
        if (checked) setSelected(new Set(current.map((r) => r.id)));
        else setSelected(new Set());
    };
    const toggleOne = (id: string, checked: boolean | "indeterminate") => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const exportCSV = () => {
        const cols: (keyof RecordItem)[] = ["id", "title", "category", "status", "author", "date", "views"];
        const rowsToExport = (selected.size ? filtered.filter((r) => selected.has(r.id)) : filtered).map((r) =>
            cols.map((c) => String(r[c]).replace(/"/g, '""')).join(",")
        );
        const csv = [cols.join(","), ...rowsToExport].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "records.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const allChecked = current.length > 0 && current.every((r) => selected.has(r.id));
    const indeterminate = selected.size > 0 && !allChecked;

    // page numbers 1 … [p-1 p p+1] … last
    const pageNumbers = useMemo(() => {
        const arr: (number | string)[] = [];
        const add = (n: number | string) => arr.push(n);
        const range = (a: number, b: number) => { for (let i = a; i <= b; i++) add(i); };
        if (pageCount <= 5) range(1, pageCount);
        else {
            add(1);
            if (pageSafe > 3) add("…");
            range(Math.max(2, pageSafe - 1), Math.min(pageCount - 1, pageSafe + 1));
            if (pageSafe < pageCount - 2) add("…");
            add(pageCount);
        }
        return arr;
    }, [pageSafe, pageCount]);

    return (
        <Card>
            <CardContent className="space-y-4 p-4 md:p-6">
                {/* TOP BAR — left: name + per-page | center: spacer | right: search, CSV, columns, Add(+) */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">Management</h2>

                        {/* Per page — number only, NO border */}
                        <Select
                            value={String(pageSize)}
                            onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}
                        >
                            <SelectTrigger
                                className="h-9 w-16 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0"
                                style={{ ["--brand" as any]: BRAND }}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 10, 20, 50].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* CENTER (empty) */}
                    <div className="flex-1" />

                    {/* RIGHT — order: Search | CSV | Columns | Add */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative w-[260px] max-w-[50vw]">
                            <Input
                                value={query}
                                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                                placeholder="Search…"
                                className="h-9 pl-9"
                            />
                            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        </div>

                        {/* Export CSV (icon + 'CSV') */}
                        <Button variant="outline" onClick={exportCSV} className="gap-2">
                            <Download className="h-4 w-4" />
                            CSV
                        </Button>

                        {/* Columns (icon only) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 w-9 p-0" title="Columns">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {Object.keys(visibleCols).map((k) => (
                                    <DropdownMenuItem key={k} className="gap-2" onClick={(e) => e.preventDefault()}>
                                        <Checkbox
                                            className="border-[#B5040F] data-[state=checked]:bg-white data-[state=checked]:text-[#B5040F]"
                                            checked={(visibleCols as any)[k]}
                                            onCheckedChange={(val) => setVisibleCols((prev) => ({ ...prev, [k]: Boolean(val) }))}
                                        />
                                        <span className="capitalize">{k}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Add — round, brand, rightmost */}
                        <Button
                            onClick={() => onCreate?.()}
                            className="h-9 w-9 rounded-full bg-[#B5040F] p-0 hover:bg-[#a1040e]"
                            title="Add"
                        >
                            <Plus className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </div>

                {/* Bulk bar */}
                {selected.size > 0 && (
                    <div className="sticky top-2 z-10 flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/95 px-3 py-2 text-sm backdrop-blur">
                        <span>{selected.size} selected</span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => onDelete(Array.from(selected))} className="gap-2 text-red-600">
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="max-h-[65vh] overflow-auto rounded-lg border border-neutral-200">
                    <Table className="text-[0.94rem]">
                        <TableHeader>
                            <TableRow className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                                {visibleCols.select && (
                                    <TableHead className="w-[44px]">
                                        <Checkbox
                                            className="border-[#B5040F] data-[state=checked]:bg-white data-[state=checked]:text-[#B5040F]"
                                            checked={indeterminate ? "indeterminate" : allChecked}
                                            onCheckedChange={toggleAll}
                                        />
                                    </TableHead>
                                )}
                                {visibleCols.id && (
                                    <TableHead aria-sort={sortKey === "id" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="cursor-pointer select-none" onClick={() => toggleSort("id")}>
                                        ID {sortIndicator("id")}
                                    </TableHead>
                                )}
                                {visibleCols.title && (
                                    <TableHead aria-sort={sortKey === "title" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                                        Title {sortIndicator("title")}
                                    </TableHead>
                                )}
                                {visibleCols.category && (
                                    <TableHead aria-sort={sortKey === "category" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="cursor-pointer select-none" onClick={() => toggleSort("category")}>
                                        Category {sortIndicator("category")}
                                    </TableHead>
                                )}
                                {visibleCols.status && <TableHead>Status</TableHead>}
                                {visibleCols.author && (
                                    <TableHead aria-sort={sortKey === "author" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="cursor-pointer select-none" onClick={() => toggleSort("author")}>
                                        Author {sortIndicator("author")}
                                    </TableHead>
                                )}
                                {visibleCols.date && (
                                    <TableHead aria-sort={sortKey === "date" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="cursor-pointer select-none" onClick={() => toggleSort("date")}>
                                        Date {sortIndicator("date")}
                                    </TableHead>
                                )}
                                {visibleCols.views && (
                                    <TableHead aria-sort={sortKey === "views" ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className="cursor-pointer select-none" onClick={() => toggleSort("views")}>
                                        Views {sortIndicator("views")}
                                    </TableHead>
                                )}
                                {visibleCols.actions && <TableHead className="w-[60px]">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {current.map((r, i) => (
                                <TableRow key={r.id} className={cn("transition-colors hover:bg-neutral-50/90", i % 2 === 1 && "bg-neutral-50/50")}>
                                    {visibleCols.select && (
                                        <TableCell>
                                            <Checkbox
                                                className="border-[#B5040F] data-[state=checked]:bg-white data-[state=checked]:text-[#B5040F]"
                                                checked={selected.has(r.id)}
                                                onCheckedChange={(v) => toggleOne(r.id, v)}
                                            />
                                        </TableCell>
                                    )}
                                    {visibleCols.id && <TableCell>{r.id}</TableCell>}
                                    {visibleCols.title && <TableCell className="font-medium">{r.title}</TableCell>}
                                    {visibleCols.category && <TableCell>{r.category}</TableCell>}
                                    {visibleCols.status && (
                                        <TableCell>
                                            <StatusBadge status={r.status as RecordStatus} />
                                        </TableCell>
                                    )}
                                    {visibleCols.author && <TableCell>{r.author}</TableCell>}
                                    {visibleCols.date && <TableCell>{r.date}</TableCell>}
                                    {visibleCols.views && <TableCell>{r.views.toLocaleString()}</TableCell>}
                                    {visibleCols.actions && (
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="gap-2" onClick={() => onEdit(r)}>
                                                        <Pencil className="h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 text-red-600" onClick={() => onDelete([r.id])}>
                                                        <Trash2 className="h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}

                            {current.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={999} className="py-10 text-center text-sm text-neutral-500">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination with round brand arrows */}
                <div className="flex items-center justify-between pt-2 text-sm text-neutral-600">
                    <div>
                        Showing <span className="font-medium">{total ? start + 1 : 0}</span>–
                        <span className="font-medium">{Math.min(start + pageSize, total)}</span> of{" "}
                        <span className="font-medium">{total}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            className="h-9 w-9 rounded-full bg-[#B5040F] text-white hover:bg-[#a1040e]"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={pageSafe === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {pageNumbers.map((n, idx) =>
                            typeof n === "number" ? (
                                <Button
                                    key={idx}
                                    variant={n === pageSafe ? "default" : "outline"}
                                    size="sm"
                                    className={cn("px-3", n === pageSafe && "bg-[#B5040F] text-white hover:bg-[#a1040e]")}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </Button>
                            ) : (
                                <span key={idx} className="px-2">
                                    {n}
                                </span>
                            )
                        )}

                        <Button
                            size="icon"
                            className="h-9 w-9 rounded-full bg-[#B5040F] text-white hover:bg-[#a1040e]"
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                            disabled={pageSafe === pageCount}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
