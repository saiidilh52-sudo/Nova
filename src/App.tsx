import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { StudentReflectionFlow } from './components/StudentReflectionFlow';
import { TeacherAuth } from './components/TeacherAuth';
import { TeacherDashboard } from './components/TeacherDashboard';
import { NovaInsightView } from './components/NovaInsightView';
import { MaterialsManager } from './components/MaterialsManager';
import { GameStudio } from './components/GameStudio';
import { RpmGenerator } from './components/RpmGenerator';
import { ProgressTracker } from './components/ProgressTracker';
import { TeacherProfile } from './components/TeacherProfile';
import { DocumentationModal } from './components/DocumentationModal';
import { PlayableGameModal } from './components/PlayableGameModal';
import { apiService, safeStorage } from './services/api';
import { StudentReflection, Material, EducationalGame, RPMStructure, NovaAnalysis, Teacher } from './types';
import { parseBrowserNavigation } from './utils/browserCompat';

export default function App() {
  const initialNav = parseBrowserNavigation();
  const [role, setRole] = useState<'landing' | 'student' | 'teacher'>(initialNav.role);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [teacherTab, setTeacherTab] = useState<string>('dashboard');
  const [previousTeacherTab, setPreviousTeacherTab] = useState<string>('dashboard');
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [playableGame, setPlayableGame] = useState<EducationalGame | null>(null);
  const [studentInitialMatId, setStudentInitialMatId] = useState<string | undefined>(initialNav.materialId);
  const [pendingPlayGameId, setPendingPlayGameId] = useState<string | undefined>(initialNav.gameId);

  // App Data
  const [reflections, setReflections] = useState<StudentReflection[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [games, setGames] = useState<EducationalGame[]>([]);
  const [rpms, setRpms] = useState<RPMStructure[]>([]);
  const [analysis, setAnalysis] = useState<NovaAnalysis | null>(null);
  const [focusedMaterial, setFocusedMaterial] = useState<Material | undefined>(undefined);
  const [gameGeneratorParams, setGameGeneratorParams] = useState<any>(null);

  const switchTeacherTab = (tab: string) => {
    setPreviousTeacherTab(teacherTab);
    setTeacherTab(tab);
  };

  // Load initial data
  const refreshAllData = async () => {
    try {
      const [refs, mats, gms, docs] = await Promise.all([
        apiService.getReflections(),
        apiService.getMaterials(),
        apiService.getGames(),
        apiService.getRPMs(),
      ]);
      setReflections(refs);
      setMaterials(mats);
      setGames(gms);
      setRpms(docs);
      if (mats.length > 0 && !focusedMaterial) {
        setFocusedMaterial(mats[0]);
      }

      if (pendingPlayGameId) {
        const target = gms.find(g => g.id === pendingPlayGameId);
        if (target) {
          setPlayableGame(target);
          setPendingPlayGameId(undefined);
        }
      }
    } catch (e) {
      console.error('Error loading app data:', e);
    }
  };

  useEffect(() => {
    // Check saved teacher session
    const saved = apiService.getActiveTeacher();
    if (saved) {
      setActiveTeacher(saved);
    }
    refreshAllData();

    // Cross-browser & mobile deep-link listener (handles WhatsApp webview, Safari back/forward, hash changes)
    const handleUrlChange = () => {
      const nav = parseBrowserNavigation();
      if (nav.role !== 'landing') {
        setRole(nav.role);
      }
      if (nav.materialId) {
        setStudentInitialMatId(nav.materialId);
      }
      if (nav.gameId) {
        setPendingPlayGameId(nav.gameId);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleTeacherLoginSuccess = (teacher: Teacher) => {
    setActiveTeacher(teacher);
    setRole('teacher');
    switchTeacherTab('dashboard');
    refreshAllData();
  };

  const handleTeacherLogout = () => {
    apiService.logoutTeacher();
    setActiveTeacher(null);
    setRole('landing');
  };

  const handleTriggerAnalysisFromMaterial = (mat: Material) => {
    setFocusedMaterial(mat);
    switchTeacherTab('analysis');
  };

  const handleTriggerAnalysisFromDashboard = (mat?: Material) => {
    if (mat) setFocusedMaterial(mat);
    switchTeacherTab('analysis');
  };

  const handleNavigateToGameGen = (params: any) => {
    setGameGeneratorParams(params);
    switchTeacherTab('games');
  };

  const handleNavigateToRPM = (newAnalysis: NovaAnalysis, targetMat?: Material) => {
    setAnalysis(newAnalysis);
    if (targetMat) {
      setFocusedMaterial(targetMat);
    }
    switchTeacherTab('rpm');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        currentRole={role}
        activeTab={teacherTab}
        onTabChange={tab => switchTeacherTab(tab)}
        onSwitchRole={r => {
          if (r === 'teacher' && !activeTeacher) {
            setRole('teacher');
          } else {
            setRole(r);
          }
        }}
        teacher={activeTeacher}
        onLogout={handleTeacherLogout}
        onOpenDocs={() => setShowDocsModal(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ROLE 1: LANDING PAGE */}
        {role === 'landing' && (
          <LandingPage
            onSelectRole={selectedRole => {
              setRole(selectedRole);
              if (selectedRole === 'teacher' && activeTeacher) {
                switchTeacherTab('dashboard');
              }
            }}
          />
        )}

        {/* ROLE 2: STUDENT REFLECTION FLOW */}
        {role === 'student' && (
          <StudentReflectionFlow
            initialMaterialId={studentInitialMatId}
            onBackToHome={() => {
              setRole('landing');
              refreshAllData();
            }}
          />
        )}

        {/* ROLE 3: TEACHER PORTAL */}
        {role === 'teacher' && (
          <>
            {/* If teacher is not authenticated yet */}
            {!activeTeacher ? (
              <TeacherAuth
                onSuccess={handleTeacherLoginSuccess}
                onBackToHome={() => setRole('landing')}
              />
            ) : (
              /* Authenticated Teacher Views */
              <div className="space-y-6">
                {teacherTab === 'dashboard' && (
                  <TeacherDashboard
                    reflections={reflections}
                    materials={materials}
                    onTriggerAnalysis={handleTriggerAnalysisFromDashboard}
                    onNavigateToGames={() => switchTeacherTab('games')}
                    onNavigateToMaterials={() => switchTeacherTab('materials')}
                    onOpenReflectionForm={mat => {
                      setStudentInitialMatId(mat?.id);
                      setRole('student');
                    }}
                  />
                )}

                {teacherTab === 'analysis' && (
                  <NovaInsightView
                    analysis={analysis}
                    activeMaterial={focusedMaterial || materials[0]}
                    materials={materials}
                    reflections={reflections}
                    onAnalysisGenerated={res => setAnalysis(res)}
                    onNavigateToGameGenerator={handleNavigateToGameGen}
                    onNavigateToRPM={handleNavigateToRPM}
                  />
                )}

                {teacherTab === 'materials' && (
                  <MaterialsManager
                    materials={materials}
                    onRefreshMaterials={refreshAllData}
                    onAnalyzeMaterial={handleTriggerAnalysisFromMaterial}
                  />
                )}

                {teacherTab === 'games' && (
                  <GameStudio
                    games={games}
                    materials={materials}
                    rpms={rpms}
                    onRefreshGames={refreshAllData}
                    initialParams={gameGeneratorParams}
                    onBack={() => setTeacherTab(previousTeacherTab || 'dashboard')}
                    onNavigateToRPM={() => switchTeacherTab('rpm')}
                  />
                )}

                {teacherTab === 'rpm' && (
                  <RpmGenerator
                    rpms={rpms}
                    materials={materials}
                    games={games}
                    reflections={reflections}
                    activeAnalysis={analysis}
                    initialMaterial={focusedMaterial}
                    onRefreshRPMs={refreshAllData}
                    onBack={() => setTeacherTab(previousTeacherTab || 'dashboard')}
                    onPlayGame={game => setPlayableGame(game)}
                    onNavigateToCreateGame={handleNavigateToGameGen}
                  />
                )}

                {teacherTab === 'progress' && (
                  <ProgressTracker
                    reflections={reflections}
                    materials={materials}
                  />
                )}

                {teacherTab === 'profile' && (
                  <TeacherProfile
                    teacher={activeTeacher}
                    onUpdateName={newName => {
                      const updated = { ...activeTeacher, namaGuru: newName };
                      setActiveTeacher(updated);
                      safeStorage.setItem('nova_active_teacher', JSON.stringify(updated));
                    }}
                    onLogout={handleTeacherLogout}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* External Documentation & Script Export Modal */}
      {showDocsModal && (
        <DocumentationModal onClose={() => setShowDocsModal(false)} />
      )}

      {/* Global Playable Game Modal (for direct student links / PIN play) */}
      {playableGame && (
        <PlayableGameModal
          game={playableGame}
          onClose={() => setPlayableGame(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
