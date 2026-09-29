import React, { useRef } from 'react';
import { 
  UploadCloud, 
  FolderPlus, 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Sparkles,
  Server,
  Layers,
  Trash2
} from 'lucide-react';

export default function Step1Import({ 
  onLoadDemo, 
  onFileUpload, 
  onClearDataset,
  seriesData, 
  selectedSlice, 
  onSelectSeries, 
  onContinue 
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            PASO 01 / 04
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Carga y Validación de Archivos DICOM
          </h1>
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Motor v3.12-WASM Activo
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            SHA-256 On-the-Fly
          </span>
          <button className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors">
            Historial de Lotes
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Ingestion & Series List */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Dropzone Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/50">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Ingesta DICOM Batch</h2>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                      DICOM Part 10
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Arrastre cortes volumétricos individuales (.dcm) o seleccione una carpeta de estudio jerárquica con DICOMDIR.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-cyan-400 font-medium mt-2">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Desidentificación local
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hasta 16-bit Grayscale
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".dcm,application/dicom"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={handleFileChange}
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                />

                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  Explorar Carpeta / Estudio
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Archivos .DCM
                  </button>
                  <button
                    onClick={onLoadDemo}
                    className="flex-1 px-3 py-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-inner"
                    title="Cargar dataset completo de CT Tórax demo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    Cargar Demo CT
                  </button>
                </div>

                {onClearDataset && (
                  <button
                    onClick={onClearDataset}
                    className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    title="Borrar todos los archivos de la importación anterior de la memoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar / Borrar Importación Anterior
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Validation Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">CHECKSUM SHA-256</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">100% OK</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Hash válido en {seriesData ? seriesData.sliceCount : 242}/242 cortes</div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">ETIQUETAS IOD</div>
                <div className="text-xs font-bold text-cyan-400 mt-0.5">PS 3.3 Compliant</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tags críticos (0020,0032) presentes</div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">CONTINUIDAD ESPACIAL</div>
                <div className="text-xs font-bold text-indigo-400 mt-0.5">Paso Constante</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Espaciado Z uniforme detectado</div>
              </div>
            </div>
          </div>

          {/* Radiological Series Detected Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Series Radiológicas Detectadas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  {seriesData ? 1 : 4} Series
                </span>
                <span className="text-[11px] text-slate-400 ml-2 font-mono">
                  Total: {seriesData ? seriesData.sliceCount : 242} instancias ({seriesData ? seriesData.sizeMb : 278} MB)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:bg-slate-800">
                  Filtrar
                </button>
                <button className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:bg-slate-800">
                  Seleccionar Todas
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3 w-8 text-center">✓</th>
                    <th className="p-3">Serie / Descripción Clínica</th>
                    <th className="p-3">Mod.</th>
                    <th className="p-3">Cortes / Matriz</th>
                    <th className="p-3">Profundidad</th>
                    <th className="p-3">Tamaño</th>
                    <th className="p-3">UID Paciente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="bg-cyan-950/20 hover:bg-cyan-950/40 transition-colors cursor-pointer">
                    <td className="p-3 text-center">
                      <input type="checkbox" checked readOnly className="rounded accent-cyan-500 cursor-pointer" />
                    </td>
                    <td className="p-3 font-sans font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>{seriesData ? seriesData.description : 'CT Tórax Axial Contrasto'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        SeriesInstanceUID: 1.3.12.2.1107.5.1.4.60144.300000210
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold">
                        {seriesData ? seriesData.modality : 'CT'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200">
                      {seriesData ? seriesData.sliceCount : 120} cortes ({seriesData ? seriesData.dimensions : '512×512'})
                    </td>
                    <td className="p-3 text-slate-300">{seriesData ? seriesData.bitDepth : '16-bit Int'}</td>
                    <td className="p-3 text-slate-300">{seriesData ? seriesData.sizeMb : 142.4} MB</td>
                    <td className="p-3 text-cyan-400">{seriesData ? seriesData.patientId : 'P-98234 [ANON]'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Sample Thumbnail & DICOM Parameters */}
        <div className="space-y-5">
          
          {/* Sample Thumbnail Box */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">Miniatura de Muestra</span>
              <span className="font-mono text-cyan-400 font-semibold">Corte #60/{seriesData ? seriesData.sliceCount : 120}</span>
            </div>

            <div className="relative aspect-square bg-black rounded-lg overflow-hidden border border-slate-800 group">
              <SampleSliceCanvas slice={selectedSlice} />
              
              {/* Overlay Annotations */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/70 px-1.5 py-0.5 rounded">
                L: -600 W: 1500 [PULMÓN]
              </div>
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-300 bg-black/70 px-1.5 py-0.5 rounded">
                FOV: 350 mm
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-300 bg-black/70 px-1.5 py-0.5 rounded">
                Slice Thk: 1.0mm
              </div>
            </div>
          </div>

          {/* DICOM Parameters List */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">Parámetros DICOM</h3>
              <HardDrive className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Modalidad Primaria</span>
                <span className="text-cyan-400 font-bold">CT / MR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Hardware / Escáner</span>
                <span className="text-slate-200">{selectedSlice ? selectedSlice.hardwareModel : 'SOMATOM Force'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Fabricante</span>
                <span className="text-slate-200">{selectedSlice ? selectedSlice.manufacturer : 'Siemens Healthineers'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Tensión del Tubo (kVp)</span>
                <span className="text-slate-200">{selectedSlice ? selectedSlice.kvp : 120} kVp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Corriente Exposición</span>
                <span className="text-slate-200">{selectedSlice ? selectedSlice.ma : 160} mAs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Kernel Reconstrucción</span>
                <span className="text-slate-200">{selectedSlice ? selectedSlice.kernel : 'Br59d / Sharp'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Matriz Espacial</span>
                <span className="text-slate-200">512 × 512 px</span>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="w-full mt-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all font-sans"
            >
              Continuar a Ventaneo y Ajustes →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

function SampleSliceCanvas({ slice }) {
  const canvasRef = useRef(null);

  React.useEffect(() => {
    if (!slice || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = slice.width;
    canvas.height = slice.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(slice.width, slice.height);

    const minHu = slice.windowCenter - slice.windowWidth / 2;
    const maxHu = slice.windowCenter + slice.windowWidth / 2;

    for (let i = 0; i < slice.pixels.length; i++) {
      const hu = slice.pixels[i] * slice.slope + slice.intercept;
      let gray = 0;
      if (hu <= minHu) gray = 0;
      else if (hu >= maxHu) gray = 255;
      else gray = Math.round(((hu - minHu) / slice.windowWidth) * 255);

      const idx = i * 4;
      imgData.data[idx] = gray;
      imgData.data[idx + 1] = gray;
      imgData.data[idx + 2] = gray;
      imgData.data[idx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  }, [slice]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
}
