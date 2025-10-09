"use client";

import { useEffect, useMemo, useState } from "react";
import { ReduxProvider } from "@/components/redux-provider";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/slices/authApi";
import { clearAuthTokenCookie } from "@/lib/authCookies";
import {
    LayoutDashboard,
    FileText,
    Image as ImageIcon,
    Users,
    Newspaper,
    Settings,
    ChevronsLeft,
    ChevronsRight,
    Menu,
    ArrowLeft,
    Crown,
    PencilLine,
    Shield,
    Gavel,
    ShieldCheck,
    BadgeCheck,
    Wrench,
    Star,
    Package,
    Boxes,
    Briefcase,
    SlidersHorizontal,
    Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * AdminLayout – updated per latest feedback
 * 1) Collapse button + logo + title live in the TOP of the SIDEBAR (not navbar)
 * 2) No underline on any menu hover (handles global a{ text-decoration } resets)
 * 3) No "Back to website" button in navbar (kept only in sidebar footer)
 * 4) Avatar trigger has no hover background
 * 5) Layout is h-screen; only main content scrolls
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useLocalStorage<boolean>(
        "asal-admin-sidebar-collapsed",
        false
    );
    const [mobileOpen, setMobileOpen] = useState(false);

    const nav = useMemo(() => NAV_ITEMS, []);

    return (
        <ReduxProvider>
            <TooltipProvider>
                {/* Master grid: [sidebar | main]; rows: [topbar | content]; full-height; only content scrolls */}
                <div className="grid h-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-hidden bg-neutral-50">
                    {/* Sidebar spans both rows on desktop */}
                    <aside
                        className={
                            "relative hidden row-span-2 border-r border-neutral-200 bg-white lg:block " +
                            (collapsed ? "w-20" : "w-72")
                        }
                    >
                        <Sidebar
                            nav={nav}
                            pathname={pathname}
                            collapsed={collapsed}
                            onToggle={() => setCollapsed((s) => !s)}
                        />
                    </aside>

                    {/* Topbar to the right of sidebar */}
                    <Topbar onBurger={() => setMobileOpen(true)} />

                    {/* Mobile sidebar (sheet) */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <button className="hidden" />
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0">
                            <Sidebar nav={nav} pathname={pathname} collapsed={false} onToggle={() => setMobileOpen(false)} />
                        </SheetContent>
                    </Sheet>

                    {/* Main content (scrollable) */}
                    <main className="col-start-2 row-start-2 h-full min-w-0 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto max-w-[1400px]">{children}</div>
                    </main>
                </div>
            </TooltipProvider>
        </ReduxProvider>
    );
}

// -----------------------------
// Topbar (no back button; avatar trigger with no hover bg)
// -----------------------------
function Topbar({ onBurger }: { onBurger: () => void }) {
    const router = useRouter();
    const [logout] = useLogoutMutation();

    const user = {
        name: "Asal Admin",
        email: "admin@asal.com",
        avatarUrl: "/avatar.png",
    };

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear token cookie and redirect to login
            clearAuthTokenCookie();
            router.push("/auth/login");
        }
    };

    return (
        <header className="col-start-2 row-start-1 flex h-16 items-center gap-2 border-b border-neutral-200 bg-white/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:px-4">
            {/* Mobile burger */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBurger} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
            </Button>

            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Plain button so no hover background */}
                        <button className="flex items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-transparent focus:outline-none focus-visible:ring-0">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="p-0">
                                    <Image src="/Logo Asal-03.svg" alt="Asal Logo" width={20} height={20} />
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-neutral-500">{user.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/admin/profile" className="no-underline hover:no-underline">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/settings/account" className="no-underline hover:no-underline">Account settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

