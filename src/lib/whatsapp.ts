import { site } from "@/data/site";

export function createWhatsAppLink(message: string): string {
  const digits = site.whatsappNumber.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("0")
    ? `234${digits.slice(1)}`
    : digits;

  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}
