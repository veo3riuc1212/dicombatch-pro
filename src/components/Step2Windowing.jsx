import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  Save, 
  FileCheck, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { HU_PRESETS } from '../utils/dicomEngine';

export default function Step2Windowing({
  windowWidth,
  setWindowWidth,
  windowCenter,
  setWindowCenter,
  activePreset,
  setActivePreset,
  jpgQuality,
  setJpgQuality,
  resolutionMode,
  setResolutionMode,
  isAnonActive,
  setIsAnonActive,
  includeOverlay,
  setIncludeOverlay,
  sliceCount = 184,
  onGoToQC,
  onApplyAndContinue
}) {

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    if (preset.id !== 'custom') {
      setWindowWidth(preset.ww);
      setWindowCenter(preset.wl);
    }
  };

  const handleWidthChange = (val) => {
    setWindowWidth(Number(val));
    setActivePreset('custom');
  };

  const handleCenterChange = (val) => {
    setWindowCenter(Number(val));
    setActivePreset('custom');
  };

  const handleReset = () => {
    setActivePreset('lung');
    setWindowWidth(1500);
    setWindowCenter(-600);
    setJpgQuality(95);
    setResolutionMode('original');
  };

  return (
    <div className="space-y-5">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            PASO 2 DE 4: PIPELINE DICOM
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Ventaneo Radiológico y Reglas de Exportación
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Perfil Activo: <strong className="text-cyan-300 font-sans">{HU_PRESETS.find(p => p.id === activePreset)?.label || 'Personalizado'}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            {sliceCount} Archivos Seleccionados
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): Hounsfield Windowing & Presets */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ventaneo Radiológico (Hounsfield Units)
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                HU CALIBRADO
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ajuste el mapeo de atenuación en unidades Hounsfield (HU) de 12/16-bit a la escala visual de 8-bit. Seleccione un preset anatómico validado o configure valores personalizados.
            </p>

            {/* Presets Grid (2x3) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HU_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs">{preset.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Window Sliders */}
            <div className="space-y-5 pt-3 border-t border-slate-800/80">
              
              {/* Window Width */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-sans font-semibold flex items-center gap-1.5">
                    Window Width (Ancho) <span className="text-[10px] text-slate-500 font-mono">[0028,1051]</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-[10px]">WW:</span>
                    <input
                      type="number"
                      value={windowWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-20 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-bold text-right text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400 text-[10px]">HU</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="4000"
                  value={windowWidth}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full accent-cyan-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1 HU (Estrecho)</span>
                  <span>2000 HU</span>
                  <span>4000 HU (Amplio)</span>
                </div>
              </div>

              {/* Window Center */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-sans font-semibold flex items-center gap-1.5">
                    Window Center (Nivel) <span className="text-[10px] text-slate-500 font-mono">[0028,1050]</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-[10px]">WL:</span>
                    <input
                      type="number"
                      value={windowCenter}
                      onChange={(e) => handleCenterChange(e.target.value)}
                      className="w-20 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-bold text-right text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400 text-[10px]">HU</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="-1024"
                  max="3071"
                  value={windowCenter}
                  onChange={(e) => handleCenterChange(e.target.value)}
                  className="w-full accent-cyan-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>-1024 HU (Aire)</span>
                  <span>0 HU (Agua)</span>
                  <span>+3071 HU (Metal / Hueso denso)</span>
                </div>
              </div>

            </div>

            {/* Save Profile Button */}
            <div className="flex items-center justify-between pt-2">
              <button className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors">
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                Guardar Configuración como Perfil
              </button>
              <span className="text-[11px] font-mono text-slate-500">
                Estudio en cola: TORAX_CT_2025_03 ({sliceCount} cortes)
              </span>
            </div>

          </div>

        </div>

        {/* Right Column (5 cols): JPG Conversion & HIPAA Anonymization */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card: JPG Compression & Matrix */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Conversión y Formato JPG
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                JPEG 8-Bit
              </span>
            </div>

            {/* Compression Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-sans font-semibold">Compresión JPG Médico</span>
                <span className="text-cyan-400 font-bold">
                  {jpgQuality}% {jpgQuality >= 95 ? '(Sin pérdidas perceptibles)' : jpgQuality >= 85 ? '(Clínico)' : '(Archival)'}
                </span>
              </div>

              <input
                type="range"
                min="70"
                max="100"
                step="5"
                value={jpgQuality}
                onChange={(e) => setJpgQuality(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>70% (Archival Rápido)</span>
                <span>85%</span>
                <span className="text-cyan-400 font-semibold">95% (Clínico Óptimo)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Matrix Resolution Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-sans font-semibold text-slate-300 block">
                Resolución de Matriz
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setResolutionMode('original')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    resolutionMode === 'original'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">Original</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">512 × 512 px</div>
                </button>

                <button
                  onClick={() => setResolutionMode('2x')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    resolutionMode === '2x'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">Escalado 2X</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">1024 × 1024 px</div>
                </button>

                <button
                  onClick={() => setResolutionMode('custom')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    resolutionMode === 'custom'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">Custom</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">Manual DPI/px</div>
                </button>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              Muestreo cromático: <span className="text-cyan-300 font-semibold">YUV 4:4:4 Grayscale Puro (Sin artefactos)</span>
            </div>

          </div>

          {/* Card: Burned-in Metadata Overlay */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Superposición de Datos en JPG Exportado
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                Overlay Radiológico
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Seleccione si desea que el archivo JPG exportado incluya impresos sobre los píxeles los datos del paciente, examen, posición Z y ventana radiológica, o si prefiere exportar la imagen limpia.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setIncludeOverlay(true)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  includeOverlay
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Con Datos en Imagen</span>
                  {includeOverlay && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Estampa Nombre, ID, Estudio, Z, WW/WL en las 4 esquinas.
                </div>
              </button>

              <button
                onClick={() => setIncludeOverlay(false)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !includeOverlay
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Sin Datos (Limpia)</span>
                  {!includeOverlay && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Exporta únicamente los píxeles de la imagen radiológica.
                </div>
              </button>
            </div>
          </div>

          {/* Card: HIPAA Anonymization */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Anonimización HIPAA & GDPR
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                Safe Harbor
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Asegura la conformidad para ensayos clínicos, docencia o publicación científica eliminando identificadores personales directos en los encabezados convertidos.
            </p>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={isAnonActive}
                onChange={(e) => setIsAnonActive(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-200">Eliminar etiquetas de paciente (0010,0010 / 0010,0020)</div>
                <div className="text-[10px] text-slate-400">Sustituir con UUIDs sintéticos aleatorizados</div>
              </div>
            </label>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGoToQC}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Previsualizar en Visor QC →
            </button>

            <button
              onClick={onApplyAndContinue}
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Aplicar y Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
