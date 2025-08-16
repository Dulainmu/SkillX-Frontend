import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  Target, 
  TrendingUp,
  Star,
  Award
} from 'lucide-react';

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

interface SkillLevelProgressProps {
  skillName: string;
  currentLevel: number;
  proficiencyLevels: SkillProficiencyLevel[];
  onLevelChange: (level: number) => void;
}

const levelIcons = {
  'Beginner': '🌱',
  'Intermediate': '🚀',
  'Advanced': '⚡',
  'Expert': '🏆'
};

const levelColors = {
  'Beginner': 'bg-green-100 text-green-800 border-green-200',
  'Intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
  'Advanced': 'bg-purple-100 text-purple-800 border-purple-200',
  'Expert': 'bg-orange-100 text-orange-800 border-orange-200'
};

export const SkillLevelProgress: React.FC<SkillLevelProgressProps> = ({
  skillName,
  currentLevel,
  proficiencyLevels,
  onLevelChange
}) => {
  const totalLevels = proficiencyLevels.length;
  const progressPercentage = (currentLevel / totalLevels) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{skillName}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Level {currentLevel} of {totalLevels}
            </Badge>
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{currentLevel}</span>
            </div>
          </div>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Level Selection */}
        <div className="grid grid-cols-4 gap-2">
          {proficiencyLevels.map((level, index) => {
            const levelNumber = index + 1;
            const isCompleted = currentLevel >= levelNumber;
            const isCurrent = currentLevel === levelNumber;
            
            return (
              <button
                key={level.level}
                onClick={() => onLevelChange(levelNumber)}
                className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  isCompleted
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{levelIcons[level.level as keyof typeof levelIcons]}</div>
                  <div className="text-xs font-semibold">{levelNumber}</div>
                  <div className="text-xs opacity-75">{level.level}</div>
                </div>
                {isCompleted && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                )}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Level Details */}
        {currentLevel > 0 && currentLevel <= proficiencyLevels.length && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">
                {proficiencyLevels[currentLevel - 1].title}
              </h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${levelColors[proficiencyLevels[currentLevel - 1].level as keyof typeof levelColors]}`}
              >
                {proficiencyLevels[currentLevel - 1].level}
              </Badge>
            </div>
            
            <p className="text-sm text-blue-800 mb-3">
              {proficiencyLevels[currentLevel - 1].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expectations */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Key Expectations</span>
                </div>
                <ul className="space-y-1">
                  {proficiencyLevels[currentLevel - 1].expectations.slice(0, 3).map((exp, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                      <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Suggested Projects</span>
                </div>
                <ul className="space-y-1">
                  {proficiencyLevels[currentLevel - 1].projects.slice(0, 3).map((project, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                      <Circle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{project}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Time to Achieve */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Estimated time: <strong>{proficiencyLevels[currentLevel - 1].timeToAchieve} hours</strong>
              </span>
            </div>
          </div>
        )}

        {/* Next Level Preview */}
        {currentLevel < totalLevels && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">Next Level Preview</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-700">
                <strong>{proficiencyLevels[currentLevel].title}</strong>
              </span>
              <Badge variant="outline" className="text-xs">
                {proficiencyLevels[currentLevel].level}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {proficiencyLevels[currentLevel].description}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{proficiencyLevels[currentLevel].timeToAchieve} hours to reach this level</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
