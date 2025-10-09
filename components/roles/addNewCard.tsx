"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const BRAND = "#B5040F";

export default function AddNewCard({ onClick }: { onClick: () => void }) {
    return (
        <Card className="h-full">
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-4">
                <div className="text-sm font-medium text-neutral-700">New Role</div>
                <Button
                    onClick={onClick}
                    className="h-12 w-12 rounded-full bg-[color:var(--brand)] hover:bg-[#a1040e]"
                    style={{ ["--brand" as any]: BRAND }}
                    title="Add new role"
                >
                    <Plus className="h-5 w-5 text-white" />
                </Button>
            </CardContent>
        </Card>
    );
}
