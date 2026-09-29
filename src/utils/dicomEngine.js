import dicomParser from 'dicom-parser';

/**
 * Anatomical Hounsfield Presets
 */
export const HU_PRESETS = [
  { id: 'lung', label: 'Pulmón', ww: 1500, wl: -600, desc: 'W: 1500 | L: -600' },
  { id: 'mediastinum', label: 'Mediastino', ww: 350, wl: 40, desc: 'W: 350 | L: 40' },
  { id: 'bone', label: 'Hueso Cortical', ww: 2000, wl: 350, desc: 'W: 2000 | L: 350' },
  { id: 'brain', label: 'Cerebro', ww: 80, wl: 40, desc: 'W: 80 | L: 40' },
  { id: 'angio', label: 'Angio / Vascular', ww: 600, wl: 150, desc: 'W: 600 | L: 150' },
  { id: 'custom', label: 'Personalizado', ww: 1500, wl: -600, desc: 'Definido Manual' }
];

/**
 * Apply Hounsfield Windowing to raw pixel data
 * Maps 16-bit / 12-bit raw pixels -> HU -> 8-bit Grayscale (0-255)
 */
export function applyWindowing(pixels, width, height, windowWidth, windowCenter, slope = 1, intercept = 0) {
  const numPixels = width * height;
  const output8 = new Uint8ClampedArray(numPixels * 4); // RGBA

  const minHu = windowCenter - windowWidth / 2;
  const maxHu = windowCenter + windowWidth / 2;

  for (let i = 0; i < numPixels; i++) {
    const rawVal = pixels[i];
    const hu = rawVal * slope + intercept;

    let gray = 0;
    if (hu <= minHu) {
      gray = 0;
    } else if (hu >= maxHu) {
      gray = 255;
    } else {
      gray = Math.round(((hu - minHu) / windowWidth) * 255);
    }

    const idx = i * 4;
    output8[idx] = gray;     // R
    output8[idx + 1] = gray; // G
    output8[idx + 2] = gray; // B
    output8[idx + 3] = 255;  // Alpha
  }

  return output8;
}

/**
 * Calculate Region of Interest (ROI) HU statistics
 */
export function calculateRoiStats(pixels, width, height, cx, cy, radius, slope = 1, intercept = 0) {
  let count = 0;
  let sum = 0;
  let values = [];

  const r2 = radius * radius;
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const idx = y * width + x;
        const hu = pixels[idx] * slope + intercept;
        sum += hu;
        values.push(hu);
        count++;
      }
    }
  }

  if (count === 0) return { mean: 0, stdDev: 0, count: 0 };

  const mean = sum / count;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return { mean: Math.round(mean), stdDev: Math.round(stdDev * 10) / 10, count };
}

/**
 * Generate HU Density Histogram
 */
export function generateHuHistogram(pixels, numBins = 50, slope = 1, intercept = 0) {
  const bins = new Array(numBins).fill(0);
  const minHu = -1024;
  const maxHu = 1500;
  const binWidth = (maxHu - minHu) / numBins;

  for (let i = 0; i < pixels.length; i += 4) { // sample every 4th pixel for speed
    const hu = pixels[i] * slope + intercept;
    if (hu >= minHu && hu <= maxHu) {
      const binIdx = Math.min(numBins - 1, Math.floor((hu - minHu) / binWidth));
      bins[binIdx]++;
    }
  }

  const maxCount = Math.max(...bins, 1);
  return bins.map((count, idx) => ({
    hu: Math.round(minHu + idx * binWidth),
    normalized: count / maxCount,
    count
  }));
}

/**
 * Render DICOM slice to Canvas & optionally burn clinical overlay text
 */
