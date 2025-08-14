import zikir from "../../../shared/data/zikir.json";
import type { Zikir } from "../types/zikir";

export const getAllZikir = (): Zikir[] => zikir as Zikir[];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export const searchZikir = (q: string): Zikir[] => {
  const all = getAllZikir();
  const query = norm(q.trim());
  if (!query) return all.slice(0, 50); // default first 50
  return all.filter((z) => {
    return (
      norm(z.name).includes(query) ||
      norm(z.arabic).includes(query) ||
      norm(z.transliteration).includes(query) ||
      norm(z.translation).includes(query) ||
      norm(z.category).includes(query)
    );
  }).slice(0, 50);
};