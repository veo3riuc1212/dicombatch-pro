import React from 'react';
import { 
  FolderArchive, 
  ShieldCheck, 
  Wifi, 
  HelpCircle, 
  Settings, 
  User, 
  Sliders, 
  Eye, 
  DownloadCloud, 
  Layers 
} from 'lucide-react';

export default function Header({ currentStep, setCurrentStep, activeStudyName, modality, isAnonActive }) {
  const steps = [
    { id: 1, title: '1. Importar y Lote', shortTitle: '1. Importar', icon: Layers },
    { id: 2, title: '2. Ventaneo y Ajustes', shortTitle: '2. Ventaneo', icon: Sliders },
    { id: 3, title: '3. Visor de Control (QC)', shortTitle: '3. QC Studio', icon: Eye },
    { id: 4, title: '4. Cola y Exportación', shortTitle: '4. Exportación', icon: DownloadCloud }
  ];

  return (
    <header className="bg-[#0b1329] border-b border-slate-800 text-slate-200 sticky top-0 z-40 select-none shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 py-2.5 gap-3">
        
        {/* Brand & Active Study Info */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentStep(1)}>
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base leading-none">
                DICOMBatch <span className="text-cyan-400 font-extrabold text-sm px-1 rounded bg-cyan-950/60 border border-cyan-500/20">Pro</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-medium tracking-wide mt-0.5">
                WORKSTATION V2.6.4
              </div>
            </div>
          </div>

          {/* Active Study Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-xs">
            <span className="text-slate-400 font-medium">Estudio:</span>
            <span className="font-mono text-cyan-300 font-bold">{activeStudyName || 'TORAX_CT_2025_03'}</span>
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
              {modality || 'CT'}
            </span>
          </div>

          {/* Status Badges */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-emerald-900/50 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3 h-3" />
              <span>PACS Conectado</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-cyan-900/50 text-[11px] text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAnonActive ? 'HIPAA Anonimización Activa' : 'Sin Anonimización'}</span>
            </div>
          </div>
        </div>

        {/* Stepper Pipeline Navigation */}
        <nav className="flex items-center justify-between sm:justify-start gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 flex-1 max-w-3xl overflow-x-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex-1 justify-center ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.shortTitle}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & User Profile */}
        <div className="hidden md:flex items-center gap-2 shrink-0 text-slate-400">
          <button title="Ayuda y documentación" className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button title="Ajustes de estación de trabajo" className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 ml-1 cursor-pointer">
            <User className="w-4 h-4" />
          </div>
        </div>

      </div>
    </header>
  );
}