export function renderSliceToCanvas(canvas, pixels, width, height, ww, wl, slope = 1, intercept = 0, sliceMeta = null, includeOverlay = false) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const rgbaData = applyWindowing(pixels, width, height, ww, wl, slope, intercept);
  const imgData = new ImageData(rgbaData, width, height);
  ctx.putImageData(imgData, 0, 0);

  // If overlay text requested, draw clinical metadata on top of canvas pixels
  if (includeOverlay && sliceMeta) {
    ctx.save();
    
    // Scale font size based on image matrix width
    const fontSize = Math.max(12, Math.round(width / 36));
    ctx.font = `bold ${fontSize}px "JetBrains Mono", Consolas, monospace`;
    ctx.textBaseline = 'top';

    // Helper to draw text with black outline border for high contrast
    const drawOutlinedText = (text, x, y, align = 'left') => {
      ctx.textAlign = align;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, Math.round(width / 150));
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = '#ffffff'; // White text
      ctx.fillText(text, x, y);
    };

    const margin = Math.round(width * 0.025);
    const lineHeight = fontSize + 4;

    // Top Left Overlay: Patient & ID
    drawOutlinedText(sliceMeta.patientName || 'ANON-8849-09TX', margin, margin, 'left');
    drawOutlinedText(`ID: ${sliceMeta.patientId || 'P-98234'}`, margin, margin + lineHeight, 'left');
    drawOutlinedText(`${sliceMeta.patientAgeSex || '58A / M'}`, margin, margin + lineHeight * 2, 'left');

    // Top Right Overlay: Study & Modality
    drawOutlinedText(sliceMeta.seriesDescription || 'CT TÓRAX AXIAL', width - margin, margin, 'right');
    drawOutlinedText(`${sliceMeta.modality || 'CT'} • ${sliceMeta.kvp || 120}kVp ${sliceMeta.ma || 240}mA`, width - margin, margin + lineHeight, 'right');
    drawOutlinedText(`FOV: ${sliceMeta.fov || 350}mm`, width - margin, margin + lineHeight * 2, 'right');

    // Bottom Left Overlay: Slice Z & Thickness
    const bottomY = height - margin - lineHeight * 2;
    drawOutlinedText(`Slice #${sliceMeta.sliceNumber || 1}`, margin, bottomY, 'left');
    drawOutlinedText(`Z: ${sliceMeta.zPos || '0.00'} mm`, margin, bottomY + lineHeight, 'left');

    // Bottom Right Overlay: WW/WL & Matrix
    drawOutlinedText(`W: ${ww} L: ${wl}`, width - margin, bottomY, 'right');
    drawOutlinedText(`Matrix: ${width}x${height}`, width - margin, bottomY + lineHeight, 'right');

    ctx.restore();
  }
}


/**
 * Create Demo DICOM Series (120 slices of realistic CT Chest scan)
 */
export function createDemoSeries(seriesName = 'CT Tórax Axial Contrastado', sliceCount = 120) {
  const slices = [];
  const width = 512;
  const height = 512;

  for (let s = 1; s <= sliceCount; s++) {
    const pixels = new Int16Array(width * height);
    const zPos = -300 + (s - 1) * 2.5;

    // Generate CT Chest cross section simulation
    const cx = 256;
    const cy = 256;
    const bodyRadius = 200 + Math.sin(s / 20) * 10;
    const lungRadius = 80 + Math.cos(s / 15) * 5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        const idx = y * width + x;

        // Background Air (-1000 HU)
        let hu = -1024 + Math.random() * 10;

        // Body outline (Soft tissue ~ +40 HU)
        if (dist2 < bodyRadius * bodyRadius) {
          hu = 40 + (Math.random() * 20 - 10);

          // Subcutaneous fat (-90 HU)
          if (dist2 > (bodyRadius - 20) * (bodyRadius - 20)) {
            hu = -90 + (Math.random() * 15 - 7);
          }

          // Ribs / Spine (Bone ~ +800 HU to +1200 HU)
          const angle = Math.atan2(dy, dx);
          const ribPattern = Math.sin(angle * 8);
          if (dist2 > 160 * 160 && dist2 < 185 * 185 && ribPattern > 0.6) {
            hu = 900 + (Math.random() * 200);
          }

          // Spine (Posterior bone)
          if (dy > 100 && Math.abs(dx) < 30) {
            hu = 1100 + (Math.random() * 150);
          }

          // Lungs (Air/Parenchyma ~ -700 HU)
          const leftLungDx = dx - 75;
          const rightLungDx = dx + 75;
          const lungDy = dy + 10;
          const distLeftLung = leftLungDx * leftLungDx + lungDy * lungDy;
          const distRightLung = rightLungDx * rightLungDx + lungDy * lungDy;

          if (distLeftLung < lungRadius * lungRadius || distRightLung < lungRadius * lungRadius) {
            hu = -680 + (Math.random() * 60 - 30);

            // Pulmonary vessels inside lungs (+150 HU)
            const vesselNoise = Math.sin(x * 0.1) * Math.cos(y * 0.1);
            if (vesselNoise > 0.7) {
              hu = 120 + Math.random() * 50;
            }
          }

          // Mediastinum / Heart (+50 HU)
          if (Math.abs(dx) < 55 && Math.abs(dy + 20) < 60) {
            hu = 55 + (Math.random() * 20 - 10);
            // Aorta (+200 HU contrast)
            if (Math.hypot(dx - 15, dy + 35) < 18) {
              hu = 240 + Math.random() * 30;
            }
          }
        }

        pixels[idx] = Math.round(hu);
      }
    }

    slices.push({
      id: `slice_${s}`,
      sliceNumber: s,
      seriesId: 'series_01',
      patientName: 'ANON-8849-09TX',
      patientId: 'P-98234 [ANON]',
      patientAgeSex: '58A / M',
      modality: 'CT',
      studyDescription: 'TORAX_CT_2025_03',
      seriesDescription: 'CT Tórax Axial Contrasto',
      manufacturer: 'Siemens Healthineers',
      hardwareModel: 'SOMATOM Force',
      kvp: 120,
      ma: 240,
      kernel: 'Br59d / Sharp',
      fov: 350.0,
      sliceThickness: 1.0,
      pixelSpacing: [0.68, 0.68],
      width,
      height,
      zPos: zPos.toFixed(2),
      slope: 1,
      intercept: 0,
      windowWidth: 1500,
      windowCenter: -600,
      pixels,
      fileSizeMb: 0.52
    });
  }

  return {
    id: 'series_01',
    description: 'CT Tórax Axial Contrasto',
    modality: 'CT',
    sliceCount: slices.length,
    dimensions: `${width}×${height}`,
    bitDepth: '16-bit Int',
    sizeMb: 62.4,
    patientId: 'P-98234 [ANON]',
    slices
  };
}

