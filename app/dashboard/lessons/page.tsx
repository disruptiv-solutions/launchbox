//app/dashboard/lessons/page.tsx
"use client";

import React, { useState } from 'react';

interface LessonData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  thumbnail: string;
  transcript: string;
  completed: boolean;
  progress: number;
}

const LessonsPage = () => {
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const sampleLessons: LessonData[] = [
    {
      id: '1',
      title: 'Introduction to React Hooks',
      description: 'Learn the fundamentals of React Hooks and how to use useState and useEffect in your applications.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 1800, // 30 minutes in seconds
      category: 'React',
      difficulty: 'beginner',
      prerequisites: ['Basic JavaScript', 'HTML/CSS'],
      thumbnail: '/images/react-hooks.jpg',
      transcript: 'Welcome to this introduction to React Hooks...',
      completed: false,
      progress: 0,
    },
    {
      id: '2',
      title: 'Advanced TypeScript Patterns',
      description: 'Dive deep into advanced TypeScript features including generics, conditional types, and mapped types.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 2700, // 45 minutes
      category: 'TypeScript',
      difficulty: 'advanced',
      prerequisites: ['TypeScript Basics', 'JavaScript ES6+'],
      thumbnail: '/images/typescript-advanced.jpg',
      transcript: 'In this advanced TypeScript lesson...',
      completed: true,
      progress: 100,
    },
    {
      id: '3',
      title: 'Building REST APIs with Node.js',
      description: 'Create robust REST APIs using Node.js, Express, and best practices for API design.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 3600, // 60 minutes
      category: 'Backend',
      difficulty: 'intermediate',
      prerequisites: ['JavaScript', 'Basic Node.js'],
      thumbnail: '/images/nodejs-api.jpg',
      transcript: 'Today we\'ll build a complete REST API...',
      completed: false,
      progress: 45,
    },
    {
      id: '4',
      title: 'Database Design Fundamentals',
      description: 'Learn the principles of database design, normalization, and relationship modeling.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 2400, // 40 minutes
      category: 'Database',
      difficulty: 'intermediate',
      prerequisites: ['Basic SQL'],
      thumbnail: '/images/database-design.jpg',
      transcript: 'Database design is crucial for...',
      completed: false,
      progress: 0,
    },
  ];

  const categories = ['all', 'React', 'TypeScript', 'Backend', 'Database'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredLessons = sampleLessons.filter(lesson => {
    const categoryMatch = selectedCategory === 'all' || lesson.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const openLesson = (lesson: LessonData) => {
    setSelectedLesson(lesson);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Lessons
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive video lessons to enhance your skills
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4" style={{ marginBottom: '2rem' }}>
        <div className="flex gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Category:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Difficulty:</span>
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-8 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === difficulty
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
            onClick={() => openLesson(lesson)}
          >
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
              <img 
                src={lesson.thumbnail} 
                alt={lesson.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f3f4f6"/><text x="150" y="90" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle">${lesson.title}</text><text x="150" y="110" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">${formatDuration(lesson.duration)}</text></svg>`)}`;
                }}
              />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-gray-800 ml-1"></div>
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(lesson.duration)}
              </div>

              {/* Progress bar */}
              {lesson.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {lesson.title}
                </h3>
                {lesson.completed && (
                  <span className="text-green-500 text-lg">✓</span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {lesson.description}
              </p>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {lesson.category}
                </span>
              </div>

              {lesson.progress > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {lesson.progress}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedLesson.title}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(selectedLesson.difficulty)}`}>
                    {selectedLesson.difficulty}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(selectedLesson.duration)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLesson.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-6">
              <div className="aspect-video w-full">
                <iframe
                  src={selectedLesson.videoUrl}
                  className="w-full h-full rounded-lg"
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLesson.description}</p>
                </div>

                {selectedLesson.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Prerequisites</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedLesson.prerequisites.map((prereq, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsPage;