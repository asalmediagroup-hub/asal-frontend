"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLoginMutation } from "@/slices/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, LogIn, ArrowLeft, X } from "lucide-react";

/** Admin login with logo, error alert and temp credentials */
export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const [login] = useLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await login({ email, password }).unwrap();
            console.log("res", res);
            if (res?.token) {
                router.push('/admin/users');
            } else {
                setError("Invalid response from server.");
            }
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto dismiss error after 3 seconds
    useEffect(() => {
        if (error) {
            setShowAlert(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setShowAlert(false);
                setError(null);
            }, 3000);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [error]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(900px_500px_at_80%_-10%,#fde7e9_12%,transparent_60%),radial-gradient(700px_460px_at_20%_110%,#f6f7fb_10%,transparent_60%)]">
            <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:22px_22px] opacity-40" />

            <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-5 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full"
                >
                    <Card className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#B5040F] via-rose-500 to-[#B5040F]" />

                        <CardHeader className="px-8 pb-4 pt-10 text-center">
                            <div className="mb-4 flex justify-center">
                                <Image
                                    src="/Logo Asal-03.svg"
                                    alt="Asal Media Group Logo"
                                    width={64}
                                    height={64}
                                    className="h-16 w-16"
                                    priority
                                />
                            </div>
                            <CardTitle className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">
                                Admin Portal
                            </CardTitle>
                            <CardDescription className="text-neutral-600">
                                Sign in to your admin account
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-8 pb-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Dismissible Alert (above email field) */}
                                {showAlert && error && (
                                    <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50/90 p-3 text-sm text-red-700 shadow-sm">
                                        <div className="leading-5 font-medium">{error}</div>
                                        <button
                                            type="button"
                                            aria-label="Close alert"
                                            onClick={() => {
                                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                                setShowAlert(false);
                                                setError(null);
                                            }}
                                            className="ml-2 rounded-md p-1 text-red-600 hover:bg-red-100"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-neutral-800">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@asalmediagroup.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl border-2 border-neutral-200/80 bg-neutral-50/70 text-neutral-900 placeholder:text-neutral-400 focus:border-[#B5040F] focus:ring-4 focus:ring-[#B5040F]/15"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-semibold text-neutral-800">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 rounded-xl border-2 border-neutral-200/80 bg-neutral-50/70 pr-12 text-neutral-900 placeholder:text-neutral-400 focus:border-[#B5040F] focus:ring-4 focus:ring-[#B5040F]/15"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#B5040F]"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-neutral-300 text-[#B5040F] focus:ring-2 focus:ring-[#B5040F]/20"
                                        />
                                        Remember me
                                    </label>
                                    <Link
                                        href="/admin/forgot-password"
                                        className="text-sm font-semibold text-[#B5040F] hover:text-[#B5040F]/80"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#B5040F] via-rose-600 to-[#B5040F] text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            <span>Signing in…</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <LogIn className="h-5 w-5" />
                                            <span>Sign In</span>
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
