import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Step1Import from './components/Step1Import';
import Step2Windowing from './components/Step2Windowing';
import Step3QC from './components/Step3QC';
import Step4Export from './components/Step4Export';
import DicomTagModal from './components/DicomTagModal';
import { createDemoSeries, parseDicomFile } from './utils/dicomEngine';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // DICOM Dataset state
  const [seriesData, setSeriesData] = useState(null);
  const [slices, setSlices] = useState([]);
  const [currentSliceIndex, setCurrentSliceIndex] = useState(0);

  // Windowing & Export Settings State
  const [windowWidth, setWindowWidth] = useState(1500);
  const [windowCenter, setWindowCenter] = useState(-600);
  const [activePreset, setActivePreset] = useState('lung');
  const [jpgQuality, setJpgQuality] = useState(95);
  const [resolutionMode, setResolutionMode] = useState('original');
  const [isAnonActive, setIsAnonActive] = useState(true);
  const [includeOverlay, setIncludeOverlay] = useState(true);

  // DICOM Tag Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Clear previous dataset and free memory
  const clearPreviousDataset = () => {
    setSlices([]);
    setSeriesData(null);
    setCurrentSliceIndex(0);
  };

  // Load Demo CT Chest dataset on startup
  useEffect(() => {
    loadDemoDataset();
  }, []);

  const loadDemoDataset = () => {
    clearPreviousDataset();
    const demo = createDemoSeries('CT Tórax Axial Contrasto', 120);
    setSeriesData(demo);
    setSlices(demo.slices);
    setCurrentSliceIndex(0);
    setWindowWidth(1500);
    setWindowCenter(-600);
    setActivePreset('lung');
  };

  // Handle uploading real DICOM files (.dcm) - Purges previous import completely
  const handleFileUpload = async (files) => {
    clearPreviousDataset();
    const fileList = Array.from(files);
    const parsedSlices = [];

    for (let i = 0; i < fileList.length; i++) {
      try {
        const slice = await parseDicomFile(fileList[i]);
        slice.sliceNumber = i + 1;
        parsedSlices.push(slice);
      } catch (err) {
        console.warn(`Error parseando ${fileList[i].name}:`, err);
      }
    }

    if (parsedSlices.length > 0) {
      const customSeries = {
        id: `uploaded_${Date.now()}`,
        description: parsedSlices[0].seriesDescription || 'Estudio Subido',
        modality: parsedSlices[0].modality || 'CT',
        sliceCount: parsedSlices.length,
        dimensions: `${parsedSlices[0].width}×${parsedSlices[0].height}`,
        bitDepth: '16-bit Int',
        sizeMb: (fileList.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1),
        patientId: parsedSlices[0].patientId || 'P-CUSTOM',
        slices: parsedSlices
      };

      setSeriesData(customSeries);
      setSlices(parsedSlices);
      setCurrentSliceIndex(0);
      setWindowWidth(parsedSlices[0].windowWidth || 1500);
      setWindowCenter(parsedSlices[0].windowCenter || -600);
      setActivePreset('custom');
    }
  };

  const selectedSlice = slices[currentSliceIndex] || null;

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-200 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Header Pipeline Navbar */}
      <Header 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep}
        activeStudyName={seriesData ? seriesData.description : 'TORAX_CT_2025_03'}
        modality={seriesData ? seriesData.modality : 'CT'}
        isAnonActive={isAnonActive}
      />

      {/* Main Content Area + Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <Sidebar 
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onOpenDicomTags={() => setIsTagModalOpen(true)}
          throughput={currentStep === 4 ? 32 : 42}
          bufferPercent={68}
        />

        {/* Main Step Workspace */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentStep === 1 && (
            <Step1Import
              onLoadDemo={loadDemoDataset}
              onFileUpload={handleFileUpload}
              onClearDataset={clearPreviousDataset}
              seriesData={seriesData}
              slices={slices}
              currentSliceIndex={currentSliceIndex}
              setCurrentSliceIndex={setCurrentSliceIndex}
              selectedSlice={selectedSlice}
              onSelectSeries={() => {}}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2Windowing
              windowWidth={windowWidth}
              setWindowWidth={setWindowWidth}
              windowCenter={windowCenter}
              setWindowCenter={setWindowCenter}
              activePreset={activePreset}
              setActivePreset={setActivePreset}
              jpgQuality={jpgQuality}
              setJpgQuality={setJpgQuality}
              resolutionMode={resolutionMode}
              setResolutionMode={setResolutionMode}
              isAnonActive={isAnonActive}
              setIsAnonActive={setIsAnonActive}
              includeOverlay={includeOverlay}
              setIncludeOverlay={setIncludeOverlay}
              sliceCount={slices.length}
              onGoToQC={() => setCurrentStep(3)}
              onApplyAndContinue={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 3 && (
            <Step3QC
              slices={slices}
              currentSliceIndex={currentSliceIndex}
              setCurrentSliceIndex={setCurrentSliceIndex}
              windowWidth={windowWidth}
              windowCenter={windowCenter}
              jpgQuality={jpgQuality}
              includeOverlay={includeOverlay}
            />
          )}

          {currentStep === 4 && (
            <Step4Export
              slices={slices}
              windowWidth={windowWidth}
              windowCenter={windowCenter}
              jpgQuality={jpgQuality}
              isAnonActive={isAnonActive}
              includeOverlay={includeOverlay}
              setIncludeOverlay={setIncludeOverlay}
              onClearDataset={() => { clearPreviousDataset(); setCurrentStep(1); }}
              studyName={seriesData ? seriesData.description : 'TORAX_CT_2025_03'}
            />
          )}
        </main>

      </div>

      {/* DICOM Tag Modal */}
      <DicomTagModal 
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        selectedSlice={selectedSlice}
      />

    </div>
  );
}
