import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  RotateCcw, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Zap,
  Play
} from 'lucide-react';
import { EducationalGame, GameQuestion } from '../types';

interface PlayableGameModalProps {
  game: EducationalGame;
  onClose: () => void;
}

interface TeamState {
  id: number;
  name: string;
  color: string;
  bgTrack: string;
  score: number;
  position: number; // 0 to 100%
  avatar: string;
  nitro: boolean;
}

export const PlayableGameModal: React.FC<PlayableGameModalProps> = ({ game, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0); // which team's turn, or all
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Teams in the game
  const [teams, setTeams] = useState<TeamState[]>([
    { id: 1, name: 'Tim Merah (Garuda)', color: '#EF4444', bgTrack: 'bg-red-500', score: 0, position: 0, avatar: '🏎️', nitro: false },
    { id: 2, name: 'Tim Biru (Elang)', color: '#3B82F6', bgTrack: 'bg-blue-500', score: 0, position: 0, avatar: '🚙', nitro: false },
    { id: 3, name: 'Tim Hijau (Banteng)', color: '#10B981', bgTrack: 'bg-emerald-500', score: 0, position: 0, avatar: '🏎️', nitro: false },
    { id: 4, name: 'Tim Kuning (Harimau)', color: '#F59E0B', bgTrack: 'bg-amber-500', score: 0, position: 0, avatar: '🚗', nitro: false },
  ]);

  const questions: GameQuestion[] = game.pertanyaan && game.pertanyaan.length > 0
    ? game.pertanyaan
    : [
        {
          id: 1,
          soal: 'Hierarki perundang-undangan tertinggi di Indonesia adalah?',
          pilihan: ['A. UUD 1945', 'B. Perpu', 'C. Perpres', 'D. Perda'],
          kunci: 'A',
          pembahasan: 'UUD 1945 merupakan hukum dasar tertinggi tertulis di Indonesia.',
          poin: 100
        }
      ];

  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Countdown timer per question
  useEffect(() => {
    if (!timerRunning || isAnswered || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isAnswered, gameOver, currentQuestionIndex]);

  const handleAnswer = (optionKey: string) => {
    if (isAnswered || gameOver) return;
    setIsAnswered(true);
    setSelectedOption(optionKey);

    const isCorrect = optionKey.startsWith(currentQ.kunci) || optionKey === currentQ.kunci;

    // Update active team position & score
    const stepMove = 100 / totalQuestions;

    setTeams(prevTeams => {
      return prevTeams.map((team, idx) => {
        if (idx === activeTeamIndex) {
          const pointsEarned = isCorrect ? currentQ.poin + Math.round(timeLeft * 2) : 0;
          const newPos = isCorrect ? Math.min(100, team.position + stepMove) : team.position;
          return {
            ...team,
            score: team.score + pointsEarned,
            position: newPos,
            nitro: isCorrect && timeLeft > 15
          };
        }
        return team;
      });
    });

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setTimeLeft(30);
      setActiveTeamIndex(prev => (prev + 1) % teams.length);
    } else {
      setGameOver(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setTimeLeft(30);
    setGameOver(false);
    setTeams(prev => prev.map(t => ({ ...t, score: 0, position: 0, nitro: false })));
  };

  // Winning team
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏎️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{game.namaGame}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {game.kategori}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Materi: {game.materi} ({game.mataPelajaran})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Reset Permainan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/80 text-slate-300 hover:text-white transition"
              title="Tutup Game"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Arena Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Race Track Canvas/Visualizer */}
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>🏁 Sirkuit Balapan Kelas NOVA</span>
              <span className="text-amber-400 flex items-center gap-1">
                <span>Garis Finish (100%)</span>
                <span>🏁</span>
              </span>
            </div>

            <div className="space-y-3">
              {teams.map((team, idx) => (
                <div key={team.id} className="relative">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: team.color }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      <span>{team.name}</span>
                      {activeTeamIndex === idx && !gameOver && (
                        <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded-md font-bold animate-pulse">
                          Giliran Menjawab
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-amber-300">{team.score} Poin</span>
                  </div>

                  {/* Track Lane */}
                  <div className="h-9 bg-slate-800/90 rounded-xl relative overflow-hidden border border-slate-700/60 flex items-center px-1">
                    {/* Asphalt Stripes */}
                    <div 
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, #fff 0, #fff 15px, transparent 15px, transparent 35px)',
                      }}
                    />

                    {/* Finish line checkerboard flag */}
                    <div className="absolute right-0 top-0 bottom-0 w-5 bg-yellow-400/40 border-l border-dashed border-white flex items-center justify-center font-bold text-[10px]">
                      🏁
                    </div>

                    {/* Racing Car Moving based on position % */}
                    <div
                      className="absolute top-1 bottom-1 transition-all duration-700 ease-out flex items-center"
                      style={{ left: `calc(${Math.min(92, team.position)}% )` }}
                    >
                      <div className="relative group">
                        <span className="text-2xl filter drop-shadow-lg">{team.avatar}</span>
                        {team.nitro && (
                          <span className="absolute -left-3 top-1 text-xs animate-ping">🔥</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GAME NOT OVER: Question Screen */}
          {!gameOver && currentQ && (
            <div className="bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
                  Soal {currentQuestionIndex + 1} dari {totalQuestions}
                </span>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  timeLeft <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40' : 'bg-slate-700 text-amber-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.soal}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQ.pilihan.map((opt, idx) => {
                  const optPrefix = opt.substring(0, 1);
                  const isCorrect = optPrefix === currentQ.kunci;
                  const isChosen = selectedOption === opt || selectedOption === optPrefix;

                  let btnStyle = 'bg-slate-700/70 border-slate-600 hover:bg-slate-600/80 text-slate-100';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white font-bold ring-2 ring-emerald-400';
                    } else if (isChosen) {
                      btnStyle = 'bg-red-600/90 border-red-400 text-white line-through';
                    } else {
                      btnStyle = 'bg-slate-800/40 border-slate-700 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleAnswer(opt)}
                      className={`p-3.5 rounded-xl border text-left transition-all text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />}
                      {isAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-white shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-200 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">💡 Pembahasan Konsep:</span>
                    <p>{currentQ.pembahasan}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Soal Berikutnya ➔' : 'Lihat Pemenang 🏆'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GAME OVER SCREEN: Podium & Victory */}
          {gameOver && (
            <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700 text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Balapan Selesai!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  🎉 Selamat kepada {winner.name}!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Juara 1 dengan raihan skor tertinggi {winner.score} poin.
                </p>
              </div>

              {/* Leaderboard Table */}
              <div className="max-w-md mx-auto bg-slate-900 rounded-xl p-4 border border-slate-800 divide-y divide-slate-800 text-xs">
                {sortedTeams.map((team, rank) => (
                  <div key={team.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        rank === 0 ? 'bg-amber-400 text-slate-950' : rank === 1 ? 'bg-slate-300 text-slate-900' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rank + 1}
                      </span>
                      <span className="font-bold" style={{ color: team.color }}>{team.name}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{team.score} Poin</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  Mainkan Lagi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
