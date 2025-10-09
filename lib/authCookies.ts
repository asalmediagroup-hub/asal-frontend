export function setAuthTokenCookie(token: string, maxAgeSeconds: number = 60 * 60 * 24 * 7) {
    try {
        const parts = [
            `token=${encodeURIComponent(token)}`,
            `Path=/`,
            `Max-Age=${maxAgeSeconds}`,
            `SameSite=Lax`,
            // In production over HTTPS, Secure should be enabled. It is safe to always set; browsers ignore on http.
            `Secure`,
        ];
        document.cookie = parts.join('; ');
    } catch { }
}

export function clearAuthTokenCookie() {
    try {
        document.cookie = `token=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
    } catch { }
}

export function getAuthTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}


