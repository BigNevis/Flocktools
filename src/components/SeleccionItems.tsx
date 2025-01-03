'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';

interface SeleccionItemsProps {
  file: File;
  onPrevious: () => void;
  onArchivosGenerados: (archivos: Archivo[]) => void;
}

interface Archivo {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: string;
  contenido: string;
  objeto: any;
}

// Encabezados para ambas versiones del template
const encabezadosV1 = [
  "Fila",
  "Nombre de servicio",
  "EndPoint",
  "Tipo",
  "Pantalla",
  "Nombre",
  "Consideraciones de seguridad",
  "Momento de ejecución",
  "Descripción",
  "Observaciones adicionales",
  "Codigo encontrado o sugerido",
  "Input.Parámetro",
  "Input.Tipo",
  "Input.Mandatorio",
  "Input.Descripción",
  "Input.Ejemplos",
  "Input.Owner",
  "Input.Tabla",
  "Input.Columna",
  "Output.Parámetro",
  "Output.Tipo",
  "Output.Mandatorio",
  "Output.Descripción",
  "Output.Ejemplos",
  "Output.Owner",
  "Output.Tabla",
  "Output.Columna",
  "Array.Nombre",
  "Array.Tipo",
  "Array.Mandatorio",
  "Array.Descripción",
  "Array.Ejemplo",
  "Array.Owner",
  "Array.Tabla",
  "Array.Columna",
  "Error/Recovery Handling.Return/Error Code",
  "Error/Recovery Handling.Message",
  "Error/Recovery Handling.Description",
  "json.Input",
  "json.Output",
];

const encabezadosV2 = [
  "Pantalla",
  "Nombre",
  "Consideraciones de seguridad de la pantalla",
  "Evento de ejecución",
  "Descripción",
  "Observaciones adicionales",
  "Nombre de servicio sugerido",
  "EndPoint sugerido",
  "Tipo endpoint",
  "Codigo encontrado",
  "Código adicional o sugerido",
  "Parámetros Input / Referencia en BD Oracle",
  "Parámetros Output / Referencia en BD Oracle",
  "Array Output / Referencia en BD Oracle",
  "Error/Recovery Handling",
  "Ejemplo Json Input",
  "Ejemplo Json Output"
];

