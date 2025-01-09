'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RichSqlEditor } from '@/components/RichSqlEditor'
import { JsonEditor } from '@/components/JsonEditor'

interface Servicio {
  id: number;
  nombre: string;
  endpoint: string;
  tipo_endpoint: string;
  consideraciones_seguridad: string;
  evento_ejecucion: string;
  descripcion: string;
  observaciones: string;
  codigo_encontrado: string;
  codigo_final: string;
  ejemplo_json_input: string;
  ejemplo_json_output: string;
  proyecto: { id: number; nombre: string };
  modulo: { id: number; nombre: string };
  oracle_form?: { id: number; nombre: string };
}

interface ParametroRow {
  id: string;
  parametro: string;
  tipo: string;
  mandatorio: string;
  descripcion: string;
  owner: string;
  objeto: string;
  columna: string;
}

interface ErrorRow {
  id: string;
  return_code: string;
  message: string;
  description: string;
}

export default function VisualizarServicioPage({ params }: { params: { idservicio: string } }) {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [parametrosInput, setParametrosInput] = useState<ParametroRow[]>([]);
  const [parametrosOutput, setParametrosOutput] = useState<ParametroRow[]>([]);
  const [arrayOutput, setArrayOutput] = useState<ParametroRow[]>([]);
  const [errores, setErrores] = useState<ErrorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3004/api/servicios/${params.idservicio}/completo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setServicio(data);
          setParametrosInput(data.parametros_input || []);
          setParametrosOutput(data.parametros_output || []);
          setArrayOutput(data.arrays_output || []);
          setErrores(data.error_handling || []);
        } else if (response.status === 431) {
          throw new Error('Error 431: Request Header Fields Too Large. Por favor, intente cerrar sesión y volver a iniciar sesión.');
        } else {
          throw new Error(`Error al cargar el servicio: ${response.status}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Error desconocido al cargar el servicio');
        }
        console.error(error);
      }
    };

    fetchServicio();
  }, [params.idservicio]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!servicio) {
    return <div>Cargando...</div>;
  }

  const TablaParametros = ({ datos, titulo }: { datos: ParametroRow[], titulo: string }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{titulo}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parámetro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Mandatorio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Objeto</TableHead>
              <TableHead>Columna</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.parametro}</TableCell>
                <TableCell>{row.tipo}</TableCell>
                <TableCell>{row.mandatorio}</TableCell>
                <TableCell>{row.descripcion}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>{row.objeto}</TableCell>
                <TableCell>{row.columna}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const TablaErrores = ({ datos }: { datos: ErrorRow[] }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Manejo de Errores</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código de Retorno</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.map((error) => (
              <TableRow key={error.id}>
                <TableCell>{error.return_code}</TableCell>
                <TableCell>{error.message}</TableCell>
                <TableCell>{error.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visualizar Servicio</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/generar-doc-tecnica/generador-excel')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
          <CardDescription>Detalles del servicio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Proyecto</Label>
              <Input value={servicio.proyecto.nombre} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Input value={servicio.modulo.nombre} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Oracle Form</Label>
              <Input value={servicio.oracle_form?.nombre || 'N/A'} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Servicio</Label>
            <Input value={servicio.nombre} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Endpoint</Label>
            <Input value={servicio.endpoint} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Endpoint</Label>
            <Input value={servicio.tipo_endpoint} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Consideraciones de Seguridad</Label>
            <Textarea value={servicio.consideraciones_seguridad} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Evento de Ejecución</Label>
            <Input value={servicio.evento_ejecucion} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={servicio.descripcion} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Observaciones Adicionales</Label>
            <Textarea value={servicio.observaciones} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Código Encontrado</Label>
            <RichSqlEditor
              value={servicio.codigo_encontrado}
              onChange={() => {}}
              placeholder=""
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label>Código Final</Label>
            <RichSqlEditor
              value={servicio.codigo_final}
              onChange={() => {}}
              placeholder=""
              readOnly
            />
          </div>

          <TablaParametros datos={parametrosInput} titulo="Parámetros Input" />
          <TablaParametros datos={parametrosOutput} titulo="Parámetros Output" />
          <TablaParametros datos={arrayOutput} titulo="Array Output" />
          <TablaErrores datos={errores} />

          <div className="space-y-2">
            <Label>Ejemplo JSON Input</Label>
            <JsonEditor
              value={servicio.ejemplo_json_input}
              onChange={() => {}}
              placeholder=""
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label>Ejemplo JSON Output</Label>
            <JsonEditor
              value={servicio.ejemplo_json_output}
              onChange={() => {}}
              placeholder=""
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

