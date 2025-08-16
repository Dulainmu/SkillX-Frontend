// src/components/assessment/steps/AdditionalSkills.tsx
import { useMemo, useState } from "react";
import { SKILL_CATALOG } from "@/data/skillsCatalog";

type SkillMap = Record<string, { selected: boolean; level: number }>;

export function AdditionalSkills({
                                     value,
                                     setValue
                                 }: {
    value: SkillMap;
    setValue: (next: SkillMap) => void;
}) {
    const [query, setQuery] = useState("");

    const chosen = useMemo(() => new Set(Object.keys(value || {})), [value]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return SKILL_CATALOG
            .filter((s) => !chosen.has(s))
            .filter((s) => (q ? s.toLowerCase().includes(q) : true))
            .slice(0, 10);
    }, [query, chosen]);

    const addSkill = (name: string) => {
        if (!name || chosen.has(name)) return;
        setValue({ ...value, [name]: { selected: true, level: 1 } }); // default 1
        setQuery("");
    };

    const removeSkill = (name: string) => {
        const next = { ...value };
        delete next[name];
        setValue(next);
    };

    const setLevel = (name: string, level: number) => {
        setValue({ ...value, [name]: { selected: true, level } });
    };

    return (
        <div className="mt-10 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-2">Other Skills (optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Add any extra skills not listed above (e.g., Linux, Docker, Kubernetes, CI/CD, Cloud, Git).
            </p>

            {/* Search + Quick-Add */}
            <div className="flex gap-2 mb-3">
                <input
                    className="flex-1 h-10 px-3 rounded-lg border bg-background/50"
                    placeholder="Search skills…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && query.trim()) {
                            e.preventDefault();
                            addSkill(query.trim());
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={() => query.trim() && addSkill(query.trim())}
                    className="h-10 px-4 rounded-lg bg-primary text-white"
                >
                    Add
                </button>
            </div>

            {/* Suggestions */}
            {filtered.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {filtered.map((s) => (
                        <button
                            type="button"
                            key={s}
                            onClick={() => addSkill(s)}
                            className="px-3 py-1 rounded-full text-sm border hover:bg-muted"
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Selected skills with 0–4 level controls */}
            {Object.keys(value).length > 0 && (
                <div className="space-y-3">
                    {Object.entries(value).map(([name, { level }]) => (
                        <div key={name} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="font-medium">{name}</div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {[0, 1, 2, 3, 4].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setLevel(name, n)}
                                            className={`w-8 h-8 rounded-md border text-sm ${
                                                n === level ? "bg-primary text-white" : "bg-background"
                                            }`}
                                            title={`${name} – Level ${n}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeSkill(name)}
                                    className="px-3 py-1 rounded-md border text-sm hover:bg-muted"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
