import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fileToUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

export const urlToFile = async (url: string): Promise<File> => {
  try {
    
    const response = await fetch(url)
    const blob = await response.blob()
    const filename = url.split("/").pop() || "file"
    return new File([blob], filename, { type: blob.type })
  } catch (error) {
    return new File([], "file.png")
  }
}


export const formatPrice = (price: number, locale: "ar" | "en" | "fr") => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };


export const formatDate = (dateStr: string, locale: string = "en") => {
      return new Date(dateStr).toLocaleDateString(
        locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-FR" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
    };