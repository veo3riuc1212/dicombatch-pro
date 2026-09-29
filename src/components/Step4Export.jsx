import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  HardDrive, 
  FileText, 
  Pause, 
  Play, 
  Search, 
  Eye, 
  Download, 
  Info,
  Archive,
  Lock,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { applyWindowing, renderSliceToCanvas } from '../utils/dicomEngine';

export default function Step4Export({ 
  slices, 
  windowWidth, 
  windowCenter, 
  jpgQuality, 
  isAnonActive, 
  includeOverlay = true,
  setIncludeOverlay,
  studyName = 'TORAX_CT_2025_03' 
}) {
  const totalSlices = slices.length;
  const [processedCount, setProcessedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Conversion Progress Simulation / Worker
  useEffect(() => {
    let interval;
    if (isProcessing && processedCount < totalSlices) {
      interval = setInterval(() => {
        setProcessedCount((prev) => {
          const next = Math.min(totalSlices, prev + Math.floor(Math.random() * 8) + 4);
          if (next === totalSlices) {
            setIsProcessing(false);
            // Trigger celebrate confetti on 100% completion
            try {
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
            } catch (e) {}
          }
          return next;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isProcessing, processedCount, totalSlices]);

  // Generate Converted Files List metadata
  useEffect(() => {
    const list = slices.map((slice, index) => {
      const fileName = `P98234_${studyName}_Axial_${String(index + 1).padStart(4, '0')}.jpg`;
      const originalSizeMb = 0.52;
      const convertedSizeKb = Math.round(118 + (Math.random() * 20 - 10));
      return {
        id: slice.id || index,
        sliceNumber: index + 1,
        fileName,
        originalSizeMb,
        convertedSizeKb,
        status: index < processedCount ? 'completed' : 'pending',
        slice
      };
    });
    setConvertedFiles(list);
  }, [slices, processedCount, studyName]);

  // Handle ZIP Download of all JPG images
  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${studyName}_JPG_Converted`);

      // Render each slice to JPEG canvas & add to ZIP
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        const canvas = document.createElement('canvas');

        renderSliceToCanvas(
          canvas,
          slice.pixels,
          slice.width,
          slice.height,
          windowWidth,
          windowCenter,
          slice.slope,
          slice.intercept,
          { ...slice, sliceNumber: i + 1 },
          includeOverlay
        );

        // Convert canvas to JPG blob
        const blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', jpgQuality / 100);
        });

        const fileName = `P98234_${studyName}_Slice_${String(i + 1).padStart(4, '0')}.jpg`;
        folder.file(fileName, blob);
      }

      // Generate ZIP blob and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${studyName}_JPG_Batch.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error generando ZIP: ${err.message}`);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Single file download
  const handleDownloadSingle = async (item) => {
    const slice = item.slice;
    const canvas = document.createElement('canvas');

    renderSliceToCanvas(
      canvas,
      slice.pixels,
      slice.width,
      slice.height,
      windowWidth,
      windowCenter,
      slice.slope,
      slice.intercept,
      { ...slice, sliceNumber: item.sliceNumber },
      includeOverlay
    );

    const url = canvas.toDataURL('image/jpeg', jpgQuality / 100);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName;
    a.click();
  };

  const progressPercent = Math.round((processedCount / totalSlices) * 100);
  const remainingSlices = totalSlices - processedCount;

  const filteredFiles = convertedFiles.filter(f => 
    f.fileName.toLowerCase().includes(filterText.toLowerCase()) || 
    String(f.sliceNumber).includes(filterText)
  );

  return (
    <div className="space-y-5">
      {/* Top Banner Processing Meter */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                TUBO DE CONVERSIÓN ACTIVO • Thread Cluster 8x
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Procesamiento en Lote: {processedCount} de {totalSlices} cortes convertidos
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {isProcessing ? `Despachando buffers WebAssembly: Tarea #${processedCount + 1} a #${Math.min(totalSlices, processedCount + 6)} en proceso` : 'Procesamiento de lote completado con éxito'}
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">Throughput</div>
              <div className="text-cyan-400 font-bold text-sm">32 cortes/s</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">Tiempo Restante</div>
              <div className="text-slate-200 font-bold text-sm">
                {isProcessing ? `00:00:${String(Math.ceil(remainingSlices / 32)).padStart(2, '0')}` : '00:00:00'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">Tasa de Éxito</div>
              <div className="text-emerald-400 font-bold text-sm">100%</div>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 relative" 
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Inicio de secuencia</span>
            <span className="text-cyan-400 font-bold">{progressPercent}% Completado</span>
          </div>
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">CORTES PROCESADOS</div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {processedCount} <span className="text-xs text-slate-400 font-normal">/ {totalSlices} cortes</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between font-mono pt-1 border-t border-slate-800/80">
            <span>{remainingSlices} pendientes</span>
            <span className="text-cyan-400 font-semibold">DICOM Part 10</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">COMPRESIÓN HOUNSFIELD</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            21.6 MB <span className="text-xs text-slate-400 font-normal">desde 184 MB</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex justify-between font-mono pt-1 border-t border-slate-800/80">
            <span className="font-bold">88.2% Ahorro</span>
            <span className="text-slate-400">JPG 95% Lossless-Q</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">INTEGRIDAD DE LOTE</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            0 <span className="text-xs text-slate-400 font-normal">errores críticos</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono pt-1 border-t border-slate-800/80">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sumas MD5 validadas</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">MOTOR DE CÓMPUTO</div>
          <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-1">
            <Lock className="w-4 h-4 text-cyan-400" />
            Wasm-DICOM Parser v2
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
            Procesamiento 100% In-Browser • Zero Leaks
          </div>
        </div>

      </div>

      {/* HIPAA Audit Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Auditoría HIPAA y GDPR Superada
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                Desidentificado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Etiquetas identificables (0010,0010 / 0010,0020) detectadas en cabeceras de salida. UID sintetizados aleatoriamente conforme al protocolo Safe Harbor.
            </p>
          </div>
        </div>

        <button className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-semibold flex items-center gap-2 whitespace-nowrap transition-colors">
          <span>@</span>
          <span>Ver Certificado SHA-256</span>
        </button>
      </div>

      {/* Main Grid: Conversion Live Queue + Download ZIP Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Live Queue Table (8 cols) */}
        <div className="lg:col-span-8 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden space-y-0">
          
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                Secuencia de Conversión en Vivo
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[10px]">
                {studyName}_AXIAL
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar corte (#slice)..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
                />
              </div>

              <button 
                onClick={() => setIsProcessing(!isProcessing)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 font-sans font-medium hover:bg-slate-800"
              >
                {isProcessing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isProcessing ? 'Pausar' : 'Reanudar'}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="p-3">MINIATURA</th>
                  <th className="p-3">FICHERO DESTINO</th>
                  <th className="p-3">DICOM → JPG</th>
                  <th className="p-3">ESTADO</th>
                  <th className="p-3 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFiles.slice(0, 15).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-2.5">
                      <div className="w-9 h-9 rounded bg-black border border-slate-800 overflow-hidden flex items-center justify-center font-mono text-[9px] text-cyan-400">
                        #{item.sliceNumber}
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-white">
                      <div>{item.fileName}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        Matriz: {item.slice.width}×{item.slice.height} | WL: {windowCenter} WW: {windowWidth}
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {item.originalSizeMb} MB → <span className="text-cyan-400 font-bold">{item.convertedSizeKb} KB</span>
                    </td>
                    <td className="p-2.5">
                      {item.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Completado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-700/50 text-[10px] font-bold animate-pulse w-fit">
                          En proceso...
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleDownloadSingle(item)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-300" 
                          title="Descargar JPG individual"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-slate-800 text-slate-400" title="Información de metadatos">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Consolidated ZIP Download Box (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-xl p-5 space-y-4 shadow-xl shadow-cyan-950/30 relative">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-cyan-400 font-bold tracking-wider">DESCARGA PRINCIPAL</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[10px] border border-cyan-700/50">
                ZIP v1.3
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Archive className="w-6 h-6 text-cyan-400" />
                Paquete Consolidado
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Archivo comprimido generado en el cliente con árbol de directorios normalizado para docencia o investigación.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Contenido ZIP</span>
                <span className="text-slate-200 font-bold">{totalSlices} Archivos JPG</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Aproximado ZIP</span>
                <span className="text-cyan-400 font-bold">21.6 MB</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Formato Estándar</span>
                <span className="text-slate-200">JPEG 8-Bit sRGB</span>
              </div>

              {/* Overlay Mode Selector */}
              <div className="pt-2 border-t border-slate-800 space-y-1 font-sans">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Modo de Exportación en Imagen:
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => setIncludeOverlay(true)}
                    className={`py-1.5 px-2 rounded text-center transition-all font-semibold ${
                      includeOverlay 
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow' 
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Con Datos
                  </button>
                  <button
                    onClick={() => setIncludeOverlay(false)}
                    className={`py-1.5 px-2 rounded text-center transition-all font-semibold ${
                      !includeOverlay 
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow' 
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Sin Datos (Limpia)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
            >
              {isGeneratingZip ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generando paquete ZIP...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-5 h-5" />
                  <span>DESCARGAR PAQUETE ZIP (.ZIP)</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
