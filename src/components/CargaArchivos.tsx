'use client';

import { useState, ChangeEvent } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, File, ArrowRight, Home } from 'lucide-react';

interface CargaArchivosProps {
  onVolverInicio: () => void;
  onSiguiente: (file: File) => void;
}

export default function CargaArchivos({ onVolverInicio, onSiguiente }: CargaArchivosProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSiguiente(file);
    }
  };

  return (
    <div className="fedpa-container flex items-center justify-center">
      <Card className="fedpa-card w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="fedpa-title text-center">
            Carga de Archivos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="file" className="fedpa-subtitle">Selecciona un archivo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file')?.click()}
                    className="fedpa-button w-full"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Seleccionar archivo
                  </Button>
                </div>
              </div>
              {file && (
                <div className="flex items-center space-x-2 p-4 bg-secondary rounded-md">
                  <File className="w-5 h-5 text-secondary-foreground" />
                  <span className="text-sm font-medium text-secondary-foreground">{file.name}</span>
                </div>
              )}
            </div>
          </form>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onVolverInicio}
              className="fedpa-button"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
            <Button
              onClick={handleSubmit}
              className="fedpa-button"
              disabled={!file}
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

