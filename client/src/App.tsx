import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LessonViewer from './components/LessonViewer';
import CodeEditor from './components/CodeEditor';
import Dashboard from './components/Dashboard';
import HelpCenter from './components/HelpCenter';
import ApiDocs from './components/ApiDocs';
import AssemblyReference from './components/AssemblyReference';
import ErrorBoundary from './components/ErrorBoundary';
import Learn from './components/Learn';
import Practice from './components/Practice';
import Progress from './components/Progress';
// Using local type definitions for client-side
interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags: string[];
  content?: any;
  exercises?: string[];
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hints?: string[];
  starterCode?: string;
  testCases?: any[];
}

function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [apiDocsOpen, setApiDocsOpen] = useState(false);
  const [assemblyRefOpen, setAssemblyRefOpen] = useState(false);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            onOpenHelp={() => setHelpCenterOpen(true)}
            onOpenApiDocs={() => setApiDocsOpen(true)}
            onOpenAssemblyRef={() => setAssemblyRefOpen(true)}
          />

          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              isOpen={sidebarOpen}
              onLessonSelect={setSelectedLesson}
              onExerciseSelect={setSelectedExercise}
              selectedLesson={selectedLesson}
              selectedExercise={selectedExercise}
            />

            <main className="flex-1 bg-gray-900 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route
                    path="/lesson/:id"
                    element={
                      <LessonViewer
                        lesson={selectedLesson}
                        onExerciseSelect={setSelectedExercise}
                      />
                    }
                  />
                  <Route
                    path="/exercise/:id"
                    element={
                      <CodeEditor
                        exercise={selectedExercise}
                        onLessonSelect={setSelectedLesson}
                      />
                    }
                  />
                </Routes>
              </ErrorBoundary>
            </main>
                  </div>

        {/* Documentation Modals */}
        <HelpCenter
          isOpen={helpCenterOpen}
          onClose={() => setHelpCenterOpen(false)}
        />
        <ApiDocs
          isOpen={apiDocsOpen}
          onClose={() => setApiDocsOpen(false)}
        />
        <AssemblyReference
          isOpen={assemblyRefOpen}
          onClose={() => setAssemblyRefOpen(false)}
        />
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
