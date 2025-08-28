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
import { Lesson, Exercise } from '../../../src/shared/types';

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
        <div className="min-h-screen bg-gray-900 text-white">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            onOpenHelp={() => setHelpCenterOpen(true)}
            onOpenApiDocs={() => setApiDocsOpen(true)}
            onOpenAssemblyRef={() => setAssemblyRefOpen(true)}
          />

          <div className="flex">
            <Sidebar
              isOpen={sidebarOpen}
              onLessonSelect={setSelectedLesson}
              onExerciseSelect={setSelectedExercise}
              selectedLesson={selectedLesson}
              selectedExercise={selectedExercise}
            />

            <main className="flex-1 p-6">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
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
