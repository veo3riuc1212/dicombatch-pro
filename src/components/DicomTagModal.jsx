import React, { useState } from 'react';
import { X, Search, FileCode, Tag } from 'lucide-react';

export default function DicomTagModal({ isOpen, onClose, selectedSlice }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const slice = selectedSlice || {
    patientName: 'ANON-8849-09TX',
    patientId: 'P-98234 [ANON]',
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
    width: 512,
    height: 512,
    windowWidth: 1500,
    windowCenter: -600,
    slope: 1,
    intercept: 0
  };

  const tags = [
    { tag: '(0008,0005)', vr: 'CS', name: 'Specific Character Set', value: 'ISO_IR 100' },
    { tag: '(0008,0008)', vr: 'CS', name: 'ImageType', value: 'ORIGINAL\\PRIMARY\\AXIAL' },
    { tag: '(0008,0016)', vr: 'UI', name: 'SOPClassUID', value: '1.2.840.10008.5.1.4.1.1.2 (CT Image Storage)' },
    { tag: '(0008,0018)', vr: 'UI', name: 'SOPInstanceUID', value: '1.3.12.2.1107.5.1.4.60144.300000210.9842' },
    { tag: '(0008,0060)', vr: 'CS', name: 'Modality', value: slice.modality },
    { tag: '(0008,0070)', vr: 'LO', name: 'Manufacturer', value: slice.manufacturer },
    { tag: '(0008,1030)', vr: 'LO', name: 'StudyDescription', value: slice.studyDescription },
    { tag: '(0008,103E)', vr: 'LO', name: 'SeriesDescription', value: slice.seriesDescription },
    { tag: '(0010,0010)', vr: 'PN', name: 'PatientName', value: slice.patientName },
    { tag: '(0010,0020)', vr: 'LO', name: 'PatientID', value: slice.patientId },
    { tag: '(0018,0050)', vr: 'DS', name: 'SliceThickness', value: `${slice.sliceThickness}` },
    { tag: '(0018,0060)', vr: 'DS', name: 'KVP', value: `${slice.kvp}` },
    { tag: '(0018,1151)', vr: 'IS', name: 'XRayTubeCurrent', value: `${slice.ma}` },
    { tag: '(0020,0032)', vr: 'DS', name: 'ImagePositionPatient', value: `-175.0\\-175.0\\${slice.zPos || '-142.50'}` },
    { tag: '(0020,0037)', vr: 'DS', name: 'ImageOrientationPatient', value: '1.000000\\0.000000\\0.000000\\0.000000\\1.000000\\0.000000' },
    { tag: '(0028,0010)', vr: 'US', name: 'Rows', value: `${slice.height}` },
    { tag: '(0028,0011)', vr: 'US', name: 'Columns', value: `${slice.width}` },
    { tag: '(0028,0100)', vr: 'US', name: 'BitsAllocated', value: '16' },
    { tag: '(0028,0101)', vr: 'US', name: 'BitsStored', value: '12' },
    { tag: '(0028,1050)', vr: 'DS', name: 'WindowCenter', value: `${slice.windowCenter}` },
    { tag: '(0028,1051)', vr: 'DS', name: 'WindowWidth', value: `${slice.windowWidth}` },
    { tag: '(0028,1052)', vr: 'DS', name: 'RescaleIntercept', value: `${slice.intercept}` },
    { tag: '(0028,1053)', vr: 'DS', name: 'RescaleSlope', value: `${slice.slope}` },
  ];

  const filteredTags = tags.filter(t => 
    t.tag.includes(searchQuery) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Inspección de Etiquetas DICOM (Data Elements)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Tag (e.g. 0028,1050), Nombre de elemento o Valor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1 p-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase sticky top-0">
              <tr>
                <th className="p-2.5">TAG</th>
                <th className="p-2.5">VR</th>
                <th className="p-2.5">NOMBRE DEL ATRIBUTO</th>
                <th className="p-2.5">VALOR EXTRAÍDO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTags.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-2.5 text-cyan-400 font-bold">{t.tag}</td>
                  <td className="p-2.5 text-slate-400">{t.vr}</td>
                  <td className="p-2.5 text-slate-200 font-sans font-semibold">{t.name}</td>
                  <td className="p-2.5 text-slate-300 font-mono text-[11px] break-all">{t.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{filteredTags.length} Elementos mostrados</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-medium">
            Cerrar Inspección
          </button>
        </div>

      </div>
    </div>
  );
}
