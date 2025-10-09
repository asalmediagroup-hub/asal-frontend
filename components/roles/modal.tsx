"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Action, Permission } from "@/store/services/rolesApi";

const BRAND = "#B5040F";

/** MENUS (subjects) now: users, roles. Add more later easily */
const MENUS = [
    { key: "users", label: "Users" },
    { key: "news", label: "News" },
    { key: "categories", label: "Categories" },
    { key: "brands", label: "Brands" },
    { key: "services", label: "Services" },
    { key: "packages", label: "Packages" },
    { key: "partnersreviews", label: "Parteners Reviews" },
    { key: "portfolios", label: "Portfolio" },
    { key: "roles", label: "Roles" },
] as const;

const ACTIONS: Action[] = ["create", "read", "update", "delete"]; // "manage" is computed
type MenuKey = typeof MENUS[number]["key"];

export interface RoleModalInitial {
    id?: string;
    name?: string;
    description?: string;
    permissions?: Permission[];
}

export default function RoleModal({
    open,
    onOpenChange,
    initial,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RoleModalInitial;
    onSubmit: (payload: { id?: string; name: string; description?: string; permissions: Permission[] }) => Promise<boolean>;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState<string>("");
    const [expanded, setExpanded] = useState<Record<MenuKey, boolean>>({ users: false, roles: false });
    const [submitting, setSubmitting] = useState(false);

    /** selection state: which actions per menu are checked */
    const [sel, setSel] = useState<Record<MenuKey, Set<Action>>>({
        users: new Set<Action>(),
        roles: new Set<Action>(),
    });

    // hydrate from initial
    useEffect(() => {
        if (!open) return;
        setName(initial?.name ?? "");
        setDescription(initial?.description ?? "");
        setSubmitting(false);

        const next: Record<MenuKey, Set<Action>> = { users: new Set(), roles: new Set() };

        // Map incoming permissions into granular selections (expand "manage" to all four)
        initial?.permissions?.forEach((p) => {
            const subj = p.subject as MenuKey | "all";
            if (subj === "all") {
                MENUS.forEach((m) => {
                    next[m.key] = new Set<Action>(ACTIONS);
                });
            } else if (MENUS.some((m) => m.key === subj)) {
                if (p.actions.includes("manage" as Action)) {
                    next[subj] = new Set<Action>(ACTIONS);
                } else {
                    const s = next[subj] ?? new Set<Action>();
                    p.actions.forEach((a: any) => {
                        if (ACTIONS.includes(a as Action)) s.add(a as Action);
                    });
                    next[subj] = s;
                }
            }
        });

        setSel(next);
    }, [open, initial]);

    /** helpers */
    const toggleMenuExpand = (m: MenuKey) => setExpanded((e) => ({ ...e, [m]: !e[m] }));
    const toggleAction = (menu: MenuKey, action: Action, checked: boolean | "indeterminate") => {
        setSel((prev) => {
            const s = new Set(prev[menu]);
            if (checked) s.add(action);
            else s.delete(action);
            return { ...prev, [menu]: s };
        });
    };
    const setAllForMenu = (menu: MenuKey, checked: boolean) => {
        setSel((prev) => ({
            ...prev,
            [menu]: checked ? new Set<Action>(ACTIONS) : new Set<Action>(),
        }));
    };
    const areAllActionsChecked = (menu: MenuKey) => ACTIONS.every((a) => sel[menu]?.has(a));
    const areAnyActionsChecked = (menu: MenuKey) => sel[menu]?.size > 0;

    /** Build final permissions payload according to scenarios */
    const permissionsPayload: Permission[] = useMemo(() => {
        const allMenusAll = MENUS.every((m) => areAllActionsChecked(m.key));
        if (allMenusAll) {
            return [{ subject: "all", actions: ["manage"] }];
        }
        const out: Permission[] = [];
        for (const m of MENUS) {
            if (!areAnyActionsChecked(m.key)) continue;
            if (areAllActionsChecked(m.key)) out.push({ subject: m.key, actions: ["manage"] as any });
            else out.push({ subject: m.key, actions: Array.from(sel[m.key]) });
        }
        return out;
    }, [sel]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        const ok = await onSubmit({
            id: initial?.id,
            name: name.trim(),
            description: description?.trim() || undefined,
            permissions: permissionsPayload,
        });
        setSubmitting(false);
        if (ok) onOpenChange(false);
    };

    const isEdit = Boolean(initial?.id);
    const submitLabel = submitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Save changes" : "Create role");

    return (
        <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
            <DialogContent className="p-0 sm:max-w-3xl overflow-hidden">
                <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col">
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">{isEdit ? "Edit Role" : "Create Role"}</DialogTitle>
                        <DialogDescription className="text-[13px]">
                            Define role details and choose permissions per menu.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 overflow-y-auto">
                        {/* Basics */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name" className="text-[13px]">
                                    Role name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={submitting}
                                    className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description" className="text-[13px]">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={submitting}
                                    className="mt-2 min-h-[40px] border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                            </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
                            <div className="grid grid-cols-12 bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-600">
                                <div className="col-span-5">Menu</div>
                                <div className="col-span-5">Actions</div>
                                <div className="col-span-2 text-right">Expand</div>
                            </div>

                            {MENUS.map((m) => {
                                const allChecked = areAllActionsChecked(m.key);
                                const anyChecked = areAnyActionsChecked(m.key);
                                const indeterminate = anyChecked && !allChecked;

                                return (
                                    <div key={m.key} className="border-t">
                                        <div className="grid grid-cols-12 items-start px-4 py-3">
                                            {/* Menu name + row select-all */}
                                            <div className="col-span-5 flex items-center gap-2">
                                                <Checkbox
                                                    checked={allChecked ? true : indeterminate ? "indeterminate" : false}
                                                    onCheckedChange={(v) => setAllForMenu(m.key, Boolean(v))}
                                                    disabled={submitting}
                                                    className="border-[color:var(--brand)] data-[state=checked]:bg-white data-[state=checked]:text-[color:var(--brand)]"
                                                    style={{ ["--brand" as any]: BRAND }}
                                                />
                                                <span className="text-sm font-medium">{m.label}</span>
                                            </div>

                                            {/* Actions column — show only when expanded */}
                                            <div className="col-span-5">
                                                {expanded[m.key] && (
                                                    <div className="flex flex-col gap-2">
                                                        {ACTIONS.map((a) => (
                                                            <label key={a} className="inline-flex items-center gap-2 text-sm">
                                                                <Checkbox
                                                                    checked={sel[m.key]?.has(a) || false}
                                                                    onCheckedChange={(v) => toggleAction(m.key, a, Boolean(v))}
                                                                    disabled={submitting}
                                                                    className="border-[color:var(--brand)] data-[state=checked]:bg-white data-[state=checked]:text-[color:var(--brand)]"
                                                                    style={{ ["--brand" as any]: BRAND }}
                                                                />
                                                                <span className="capitalize">{a}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expand/Collapse */}
                                            <div className="col-span-2 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleMenuExpand(m.key)}
                                                    disabled={submitting}
                                                    className="h-8 w-8"
                                                >
                                                    {expanded[m.key] ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 z-10 mt-auto gap-2 border-t bg-white px-4 py-3 sm:px-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || submitting}
                            className="min-w-[140px] bg-[color:var(--brand)] hover:bg-[#a1040e]"
                            style={{ ["--brand" as any]: BRAND }}
                        >
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
