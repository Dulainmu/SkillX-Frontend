import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen, Target, CheckCircle, ExternalLink } from 'lucide-react';

interface SkillProficiencyLevel {
  level: string;
  title: string;
  description: string;
  expectations: string[];
  projects: string[];
  timeToAchieve: number;
  prerequisites: string[];
  resources: any[];
}

interface SkillProficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  proficiencyLevels: SkillProficiencyLevel[];
}

const levelColors = {
  'Beginner': 'bg-green-100 text-green-800 border-green-200',
  'Intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
  'Advanced': 'bg-purple-100 text-purple-800 border-purple-200',
  'Expert': 'bg-orange-100 text-orange-800 border-orange-200'
};

const levelIcons = {
  'Beginner': '🌱',
  'Intermediate': '🚀',
  'Advanced': '⚡',
  'Expert': '🏆'
};

export const SkillProficiencyModal: React.FC<SkillProficiencyModalProps> = ({
  isOpen,
  onClose,
  skillName,
  proficiencyLevels
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {skillName} - Proficiency Levels
          </DialogTitle>
          <p className="text-gray-600">
            Master {skillName} through structured learning paths with clear expectations and projects
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {proficiencyLevels.map((level, index) => (
            <Card key={level.level} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{levelIcons[level.level as keyof typeof levelIcons]}</span>
                    <div>
                      <CardTitle className="text-xl text-gray-900">
                        Level {index + 1}: {level.title}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 ${levelColors[level.level as keyof typeof levelColors]}`}
                      >
                        {level.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{level.timeToAchieve} hours</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{level.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Prerequisites */}
                {level.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Prerequisites
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {level.prerequisites.map((prereq, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expectations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    What You'll Be Able To Do
                  </h4>
                  <ul className="space-y-2">
                    {level.expectations.map((expectation, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{expectation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Projects */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Suggested Projects
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {level.projects.map((project, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border">
                        <span className="text-sm font-medium text-gray-900">{project}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                {level.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Learning Resources</h4>
                    <div className="space-y-2">
                      {level.resources.map((resource, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-900">{resource.title}</span>
                              {resource.isRequired && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-blue-700 mt-1">{resource.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                              <span className="capitalize">{resource.type}</span>
                              <span>{resource.estimatedTime}h</span>
                              <span className="capitalize">{resource.difficulty}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                            className="ml-4"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
