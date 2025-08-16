import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type {
    BackendRecommendationsResponse,
    BackendTopMatch,
    BackendPath,
} from '@/types/backendRecommendations';
import { getApiUrl, getAuthToken } from '@/config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ResultsProps {
    data: any;
    onNext: (data: any) => void;
    onPrevious: () => void;
    isLoading?: boolean;
    canGoBack: boolean;
}

const FitBar = ({ label, value }: { label: string; value: number | undefined }) => {
    const pct = typeof value === 'number'
        ? Math.round((value <= 1 ? value * 100 : value))
        : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const PercentBar = ({ label, value }: { label: string; value: number }) => {
    const pct = Math.round(value * 100); // expects 0..1
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-foreground">{label}</span>
                <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded">
                <div className="h-2 bg-secondary rounded" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

function findPathById(paths: BackendPath[] | undefined, id: string): BackendPath | undefined {
    return (paths || []).find(p => p.id === id);
}

/**
 * Resolve the best-available match score:
 * - Prefer topMatch.currentRole.score if present and valid
 * - Else use path.currentRole.weightedScore (0..100)
 * - Else compute weighted blend from individual fit scores
 * - Always return a valid number or null with clear indication
 */
function resolveMatchScore(match: BackendTopMatch, path?: BackendPath): number | null {
    // Primary source: topMatch.currentRole.score
    if (typeof match?.currentRole?.score === 'number' && 
        !isNaN(match.currentRole.score) && 
        match.currentRole.score >= 0 && 
        match.currentRole.score <= 100) {
        return Math.round(match.currentRole.score);
    }
    
    // Secondary source: path.currentRole.weightedScore
    const snap = path?.currentRole;
    if (snap && typeof snap.weightedScore === 'number' && 
        !isNaN(snap.weightedScore) && 
        snap.weightedScore >= 0 && 
        snap.weightedScore <= 100) {
        return Math.round(snap.weightedScore);
    }
    
    // Fallback: compute from individual fit scores if available
    if (snap) {
        const skillPct = typeof snap.skillFit === 'number' && !isNaN(snap.skillFit) ? snap.skillFit : undefined;
        const persPct = typeof snap.personalityFit === 'number' && !isNaN(snap.personalityFit) ? snap.personalityFit : undefined;
        const learnPct = typeof snap.learningFit === 'number' && !isNaN(snap.learningFit) ? snap.learningFit : undefined;

        // Only compute if we have at least 2 out of 3 fit scores
        const validScores = [skillPct, persPct, learnPct].filter(s => s != null);
        if (validScores.length >= 2) {
            // Use available scores, default missing ones to 0.5
            const skill = skillPct ?? 0.5;
            const pers = persPct ?? 0.5;
            const learn = learnPct ?? 0.5;
            const score = (skill * 0.6) + (pers * 0.3) + (learn * 0.1);
            return Math.round(score * 100);
        }
    }
    
    // If we can't compute a score, return null to indicate data is incomplete
    return null;
}

function resolveCurrentRoleTitleLevel(
    match: BackendTopMatch,
    path?: BackendPath
): { title: string; level: string } {
    // topMatches payload
    if (match?.currentRole?.title) {
        return { title: match.currentRole.title, level: match.currentRole.level || '-' };
    }
    // path snapshot payload
    if (path?.currentRole) {
        const s: any = path.currentRole as any;
        // some dumps had `roleTitle`; others `title`
        const title = s.roleTitle || s.title || '(Role)';
        const level = s.level || '-';
        return { title, level };
    }
    return { title: '-', level: '-' };
}

export const Results: React.FC<ResultsProps> = ({ data, onPrevious, canGoBack }) => {
    const navigate = useNavigate();
    const [backend, setBackend] = useState<BackendRecommendationsResponse | null>(data.backend || null);
    const [loading, setLoading] = useState(!data.backend);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCareer, setSelectedCareer] = useState<BackendTopMatch | null>(null);
    const [selectedPath, setSelectedPath] = useState<BackendPath | null>(null);

    // Fallback fetch if AssessmentFlow didn't set backend payload
    useEffect(() => {
        if (backend) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const token = getAuthToken();
                const res = await fetch(getApiUrl('/api/recommendations/personalized'), {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(`${res.status} ${txt}`);
                }
                const raw = await res.json();
                // Normalize legacy recommendations payload to BackendRecommendationsResponse
                const normalized: BackendRecommendationsResponse = ((): BackendRecommendationsResponse => {
                    if (Array.isArray((raw as any)?.recommendations) && !(raw as any)?.topMatches) {
                        return {
                            topMatches: (raw as any).recommendations.map((r: any) => ({
                                pathId: String(r.id || r._id || r.slug || r.name || 'unknown'),
                                name: r.name,
                                description: r.description,
                                currentRole: {
                                    title: r.name || 'Role',
                                    level: 'entry',
                                    score: typeof r.matchPercentage === 'number' ? r.matchPercentage : 0,
                                },
                                averageSalary: r.averageSalary,
                                jobGrowth: r.jobGrowth,
                            })),
                            profile: undefined as unknown as any,
                            paths: [],
                            timestamp: (raw as any).timestamp,
                        };
                    }
                    return raw as BackendRecommendationsResponse;
                })();
                if (!cancelled) setBackend(normalized);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('Failed to load recommendations');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [backend]);

    const topMatches: BackendTopMatch[] = useMemo(
        () => backend?.topMatches ?? [],
        [backend]
    );

    const pathsById: Record<string, BackendPath> = useMemo(() => {
        const map: Record<string, BackendPath> = {};
        (backend?.paths || []).forEach(p => { map[p.id] = p; });
        return map;
    }, [backend]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-16">
                <div className="relative">
                    <div className="spinner"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🧠</span>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Analyzing your profile…</h2>
                    <p>We’re matching your skills and preferences with career opportunities</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-2">Unable to load recommendations</h2>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                {canGoBack && (
                    <Button variant="outline" onClick={onPrevious}>Back</Button>
                )}
            </Card>
        );
    }

    const profile = backend?.profile;

    const handleBrowseAllCareers = () => {
        // Navigate to browse careers with assessment context
        navigate('/browse-careers', { 
            state: { 
                fromAssessment: true,
                assessmentData: data,
                recommendations: backend
            }
        });
    };

    const handleShowCareerModal = (career: BackendTopMatch) => {
        setSelectedCareer(career);
        setSelectedPath(pathsById[career.pathId] || findPathById(backend?.paths, career.pathId) || null);
        setShowModal(true);
    };
    const handleStartCareerPath = () => {
        if (selectedCareer) {
            navigate(`/career-roadmap/${selectedCareer.pathId}`);
            setShowModal(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Modal for career path brief */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedCareer?.name}</DialogTitle>
                        <DialogDescription>{selectedCareer?.description}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="font-semibold mb-2">Roadmap Brief</div>
                        <div className="text-sm text-muted-foreground">
                            {selectedPath?.description || 'No roadmap brief available.'}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleStartCareerPath} className="w-full">Start Career Path</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Header */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Your Career Matches</h2>
                <p className="text-muted-foreground">Powered by your validated quiz + skills + preferences</p>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div><strong>{data?.answers ? Object.keys(data.answers).length : 32}</strong> Quiz Answers</div>
                    <div><strong>{data?.skills ? Object.values(data.skills).filter((s: any) => s.selected && s.level > 0).length : 0}</strong> Skills Selected</div>
                    <div><strong>{topMatches.length}</strong> Top Matches</div>
                </div>
            </div>

            {/* Personality transparency */}
            {profile && (
                <Card className="p-6">
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                        <span className="mr-2">🧭</span> Your Profile Snapshot
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Big Five */}
                        <div>
                            <h4 className="font-semibold mb-3">Big Five</h4>
                            <div className="space-y-2">
                                {Object.entries(profile.BigFive).map(([k, v]) => (
                                    <PercentBar key={k} label={k} value={v as number} />
                                ))}
                            </div>
                        </div>

                        {/* RIASEC */}
                        <div>
                            <h4 className="font-semibold mb-3">RIASEC</h4>
                            <div className="space-y-2">
                                {Object.entries(profile.RIASEC).map(([k, v]) => (
                                    <PercentBar key={k} label={k} value={v as number / 1} />
                                ))}
                            </div>
                        </div>

                        {/* Work Values */}
                        <div>
                            <h4 className="font-semibold mb-3">Work Values</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(profile.WorkValues).map(([k, v]) => (
                                    <div key={k} className="text-xs p-2 rounded bg-primary/5 flex items-center justify-between">
                                        <span className="font-medium">{k}</span>
                                        <span className="text-muted-foreground">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Top Matches */}
            <div className="grid gap-6 max-w-4xl mx-auto">
                {topMatches.length === 0 && (
                    <Card className="p-6">
                        <p className="text-muted-foreground">No matches found. Try adjusting your inputs.</p>
                    </Card>
                )}

                {topMatches.map((m) => {
                    const path = pathsById[m.pathId] || findPathById(backend?.paths, m.pathId);
                    const score = resolveMatchScore(m, path);
                    const current = resolveCurrentRoleTitleLevel(m, path);
                    const next = m.nextRole || path?.nextRole;
                    const fit = path?.currentRole;

                    // Build transparent “why” bullets
                    const why: string[] = [];
                    if (typeof fit?.skillFit === 'number') {
                        const s = Math.round((fit.skillFit <= 1 ? fit.skillFit * 100 : fit.skillFit));
                        if (s >= 60) why.push('Strong skills alignment');
                        else if (s >= 40) why.push('Moderate skills alignment');
                        else why.push('Skills partially match');
                    }
                    if (typeof fit?.personalityFit === 'number') {
                        const p = Math.round((fit.personalityFit <= 1 ? fit.personalityFit * 100 : fit.personalityFit));
                        if (p >= 60) why.push('Personality fit is strong for this path');
                        else if (p >= 40) why.push('Personality fit is decent');
                        else why.push('Personality fit is developing');
                    }
                    if (typeof fit?.learningFit === 'number') {
                        const l = Math.round((fit.learningFit <= 1 ? fit.learningFit * 100 : fit.learningFit));
                        if (l >= 60) why.push('Learning style matches training resources');
                        else why.push('Learning style has acceptable match');
                    }

                    return (
                        <Card key={m.pathId} className="p-8 hover:shadow-lg transition-all duration-300">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">{m.name}</h3>
                                        <p className="text-muted-foreground">{m.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-primary">
                                            {typeof score === 'number' ? `${score}%` : 'Score Unavailable'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {typeof score === 'number' ? 'Match Score' : 'Data incomplete - check assessment inputs'}
                                        </div>
                                    </div>
                                </div>

                                {/* Why you got this match (transparent breakdown) */}
                                {(fit?.skillFit != null || fit?.personalityFit != null || fit?.learningFit != null) && (
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <FitBar label="Skills fit" value={fit?.skillFit} />
                                        <FitBar label="Personality fit" value={fit?.personalityFit} />
                                        <FitBar label="Learning fit" value={fit?.learningFit} />
                                    </div>
                                )}

                                {/* Current vs Next */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">You likely fit now</h4>
                                        <div className="p-3 rounded bg-primary/5">
                                            <div className="text-sm">
                                                <strong>{current.title}</strong> ({current.level})
                                            </div>
                                        </div>
                                        {/* Why bullets */}
                                        {why.length > 0 && (
                                            <ul className="mt-3 space-y-1">
                                                {why.slice(0, 3).map((reason, i) => (
                                                    <li key={i} className="text-sm text-muted-foreground flex items-start">
                                                        <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                        {reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {next && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Next role & missing skills</h4>
                                            <div className="space-y-2">
                                                <div className="text-sm p-3 rounded bg-secondary/5">
                                                    <strong>{next.title}</strong> ({next.level})
                                                </div>
                                                {(next.missingSkills || []).slice(0, 6).map((s, i) => (
                                                    <div key={i} className="text-sm flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200">
                                                        <span>{s.skill}</span>
                                                        <span className="text-xs text-muted-foreground">have {s.have} → need {s.need}</span>
                                                    </div>
                                                ))}
                                                {next.missingSkills?.length === 0 && (
                                                    <div className="text-sm text-muted-foreground">No gaps detected 🎉</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="text-center">
                                        <div className="font-semibold">{m.averageSalary || '—'}</div>
                                        <div className="text-xs text-muted-foreground">Salary Range</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">{m.jobGrowth || '—'}</div>
                                        <div className="text-xs text-muted-foreground">Market Growth</div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        className="w-full"
                                        onClick={() => handleShowCareerModal(m)}
                                    >
                                        Start Learning Path
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="text-center space-y-4 pt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {canGoBack && (
                        <Button variant="outline" onClick={onPrevious}>
                            Adjust Inputs
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        onClick={handleBrowseAllCareers}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                        Browse All Careers
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90">
                        Download Full Report
                    </Button>
                </div>
                
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    Ready to explore more options? Browse our complete career database to discover 
                    additional paths that might interest you.
                </p>
            </div>
        </div>
    );
};
