/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ear, 
  MessageSquare, 
  Puzzle, 
  Lightbulb, 
  RefreshCw, 
  Calendar, 
  Users, 
  Handshake,
  ChevronRight,
  ChevronLeft,
  Download,
  Gamepad2,
  Target,
  Check,
  HelpCircle,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  SKILLS, 
  GENRES, 
  SKILL_STEP_DESCRIPTORS, 
  getCatalystTask, 
  Genre, 
  Skill 
} from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IconMap: Record<string, React.ElementType> = {
  Ear,
  MessageSquare,
  Puzzle,
  Lightbulb,
  RefreshCw,
  Calendar,
  Users,
  Handshake
};

export default function App() {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [selectedGenre, setSelectedGenre] = useState<Genre>(GENRES[0]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<Record<string, number[]>>({});
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.id === skill.id);
      if (exists) {
        const newSkills = prev.filter(s => s.id !== skill.id);
        // Also clean up steps
        const newSteps = { ...selectedSteps };
        delete newSteps[skill.id];
        setSelectedSteps(newSteps);
        return newSkills;
      }
      const newSkills = [...prev, skill];
      // Initialize steps for new skill if not exists
      if (!selectedSteps[skill.id]) {
        setSelectedSteps(curr => ({ ...curr, [skill.id]: [] }));
      }
      return newSkills;
    });
  };

  const toggleStep = (skillId: string, step: number) => {
    setSelectedSteps(prev => {
      const currentSteps = prev[skillId] || [];
      const exists = currentSteps.includes(step);
      if (exists) {
        return { ...prev, [skillId]: currentSteps.filter(s => s !== step) };
      }
      return { ...prev, [skillId]: [...currentSteps, step].sort((a, b) => a - b) };
    });
  };

  const toggleAllSteps = (skillId: string) => {
    setSelectedSteps(prev => {
      const currentSteps = prev[skillId] || [];
      if (currentSteps.length === 16) {
        return { ...prev, [skillId]: [] };
      }
      return { ...prev, [skillId]: Array.from({ length: 16 }, (_, i) => i + 1) };
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let yPos = 30;

    // Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text('GAME TASK', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('MISSION BRIEF', 20, yPos);
    yPos += 5;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Genre: ${selectedGenre}`, 20, yPos);
    yPos += 15;

    selectedSkills.forEach((skill, skillIdx) => {
      if (yPos > 250) {
        doc.addPage();
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, 210, 297, 'F');
        yPos = 30;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Skill: ${skill.name}`, 20, yPos);
      yPos += 8;

      const steps = selectedSteps[skill.id] || [];
      steps.forEach(step => {
        if (yPos > 250) {
          doc.addPage();
          doc.setFillColor(245, 245, 245);
          doc.rect(0, 0, 210, 297, 'F');
          yPos = 30;
        }

        doc.setFontSize(11);
        doc.setTextColor(20, 20, 20);
        doc.text(`Step ${step}:`, 25, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const descriptor = (SKILL_STEP_DESCRIPTORS[skill.id] || {})[step] || `Step ${step} descriptor`;
        const descriptorLines = doc.splitTextToSize(descriptor, 160);
        doc.text(descriptorLines, 30, yPos);
        yPos += (descriptorLines.length * 5) + 5;

        const task = getCatalystTask(selectedGenre, skill.id, step);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const taskLines = doc.splitTextToSize(`Task: ${task}`, 160);
        doc.text(taskLines, 30, yPos);
        yPos += (taskLines.length * 6) + 10;
      });
      yPos += 5;
    });
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated via Game Task App - UF2.0', 20, 285);
    
    doc.save(`GameTask_Mission_${selectedGenre}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-emerald-500/30">
      <header className="p-6 border-b border-black/20 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase italic">Game Task</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 text-black/70 hover:text-black transition-colors rounded-full hover:bg-black/5"
            title="How to use"
          >
            <HelpCircle size={20} />
          </button>
          <div className="text-[10px] uppercase tracking-widest text-black/70 font-mono">
            UF2.0
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-6 right-6 p-2 text-black/70 hover:text-black transition-colors rounded-full hover:bg-black/5"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <HelpCircle className="text-white w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">How to use</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">Select Genre</p>
                    <p className="text-xs text-black/80 leading-relaxed">Choose the game type you are playing (e.g., Sandbox, Survival, RPG).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">Choose Skills</p>
                    <p className="text-xs text-black/80 leading-relaxed">Pick one or more essential skills you want to focus on during your session.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">Configure Steps</p>
                    <p className="text-xs text-black/80 leading-relaxed">Select the specific progression steps (0-16) for each chosen skill.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">Mission Briefing</p>
                    <p className="text-xs text-black/80 leading-relaxed">Review your generated tasks and export them as a PDF for your gaming session.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors shadow-lg"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          {screen === 1 && (
            <motion.div
              key="screen1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <section>
                <label className="text-[10px] tracking-widest text-black/70 mb-4 block">01. Select Genre</label>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={cn(
                        "px-6 py-3 rounded-full border transition-all whitespace-nowrap text-sm font-medium",
                        selectedGenre === genre 
                          ? "bg-black text-white border-black shadow-[0_0_15px_rgba(0,0,0,0.1)]" 
                          : "bg-black/5 border-black/10 text-black/80 hover:bg-black/10"
                      )}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] tracking-widest text-black/70 block">02. Select Essential Skills</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SKILLS.map((skill) => {
                    const Icon = IconMap[skill.icon];
                    const isSelected = selectedSkills.some(s => s.id === skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "p-4 rounded-2xl border-4 transition-all flex flex-col items-start gap-3 group text-left relative overflow-hidden h-32",
                          isSelected
                            ? "shadow-xl scale-[1.02] border-white ring-4 ring-black/5"
                            : "border-transparent opacity-80 hover:opacity-100 hover:scale-[1.01]"
                        )}
                        style={{
                          backgroundColor: isSelected ? skill.activeColor : skill.color,
                          color: isSelected ? 'white' : 'black'
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
                            <Check size={14} className="font-bold text-white" />
                          </div>
                        )}
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/10 backdrop-blur-sm"
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black tracking-tight leading-none mb-1">{skill.name}</div>
                          <div className="text-[9px] text-black/80 tracking-widest font-bold leading-none">{skill.category}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <button
                onClick={() => setScreen(2)}
                disabled={selectedSkills.length === 0}
                className={cn(
                  "w-full py-5 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]",
                  selectedSkills.length > 0 
                    ? "bg-emerald-500 text-white hover:bg-emerald-400" 
                    : "bg-black/10 text-black/50 cursor-not-allowed shadow-none"
                )}
              >
                Continue to Steps <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {screen === 2 && (
            <motion.div
              key="screen2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <button 
                onClick={() => setScreen(1)}
                className="flex items-center gap-2 text-black/70 hover:text-black transition-colors text-sm"
              >
                <ChevronLeft size={16} /> Back to Setup
              </button>

              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <div className="text-[10px] tracking-widest text-emerald-600 font-bold">Step Selection</div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Configure Steps</h2>
                  <p className="text-xs text-black/70">Select one or more steps for each skill</p>
                </div>

                <div className="space-y-10">
                  {selectedSkills.map((skill) => (
                    <div key={skill.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-black shadow-sm"
                            style={{ backgroundColor: skill.color }}
                          >
                            {React.createElement(IconMap[skill.icon], { size: 16 })}
                          </div>
                          <h3 className="font-bold text-sm tracking-widest" style={{ color: skill.color }}>{skill.name}</h3>
                        </div>
                        <button
                          onClick={() => toggleAllSteps(skill.id)}
                          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-black/10 hover:bg-black/5 transition-colors"
                        >
                          {(selectedSteps[skill.id] || []).length === 16 ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((step) => {
                          const isSelected = (selectedSteps[skill.id] || []).includes(step);
                          return (
                            <button
                              key={step}
                              onClick={() => toggleStep(skill.id, step)}
                              className={cn(
                                "h-12 rounded-xl border font-bold transition-all text-sm",
                                isSelected
                                  ? "text-black shadow-md border-transparent"
                                  : "bg-black/5 border-black/5 text-black/70 hover:bg-black/10"
                              )}
                              style={isSelected ? { backgroundColor: skill.activeColor, color: 'white' } : {}}
                            >
                              {step}
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="bg-black/5 border border-black/5 p-4 rounded-2xl">
                        <div className="text-[10px] tracking-widest text-black/70 mb-2">Selected Steps Descriptors</div>
                        <div className="space-y-2">
                          {(selectedSteps[skill.id] || []).map(step => (
                            <div key={step} className="text-xs text-black/90 italic border-l-2 pl-3 py-1" style={{ borderLeftColor: skill.color }}>
                              <span className="font-bold not-italic mr-2">Step {step}:</span>
                              {(SKILL_STEP_DESCRIPTORS[skill.id] || {})[step] || `Step ${step} descriptor`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button
                onClick={() => setScreen(3)}
                disabled={Object.values(selectedSteps).every((steps: number[]) => steps.length === 0)}
                className={cn(
                  "w-full py-5 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]",
                  !Object.values(selectedSteps).every((steps: number[]) => steps.length === 0)
                    ? "bg-emerald-500 text-white hover:bg-emerald-400" 
                    : "bg-black/10 text-black/50 cursor-not-allowed shadow-none"
                )}
              >
                Generate Task(s) <Target size={20} />
              </button>
            </motion.div>
          )}

          {screen === 3 && (
            <motion.div
              key="screen3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setScreen(2)}
                className="flex items-center gap-2 text-black/70 hover:text-black transition-colors text-sm"
              >
                <ChevronLeft size={16} /> Adjust Steps
              </button>

              <div className="space-y-2">
                <div className="text-[10px] tracking-widest text-emerald-600 font-bold">Mission Briefing</div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Tasks</h2>
              </div>

              <div className="space-y-6">
                {selectedSkills.map((skill) => (
                  <div key={skill.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-black shadow-sm"
                        style={{ backgroundColor: skill.color }}
                      >
                        {React.createElement(IconMap[skill.icon], { size: 20 })}
                      </div>
                      <h3 className="text-xl font-bold italic tracking-tight" style={{ color: skill.color }}>{skill.name}</h3>
                    </div>

                    <div className="space-y-4">
                      {(selectedSteps[skill.id] || []).map(step => (
                        <div key={step} className="relative group">
                          <div 
                            className="absolute -inset-0.5 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"
                            style={{ backgroundColor: skill.color }}
                          ></div>
                          <div className="relative bg-white border border-black/10 p-6 rounded-3xl space-y-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <div className="text-[10px] text-black/70 tracking-widest font-mono">{selectedGenre} • Step {step}</div>
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                                style={{ backgroundColor: skill.color }}
                              >
                                {step}
                              </div>
                            </div>
                            <p className="text-lg font-medium leading-relaxed text-black/90">
                              {getCatalystTask(selectedGenre, skill.id, step)}
                            </p>
                            <div className="bg-black/5 p-3 rounded-xl border-l-4" style={{ borderLeftColor: skill.color }}>
                              <p className="text-[10px] text-black/80 italic leading-tight">{(SKILL_STEP_DESCRIPTORS[skill.id] || {})[step] || `Step ${step} descriptor`}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setScreen(1)}
                  className="py-4 bg-black/5 text-black/80 font-bold uppercase tracking-widest rounded-2xl border border-black/5 hover:bg-black/10 transition-colors"
                >
                  New Mission
                </button>
                <button
                  onClick={exportPDF}
                  className="py-4 bg-black text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-black/90 transition-colors shadow-lg"
                >
                  Export PDF <Download size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-center pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-black/10 px-6 py-3 rounded-full flex gap-8 shadow-xl">
            <div className="flex flex-col items-center">
              <div className={cn("w-1.5 h-1.5 rounded-full mb-1", screen >= 1 ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-black/20")}></div>
              <span className="text-[8px] tracking-widest font-bold text-black/70">Setup</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={cn("w-1.5 h-1.5 rounded-full mb-1", screen >= 2 ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-black/20")}></div>
              <span className="text-[8px] tracking-widest font-bold text-black/70">Steps</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={cn("w-1.5 h-1.5 rounded-full mb-1", screen >= 3 ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-black/20")}></div>
              <span className="text-[8px] tracking-widest font-bold text-black/70">Output</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
