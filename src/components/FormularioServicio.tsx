'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, PlusCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { RichSqlEditor } from '@/components/RichSqlEditor'
import { JsonEditor } from '@/components/JsonEditor'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Proyecto {
  id: number;
  nombre: string;
}

interface Modulo {
  id: number;
  nombre: string;
  proyecto_id: number;
}

interface OracleForm {
  id: number;
  nombre: string;
  modulo_id: number;
  descripcion: string;
}

interface ParametroRow {
  id?: string | number;
  parametro: string;
  tipo: string;
  mandatorio: string;
  descripcion: string;
  owner: string;
  objeto: string;
  columna: string;
}

interface ErrorRow {
  id?: string;
  return_code: string;
  message: string;
  description: string;
}

interface FormularioServicioProps {
  modo: 'crear' | 'editar';
  servicioId?: number;
  onCancel: () => void;
  onSave: (servicio: any) => void;
}

const tiposEndpoint = [
  "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT"
];

export default function FormularioServicio({ modo, servicioId, onCancel, onSave }: FormularioServicioProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null)
  const [openProyecto, setOpenProyecto] = useState(false)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null)
  const [openModulo, setOpenModulo] = useState(false)
  const [oracleForms, setOracleForms] = useState<OracleForm[]>([])
  const [formSeleccionado, setFormSeleccionado] = useState<OracleForm | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [nombreServicio, setNombreServicio] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [tipoEndpoint, setTipoEndpoint] = useState('')
  const [consideracionesSeguridad, setConsideracionesSeguridad] = useState('')
  const [eventoEjecucion, setEventoEjecucion] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [codigoEncontrado, setCodigoEncontrado] = useState('')
  const [codigoFinal, setCodigoFinal] = useState('')
  const [parametrosInput, setParametrosInput] = useState<ParametroRow[]>([])
  const [parametrosOutput, setParametrosOutput] = useState<ParametroRow[]>([])
  const [arrayOutput, setArrayOutput] = useState<ParametroRow[]>([])
  const [errores, setErrores] = useState<ErrorRow[]>([])
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingOracleForm, setIsCreatingOracleForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [newOracleFormName, setNewOracleFormName] = useState('');
  const [newOracleFormDescription, setNewOracleFormDescription] = useState('');

  const getToken = useCallback(() => localStorage.getItem('token'), []);

  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    return response.json();
  }, [getToken]);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const data = await fetchApi('http://localhost:3004/api/proyectos');
        setProyectos(data);
      } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los proyectos. Por favor, intente nuevamente.",
          variant: "destructive",
        });
      }
    };

    fetchProyectos();
  }, [fetchApi, toast]);

  const fetchModulos = useCallback(async (proyectoId: number) => {
    try {
      const data = await fetchApi(`http://localhost:3004/api/modulos/proyecto/${proyectoId}`);
      setModulos(data);
    } catch (error) {
      console.error('Error al cargar los módulos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los módulos. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  }, [fetchApi, toast]);

  const fetchOracleForms = useCallback(async (moduloId: number) => {
    try {
      const data = await fetchApi(`http://localhost:3004/api/oracle-forms/modulo/${moduloId}`);
      setOracleForms(data);
    } catch (error) {
      console.error('Error al cargar los Oracle Forms:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los Oracle Forms. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  }, [fetchApi, toast]);

  useEffect(() => {
    if (proyectoSeleccionado) {
      fetchModulos(proyectoSeleccionado.id);
    }
  }, [proyectoSeleccionado, fetchModulos]);

  useEffect(() => {
    if (moduloSeleccionado) {
      fetchOracleForms(moduloSeleccionado.id);
    }
  }, [moduloSeleccionado, fetchOracleForms]);

  useEffect(() => {
    if (modo === 'editar' && servicioId) {
      const fetchServicio = async () => {
        try {
          const data = await fetchApi(`http://localhost:3004/api/servicios/${servicioId}/completo`);
          setNombreServicio(data.nombre);
          setEndpoint(data.endpoint);
          setTipoEndpoint(data.tipo_endpoint);
          setConsideracionesSeguridad(data.consideraciones_seguridad);
          setEventoEjecucion(data.evento_ejecucion);
          setDescripcion(data.descripcion);
          setObservaciones(data.observaciones);
          setCodigoEncontrado(data.codigo_encontrado);
          setCodigoFinal(data.codigo_final);
          setJsonInput(data.ejemplo_json_input);
          setJsonOutput(data.ejemplo_json_output);
          setParametrosInput(data.parametros_input || []);
          setParametrosOutput(data.parametros_output || []);
          setArrayOutput(data.arrays_output || []);
          setErrores(data.error_handling || []);

          if (data.proyecto_id) {
            const proyecto = await fetchApi(`http://localhost:3004/api/proyectos/${data.proyecto_id}`);
            setProyectoSeleccionado(proyecto);
            await fetchModulos(data.proyecto_id);
          }
          if (data.modulo && data.modulo.id) {
            const modulo = await fetchApi(`http://localhost:3004/api/modulos/${data.modulo.id}`);
            setModuloSeleccionado(modulo);
          }
          if (data.oracle_form && data.oracle_form.id) {
            const oracleForm = await fetchApi(`http://localhost:3004/api/oracle-forms/${data.oracle_form.id}`);
            setFormSeleccionado(oracleForm);
          }
        } catch (error) {
          console.error('Error al cargar el servicio:', error);
          toast({
            title: "Error",
            description: "No se pudo cargar el servicio. Por favor, intente nuevamente.",
            variant: "destructive",
          });
        }
      };

      fetchServicio();
    }
  }, [modo, servicioId, fetchApi, toast, fetchModulos]);

  const isFormValid = useMemo(() => {
    const requiredFieldsFilled = 
      nombreServicio.trim() !== '' &&
      endpoint.trim() !== '' &&
      tipoEndpoint !== '' &&
      proyectoSeleccionado !== null &&
      moduloSeleccionado !== null;

    const hasParameters = parametrosInput.length > 0 || parametrosOutput.length > 0;

    const allParametersValid = [...parametrosInput, ...parametrosOutput, ...arrayOutput].every(
      param => param.parametro.trim() !== '' && param.tipo.trim() !== ''
    );

    const allErrorsValid = errores.every(
      error => error.return_code.trim() !== '' && error.message.trim() !== ''
    );

    return requiredFieldsFilled && hasParameters && allParametersValid && allErrorsValid;
  }, [
    nombreServicio, 
    endpoint, 
    tipoEndpoint, 
    proyectoSeleccionado, 
    moduloSeleccionado, 
    parametrosInput, 
    parametrosOutput, 
    arrayOutput,
    errores
  ]);

  useEffect(() => {
    console.log("Estado de validación del formulario:", isFormValid);
  }, [isFormValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validación básica
    if (!nombreServicio.trim() || !endpoint.trim() || !tipoEndpoint || !proyectoSeleccionado || !moduloSeleccionado) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, complete al menos el nombre del servicio, endpoint, tipo de endpoint, proyecto y módulo.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const servicioData = {
        nombre: nombreServicio,
        endpoint,
        tipo_endpoint: tipoEndpoint,
        consideraciones_seguridad: consideracionesSeguridad,
        evento_ejecucion: eventoEjecucion,
        descripcion,
        observaciones,
        codigo_encontrado: codigoEncontrado,
        codigo_final: codigoFinal,
        ejemplo_json_input: jsonInput,
        ejemplo_json_output: jsonOutput,
        proyecto_id: proyectoSeleccionado.id,
        modulo_id: moduloSeleccionado.id,
        oracle_form_id: formSeleccionado ? formSeleccionado.id : null,
        parametros_input: parametrosInput,
        parametros_output: parametrosOutput,
        arrays_output: arrayOutput,
        error_handling: errores
      };

      const url = modo === 'crear' 
        ? 'http://localhost:3004/api/servicios'
        : `http://localhost:3004/api/servicios/${servicioId}`;
      const method = modo === 'crear' ? 'POST' : 'PUT';

      const savedServicio = await fetchApi(url, {
        method,
        body: JSON.stringify(servicioData),
      });

      await Promise.all([
        guardarParametros(savedServicio.id, parametrosInput, 'input'),
        guardarParametros(savedServicio.id, parametrosOutput, 'output'),
        guardarArraysOutput(savedServicio.id, arrayOutput),
        guardarErrores(savedServicio.id, errores)
      ]);

      onSave(savedServicio);
      toast({
        title: `Servicio ${modo === 'crear' ? 'creado' : 'actualizado'}`,
        description: `El servicio se ha ${modo === 'crear' ? 'creado' : 'actualizado'} exitosamente.`,
      });

      if (modo === 'crear') {
        resetForm();
      }
    } catch (error) {
      console.error('Error durante el envío:', error);
      setError(`Error al ${modo === 'crear' ? 'crear' : 'actualizar'} el servicio. Por favor, intente nuevamente.`);
      toast({
        title: "Error",
        description: `No se pudo ${modo === 'crear' ? 'crear' : 'actualizar'} el servicio. Por favor, intente nuevamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNombreServicio('');
    setEndpoint('');
    setTipoEndpoint('');
    setConsideracionesSeguridad('');
    setEventoEjecucion('');
    setDescripcion('');
    setObservaciones('');
    setCodigoEncontrado('');
    setCodigoFinal('');
    setJsonInput('');
    setJsonOutput('');
    setParametrosInput([]);
    setParametrosOutput([]);
    setArrayOutput([]);
    setErrores([]);
  };

  const guardarParametros = async (servicioId: number, parametros: ParametroRow[], tipo: 'input' | 'output') => {
    const token = getToken();
    const endpoint = tipo === 'input' ? 'parametros-input' : 'parametros-output';

    for (const parametro of parametros) {
      const parametroData = {
        servicio_id: servicioId,
        parametro: parametro.parametro,
        tipo: parametro.tipo,
        mandatorio: parametro.mandatorio,
        descripcion: parametro.descripcion,
        owner: parametro.owner,
        objeto: parametro.objeto,
        columna: parametro.columna
      };

      try {
        if (parametro.id) {
          await fetchApi(`http://localhost:3004/api/${endpoint}/${parametro.id}`, {
            method: 'PUT',
            body: JSON.stringify(parametroData)
          });
        } else {
          await fetchApi(`http://localhost:3004/api/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(parametroData)
          });
        }
      } catch (error) {
        console.error(`Error al guardar parámetro ${tipo}:`, error);
        toast({
          title: "Error",
          description: `No se pudo guardar el parámetro ${tipo}. Por favor, intente nuevamente.`,
          variant: "destructive",
        });
      }
    }
  };

  const guardarArraysOutput = async (servicioId: number, arrays: ParametroRow[]) => {
    const token = getToken();

    for (const array of arrays) {
      const arrayData = {
        servicio_id: servicioId,
        parametro: array.parametro,
        tipo: array.tipo,
        mandatorio: array.mandatorio,
        descripcion: array.descripcion,
        owner: array.owner,
        objeto: array.objeto,
        columna: array.columna
      };

      try {
        if (array.id) {
          await fetchApi(`http://localhost:3004/api/arrays-output/${array.id}`, {
            method: 'PUT',
            body: JSON.stringify(arrayData)
          });
        } else {
          await fetchApi('http://localhost:3004/api/arrays-output', {
            method: 'POST',
            body: JSON.stringify(arrayData)
          });
        }
      } catch (error) {
        console.error('Error al guardar array output:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el array output. Por favor, intente nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  const guardarErrores = async (servicioId: number, errores: ErrorRow[]) => {
    const token = getToken();

    for (const error of errores) {
      const errorData = {
        servicio_id: servicioId,
        return_code: error.return_code,
        message: error.message,
        description: error.description
      };

      try {
        if (error.id) {
          await fetchApi(`http://localhost:3004/api/error-handling/${error.id}`, {
            method: 'PUT',
            body: JSON.stringify(errorData)
          });
        } else {
          await fetchApi('http://localhost:3004/api/error-handling', {
            method: 'POST',
            body: JSON.stringify(errorData)
          });
        }
      } catch (error) {
        console.error('Error al guardar error handling:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el manejo de errores. Por favor, intente nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  const agregarParametro = (tipo: 'input' | 'output' | 'array') => {
    const nuevoParametro: ParametroRow = {
      parametro: '',
      tipo: '',
      mandatorio: 'NO',
      descripcion: '',
      owner: '',
      objeto: '',
      columna: ''
    };

    switch (tipo) {
      case 'input':
        setParametrosInput(prev => [...prev, { ...nuevoParametro, id: `new-${Date.now()}` }]);
        break;
      case 'output':
        setParametrosOutput(prev => [...prev, { ...nuevoParametro, id: `new-${Date.now()}` }]);
        break;
      case 'array':
        setArrayOutput(prev => [...prev, { ...nuevoParametro, id: `new-${Date.now()}` }]);
        break;
    }
  };

  const actualizarParametro = (
    id: string | number,
    campo: keyof ParametroRow,
    valor: string,
    tipo: 'input' | 'output' | 'array'
  ) => {
    const actualizarArray = (array: ParametroRow[]) =>
      array.map(p => (p.id === id ? { ...p, [campo]: valor } : p));

    switch (tipo) {
      case 'input':
        setParametrosInput(prev => actualizarArray(prev));
        break;
      case 'output':
        setParametrosOutput(prev => actualizarArray(prev));
        break;
      case 'array':
        setArrayOutput(prev => actualizarArray(prev));
        break;
    }
  };

  const eliminarParametro = async (id: string | number, tipo: 'input' | 'output' | 'array') => {
    let endpoint = '';
    switch (tipo) {
      case 'input':
        endpoint = 'parametros-input';
        setParametrosInput(prev => prev.filter(p => p.id !== id));
        break;
      case 'output':
        endpoint = 'parametros-output';
        setParametrosOutput(prev => prev.filter(p => p.id !== id));
        break;
      case 'array':
        endpoint = 'arrays-output';
        setArrayOutput(prev => prev.filter(p => p.id !== id));
        break;
    }

    if (typeof id === 'string' && id.startsWith('new')) {
      return;
    }

    try {
      await fetchApi(`http://localhost:3004/api/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      toast({
        title: "Parámetro eliminado",
        description: "El parámetro se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error('Error al eliminar el parámetro:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el parámetro. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const agregarError = () => {
    const nuevoError: ErrorRow = {
      return_code: '',
      message: '',
      description: ''
    };
    setErrores(prev => [...prev, { ...nuevoError, id: `new-${Date.now()}` }]);
  };

  const actualizarError = (id: string, campo: keyof ErrorRow, valor: string) => {
    setErrores(prev => prev.map(e => (e.id === id ? { ...e, [campo]: valor } : e)));
  };

  const eliminarError = async (id: string) => {
    if (id.startsWith('new')) {
      setErrores(prev => prev.filter(e => e.id !== id));
      return;
    }

    try {
      await fetchApi(`http://localhost:3004/api/error-handling/${id}`, {
        method: 'DELETE',
      });

      setErrores(prev => prev.filter(e => e.id !== id));

      toast({
        title: "Manejo de error eliminado",
        description: "El manejo de error se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error('Error al eliminar el manejo de error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el manejo de error. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const TablaParametros = ({
    datos,
    tipo,
    onActualizar,
    onEliminar
  }: {
    datos: ParametroRow[],
    tipo: 'input' | 'output' | 'array',
    onActualizar: (id: string | number, campo: keyof ParametroRow, valor: string, tipo: 'input' | 'output' | 'array') => void,
    onEliminar: (id: string | number, tipo: 'input' | 'output' | 'array') => void
  }) => (
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
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Input
                  value={row.parametro}
                  onChange={(e) => onActualizar(row.id!, 'parametro', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.tipo}
                  onChange={(e) => onActualizar(row.id!, 'tipo', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.mandatorio}
                  onValueChange={(value) => onActualizar(row.id!, 'mandatorio', value, tipo)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SI">SI</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={row.descripcion}
                  onChange={(e) => onActualizar(row.id!, 'descripcion', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.owner}
                  onChange={(e) => onActualizar(row.id!, 'owner', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.objeto}
                  onChange={(e) => onActualizar(row.id!, 'objeto', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.columna}
                  onChange={(e) => onActualizar(row.id!, 'columna', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEliminar(row.id!, tipo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const TablaErrores = ({
    datos,
    onActualizar,
    onEliminar
  }: {
    datos: ErrorRow[],
    onActualizar: (id: string, campo: keyof ErrorRow, valor: string) => void,
    onEliminar: (id: string) => void
  }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código de Retorno</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.map((error) => (
            <TableRow key={error.id}>
              <TableCell>
                <Input
                  value={error.return_code}
                  onChange={(e) => onActualizar(error.id!, 'return_code', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={error.message}
                  onChange={(e) => onActualizar(error.id!, 'message', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={error.description}
                  onChange={(e) => onActualizar(error.id!, 'description', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEliminar(error.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const createNewProject = async () => {
    try {
      const newProject = await fetchApi('http://localhost:3004/api/proyectos', {
        method: 'POST',
        body: JSON.stringify({ nombre: newProjectName })
      });
      setProyectos(prev => [...prev, newProject]);
      setProyectoSeleccionado(newProject);
      await fetchModulos(newProject.id);
      setIsCreatingProject(false);
      setNewProjectName('');
      toast({
        title: "Proyecto creado",
        description: "El nuevo proyecto se ha creado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const createNewModule = async () => {
    if (!proyectoSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un proyecto primero.",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = getToken();
      const response = await fetchApi('http://localhost:3004/api/modulos', {
        method: 'POST',
        body: JSON.stringify({ nombre: newModuleName, proyecto_id: proyectoSeleccionado.id })
      });
      const newModule = await response.json();
      setModulos([...modulos, newModule]);
      setModuloSeleccionado(newModule);
      setIsCreatingModule(false);
      setNewModuleName('');
      toast({
        title: "Módulo creado",
        description: "El nuevo módulo se ha creado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo crear el módulo. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const createNewOracleForm = async () => {
    if (!moduloSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un módulo primero.",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = getToken();
      const response = await fetchApi('http://localhost:3004/api/oracle-forms', {
        method: 'POST',
        body: JSON.stringify({
          nombre: newOracleFormName,
          descripcion: newOracleFormDescription,
          modulo_id: moduloSeleccionado.id
        })
      });
      const newOracleForm = await response.json();
      setOracleForms([...oracleForms, newOracleForm]);
      setFormSeleccionado(newOracleForm);
      setIsCreatingOracleForm(false);
      setNewOracleFormName('');
      setNewOracleFormDescription('');
      toast({
        title: "Oracle Form creado",
        description: "El nuevo Oracle Form se ha creado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo crear el Oracle Form. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 max-h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proyecto-select">Proyecto</Label>
            <div className="flex items-center space-x-2">
              <Popover open={openProyecto} onOpenChange={setOpenProyecto}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openProyecto} className="w-full justify-start">
                    {proyectoSeleccionado ? proyectoSeleccionado.nombre : "Selecciona un proyecto"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar proyecto..." />
                    <CommandEmpty>No se encontraron proyectos.</CommandEmpty>
                    <CommandGroup>
                      {proyectos.map((proyecto) => (
                        <CommandItem
                          key={proyecto.id}
                          onSelect={() => {
                            setProyectoSeleccionado(proyecto);
                            setOpenProyecto(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              proyectoSeleccionado?.id === proyecto.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {proyecto.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsCreatingProject(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modulo-select">Módulo</Label>
            <div className="flex items-center space-x-2">
              <Popover open={openModulo} onOpenChange={setOpenModulo}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openModulo} className="w-full justify-start">
                    {moduloSeleccionado ? moduloSeleccionado.nombre : "Selecciona un módulo"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar módulo..." />
                    <CommandEmpty>No se encontraron módulos.</CommandEmpty>
                    <CommandGroup>
                      {modulos.map((modulo) => (
                        <CommandItem
                          key={modulo.id}
                          onSelect={() => {
                            setModuloSeleccionado(modulo);
                            setOpenModulo(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              moduloSeleccionado?.id === modulo.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {modulo.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsCreatingModule(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-select">Oracle Form</Label>
            <div className="flex items-center space-x-2">
              <Popover open={openForm} onOpenChange={setOpenForm}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openForm} className="w-full justify-start">
                    {formSeleccionado ? formSeleccionado.nombre : "Selecciona un Oracle Form"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar Oracle Form..." />
                    <CommandEmpty>No se encontraron Oracle Forms.</CommandEmpty>
                    <CommandGroup>
                      {oracleForms.map((form) => (
                        <CommandItem
                          key={form.id}
                          onSelect={() => {
                            setFormSeleccionado(form);
                            setOpenForm(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formSeleccionado?.id === form.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {form.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsCreatingOracleForm(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nombre del Servicio</Label>
          <Input value={nombreServicio} onChange={(e) => setNombreServicio(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Endpoint</Label>
          <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Endpoint</Label>
          <Select value={tipoEndpoint} onValueChange={setTipoEndpoint}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposEndpoint.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Consideraciones de Seguridad</Label>
          <Textarea
            value={consideracionesSeguridad}
            onChange={(e) => setConsideracionesSeguridad(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Evento de Ejecución</Label>
          <Input value={eventoEjecucion} onChange={(e) => setEventoEjecucion(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Observaciones Adicionales</Label>
          <Textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Código Encontrado</Label>
          <RichSqlEditor
            value={codigoEncontrado}
            onChange={setCodigoEncontrado}
            placeholder="Ingrese el código SQL encontrado"
          />
        </div>

        <div className="space-y-2">
          <Label>Código Final</Label>
          <RichSqlEditor
            value={codigoFinal}
            onChange={setCodigoFinal}
            placeholder="Ingrese el código SQL final"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Parámetros Input</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => agregarParametro('input')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Parámetro
            </Button>
          </div>
          <TablaParametros
            datos={parametrosInput}
            tipo="input"
            onActualizar={actualizarParametro}
            onEliminar={eliminarParametro}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Parámetros Output</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => agregarParametro('output')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Parámetro
            </Button>
          </div>
          <TablaParametros
            datos={parametrosOutput}
            tipo="output"
            onActualizar={actualizarParametro}
            onEliminar={eliminarParametro}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Array Output</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => agregarParametro('array')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Parámetro
            </Button>
          </div>
          <TablaParametros
            datos={arrayOutput}
            tipo="array"
            onActualizar={actualizarParametro}
            onEliminar={eliminarParametro}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Manejo de Errores</Label>
            <Button type="button" variant="outline" size="sm" onClick={agregarError}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Error
            </Button>
          </div>
          <TablaErrores
            datos={errores}
            onActualizar={actualizarError}
            onEliminar={eliminarError}
          />
        </div>

        <div className="space-y-2">
          <Label>Ejemplo JSON Input</Label>
          <JsonEditor
            value={jsonInput}
            onChange={setJsonInput}
            placeholder="Ingrese el ejemplo de JSON Input"
          />
        </div>

        <div className="space-y-2">
          <Label>Ejemplo JSON Output</Label>
          <JsonEditor
            value={jsonOutput}
            onChange={setJsonOutput}
            placeholder="Ingrese el ejemplo de JSON Output"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>

      <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={createNewProject}>Crear Proyecto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingModule} onOpenChange={setIsCreatingModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Módulo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={createNewModule}>Crear Módulo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingOracleForm} onOpenChange={setIsCreatingOracleForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Oracle Form</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newOracleFormName}
                onChange={(e) => setNewOracleFormName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={newOracleFormDescription}
                onChange={(e) => setNewOracleFormDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={createNewOracleForm}>Crear Oracle Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