// -----------------------------
// Sidebar
// -----------------------------
function Sidebar({
    nav,
    pathname,
    collapsed,
    onToggle,
}: {
    nav: NavItem[];
    pathname: string | null;
    collapsed: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Sidebar header with logo, name and collapse button (AFTER the name) */}
            <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-3">
                {collapsed ? (
                    <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Expand sidebar" className="mx-auto">
                        <ChevronsRight className="h-5 w-5" />
                    </Button>
                ) : (
                    <>
                        <Image src="/Logo Asal-03.svg" alt="Asal Media Group Logo" width={32} height={32} className="h-8 w-8" priority />
                        <span className="text-sm font-semibold tracking-wide text-neutral-700">Asal Admin</span>
                        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Collapse sidebar" className="ml-auto">
                            <ChevronsLeft className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>

            <nav className="flex-1 space-y-1 overflow-hidden px-2 py-3">
                {nav.map((item) => (
                    <SidebarItem key={item.title} item={item} pathname={pathname ?? ""} collapsed={collapsed} />
                ))}
            </nav>

            <div className="border-t border-neutral-200 p-3">
                <Button variant="outline" asChild className="w-full no-underline hover:no-underline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to website
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function SidebarItem({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
    const isChildActive = (children?: { title: string; href?: string }[]) =>
        children?.some((c) => (c.href ? pathname.startsWith(c.href) : false)) ?? false;

    const active = item.href ? pathname.startsWith(item.href) : isChildActive(item.children);

    if (item.children && item.children.length > 0) {
        return (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={item.title} className="border-none">
                    {/* Single chevron via AccordionTrigger; hide when collapsed */}
                    <AccordionTrigger
                        className={`group w-full justify-between rounded-lg px-2 py-2 text-left no-underline hover:no-underline hover:bg-[#B5040F]/10 ${active ? "bg-[#B5040F]/10" : ""
                            } ${active ? "hover:bg-transparent" : ""} ${collapsed ? "[&>svg]:hidden" : ""}`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`h-5 w-5 ${active ? "text-[#B5040F]" : "text-neutral-600"}`} />
                            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-10 pr-2">
                        <div className="space-y-1 py-1">
                            {item.children.map((child) => {
                                const childActive = child.href ? pathname.startsWith(child.href) : false;
                                return (
                                    <Link
                                        key={child.title}
                                        href={child.href ?? "#"}
                                        className={`block rounded-md px-2 py-1.5 text-sm no-underline hover:no-underline hover:bg-[#B5040F]/10 ${childActive ? "bg-[#B5040F] text-white" : "text-neutral-700"
                                            }`}
                                    >
                                        {child.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    }

    // Leaf item
    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Link
                    href={item.href ?? "#"}
                    className={`group flex items-center gap-3 rounded-lg px-2 py-2 no-underline hover:no-underline ${active ? "bg-[#B5040F] text-white" : "hover:bg-[#B5040F]/10"}`}
                >
                    <item.icon className={`h-5 w-5 ${active ? "text-white" : "text-neutral-600"}`} />
                    {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
        </Tooltip>
    );
}

// -----------------------------
// Data
// -----------------------------
export type NavItem = {
    title: string;
    icon: any;
    href?: string;
    children?: { title: string; href?: string }[];
};

const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    // {
    //     title: "Media",
    //     icon: ImageIcon,
    //     children: [
    //         { title: "Library", href: "/admin/media" },
    //         { title: "Upload", href: "/admin/media/upload" },
    //     ],
    // },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "News", href: "/admin/news", icon: Newspaper },
    { title: "Categories", href: "/admin/categories", icon: Boxes },
    { title: "Brands", href: "/admin/brands", icon: Briefcase },
    { title: "Services", href: "/admin/services", icon: Wrench },
    { title: "Packages", href: "/admin/packages", icon: Package },
    { title: "Patner Reviews", href: "/admin/partner-review", icon: Star },
    { title: "Portfolio", href: "/admin/portfolio", icon: Award },
    { title: "Roles", href: "/admin/roles", icon: ShieldCheck },
];

// -----------------------------
// Hook – persisted state
// -----------------------------
function useLocalStorage<T>(key: string, initial: T) {
    const [state, setState] = useState<T>(initial);
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(key);
            if (raw !== null) setState(JSON.parse(raw));
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch { }
    }, [key, state]);
    return [state, setState] as const;
}
