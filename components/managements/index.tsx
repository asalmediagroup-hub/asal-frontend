"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./table";
import RecordModal from "./modal";

// Types
// -----------------------------
export interface RecordItem {
    id: string;
    title: string;
    category: string;
    status: string;
    author: string;
    date: string;
    views: number;
}

// Sample data
// -----------------------------
const SAMPLE_DATA: RecordItem[] = [
    { id: "P-1001", title: "AMG Awards 2025 Highlights", category: "Events", status: "Published", author: "A. Ali", date: "2025-09-01", views: 2310 },
    { id: "P-1002", title: "Studio Lighting Setup Guide", category: "Guides", status: "Draft", author: "R. Noor", date: "2025-08-29", views: 120 },
    { id: "P-1003", title: "Interview: Omar Artan", category: "Interviews", status: "Scheduled", author: "H. Warsame", date: "2025-09-07", views: 0 },
    { id: "P-1004", title: "Behind the Scenes: Asal TV", category: "Culture", status: "Published", author: "M. Ahmed", date: "2025-08-28", views: 980 },
    { id: "P-1005", title: "Somali Cinema Revival", category: "Features", status: "Published", author: "L. Farah", date: "2025-08-26", views: 1510 },
    { id: "P-1006", title: "Field Report: NMDC Groundbreaking", category: "News", status: "Published", author: "N. Ibrahim", date: "2025-06-29", views: 3480 },
    { id: "P-1007", title: "Editing Tips for Producers", category: "Guides", status: "Draft", author: "D. Bile", date: "2025-08-14", views: 65 },
    { id: "P-1008", title: "Weekly Recap #34", category: "News", status: "Published", author: "Team", date: "2025-08-31", views: 760 },
    { id: "P-1009", title: "Asal TV New Studio Walkthrough", category: "Announcements", status: "Scheduled", author: "Comms", date: "2025-09-10", views: 0 },
    { id: "P-1010", title: "Producer’s Toolkit 101", category: "Guides", status: "Published", author: "Team", date: "2025-07-10", views: 1890 },
];


// -----------------------------
// Page component
// -----------------------------
export default function Management() {
    const [items, setItems] = useState<RecordItem[]>(SAMPLE_DATA);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<RecordItem | null>(null);


    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };


    const onEdit = (item: RecordItem) => {
        setEditing(item);
        setModalOpen(true);
    };


    const onDelete = (ids: string[]) => {
        setItems((prev) => prev.filter((x) => !ids.includes(x.id)));
    };


    const onSave = (payload: Omit<RecordItem, "id"> & { id?: string }) => {
        if (payload.id) {
            // update
            setItems((prev) => prev.map((x) => (x.id === payload.id ? (payload as RecordItem) : x)));
        } else {
            const newId = `P-${Math.floor(Math.random() * 9000 + 2000)}`;
            setItems((prev) => [{ id: newId, ...payload }, ...prev]);
        }
        setModalOpen(false);
    };


    const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items]);


    return (
        <div className="space-y-4" >


            <DataTable
                rows={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
            />


            <RecordModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initial={editing ?? undefined
                }
                onSave={onSave}
            />
        </div>
    );
}