'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Eye, Trash2, PlusCircle, FileSpreadsheet } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import VisualizarServicioModal from '@/components/VisualizarServicioModal'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import FormularioServicio from '@/components/FormularioServicio'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Servicio {
  id: number;
  nombre: string;
  endpoint: string;
  proyecto_id: number;
  modulo: {
    id: number;
    nombre: string;
  };
  oracle_form?: {
    id: number;
    nombre: string;
  };
  proyectoNombre?: string;
}

export default function GeneradorExcelPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [proyectos, setProyectos] = useState<{ id: number; nombre: string }[]>([]);
  const [modulos, setModulos] = useState<{ id: number; nombre: string }[]>([]);
  const [oracleForms, setOracleForms] = useState<{ id: number; nombre: string }[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<string>('all');
  const [selectedModulo, setSelectedModulo] = useState<string>('all');
  const [selectedOracleForm, setSelectedOracleForm] = useState<string>('all');

  const fetchProyectoNombre = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/api/proyectos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener el proyecto');
      const proyecto = await response.json();
      return proyecto.nombre;
    } catch (error) {
      console.error('Error fetching proyecto:', error);
      return 'Error';
    }
  }, []);

  const fetchServicios = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/servicios/completo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los servicios');
      }
      const data = await response.json();
      
      // Obtener los nombres de los proyectos
      const serviciosConProyectos = await Promise.all(data.map(async (servicio: Servicio) => {
        if (servicio.proyecto_id) {
          const proyectoNombre = await fetchProyectoNombre(servicio.proyecto_id);
          return { ...servicio, proyectoNombre };
        }
        return servicio;
      }));

      setServicios(serviciosConProyectos);
    } catch (error) {
      console.error("Error fetching servicios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchProyectoNombre]);

  const fetchProyectos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/proyectos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener los proyectos');
      const data = await response.json();
      setProyectos(data);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
    }
  }, []);

  const fetchModulos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/modulos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener los módulos');
      const data = await response.json();
      setModulos(data);
    } catch (error) {
      console.error('Error fetching modulos:', error);
    }
  }, []);

  const fetchOracleForms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3004/api/oracle-forms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener los Oracle Forms');
      const data = await response.json();
      setOracleForms(data);
    } catch (error) {
      console.error('Error fetching Oracle Forms:', error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = servicios;
    if (selectedProyecto && selectedProyecto !== 'all') {
      filtered = filtered.filter(servicio => servicio.proyecto_id.toString() === selectedProyecto);
    }
    if (selectedModulo && selectedModulo !== 'all') {
      filtered = filtered.filter(servicio => servicio.modulo.id.toString() === selectedModulo);
    }
    if (selectedOracleForm && selectedOracleForm !== 'all') {
      filtered = filtered.filter(servicio => servicio.oracle_form?.id.toString() === selectedOracleForm);
    }
    setFilteredServicios(filtered);
  }, [servicios, selectedProyecto, selectedModulo, selectedOracleForm]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchServicios(), fetchProyectos(), fetchModulos(), fetchOracleForms()]);
      } catch (error) {
        setError('Error de conexión al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchServicios, fetchProyectos, fetchModulos, fetchOracleForms]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleBorrar = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/api/servicios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchServicios();
        toast({
          title: "Servicio eliminado",
          description: "El servicio se ha eliminado correctamente.",
        });
      } else {
        throw new Error('Error al borrar el servicio');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  }, [fetchServicios, toast]);

  const handleVisualizar = (id: number) => {
    setSelectedServiceId(id);
    setIsModalOpen(true);
  };

  const handleEditar = (id: number) => {
    setEditingServiceId(id);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (servicio: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/api/servicios/${editingServiceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(servicio)
      });

      if (response.ok) {
        // Actualizar el estado local con el servicio editado
        setServicios(prevServicios =>
          prevServicios.map(s => s.id === servicio.id ? servicio : s)
        );

        setIsEditModalOpen(false);
        fetchServicios(); //Llamada a fetchServicios para actualizar la lista
        toast({
          title: "Servicio actualizado",
          description: "El servicio se ha actualizado correctamente.",
        });
      } else {
        throw new Error('Error al actualizar el servicio');
      }
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleNuevoServicio = () => {
    router.push('/generar-doc-tecnica/generador-excel/nuevoservicio');
  };

  const handleExportToExcel = async () => {
    setIsExportingExcel(true);
    try {
      const token = localStorage.getItem('token');
      const serviciosIds = filteredServicios.map(servicio => servicio.id);
      const response = await fetch('http://localhost:3004/api/export/export-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviciosIds,
          proyectoId: selectedProyecto !== 'all' ? selectedProyecto : null,
          moduloId: selectedModulo !== 'all' ? selectedModulo : null,
          oracleFormId: selectedOracleForm !== 'all' ? selectedOracleForm : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al exportar a Excel');
      }

      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'servicios.zip';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Excel exportado",
        description: "Los archivos Excel se han generado y descargado correctamente.",
      });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar a Excel. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isLoading) {
    return <div>Cargando servicios...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Servicios</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handleNuevoServicio}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </Button>
              <Button onClick={handleExportToExcel} disabled={isExportingExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {isExportingExcel ? 'Exportando...' : 'Exportar a Excel'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Select value={selectedProyecto} onValueChange={setSelectedProyecto}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Proyectos</SelectItem>
                {proyectos.map((proyecto) => (
                  <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                    {proyecto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedModulo} onValueChange={setSelectedModulo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Módulos</SelectItem>
                {modulos.map((modulo) => (
                  <SelectItem key={modulo.id} value={modulo.id.toString()}>
                    {modulo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedOracleForm} onValueChange={setSelectedOracleForm}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Oracle Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Oracle Forms</SelectItem>
                {oracleForms.map((form) => (
                  <SelectItem key={form.id} value={form.id.toString()}>
                    {form.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Proyecto</TableHead>
      <TableHead>Módulo</TableHead>
      <TableHead>Oracle Form</TableHead>
      <TableHead>Servicio</TableHead>
      <TableHead>Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredServicios.map((servicio) => (
      <TableRow key={servicio.id}>
        <TableCell>{servicio.proyectoNombre || 'N/A'}</TableCell>
        <TableCell>{servicio.modulo?.nombre || 'N/A'}</TableCell>
        <TableCell>{servicio.oracle_form?.nombre || 'N/A'}</TableCell>
        <TableCell>{`${servicio.nombre || 'Sin nombre'} - ${servicio.endpoint || 'Sin endpoint'}`}</TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleBorrar(servicio.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleVisualizar(servicio.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleEditar(servicio.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-full w-full h-full max-h-screen">
          <DialogTitle className="sr-only">Detalles del Servicio</DialogTitle>
          {selectedServiceId && (
            <VisualizarServicioModal
              servicioId={selectedServiceId}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-full w-full h-full max-h-screen">
          <DialogTitle className="sr-only">Editar Servicio</DialogTitle>
          {editingServiceId && (
            <FormularioServicio
              modo="editar"
              servicioId={editingServiceId}
              onCancel={() => setIsEditModalOpen(false)}
              onSave={handleSaveEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

