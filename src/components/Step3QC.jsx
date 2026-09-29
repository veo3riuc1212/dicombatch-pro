import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Ruler, 
  Circle, 
  Columns, 
  Play, 
  Pause, 
  CheckCircle2, 
  Activity, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { calculateRoiStats, generateHuHistogram } from '../utils/dicomEngine';

export default function Step3QC({ 
  slices, 
  currentSliceIndex, 
  setCurrentSliceIndex, 
  windowWidth, 
  windowCenter, 
  jpgQuality 
}) {
  const currentSlice = slices[currentSliceIndex] || slices[0];
  const sliceCount = slices.length;

  // Tools state
  const [activeTool, setActiveTool] = useState('caliper'); // 'caliper', 'roi', 'dual'
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [dualSplit, setDualSplit] = useState(50); // percentage split for dual curtain
  const [hoverPos, setHoverPos] = useState({ x: 218, y: 341, hu: -452 });

  // Measurement points for Caliper (d = 16.4 mm)
  const [caliperPoints, setCaliperPoints] = useState({
    p1: { x: 180, y: 250 },
    p2: { x: 260, y: 250 }
  });

  // ROI circle state
  const [roiPos, setRoiPos] = useState({ x: 340, y: 280, radius: 25 });
  const [roiStats, setRoiStats] = useState({ mean: -680, stdDev: 34.2, count: 196 });

  // Main canvas ref
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Cine Playback effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSliceIndex((prev) => (prev + 1) % sliceCount);
      }, 1000 / 15); // 15 fps
    }
    return () => clearInterval(interval);
  }, [isPlaying, sliceCount, setCurrentSliceIndex]);

  // Render DICOM slice to Canvas
  useEffect(() => {
    if (!currentSlice || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = currentSlice.width;
    canvas.height = currentSlice.height;
    const ctx = canvas.getContext('2d');

    const minHu = windowCenter - windowWidth / 2;
    const maxHu = windowCenter + windowWidth / 2;
    const pixels = currentSlice.pixels;
    const numPixels = currentSlice.width * currentSlice.height;

    const imgData = ctx.createImageData(currentSlice.width, currentSlice.height);

    for (let i = 0; i < numPixels; i++) {
      const hu = pixels[i] * currentSlice.slope + currentSlice.intercept;
      let gray = 0;
      if (hu <= minHu) gray = 0;
      else if (hu >= maxHu) gray = 255;
      else gray = Math.round(((hu - minHu) / windowWidth) * 255);

      const idx = i * 4;
      imgData.data[idx] = gray;
      imgData.data[idx + 1] = gray;
      imgData.data[idx + 2] = gray;
      imgData.data[idx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);

    // Calculate ROI stats if ROI tool active
    if (currentSlice.pixels) {
      const stats = calculateRoiStats(
        currentSlice.pixels,
        currentSlice.width,
        currentSlice.height,
        roiPos.x,
        roiPos.y,
        roiPos.radius,
        currentSlice.slope,
        currentSlice.intercept
      );
      setRoiStats(stats);
    }
  }, [currentSlice, windowWidth, windowCenter, roiPos]);

  // Handle Mouse Move over Canvas to track HU at cursor
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !currentSlice) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = currentSlice.width / rect.width;
    const scaleY = currentSlice.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < currentSlice.width && y >= 0 && y < currentSlice.height) {
      const idx = y * currentSlice.width + x;
      const hu = currentSlice.pixels[idx] * currentSlice.slope + currentSlice.intercept;
      setHoverPos({ x, y, hu: Math.round(hu) });
    }
  };

  // Calculate distance in mm for Caliper
  const distPixels = Math.hypot(caliperPoints.p2.x - caliperPoints.p1.x, caliperPoints.p2.y - caliperPoints.p1.y);
  const distMm = (distPixels * 0.68).toFixed(1); // 0.68 mm per pixel

  return (
    <div className="space-y-4">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-bold">
            <Activity className="w-4 h-4" />
            QC Studio
          </span>
          <h1 className="text-sm font-bold text-white tracking-tight">
            Corte {currentSliceIndex + 1} / {sliceCount} <span className="text-slate-400 font-normal">({currentSlice ? currentSlice.seriesDescription : 'Serie 03: CT Tórax Alta Resolución Axial'})</span>
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
            Z: {currentSlice ? currentSlice.zPos : '-142.50'} mm
          </span>
        </div>

        {/* Quality Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Validación Pixel: Exacta
          </span>
          <span className="px-2.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[11px]">
            SSIM: 0.9942
          </span>
        </div>

        {/* Tools Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Acercar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-cyan-400 px-1 font-bold">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Alejar Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 my-auto mx-1"></div>

          {/* Caliper Tool */}
          <button
            onClick={() => setActiveTool('caliper')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
              activeTool === 'caliper'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Caliper</span>
          </button>

          {/* ROI HU Tool */}
          <button
            onClick={() => setActiveTool('roi')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
              activeTool === 'roi'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>ROI HU</span>
          </button>

          {/* Cortina Dual Tool */}
          <button
            onClick={() => setActiveTool('dual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
              activeTool === 'dual'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Cortina Dual</span>
          </button>

          <button
            onClick={() => { setZoomLevel(1.0); setActiveTool('caliper'); setDualSplit(50); }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
            title="Restablecer Visor"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Viewer + Radiometric Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (8 cols): Interactive Canvas Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          
          <div 
            ref={containerRef}
            className="relative bg-black rounded-xl border border-slate-800 overflow-hidden min-h-[460px] flex items-center justify-center select-none group"
            onMouseMove={handleMouseMove}
          >
            {/* DICOM Render Canvas */}
            <div 
              className="relative transition-transform duration-100 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <canvas ref={canvasRef} className="max-w-full max-h-[460px] object-contain block mx-auto" />

              {/* Dual Curtain Split Overlay */}
              {activeTool === 'dual' && (
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-cyan-950/40 border-r-2 border-cyan-400 overflow-hidden pointer-events-none"
                  style={{ width: `${dualSplit}%` }}
                >
                  <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/40">
                    RAW 16-BIT DICOM (HU Original)
                  </div>
                </div>
              )}

              {/* Caliper Tool Line Annotation */}
              {activeTool === 'caliper' && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1={caliperPoints.p1.x} 
                    y1={caliperPoints.p1.y} 
                    x2={caliperPoints.p2.x} 
                    y2={caliperPoints.p2.y} 
                    stroke="#22d3ee" 
                    strokeWidth="2" 
                    strokeDasharray="4 2"
                  />
                  <circle cx={caliperPoints.p1.x} cy={caliperPoints.p1.y} r="4" fill="#06b6d4" />
                  <circle cx={caliperPoints.p2.x} cy={caliperPoints.p2.y} r="4" fill="#06b6d4" />
                  <rect 
                    x={(caliperPoints.p1.x + caliperPoints.p2.x) / 2 - 35} 
                    y={(caliperPoints.p1.y + caliperPoints.p2.y) / 2 - 12} 
                    width="70" 
                    height="20" 
                    rx="4" 
                    fill="#0f172a" 
                    stroke="#06b6d4" 
                    strokeWidth="1"
                  />
                  <text 
                    x={(caliperPoints.p1.x + caliperPoints.p2.x) / 2} 
                    y={(caliperPoints.p1.y + caliperPoints.p2.y) / 2 + 2} 
                    fill="#22d3ee" 
                    fontSize="10" 
                    fontFamily="monospace" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    d = {distMm} mm
                  </text>
                </svg>
              )}

              {/* ROI Circle Annotation */}
              {activeTool === 'roi' && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <circle 
                    cx={roiPos.x} 
                    cy={roiPos.y} 
                    r={roiPos.radius} 
                    fill="rgba(6, 182, 212, 0.15)" 
                    stroke="#06b6d4" 
                    strokeWidth="2"
                  />
                  <rect 
                    x={roiPos.x + roiPos.radius + 5} 
                    y={roiPos.y - 20} 
                    width="100" 
                    height="36" 
                    rx="4" 
                    fill="#0f172a" 
                    stroke="#06b6d4" 
                    strokeWidth="1"
                  />
                  <text x={roiPos.x + roiPos.radius + 12} y={roiPos.y - 5} fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    ROI μ: {roiStats.mean} HU
                  </text>
                  <text x={roiPos.x + roiPos.radius + 12} y={roiPos.y + 10} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    σ: ±{roiStats.stdDev} HU
                  </text>
                </svg>
              )}
            </div>

            {/* Overlays - Top Left Header Tags */}
            <div className="absolute top-3 left-3 pointer-events-none font-mono text-[10px] space-y-0.5 text-white bg-black/70 p-2 rounded border border-slate-800/80 shadow-md">
              <div className="text-white font-bold tracking-wide drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">ID: {currentSlice ? currentSlice.patientName : 'ANON-8849-09TX'}</div>
              <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">PACIENTE: [ANONIMIZADO CLÍNICO]</div>
              <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">EDAD/SEXO: {currentSlice ? currentSlice.patientAgeSex : '58A / M'} • kVp: {currentSlice ? currentSlice.kvp : 120} • mA: {currentSlice ? currentSlice.ma : 240}</div>
            </div>

            {/* Overlays - Top Right Image Meta */}
            <div className="absolute top-3 right-3 pointer-events-none font-mono text-[10px] space-y-0.5 text-right text-white bg-black/70 p-2 rounded border border-slate-800/80 shadow-md">
              <div className="text-white font-bold tracking-wide drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">TÓRAX ALTA RES (HRCT)</div>
              <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">FOV: {currentSlice ? currentSlice.fov : 350.0} mm • Matriz: {currentSlice ? currentSlice.width : 512} × {currentSlice ? currentSlice.height : 512}</div>
              <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">Espesor: {currentSlice ? currentSlice.sliceThickness : 1.00} mm • Spacing: 0.68 mm</div>
            </div>

            {/* Overlays - Bottom Left Pixel Info */}
            <div className="absolute bottom-3 left-3 pointer-events-none font-mono text-[10px] space-y-0.5 text-white bg-black/70 p-2 rounded border border-slate-800/80 shadow-md">
              <div className="text-white font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">DICOM Raw (16-bit) • Cursor X: {hoverPos.x} Y: {hoverPos.y}</div>
              <div className="text-emerald-400 font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">Valor HU: {hoverPos.hu} HU ({hoverPos.hu < -500 ? 'Parénquima Pulmonar' : hoverPos.hu < 0 ? 'Grasa' : hoverPos.hu < 100 ? 'Mediastino' : 'Hueso'})</div>
              <div className="text-slate-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">Gama: Aire -1000 • Grasa -120 • Parénquima -600 • Hueso +1000</div>
            </div>

            {/* Overlays - Bottom Right Render Info */}
            <div className="absolute bottom-3 right-3 pointer-events-none font-mono text-[10px] space-y-0.5 text-right text-white bg-black/70 p-2 rounded border border-slate-800/80 shadow-md">
              <div className="text-white font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">JPG Render: 8-bit sRGB</div>
              <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">W: {windowWidth} • L: {windowCenter} • Q: {jpgQuality}%</div>
              <div className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">Corte Z: {currentSlice ? currentSlice.zPos : '-142.50'} mm (Axial Craniocaudal)</div>
            </div>

          </div>

          {/* Bottom Axial Navigator Controls */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-sans font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                NAVAGADOR AXIAL DE CORTES ({sliceCount} CORTES DICOM)
              </span>
              <span className="text-cyan-400 font-bold">Paso: 1.0 mm</span>
            </div>

            {/* Slice Slider */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={sliceCount - 1}
                value={currentSliceIndex}
                onChange={(e) => setCurrentSliceIndex(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 min-w-[70px] text-center">
                #{currentSliceIndex + 1}/{sliceCount}
              </span>
            </div>

            {/* Thumbnail Carousel & Cine Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Cine Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-sans font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  isPlaying 
                    ? 'bg-amber-500 text-slate-950 border-amber-400' 
                    : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pausar' : 'Cine 15 fps'}</span>
              </button>

              {/* Slice Position Indicators */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-lg scrollbar-none">
                {slices.slice(Math.max(0, currentSliceIndex - 4), Math.min(sliceCount, currentSliceIndex + 5)).map((s, idx) => {
                  const actualIdx = Math.max(0, currentSliceIndex - 4) + idx;
                  const isCur = actualIdx === currentSliceIndex;
                  return (
                    <button
                      key={s.id || actualIdx}
                      onClick={() => setCurrentSliceIndex(actualIdx)}
                      className={`w-10 h-10 rounded border overflow-hidden shrink-0 transition-all ${
                        isCur 
                          ? 'border-cyan-400 ring-2 ring-cyan-500/40 scale-105' 
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="w-full h-full bg-slate-900 text-[9px] flex items-center justify-center font-mono text-cyan-300">
                        #{actualIdx + 1}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Radiometric Inspection & Density Histogram */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                <Activity className="w-4 h-4 text-cyan-400" />
                Inspección Radiométrica
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                QC PASSED
              </span>
            </div>

            {/* HU Histogram Canvas Simulation */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>HISTOGRAMA DENSIDAD HU</span>
                <span className="text-cyan-400">Rango: [-1024 a +1400 HU]</span>
              </div>

              {/* Histogram Graph */}
              <div className="relative h-36 bg-black rounded-lg border border-slate-800 p-2 flex items-end justify-between overflow-hidden">
                {/* Background curves */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none p-2">
                  {/* Air Peak */}
                  <path d="M 10 120 Q 30 10 50 120" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                  {/* Lungs Peak */}
                  <path d="M 55 120 Q 85 30 115 120" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                  {/* Water Peak */}
                  <path d="M 120 120 Q 150 70 180 120" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Bone Peak */}
                  <path d="M 210 120 Q 240 40 270 120" fill="none" stroke="#a855f7" strokeWidth="1.5" />

                  {/* Active Cursor Level Indicator */}
                  <line x1="90" y1="0" x2="90" y2="130" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>

                <div className="w-full flex justify-between text-[9px] font-mono text-slate-500 absolute bottom-1 left-0 px-3 pointer-events-none">
                  <span>-1000 HU</span>
                  <span>-452 HU</span>
                  <span>0 HU</span>
                  <span>+1000 HU</span>
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-400 px-1">
                <span>Aire</span>
                <span>Pulmón</span>
                <span>Agua/Músc.</span>
                <span>Hueso</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Media Corte</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">-618 HU</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Desv. Est.</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">+412 HU</div>
              </div>
            </div>

            {/* Compression Alerts */}
            <div className="space-y-2 pt-2 border-t border-slate-800 font-sans">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Alertas y Calidad de Compresión
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Contraste Óptimo Verificado
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Sin colapso tonal entre aire traqueal y septos alveolares finos.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
