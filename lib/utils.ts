import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fileToUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

export const urlToFile = async (url: string): Promise<File> => {
  const response = await fetch(url)
  const blob = await response.blob()
  const filename = url.split("/").pop() || "file"
  return new File([blob], filename, { type: blob.type })
}