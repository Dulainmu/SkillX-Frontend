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

            {/* Enhanced Personality & Skills Analysis */}
            <div className="space-y-6">
                {/* Personality Analysis */}
                {profile && (
                    <Card className="p-6">
                        <h3 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-2">🧭</span> Your Personality Profile
                        </h3>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Big Five */}
                            <div>
                                <h4 className="font-semibold mb-3 text-lg">Big Five Personality Traits</h4>
                                <div className="space-y-3">
                                    {Object.entries(profile.BigFive).map(([trait, value]) => {
                                        const percentage = Math.round((value as number) * 100);
                                        const getTraitDescription = (traitName: string, score: number) => {
                                            const descriptions: Record<string, Record<string, string>> = {
                                                'Openness': {
                                                    high: 'You are curious, creative, and open to new experiences. Great for innovative roles!',
                                                    medium: 'You balance tradition with new ideas. Adaptable to various work environments.',
                                                    low: 'You prefer structure and proven methods. Excellent for roles requiring consistency.'
                                                },
                                                'Conscientiousness': {
                                                    high: 'You are organized, responsible, and detail-oriented. Perfect for leadership roles!',
                                                    medium: 'You are reliable and can adapt your work style as needed.',
                                                    low: 'You are flexible and spontaneous. Great for creative and dynamic roles.'
                                                },
                                                'Extraversion': {
                                                    high: 'You are outgoing, energetic, and social. Excellent for client-facing roles!',
                                                    medium: 'You can work well both independently and in teams.',
                                                    low: 'You are thoughtful and prefer focused work. Great for analytical roles.'
                                                },
                                                'Agreeableness': {
                                                    high: 'You are cooperative, trusting, and empathetic. Perfect for team collaboration!',
                                                    medium: 'You can balance cooperation with assertiveness when needed.',
                                                    low: 'You are direct and competitive. Great for roles requiring strong decision-making.'
                                                },
                                                'Neuroticism': {
                                                    high: 'You may experience stress more easily. Consider roles with clear structure.',
                                                    medium: 'You handle stress reasonably well in most situations.',
                                                    low: 'You are emotionally stable and handle pressure well. Great for high-stress roles!'
                                                }
                                            };
                                            const level = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
                                            return descriptions[traitName]?.[level] || 'This trait influences your work style.';
                                        };
                                        
                                        return (
                                            <div key={trait} className="p-3 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-sm">{trait}</span>
                                                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded">
                                                    <div 
                                                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded" 
                                                        style={{ width: `${percentage}%` }} 
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-600 mt-2">
                                                    {getTraitDescription(trait, value as number)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RIASEC */}
                            <div>
                                <h4 className="font-semibold mb-3 text-lg">Career Interests (RIASEC)</h4>
                                <div className="space-y-3">
                                    {Object.entries(profile.RIASEC).map(([interest, value]) => {
                                        const percentage = Math.round((value as number) * 100);
                                        const getInterestDescription = (interestName: string) => {
                                            const descriptions = {
                                                'Realistic': 'You enjoy working with things, machines, tools, or outdoors.',
                                                'Investigative': 'You like to observe, learn, investigate, analyze, evaluate, or solve problems.',
                                                'Artistic': 'You prefer to work with ideas, and express yourself through art, music, or writing.',
                                                'Social': 'You enjoy working with people, helping, teaching, or serving others.',
                                                'Enterprising': 'You like to work with people, influence, persuade, lead, or manage.',
                                                'Conventional': 'You prefer to work with data, have clerical or numerical ability.'
                                            };
                                            return descriptions[interestName as keyof typeof descriptions] || 'This interest area may influence your career satisfaction.';
                                        };
                                        
                                        return (
                                            <div key={interest} className="p-3 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-sm">{interest}</span>
                                                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded">
                                                    <div 
                                                        className="h-2 bg-gradient-to-r from-green-500 to-teal-600 rounded" 
                                                        style={{ width: `${percentage}%` }} 
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-600 mt-2">
                                                    {getInterestDescription(interest)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Work Values */}
                            <div>
                                <h4 className="font-semibold mb-3 text-lg">Work Values</h4>
                                <div className="space-y-2">
                                    {Object.entries(profile.WorkValues).map(([value, score]) => (
                                        <div key={value} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">{value}</span>
                                                <span className="text-xs text-muted-foreground">{score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Career Matches with Skills Analysis */}
                <div className="space-y-8">
                    {topMatches.map((match, index) => {
                        // Get skills relevant to this career path
                        const careerSkills = data.skills ? Object.entries(data.skills).filter(([skillName, skillData]: [string, any]) => {
                            if (!skillData.selected || skillData.level === 0) return false;
                            // Check if this skill is relevant to the career path
                            // For now, we'll show all selected skills, but this could be enhanced with career-specific filtering
                            return true;
                        }) : [];

                        const getLevelDescription = (level: number) => {
                            const descriptions = {
                                1: 'Beginner - Basic understanding, can follow tutorials',
                                2: 'Intermediate - Can work on projects independently',
                                3: 'Advanced - Can handle complex projects and mentor beginners',
                                4: 'Expert - Can architect solutions and lead teams'
                            };
                            return descriptions[level as keyof typeof descriptions] || 'Skill level assessed';
                        };

                        const getLevelColor = (level: number) => {
                            const colors = {
                                1: 'from-blue-400 to-blue-600',
                                2: 'from-green-400 to-green-600',
                                3: 'from-purple-400 to-purple-600',
                                4: 'from-orange-400 to-orange-600'
                            };
                            return colors[level as keyof typeof colors] || 'from-gray-400 to-gray-600';
                        };

                        const getNextLevelTarget = (currentLevel: number) => {
                            if (currentLevel >= 4) return 'Master level achieved!';
                            const nextLevel = currentLevel + 1;
                            const targets = {
                                2: 'Focus on independent project work and problem-solving',
                                3: 'Work on complex projects and start mentoring others',
                                4: 'Lead teams and architect solutions'
                            };
                            return targets[nextLevel as keyof typeof targets] || 'Continue building experience';
                        };

                        const getEstimatedTime = (currentLevel: number) => {
                            const estimates = {
                                1: '3-6 months',
                                2: '6-12 months',
                                3: '12-18 months'
                            };
                            return estimates[currentLevel as keyof typeof estimates] || 'Varies';
                        };

                        return (
                            <Card key={match.pathId} className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{match.name}</h3>
                                        <p className="text-gray-600 mb-4">{match.description}</p>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Match Score:</span>
                                                <span className="text-lg font-bold text-blue-600">{Math.round(match.currentRole.score)}%</span>
                                            </div>
                                            {match.averageSalary && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Salary:</span>
                                                    <span className="text-green-600">{match.averageSalary}</span>
                                                </div>
                                            )}
                                            {match.jobGrowth && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Growth:</span>
                                                    <span className="text-purple-600">{match.jobGrowth}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleShowCareerModal(match)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        View Details
                                    </Button>
                                </div>

                                {/* Skills Assessment for this Career */}
                                {careerSkills.length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-xl font-bold mb-4 flex items-center">
                                            <span className="mr-2">⚡</span> Skills Assessment for {match.name}
                                        </h4>
                                        
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Current Skills */}
                                            <div>
                                                <h5 className="font-semibold mb-3 text-lg">Your Current Skills</h5>
                                                <div className="space-y-3">
                                                    {careerSkills.map(([skillName, skillData]: [string, any]) => (
                                                        <div key={skillName} className="p-3 rounded-lg border border-gray-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="font-medium text-sm">{skillName}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-semibold">Level {skillData.level}</span>
                                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getLevelColor(skillData.level)}`}></div>
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-gray-200 rounded mb-1">
                                                                <div 
                                                                    className={`h-1.5 bg-gradient-to-r ${getLevelColor(skillData.level)} rounded`}
                                                                    style={{ width: `${(skillData.level / 4) * 100}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-600">
                                                                {getLevelDescription(skillData.level)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Learning Recommendations */}
                                            <div>
                                                <h5 className="font-semibold mb-3 text-lg">Learning Recommendations</h5>
                                                <div className="space-y-3">
                                                    {careerSkills.map(([skillName, skillData]: [string, any]) => (
                                                        <div key={skillName} className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-medium text-blue-900 text-sm">{skillName}</span>
                                                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                                                    Level {skillData.level} → {skillData.level < 4 ? skillData.level + 1 : 'Master'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-blue-800 mb-1">
                                                                {getNextLevelTarget(skillData.level)}
                                                            </p>
                                                            <div className="flex justify-between items-center text-xs text-blue-600">
                                                                <span>Time: {getEstimatedTime(skillData.level)}</span>
                                                                <span>Focus: {skillData.level < 4 ? 'Advanced concepts' : 'Leadership'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Career Path Summary */}
                                        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                            <h5 className="font-semibold mb-2 text-gray-800">Career Path Summary</h5>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {careerSkills.length}
                                                    </div>
                                                    <div className="text-xs text-gray-600">Skills Assessed</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-green-600">
                                                        {(() => {
                                                            const skills = careerSkills.filter(([_, skillData]: [string, any]) => skillData.level >= 2);
                                                            return skills.length;
                                                        })()}
                                                    </div>
                                                    <div className="text-xs text-gray-600">Intermediate+</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-purple-600">
                                                        {(() => {
                                                            const skills = careerSkills.filter(([_, skillData]: [string, any]) => skillData.level >= 3);
                                                            return skills.length;
                                                        })()}
                                                    </div>
                                                    <div className="text-xs text-gray-600">Advanced+</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

            {/* Assessment Summary */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-2">📊</span> Assessment Summary
                </h3>
                
                <div className="grid md:grid-cols-4 gap-6">
                    {/* Quiz Completion */}
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {data?.answers ? Object.keys(data.answers).length : 32}
                        </div>
                        <div className="text-sm text-gray-600">Personality Questions</div>
                        <div className="text-xs text-green-600 mt-1">✓ Completed</div>
                    </div>

                    {/* Skills Assessed */}
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {data?.skills ? Object.values(data.skills).filter((s: any) => s.selected && s.level > 0).length : 0}
                        </div>
                        <div className="text-sm text-gray-600">Skills Assessed</div>
                        <div className="text-xs text-blue-600 mt-1">Levels: 1-4</div>
                    </div>

                    {/* Average Skill Level */}
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {(() => {
                                const skills = data?.skills ? Object.values(data.skills).filter((s: any) => s.selected && s.level > 0) : [];
                                if (skills.length === 0) return '0';
                                const total = skills.reduce((sum: number, skill: any) => sum + skill.level, 0);
                                return (total / skills.length).toFixed(1);
                            })()}
                        </div>
                        <div className="text-sm text-gray-600">Avg Skill Level</div>
                        <div className="text-xs text-purple-600 mt-1">Out of 4</div>
                    </div>

                    {/* Career Matches */}
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {topMatches.length}
                        </div>
                        <div className="text-sm text-gray-600">Career Matches</div>
                        <div className="text-xs text-orange-600 mt-1">Personalized</div>
                    </div>
                </div>

                {/* Key Insights */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
                    <h4 className="font-semibold mb-3 text-gray-800">Key Insights</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span className="text-gray-700">
                                    <strong>Personality:</strong> {(() => {
                                        if (!profile?.BigFive) return 'Analysis complete';
                                        const traits = Object.entries(profile.BigFive);
                                                                        const highest = traits.reduce((max: [string, number], [trait, value]) => 
                                    (value as number) > (max[1] as number) ? [trait, value] : max, traits[0] as [string, number]);
                                        return `${highest[0]} is your strongest trait`;
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-gray-700">
                                    <strong>Interests:</strong> {(() => {
                                        if (!profile?.RIASEC) return 'Analysis complete';
                                        const interests = Object.entries(profile.RIASEC);
                                                                        const highest = interests.reduce((max: [string, number], [interest, value]) => 
                                    (value as number) > (max[1] as number) ? [interest, value] : max, interests[0] as [string, number]);
                                        return `${highest[0]} work environments suit you best`;
                                    })()}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span className="text-gray-700">
                                    <strong>Skills:</strong> {(() => {
                                        const skills = data?.skills ? Object.values(data.skills).filter((s: any) => s.selected && s.level > 0) : [];
                                        if (skills.length === 0) return 'No skills assessed';
                                        const advanced = skills.filter((s: any) => s.level >= 3).length;
                                        return `${advanced} advanced skills, ${skills.length - advanced} developing`;
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                <span className="text-gray-700">
                                    <strong>Growth:</strong> {(() => {
                                        const skills = data?.skills ? Object.values(data.skills).filter((s: any) => s.selected && s.level > 0) : [];
                                        if (skills.length === 0) return 'Ready to learn';
                                        const canAdvance = skills.filter((s: any) => s.level < 4).length;
                                        return `${canAdvance} skills ready for advancement`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

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
