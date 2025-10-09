"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const BRAND = "#B5040F";

export interface RoleCardProps {
    title: string;
    description?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function RoleCard({ title, description, onEdit, onDelete }: RoleCardProps) {
    return (
        <Card className="relative h-full overflow-hidden">
            <CardContent className="p-4">
                {/* Top-right actions */}
                <div className="absolute right-2 top-2 flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={onEdit}
                        className="h-8 w-8 text-[color:var(--brand)]"
                        style={{ ["--brand" as any]: BRAND }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={onDelete}
                        className="h-8 w-8 text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="min-w-0 pr-16">
                    <h3 className="truncate text-base font-semibold text-neutral-900">{title}</h3>
                    {description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{description}</p>
                    ) : (
                        <p className="mt-1 text-sm text-neutral-400">No description</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
