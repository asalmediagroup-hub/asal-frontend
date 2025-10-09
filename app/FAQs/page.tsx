"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    HelpCircle,
    Search,
    Phone,
    MessageCircleMore,
    Building2,
    Tv,
    Cog,
    Megaphone,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

// ──────────────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────────────
type QA = { question: string; answer: string };

type FAQGroup = {
    title: string;
    icon: React.ComponentType<any>;
    items: QA[];
};

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 80);
}

function buildFaqJsonLd(groups: FAQGroup[]) {
    const all: QA[] = groups.flatMap((g) => g.items);
    const mainEntity = all.slice(0, 35).map((qa) => ({
        "@type": "Question",
        name: qa.question,
        acceptedAnswer: { "@type": "Answer", text: qa.answer },
    }));
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity,
    } as const;
}

// ──────────────────────────────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────────────────────────────
export default function FAQPage() {
    const { t } = useLanguage();
    const [query, setQuery] = useState("");

    // All FAQ content comes from translations
    const groups: FAQGroup[] = useMemo(
        () => [
            {
                title: t("faq.groups.general.title"),
                icon: HelpCircle,
                items: [
                    { question: t("faq.q.general.whatIs.title"), answer: t("faq.q.general.whatIs.body") },
                    { question: t("faq.q.general.location.title"), answer: t("faq.q.general.location.body") },
                ],
            },
            {
                title: t("faq.groups.services.title"),
                icon: Tv,
                items: [
                    { question: t("faq.q.services.whatProvide.title"), answer: t("faq.q.services.whatProvide.body") },
                    { question: t("faq.q.services.subscribeCable.title"), answer: t("faq.q.services.subscribeCable.body") },
                    { question: t("faq.q.services.whatIsIptv.title"), answer: t("faq.q.services.whatIsIptv.body") },
                ],
            },
            {
                title: t("faq.groups.corporate.title"),
                icon: Building2,
                items: [{ question: t("faq.q.corporate.videoProd.title"), answer: t("faq.q.corporate.videoProd.body") }],
            },
            {
                title: t("faq.groups.tech.title"),
                icon: Cog,
                items: [
                    { question: t("faq.q.tech.supportContact.title"), answer: t("faq.q.tech.supportContact.body") },
                    { question: t("faq.q.tech.iptvNotWorking.title"), answer: t("faq.q.tech.iptvNotWorking.body") },
                ],
            },
            {
                title: t("faq.groups.advertising.title"),
                icon: Megaphone,
                items: [{ question: t("faq.q.advertising.options.title"), answer: t("faq.q.advertising.options.body") }],
            },
        ],
        [t]
    );

    const all = useMemo(() => groups.flatMap((g) => g.items), [groups]);

    const filteredGroups = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return groups;
        return groups
            .map((g) => ({
                ...g,
                items: g.items.filter(
                    (i) => i.question.toLowerCase().includes(term) || i.answer.toLowerCase().includes(term)
                ),
            }))
            .filter((g) => g.items.length > 0);
    }, [query, groups]);

    // Deep-linking via #hash (e.g., /faq#what-is-asal-tv)
    useEffect(() => {
        const id = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
        if (!id) return;
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            if (el.tagName.toLowerCase() === "details") (el as HTMLDetailsElement).open = true;
        }
    }, []);

    const jsonLd = useMemo(() => buildFaqJsonLd(groups), [groups]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                {/* JSON-LD for SEO */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                {/* Hero */}
                <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">{t("faq.hero.title")}</h1>
                            <p className="text-xl text-muted-foreground mb-8">{t("faq.hero.subtitle")}</p>
                            <div className="relative max-w-2xl mx-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t("faq.hero.searchPlaceholder")}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full rounded-2xl border border-border bg-background pl-11 pr-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Total Questions (9)
                            </p>
                        </div>
                    </div>
                </section>

                {/* Grouped FAQs */}
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {filteredGroups.length === 0 ? (
                            <p className="text-center text-muted-foreground">{t("faq.noResults")}</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {filteredGroups.map((group) => {
                                    const Icon = group.icon;
                                    return (
                                        <Card key={group.title} className="overflow-hidden">
                                            <CardContent className="p-6 md:p-8">
                                                <div className="mb-6 flex items-center text-[#B5040F] gap-3">
                                                    <Icon className="h-6 w-6 text-[#B5040F]" />
                                                    <h2 className="text-2xl font-semibold">{group.title}</h2>
                                                </div>
                                                <div className="space-y-3">
                                                    {group.items.map((qa) => {
                                                        const id = slugify(qa.question);
                                                        return (
                                                            <details id={id} key={id} className="group rounded-2xl border border-border bg-card p-4 open:shadow-sm">
                                                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                                                                    <h3 className="text-left text-base font-semibold text-foreground">{qa.question}</h3>
                                                                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors group-open:border-primary group-open:text-primary">
                                                                        {t("faq.openPill")}
                                                                    </span>
                                                                </summary>
                                                                <div className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">
                                                                    {qa.answer}
                                                                </div>
                                                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                                    <a href={`#${id}`} className="hover:text-foreground/80 hover:underline">
                                                                        {t("faq.permalink")}
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (navigator?.clipboard) {
                                                                                navigator.clipboard.writeText(`${window.location.origin}/faq#${id}`);
                                                                            }
                                                                        }}
                                                                        className="rounded-full border border-border px-2 py-1 hover:bg-muted"
                                                                    >
                                                                        {t("faq.copyLink")}
                                                                    </button>
                                                                </div>
                                                            </details>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Contact block */}
                <section className="pb-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                                <Phone className="h-6 w-6 text-[#B5040F]" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[#B5040F]">{t("faq.contact.title")}</h3>
                                    <p className="text-muted-foreground">{t("faq.contact.subtitle")}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button className="bg-[#B5040F] text-white" asChild variant="default">
                                        <a href="tel:424">{t("faq.contact.callCta")}</a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full bg-[#25D366] text-white border-[#25D366] hover:bg-[#25D366] hover:text-white"
                                    >
                                        <a
                                            href="https://wa.me/252619993395"
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label="WhatsApp"
                                            title={t("faq.contact.whatsappTitle")}
                                        >
                                            <MessageCircleMore className="h-5 w-5 fw-bolder" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