export default function SeleccionItems({ file, onPrevious, onArchivosGenerados }: SeleccionItemsProps) {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          setSheetNames(workbook.SheetNames);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const detectarVersion = (headers: any[]): 'v1' | 'v2' => {
    if (!headers || headers.length === 0) return 'v1';

    // Verificar si los encabezados coinciden más con V1 o V2
    const headersStr = headers.join('').toLowerCase();
    const v1Match = encabezadosV1.filter(h =>
      headersStr.includes(h.toLowerCase())
    ).length;
    const v2Match = encabezadosV2.filter(h =>
      headersStr.includes(h.toLowerCase())
    ).length;

    return v2Match > v1Match ? 'v2' : 'v1';
  };

  const generarTablaParametrosV1 = (headers: string[], valores: string[][]): string => {
    if (valores.length === 0) {
      return "| Sin datos |\n|-----------|";
    }

    let tabla = `| ${headers.join(' | ')} |\n`;
    tabla += `| ${headers.map(() => '---').join(' | ')} |\n`;

    valores.forEach((fila) => {
      tabla += `| ${fila.map(v => v || 'Sin contenido').join(' | ')} |\n`;
    });

    return tabla;
  };

  const generarTablaParametrosV2 = (contenido: string): string => {
    if (!contenido || contenido === 'N/A') {
      return "| Sin datos |\n|-----------|";
    }

    // Detectar el formato de la tabla de parámetros
    const lineas = contenido.split('\n').filter(line => line.trim() !== '');
    if (lineas.length < 2) return "| Sin datos |\n|-----------|";

    // Buscar la línea de separación que indica el formato
    const lineaSeparacion = lineas.findIndex(line => line.includes('----'));
    if (lineaSeparacion === -1) return contenido;

    // Obtener los encabezados
    const headers = lineas[0]
      .split(/\s+/)
      .filter(h => h.trim() !== '')
      .map(h => h.trim());

    // Crear la tabla Markdown
    let tabla = `| ${headers.join(' | ')} |\n`;
    tabla += `| ${headers.map(() => '---').join(' | ')} |\n`;

    // Procesar las filas de datos (después de la línea de separación)
    for (let i = lineaSeparacion + 1; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (linea === '') continue;

      // Dividir la línea en columnas manteniendo el formato
      const valores = linea.split(/\s{2,}/).map(v => v.trim() || 'N/A');
      tabla += `| ${valores.join(' | ')} |\n`;
    }

    return tabla;
  };

  const formatearCodigo = (codigo: string): string => {
    if (!codigo || codigo === 'N/A') return 'Sin código disponible';
    return codigo.trim();
  };

  const procesarFilaV1 = (row: any[], index: number, sheetName: string): Archivo => {
    let contenidoMd = "";

    // Agregar información general
    encabezadosV1.slice(0, 10).forEach((header, colIndex) => {
      const value = row[colIndex] || 'Sin contenido';
      contenidoMd += `### ${header}\n\n${value}\n\n`;
    });

    // Código encontrado o sugerido
    const sqlCode = row[10] || 'Sin contenido';
    contenidoMd += `### Codigo encontrado o sugerido\n\n\`\`\`sql\n${sqlCode}\n\`\`\`\n\n`;

    // Generar tablas para Input, Output, y Array
    ["Input", "Output", "Array"].forEach((section) => {
      const sectionHeaders = encabezadosV1.filter(h => h.startsWith(section));
      const valoresGrupo = sectionHeaders.map((header) => {
        const colIndex = encabezadosV1.indexOf(header);
        const cellValue = row[colIndex];
        return typeof cellValue === "string"
          ? cellValue.split('\r\n')
          : ['Sin contenido'];
      });

      const filas = [];
      for (let i = 0; i < valoresGrupo[0]?.length || 0; i++) {
        const fila = valoresGrupo.map(v => v[i] || 'Sin contenido');
        filas.push(fila);
      }

      contenidoMd += `### ${section}\n\n`;
      contenidoMd += generarTablaParametrosV1(
        sectionHeaders.map(h => h.split(".")[1]),
        filas
      );
      contenidoMd += "\n\n";
    });

    // JSON Input y Output
    ["json.Input", "json.Output"].forEach((jsonKey) => {
      const jsonData = row[encabezadosV1.indexOf(jsonKey)] || "{}";
      contenidoMd += `### ${jsonKey}\n\n\`\`\`json\n${jsonData}\n\`\`\`\n\n`;
    });

    const nombreServicio = row[1] || 'SinNombreServicio';
    const endPoint = row[2] || 'SinEndPoint';
    const fila = `Fila${index + 3}`;
    const paquete = sheetName;

    return {
      id: `${paquete}-${fila}-${nombreServicio}-${endPoint}-${index}`,
      nombre: `${paquete}-${fila}-${nombreServicio}-${endPoint}-${index}.md`,
      tipo: 'Markdown',
      tamaño: `${(contenidoMd.length / 1024).toFixed(2)} KB`,
      contenido: contenidoMd,
      objeto: contenidoMd,
    };
  };

  const procesarFilaV2 = (row: any[], index: number, sheetName: string): Archivo | null => {
    if (!row[0]) return null; // Saltar filas vacías

    let contenidoMd = "";

    // Información general
    contenidoMd += `# ${row[1] || 'Sin nombre'}\n\n`;
    contenidoMd += `## Información General\n\n`;
    contenidoMd += `- **Pantalla**: ${row[0] || 'N/A'}\n`;
    contenidoMd += `- **Consideraciones de Seguridad**: ${row[2] || 'N/A'}\n`;
    contenidoMd += `- **Evento de Ejecución**: ${row[3] || 'N/A'}\n\n`;

    // Descripción y observaciones
    contenidoMd += `## Descripción\n\n${row[4] || 'Sin descripción'}\n\n`;
    if (row[5]) {
      contenidoMd += `## Observaciones Adicionales\n\n${row[5]}\n\n`;
    }

    // Información del servicio
    contenidoMd += `## Información del Servicio\n\n`;
    contenidoMd += `- **Nombre del Servicio**: ${row[6] || 'N/A'}\n`;
    contenidoMd += `- **EndPoint**: ${row[7] || 'N/A'}\n`;
    contenidoMd += `- **Tipo**: ${row[8] || 'N/A'}\n\n`;

    // Código
    if (row[9] || row[10]) {
      contenidoMd += `## Código\n\n`;
      if (row[9]) {
        contenidoMd += `### Código Encontrado\n\n\`\`\`sql\n${formatearCodigo(row[9])}\n\`\`\`\n\n`;
      }
      if (row[10]) {
        contenidoMd += `### Código Adicional o Sugerido\n\n\`\`\`sql\n${formatearCodigo(row[10])}\n\`\`\`\n\n`;
      }
    }

    // Parámetros
    contenidoMd += `## Parámetros Input\n\n${generarTablaParametrosV2(row[11] || '')}\n\n`;
    contenidoMd += `## Parámetros Output\n\n${generarTablaParametrosV2(row[12] || '')}\n\n`;
    if (row[13] && row[13] !== 'N/A') {
      contenidoMd += `## Array Output\n\n${generarTablaParametrosV2(row[13])}\n\n`;
    }

    // Error Handling
    if (row[14] && row[14] !== 'N/A') {
      contenidoMd += `## Error/Recovery Handling\n\n${generarTablaParametrosV2(row[14])}\n\n`;
    }

    // JSON Examples
    if (row[15] || row[16]) {
      contenidoMd += `## Ejemplos JSON\n\n`;
      if (row[15] && row[15] !== 'N/A') {
        contenidoMd += `### Request\n\n\`\`\`json\n${row[15]}\n\`\`\`\n\n`;
      }
      if (row[16] && row[16] !== 'N/A') {
        contenidoMd += `### Response\n\n\`\`\`json\n${row[16]}\n\`\`\`\n\n`;
      }
    }

    const nombreServicio = row[6] || 'SinNombreServicio';
    const endPoint = row[7] || 'SinEndPoint';
    const pantalla = row[0] || 'SinPantalla';

    return {
      id: `${pantalla}-${nombreServicio}-${endPoint}-${index}`,
      nombre: `${pantalla}-${nombreServicio}-${endPoint}-${index}.md`,
      tipo: 'Markdown',
      tamaño: `${(contenidoMd.length / 1024).toFixed(2)} KB`,
      contenido: contenidoMd,
      objeto: contenidoMd,
    };
  };

  const handleGenerateMarkdown = () => {
    if (!file || selectedSheets.length === 0) {
      alert('Por favor selecciona al menos una hoja');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const archivos: Archivo[] = [];

        selectedSheets.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Detectar la versión del template basado en los encabezados
          const version = detectarVersion(rows[0]);

          // Omitir la primera fila (encabezados)
          const dataRows = rows.slice(1);

          dataRows.forEach((row, index) => {
            if (!row || row.length === 0) return; // Saltar filas vacías

            const archivo = version === 'v1'
              ? procesarFilaV1(row, index, sheetName)
              : procesarFilaV2(row, index, sheetName);

            if (archivo !== null) {
              archivos.push(archivo);
            }
          });
        });

        onArchivosGenerados(archivos);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSheetToggle = (sheetName: string) => {
    setSelectedSheets((prev) =>
      prev.includes(sheetName) ? prev.filter((name) => name !== sheetName) : [...prev, sheetName]
    );
  };

  return (
    <div className="fedpa-container flex items-center justify-center">
      <Card className="fedpa-card w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="fedpa-title text-center">
            Seleccionar Hojas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border border-border p-4">
            <div className="space-y-4">
              {sheetNames.map((sheetName, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={sheetName}
                    checked={selectedSheets.includes(sheetName)}
                    onCheckedChange={() => handleSheetToggle(sheetName)}
                    className="border-muted data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <label htmlFor={sheetName} className="fedpa-text cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 inline-block mr-2" />
                    {sheetName}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between mt-6">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="fedpa-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={handleGenerateMarkdown}
            className="fedpa-button"
            disabled={selectedSheets.length === 0}
          >
            Generar Archivos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

