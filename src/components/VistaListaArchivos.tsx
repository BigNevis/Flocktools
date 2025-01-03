'use client';

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Eye, Code, ChevronLeft, ChevronRight, FileSpreadsheet, Archive, X } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Archivo {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: string;
  contenido: string;
  objeto?: any;
}

interface VistaListaArchivosProps {
  archivos: Archivo[];
  onVolverSeleccion: () => void;
}

export default function VistaListaArchivos({ archivos, onVolverSeleccion }: VistaListaArchivosProps) {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<Archivo | null>(null);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<any | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalAbierta, setModalAbierta] = useState(false);
  const registrosPorPagina = 7;

  const totalPaginas = Math.ceil(archivos.length / registrosPorPagina);
  const inicioIndice = (paginaActual - 1) * registrosPorPagina;
  const archivosPaginados = archivos.slice(inicioIndice, inicioIndice + registrosPorPagina);

  const manejarDescarga = (archivo: Archivo) => {
    const blob = new Blob([archivo.contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = archivo.nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const manejarDescargaZip = async () => {
    const zip = new JSZip();
    archivos.forEach(archivo => {
      zip.file(archivo.nombre, archivo.contenido);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "archivos_generados.zip");
  };

  const manejarVista = (archivo: Archivo) => {
    setArchivoSeleccionado(archivo);
    setObjetoSeleccionado(null);
    setModalAbierta(true);
  };

  const manejarVerObjeto = (objeto: any) => {
    setObjetoSeleccionado(objeto);
    setArchivoSeleccionado(null);
    setModalAbierta(true);
  };

  const manejarCerrarVista = () => {
    setArchivoSeleccionado(null);
    setObjetoSeleccionado(null);
    setModalAbierta(false);
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const formatearTamaño = (tamaño: string) => {
    const match = tamaño.match(/^([\d.]+)\s*(\w+)$/);
    if (match) {
      const [, numero, unidad] = match;
      return `${parseFloat(numero).toFixed(2)} ${unidad}`;
    }
    return tamaño;
  };

  return (
    <div className="fedpa-container flex flex-col items-center justify-start">
      <Card className="fedpa-card w-full max-w-4xl mb-4">
        <CardHeader>
          <CardTitle className="fedpa-title text-center">
            Archivos Generados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <ScrollArea className="h-[400px] overflow-x-auto">
              <div className="w-[700px] min-w-full">
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-primary font-bold w-[40%]">Nombre del Archivo</TableHead>
                      <TableHead className="text-primary font-bold w-[20%]">Tipo</TableHead>
                      <TableHead className="text-primary font-bold w-[20%]">Tamaño</TableHead>
                      <TableHead className="text-primary font-bold sticky right-0 bg-muted w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivosPaginados.map((archivo) => (
                      <TableRow key={archivo.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-primary truncate max-w-[40%]">{archivo.nombre}</TableCell>
                        <TableCell className="text-primary truncate max-w-[20%]">{archivo.tipo}</TableCell>
                        <TableCell className="text-primary truncate max-w-[20%]">{formatearTamaño(archivo.tamaño)}</TableCell>
                        <TableCell className="sticky right-0 bg-background w-[120px]">
                          <div className="flex justify-end space-x-1">
                            <Button onClick={() => manejarDescarga(archivo)} size="sm" variant="ghost" className="text-primary hover:bg-muted p-1">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => manejarVista(archivo)} size="sm" variant="ghost" className="text-primary hover:bg-muted p-1">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => manejarVerObjeto(archivo.objeto)} size="sm" variant="ghost" className="text-primary hover:bg-muted p-1">
                              <Code className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center mt-4 flex-wrap gap-2">
          <Button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            variant="outline"
            className="fedpa-button"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            variant="outline"
            className="fedpa-button"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={onVolverSeleccion}
            variant="outline"
            className="fedpa-button"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Volver a Selección
          </Button>
          <Button
            onClick={manejarDescargaZip}
            variant="outline"
            className="fedpa-button"
          >
            <Archive className="w-4 h-4 mr-2" />
            Descargar ZIP
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={modalAbierta} onOpenChange={setModalAbierta}>
        <DialogContent className="max-w-full w-full h-full max-h-screen flex flex-col">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-lg font-semibold">
              {archivoSeleccionado ? `Vista Previa: ${archivoSeleccionado.nombre}` : 'Vista del Objeto'}
            </DialogTitle>
            <Button onClick={manejarCerrarVista} variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-6 w-6" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </DialogHeader>
          <ScrollArea className="flex-grow">
            <div className="p-6">
              {archivoSeleccionado ? (
                <ReactMarkdown
                  className="text-primary prose prose-invert max-w-none"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-lg font-medium mt-3 mb-2" {...props} />,
                    h5: ({ node, ...props }) => <h5 className="text-base font-medium mt-3 mb-2" {...props} />,
                    h6: ({ node, ...props }) => <h6 className="text-sm font-medium mt-3 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-muted my-4" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
                    th: ({ node, ...props }) => <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" {...props} />,
                    td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />,
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, '')}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        />
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {archivoSeleccionado.contenido}
                </ReactMarkdown>
              ) : (
                <pre className="text-primary whitespace-pre-wrap">
                  {JSON.stringify(objetoSeleccionado, null, 2)}
                </pre>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