/**
 * Parse real uploaded DICOM File using dicom-parser
 */
export async function parseDicomFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  let dataSet;
  try {
    dataSet = dicomParser.parseDicom(byteArray);
  } catch (err) {
    throw new Error(`Error analizando estructura DICOM de ${file.name}: ${err.message}`);
  }

  const patientName = dataSet.string('x00100010') || 'ANÓNIMO';
  const patientId = dataSet.string('x00100020') || 'P-UNKNOWN';
  const modality = dataSet.string('x00080060') || 'CT';
  const studyDescription = dataSet.string('x00081030') || 'ESTUDIO DICOM';
  const seriesDescription = dataSet.string('x0008103e') || 'SERIE DICOM';
  const manufacturer = dataSet.string('x00080070') || 'GENÉRICO';
  const rows = dataSet.uint16('x00280010') || 512;
  const columns = dataSet.uint16('x00280011') || 512;
  const windowCenter = parseFloat(dataSet.string('x00281050')) || -600;
  const windowWidth = parseFloat(dataSet.string('x00281051')) || 1500;
  const rescaleIntercept = parseFloat(dataSet.string('x00281052')) || 0;
  const rescaleSlope = parseFloat(dataSet.string('x00281053')) || 1;
  const sliceThickness = parseFloat(dataSet.string('x00180050')) || 1.0;
  const kvp = dataSet.string('x00180060') || '120';
  const ma = dataSet.string('x00181151') || '160';

  // Read pixel data element (07FE,0010)
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) {
    throw new Error(`Sin datos de píxeles en ${file.name}`);
  }

  const pixelDataOffset = pixelDataElement.dataOffset;
  const numPixels = rows * columns;
  const pixels = new Int16Array(numPixels);

  // Read 16-bit little endian words
  for (let i = 0; i < numPixels; i++) {
    const byteIdx = pixelDataOffset + i * 2;
    if (byteIdx + 1 < byteArray.length) {
      pixels[i] = byteArray[byteIdx] | (byteArray[byteIdx + 1] << 8);
    }
  }

  return {
    id: `file_${file.name}_${Date.now()}`,
    fileName: file.name,
    patientName,
    patientId,
    modality,
    studyDescription,
    seriesDescription,
    manufacturer,
    hardwareModel: 'DICOM Scanner',
    kvp,
    ma,
    kernel: 'Standard',
    fov: 350.0,
    sliceThickness,
    pixelSpacing: [0.7, 0.7],
    width: columns,
    height: rows,
    zPos: '0.00',
    slope: rescaleSlope,
    intercept: rescaleIntercept,
    windowWidth,
    windowCenter,
    pixels,
    fileSizeMb: (file.size / (1024 * 1024)).toFixed(2)
  };
}
