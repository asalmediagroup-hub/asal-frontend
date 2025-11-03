import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves image URLs to handle base64 encoding, HTTP URLs, and legacy file paths.
 * Images are now stored as base64 strings in the database.
 * 
 * @param src - Image source: base64 string, data URI, HTTP URL, or file path
 * @param placeholder - Fallback placeholder URL (default: "/placeholder.svg")
 * @returns Resolved image URL
 */
export function resolveImageUrl(src: string | null | undefined, placeholder: string = "/placeholder.svg"): string {
  if (!src) return placeholder;
  
  const s = src.trim();
  
  // Handle empty or invalid strings
  const isMissing = !s || s === "null" || s === "undefined" || s === "#" || s === "/";
  if (isMissing || s === placeholder || s.startsWith("/placeholder") || s.startsWith("placeholder")) {
    return placeholder;
  }
  
  // Handle data URIs (data:image/png;base64,...)
  if (s.startsWith("data:")) {
    return s;
  }
  
  // Handle HTTP/HTTPS URLs
  if (/^(https?:)?\/\//i.test(s)) {
    return s;
  }
  
  // Check if it's a raw base64 string (no prefix)
  // Base64 strings are typically long (>100 chars) and contain only base64 characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  const looksLikeBase64 = s.length > 100 && base64Regex.test(s);
  
  if (looksLikeBase64) {
    // Assume it's an image - add data URI prefix
    // Try to detect format from first few chars or default to jpeg
    let mimeType = "image/jpeg";
    if (s.startsWith("/9j/") || s.startsWith("/9j")) {
      mimeType = "image/jpeg";
    } else if (s.startsWith("iVBORw0KGgo")) {
      mimeType = "image/png";
    } else if (s.startsWith("R0lGOD")) {
      mimeType = "image/gif";
    } else if (s.startsWith("UklGR") || s.startsWith("/9j/4AAQ")) {
      mimeType = "image/webp";
    }
    return `data:${mimeType};base64,${s}`;
  }
  
  // Handle legacy file paths (for backward compatibility)
  const base = (process.env.NEXT_PUBLIC_API_IMAGE_URL || "").trim();
  if (base) {
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${cleanBase}${path}`;
  }
  
  // Fallback to placeholder if we can't resolve
  return placeholder;
}