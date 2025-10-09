import { LanguageProvider } from "@/components/language-provider";
import { ReduxProvider } from "@/components/redux-provider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-white font-sans antialiased">
                <ReduxProvider>
                    <LanguageProvider>
                        <div className="relative flex min-h-screen flex-col">
                            <div className="flex-1">
                                {children}
                            </div>
                        </div>
                    </LanguageProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
