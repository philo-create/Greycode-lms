import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Eye, Zap, ShieldAlert, Cpu, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { GradeType } from '../types';
import SpeakableText from './SpeakableText';

interface RobotPart {
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
}

export default function RoboticsActivity({ grade, onComplete }: { grade: GradeType; onComplete: (stars: number, possible?: number) => void }) {
  const [activeTab, setActiveTab] = useState<'id' | 'assembly' | 'sorter'>('id');
  const [stars, setStars] = useState(0);

  // Level 1 state (Is it a Robot?)
  const [selectedItems, setSelectedOption] = useState<Record<string, boolean>>({});
  const [idChecked, setIdChecked] = useState(false);
  const [idSuccess, setIdSuccess] = useState(false);

  // Level 2 state (Assembly mapping)
  const [assembledParts, setAssembledParts] = useState<string[]>([]);
  const [assemblyCompleted, setAssemblyCompleted] = useState(false);

  // Level 3 state (Real-time Color Sorter)
  const [sorterActive, setSorterActive] = useState(false);
  const [fallingColor, setFallingColor] = useState<'Red' | 'Blue' | 'Unknown'>('Red');
  const [sorterScore, setSorterScore] = useState(0);
  const [sorterTicks, setSorterTicks] = useState(0);

  // Reset states
  useEffect(() => {
    setSelectedOption({});
    setIdChecked(false);
    setIdSuccess(false);
    setAssembledParts([]);
    setAssemblyCompleted(false);
    setSorterActive(false);
    setSorterScore(0);
    setSorterTicks(0);
    // Grade defaulting
    if (grade === 'R' || grade === '1') {
      setActiveTab('id');
    } else {
      setActiveTab('assembly');
    }
  }, [grade]);

  // Is Robot database
  const classificationItems = [
    { id: 'vacuum', label: 'Robot Vacuum', isRobot: true, img: '🧹' },
    { id: 'toaster', label: 'Classic Kitchen Toaster', isRobot: false, img: '🍞' },
    { id: 'toy_dog', label: 'Sensor Coding Puppy', isRobot: true, img: '🐶' },
    { id: 'bicycle', label: 'Pedal Bicycle', isRobot: false, img: '🚲' },
    { id: 'arm', label: 'Car Assembly Arm', isRobot: true, img: '🦾' },
    { id: 'lamp', label: 'Standard Living Room Lamp', isRobot: false, img: '💡' },
  ];

  const handleToggleItem = (id: string) => {
    if (idChecked) return;
    setSelectedOption(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckClassification = () => {
    setIdChecked(true);
    let correct = true;
    classificationItems.forEach(item => {
      const isChecked = !!selectedItems[item.id];
      if (isChecked !== item.isRobot) {
        correct = false;
      }
    });

    if (correct) {
      setIdSuccess(true);
      setStars(prev => prev + 1);
      if (grade === 'R' || grade === '1') {
        onComplete(3);
      }
    } else {
      setIdSuccess(false);
    }
  };

  // Robot Parts Assembly data
  const robotParts: RobotPart[] = [
    { name: 'Microcontroller (Brain)', category: 'Control System', icon: <Cpu className="w-5 h-5 text-indigo-500" />, description: 'Processes code and coordinates sensors/actuators.' },
    { name: 'Battery Pack (Heart)', category: 'Power Source', icon: <Zap className="w-5 h-5 text-amber-500" />, description: 'Supplies electrical current to the motherboard and motors.' },
    { name: 'Ultrasonic Sensor (Eyes)', category: 'Sensors', icon: <Eye className="w-5 h-5 text-sky-500" />, description: 'Measures distances to avoid bumping into classroom obstacles.' },
    { name: 'Geared Motor & Wheels (Legs)', category: 'Actuators', icon: <Settings className="w-5 h-5 text-emerald-500" />, description: 'Converts potential energy into actual moving physics.' },
  ];

  const handleAssemblePart = (name: string) => {
    if (assembledParts.includes(name)) return;
    const newParts = [...assembledParts, name];
    setAssembledParts(newParts);
    if (newParts.length === robotParts.length) {
      setAssemblyCompleted(true);
      setStars(prev => prev + 1);
      if (grade === '2' && activeTab === 'assembly') {
        onComplete(3);
      }
    }
  };

  // Level 3 Conveyor Sorter Game Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sorterActive && sorterTicks < 8) {
      interval = setInterval(() => {
        setFallingColor(Math.random() > 0.5 ? 'Red' : 'Blue');
        setSorterTicks(t => t + 1);
      }, 2000);
    } else if (sorterTicks === 8) {
      setSorterActive(false);
      if (sorterScore >= 6) {
        onComplete(4); // Reward top stars!
      }
    }
    return () => clearInterval(interval);
  }, [sorterActive, sorterTicks]);

  const handleSorterSort = (direction: 'Left' | 'Right') => {
    if (!sorterActive) return;
    
    // Correct sorting logic: IF Red -> Left, IF Blue -> Right
    const isCorrect = (fallingColor === 'Red' && direction === 'Left') || (fallingColor === 'Blue' && direction === 'Right');
    if (isCorrect) {
      setSorterScore(s => s + 1);
    }
    
    // Trigger next color cascade instantly
    setFallingColor(Math.random() > 0.5 ? 'Red' : 'Blue');
    setSorterTicks(t => t + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8" id="robotics-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            Robotics strand (R.1 - R.7)
          </span>
          <h2 className="text-xl font-black text-slate-800 mt-2">Robotics Workshop Sandbox</h2>
        </div>

        {/* Tab selector based on Grade availability */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('id')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'id' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Robot Identifier
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'assembly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Robot Blueprint
          </button>
          {grade !== 'R' && grade !== '1' && (
            <button
              onClick={() => setActiveTab('sorter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'sorter' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Belts Color Sorter
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: ROBOT IDENTIFIER */}
        {activeTab === 'id' && (
          <motion.div
            key="identifier"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text="Mission Grade R & 1 (R.1): Select exactly all the objects below that qualify as a Robot (machines built by humans that take instructions to do repetitive work)." className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {classificationItems.map(item => {
                const isSelected = !!selectedItems[item.id];
                let cardStyle = "border-slate-200 bg-slate-50 hover:bg-slate-100/50";
                if (isSelected) cardStyle = "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20";
                if (idChecked) {
                  if (item.isRobot) {
                    cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  } else if (isSelected) {
                    cardStyle = "border-rose-500 bg-rose-50 text-rose-800";
                  } else {
                    cardStyle = "opacity-50 border-slate-100 bg-slate-100 text-slate-400";
                  }
                }

                return (
                  <button
                    key={item.id}
                    disabled={idChecked}
                    onClick={() => handleToggleItem(item.id)}
                    id={`toggle-item-${item.id}`}
                    className={`p-5 rounded-2xl border text-center transition-all duration-150 flex flex-col items-center justify-center gap-3 cursor-pointer ${cardStyle}`}
                  >
                    <span className="text-4xl">{item.img}</span>
                    <span className="font-bold text-xs md:text-sm text-slate-700">{item.label}</span>
                    {idChecked && item.isRobot && (
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">✓ Correct Robot</span>
                    )}
                  </button>
                );
              })}
            </div>

            {idChecked && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                  idSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm">
                    {idSuccess ? "🌟 Amazing Work!" : "❌ Try again!"}
                  </h4>
                  <p className="text-xs">
                    {idSuccess 
                      ? "You successfully separated the programmable bots from passive kitchen appliances and manually pedaled tools!" 
                      : "Oops! Some options are wrong. Remember: Robots have microcontrollers to execute instruction codes!"
                    }
                  </p>
                </div>
                {!idSuccess && (
                  <button
                    onClick={() => { setSelectedOption({}); setIdChecked(false); }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Retry Quiz
                  </button>
                )}
              </motion.div>
            )}

            <div className="flex items-center justify-end border-t border-slate-100 pt-4 mt-6">
              <button
                disabled={idChecked}
                onClick={handleCheckClassification}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer transition-all"
              >
                Verify Robot Selections
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ROBOT BLUEPRINT */}
        {activeTab === 'assembly' && (
          <motion.div
            key="assembly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text="Blueprint (R.3 & R.5): Assemble the robot’s main organ blocks correctly onto the motherboard deck! Click each component below to mount it." className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Virtual Bot Motherboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative min-h-[16rem]">
                <div className="absolute top-3 left-3 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Motherboard Deck
                </div>

                <div className="space-y-3 w-full">
                  <div className="border border-white/5 rounded-2xl p-4 bg-white/5 flex flex-wrap gap-2 items-center justify-center min-h-[10rem]">
                    {assembledParts.length === 0 ? (
                      <span className="text-slate-500 text-xs font-mono font-medium">motherboard is empty...</span>
                    ) : (
                      assembledParts.map(part => {
                        const original = robotParts.find(p => p.name === part);
                        return (
                          <motion.div
                            key={part}
                            initial={{ scale: 0.1, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            {original?.icon}
                            <span>{part.split(' ')[0]}</span>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      Parts mounted: {assembledParts.length} / {robotParts.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Components bin */}
              <div className="space-y-3">
                {robotParts.map(part => {
                  const isMounted = assembledParts.includes(part.name);
                  return (
                    <button
                      key={part.name}
                      disabled={isMounted}
                      onClick={() => handleAssemblePart(part.name)}
                      className={`w-full text-left p-4 rounded-xl border flex items-start gap-3 transition cursor-pointer ${
                        isMounted 
                          ? 'border-emerald-200 bg-emerald-50/50 opacity-40 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                        {part.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-xs text-slate-800">{part.name}</h4>
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {part.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{part.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {assemblyCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-900 border border-indigo-700 text-white rounded-2xl p-6 text-center shadow-lg"
              >
                <div className="inline-flex p-3 bg-white/10 rounded-full mb-3">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-extrabold text-sm md:text-base">Motherboard Deck Complete!</h3>
                <p className="text-slate-300 text-xs mt-1.5 max-w-sm mx-auto">
                  Excellent design alignment! You accurately mounted microcontrollers, batteries, and ultrasound grids, finishing this robotics activity.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => { setAssembledParts([]); setAssemblyCompleted(false); }}
                    className="px-4 py-1.5 bg-white text-indigo-950 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Reset Board
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TAB 3: CONVEYOR BELTS COLOR SORTER */}
        {activeTab === 'sorter' && (
          <motion.div
            key="sorter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text="Sorter Game (R.6): Act as a computer decision sorting program. IF Block turns RED, route to Left Hopper. IF Block turns BLUE, route to Right Hopper." className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            <div className="flex flex-col items-center bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-800 relative">
              <div className="text-slate-400 text-[10px] font-mono absolute top-2 right-2">
                Color Sensor Simulation
              </div>

              {/* Falling Item */}
              <div className="w-full flex items-center justify-center min-h-[9rem] relative border-b border-white/5 pb-6">
                {!sorterActive ? (
                  <button
                    onClick={() => { setSorterActive(true); setSorterScore(0); setSorterTicks(0); }}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow"
                  >
                    Start conveyor sorting loop
                  </button>
                ) : (
                  <div className="text-center space-y-4">
                    <span className="text-[10px] font-black text-slate-500 tracking-wider">conveyor hopper incoming...</span>
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`w-14 h-14 rounded-3xl mx-auto shadow-lg flex items-center justify-center font-bold text-white text-xs ${
                        fallingColor === 'Red' ? 'bg-rose-500 border-2 border-rose-300' : 'bg-sky-500 border-2 border-sky-300'
                      }`}
                    >
                      {fallingColor}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Decision levers */}
              {sorterActive && (
                <div className="w-full grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => handleSorterSort('Left')}
                    className="p-4 bg-rose-950 hover:bg-rose-900/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-black shadow flex flex-col items-center gap-1.5 cursor-pointer uppercase transition-all"
                  >
                    👈 Left Hopper (IF Red)
                  </button>
                  <button
                    onClick={() => handleSorterSort('Right')}
                    className="p-4 bg-sky-950 hover:bg-sky-900/80 border border-sky-800 text-sky-200 rounded-xl text-xs font-black shadow flex flex-col items-center gap-1.5 cursor-pointer uppercase transition-all"
                  >
                    Right Hopper (IF Blue) 👉
                  </button>
                </div>
              )}

              {/* Progress and score */}
              <div className="w-full flex items-center justify-between mt-4 text-xs font-mono text-slate-300 bg-slate-950 px-4 py-2.5 rounded-xl border border-white/5">
                <span>Score: {sorterScore} / 8</span>
                <span>Loops left: {8 - sorterTicks}</span>
              </div>
            </div>

            {sorterTicks === 8 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center"
              >
                <div className="inline-flex p-3 bg-emerald-100 rounded-full mb-3 text-emerald-600">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-sm md:text-base">Color Sorter Complete!</h3>
                <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                  {sorterScore >= 6 
                    ? `Great success! You sorted ${sorterScore} items correctly, satisfying the decision threshold (6 required).` 
                    : `You got ${sorterScore}/8 correct. Take an extra practice loop to improve sequence accuracy!`
                  }
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => { setSorterScore(0); setSorterTicks(0); setSorterActive(false); }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Replay
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
