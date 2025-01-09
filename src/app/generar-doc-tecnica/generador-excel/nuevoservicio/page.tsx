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
import { debounce } from 'lodash'
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
  returnCode: string;
  message: string;
  description: string;
}

const tiposEndpoint = [
  "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT"
];

export default function NuevoServicioPage() {
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


  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3004/api/proyectos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProyectos(data);
        } else {
          throw new Error('Error al cargar los proyectos');
        }
      } catch (error) {
        setError('Error al cargar los proyectos');
        console.error(error);
      }
    };

    fetchProyectos();
  }, []);

  const fetchModulos = useCallback(async (proyectoId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/api/modulos/proyecto/${proyectoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setModulos(data);
      } else {
        throw new Error('Error al cargar los módulos');
      }
    } catch (error) {
      setError('Error al cargar los módulos');
      console.error(error);
    }
  }, []);

  const fetchOracleForms = useCallback(async (moduloId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/api/oracle-forms/modulo/${moduloId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOracleForms(data);
      } else {
        throw new Error('Error al cargar los Oracle Forms');
      }
    } catch (error) {
      setError('Error al cargar los Oracle Forms');
      console.error(error);
    }
  }, []);

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !proyectoSeleccionado || !moduloSeleccionado) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Crear el servicio
      const servicioResponse = await fetch('http://localhost:3004/api/servicios', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        })
      });

      if (!servicioResponse.ok) {
        throw new Error(`Error al crear el servicio: ${servicioResponse.status}`);
      }

      const servicioCreado = await servicioResponse.json();
      
      // Guardar parámetros de entrada
      await guardarParametros(servicioCreado.id, parametrosInput, 'input');
      
      // Guardar parámetros de salida
      await guardarParametros(servicioCreado.id, parametrosOutput, 'output');

      // Guardar arrays de salida
      await guardarArraysOutput(servicioCreado.id, arrayOutput);

      // Guardar manejo de errores
      await guardarErrores(servicioCreado.id, errores);

      toast({
        title: "Servicio creado",
        description: "El servicio y todos sus datos relacionados se han creado exitosamente.",
      });
      router.push('/generar-doc-tecnica/generador-excel');
    } catch (error) {
      console.error('Error durante el envío:', error);
      setError('Error al crear el servicio. Por favor, intente nuevamente.');
      toast({
        title: "Error",
        description: "No se pudo crear el servicio. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    nombreServicio, endpoint, tipoEndpoint, consideracionesSeguridad, eventoEjecucion,
    descripcion, observaciones, codigoEncontrado, codigoFinal, jsonInput, jsonOutput,
    proyectoSeleccionado, moduloSeleccionado, formSeleccionado, parametrosInput,
    parametrosOutput, arrayOutput, errores, router, toast
  ]);

  const guardarParametros = async (servicioId: number, parametros: ParametroRow[], tipo: 'input' | 'output') => {
    const token = localStorage.getItem('token');
    const endpoint = tipo === 'input' ? 'parametros-input' : 'parametros-output';
    
    const parametrosFormateados = parametros.map(p => ({
      servicio_id: servicioId,
      parametro: p.parametro,
      tipo: p.tipo,
      mandatorio: p.mandatorio,
      descripcion: p.descripcion,
      owner: p.owner,
      objeto: p.objeto,
      columna: p.columna
    }));

    const response = await fetch(`http://localhost:3004/api/${endpoint}/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parametrosFormateados)
    });

    if (!response.ok) {
      throw new Error(`Error al guardar los parámetros de ${tipo}: ${response.status}`);
    }
  };

  const guardarArraysOutput = async (servicioId: number, arrays: ParametroRow[]) => {
    const token = localStorage.getItem('token');
    
    const arraysFormateados = arrays.map(a => ({
      servicio_id: servicioId,
      parametro: a.parametro,
      tipo: a.tipo,
      mandatorio: a.mandatorio,
      descripcion: a.descripcion,
      owner: a.owner,
      objeto: a.objeto,
      columna: a.columna
    }));

    const response = await fetch('http://localhost:3004/api/arrays-output/bulk', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arraysFormateados)
    });

    if (!response.ok) {
      throw new Error(`Error al guardar los arrays de salida: ${response.status}`);
    }
  };

  const guardarErrores = async (servicioId: number, errores: ErrorRow[]) => {
    const token = localStorage.getItem('token');
    
    const erroresFormateados = errores.map(e => ({
      servicio_id: servicioId,
      return_code: e.returnCode,
      message: e.message,
      description: e.description
    }));

    const response = await fetch('http://localhost:3004/api/error-handling/bulk', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(erroresFormateados)
    });

    if (!response.ok) {
      throw new Error(`Error al guardar los datos de manejo de errores: ${response.status}`);
    }
  };

  const debouncedHandleSubmit = debounce(handleSubmit, 300, { leading: true, trailing: false });

  const agregarParametro = useCallback((tipo: 'input' | 'output' | 'array') => {
    const nuevoParametro: ParametroRow = {
      id: Date.now().toString(),
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
        setParametrosInput(prev => [...prev, nuevoParametro]);
        break;
      case 'output':
        setParametrosOutput(prev => [...prev, nuevoParametro]);
        break;
      case 'array':
        setArrayOutput(prev => [...prev, nuevoParametro]);
        break;
    }
  }, []);

  const actualizarParametro = useCallback((
    id: string,
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
  }, []);

  const eliminarParametro = useCallback((id: string, tipo: 'input' | 'output' | 'array') => {
    switch (tipo) {
      case 'input':
        setParametrosInput(prev => prev.filter(p => p.id !== id));
        break;
      case 'output':
        setParametrosOutput(prev => prev.filter(p => p.id !== id));
        break;
      case 'array':
        setArrayOutput(prev => prev.filter(p => p.id !== id));
        break;
    }
  }, []);

  const agregarError = useCallback(() => {
    const nuevoError: ErrorRow = {
      id: Date.now().toString(),
      returnCode: '',
      message: '',
      description: ''
    };
    setErrores(prev => [...prev, nuevoError]);
  }, []);

  const actualizarError = useCallback((id: string, campo: keyof ErrorRow, valor: string) => {
    setErrores(prev => prev.map(e => (e.id === id ? { ...e, [campo]: valor } : e)));
  }, []);

  const eliminarError = useCallback((id: string) => {
    setErrores(prev => prev.filter(e => e.id !== id));
  }, []);

  const TablaParametros = useCallback(({ 
    datos, 
    tipo, 
    onActualizar, 
    onEliminar 
  }: { 
    datos: ParametroRow[], 
    tipo: 'input' | 'output' | 'array',
    onActualizar: (id: string, campo: keyof ParametroRow, valor: string, tipo: 'input' | 'output' | 'array') => void,
    onEliminar: (id: string, tipo: 'input' | 'output' | 'array') => void
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
                  onChange={(e) => onActualizar(row.id, 'parametro', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.tipo}
                  onChange={(e) => onActualizar(row.id, 'tipo', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.mandatorio}
                  onValueChange={(value) => onActualizar(row.id, 'mandatorio', value, tipo)}
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
                  onChange={(e) => onActualizar(row.id, 'descripcion', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.owner}
                  onChange={(e) => onActualizar(row.id, 'owner', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.objeto}
                  onChange={(e) => onActualizar(row.id, 'objeto', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.columna}
                  onChange={(e) => onActualizar(row.id, 'columna', e.target.value, tipo)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEliminar(row.id, tipo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ), []);

  const TablaErrores = useCallback(({ 
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
                  value={error.returnCode}
                  onChange={(e) => onActualizar(error.id, 'returnCode', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={error.message}
                  onChange={(e) => onActualizar(error.id, 'message', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={error.description}
                  onChange={(e) => onActualizar(error.id, 'description', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEliminar(error.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ), []);

  const createNewProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/proyectos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: newProjectName })
      });
      if (response.ok) {
        const newProject = await response.json();
        setProyectos([...proyectos, newProject]);
        setProyectoSeleccionado(newProject);
        setIsCreatingProject(false);
        setNewProjectName('');
        toast({
          title: "Proyecto creado",
          description: "El nuevo proyecto se ha creado exitosamente.",
        });
      } else {
        throw new Error('Error al crear el proyecto');
      }
    } catch (error) {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/modulos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: newModuleName, proyecto_id: proyectoSeleccionado.id })
      });
      if (response.ok) {
        const newModule = await response.json();
        setModulos([...modulos, newModule]);
        setModuloSeleccionado(newModule);
        setIsCreatingModule(false);
        setNewModuleName('');
        toast({
          title: "Módulo creado",
          description: "El nuevo módulo se ha creado exitosamente.",
        });
      } else {
        throw new Error('Error al crear el módulo');
      }
    } catch (error) {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/oracle-forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: newOracleFormName,
          descripcion: newOracleFormDescription,
          modulo_id: moduloSeleccionado.id
        })
      });
      if (response.ok) {
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
      } else {
        throw new Error('Error al crear el Oracle Form');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el Oracle Form. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Nuevo Servicio</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/generar-doc-tecnica/generador-excel')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
          <CardDescription>Complete la información para crear un nuevo servicio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={debouncedHandleSubmit} className="space-y-6">
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
              <Button type="button" variant="outline" onClick={() => router.push('/generar-doc-tecnica/generador-excel')}>Cancelar</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !proyectoSeleccionado || !moduloSeleccionado}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Diálogo para crear nuevo proyecto */}
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

      {/* Diálogo para crear nuevo módulo */}
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

      {/* Diálogo para crear nuevo Oracle Form */}
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

