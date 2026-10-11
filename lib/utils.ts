export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
