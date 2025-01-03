'use client';

import { useState } from 'react';
import CargaArchivos from '@/components/CargaArchivos';
import SeleccionItems from '@/components/SeleccionItems';
import VistaListaArchivos from '@/components/VistaListaArchivos';

export default function ExcelAMarkdownPage() {
  const [step, setStep] = useState<'carga' | 'seleccion' | 'vista'>('carga');
  const [file, setFile] = useState<File | null>(null);
  const [archivosGenerados, setArchivosGenerados] = useState<any[]>([]);

  const handleFileUpload = (file: File) => {
    setFile(file);
    setStep('seleccion');
  };

  const handleVolverInicio = () => {
    setStep('carga');
    setFile(null);
  };

  const handleArchivosGenerados = (archivos: any[]) => {
    setArchivosGenerados(archivos);
    setStep('vista');
  };

  const handleVolverSeleccion = () => {
    setStep('seleccion');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {step === 'carga' && (
        <CargaArchivos onVolverInicio={handleVolverInicio} onSiguiente={handleFileUpload} />
      )}
      {step === 'seleccion' && file && (
        <SeleccionItems file={file} onPrevious={handleVolverInicio} onArchivosGenerados={handleArchivosGenerados} />
      )}
      {step === 'vista' && (
        <VistaListaArchivos archivos={archivosGenerados} onVolverSeleccion={handleVolverSeleccion} />
      )}
    </div>
  );
}

