import React from 'react';
import { 
  Layers, 
  Sliders, 
  Eye, 
  DownloadCloud, 
  FileCode, 
  Activity, 
  Database 
} from 'lucide-react';

export default function Sidebar({ currentStep, setCurrentStep, onOpenDicomTags, throughput = 42, bufferPercent = 68 }) {
  const menuItems = [
    { id: 1, label: 'Lote & Series', icon: Layers },
    { id: 2, label: 'Ventanas Hounsfield', icon: Sliders },
    { id: 3, label: 'Inspección QC', icon: Eye },
    { id: 4, label: 'Exportar & PACS', icon: DownloadCloud },
  ];

  return (
    <aside className="w-64 bg-[#091022] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-57px)]">
      {/* Top Menu Section */}
      <div className="p-3">
        <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 py-2">
          Sesión de Trabajo
        </div>
        
        <div className="space-y-1 mt-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentStep(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenDicomTags}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all text-left"
          >
            <FileCode className="w-4 h-4 text-slate-400" />
            <span>Etiquetas DICOM</span>
          </button>
        </div>
      </div>

      {/* Bottom Performance Metrics Panel */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 font-mono text-[11px] space-y-3">
        {/* Throughput */}
        <div>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-sans text-xs text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Throughput
            </span>
            <span className="text-cyan-400 font-bold">{throughput} dcm/s</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, throughput * 2)}%` }}></div>
          </div>
        </div>

        {/* Buffer */}
        <div>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-sans text-xs text-slate-400">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Buffer
            </span>
            <span className="text-slate-300 font-semibold">{bufferPercent}% de 2.0GB</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-slate-500 rounded-full transition-all duration-500" style={{ width: `${bufferPercent}%` }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
