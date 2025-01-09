import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Eye, FileSpreadsheet, Plus } from 'lucide-react'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from 'next/link'

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  endpoint: string;
}

const ServiciosGrid: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [servicioToDelete, setServicioToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchApi = useCallback(async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }, []);

  const deleteServicio = useCallback(async (id: number) => {
    try {
      await fetchApi(`http://localhost:3004/api/servicios/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      throw error;
    }
  }, [fetchApi]);

  const handleDelete = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await deleteServicio(id);
      setServicios(prevServicios => prevServicios.filter(servicio => servicio.id !== id));
      toast({
        title: "Servicio eliminado",
        description: "El servicio y todos sus datos relacionados se han eliminado correctamente.",
      });
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setServicioToDelete(null);
    }
  }, [deleteServicio, toast]);

  const handleGenerateExcel = useCallback(async () => {
    setIsGeneratingExcel(true);
    try {
      // Aquí iría la lógica para generar el Excel
      // Por ahora, simularemos una demora y mostraremos un mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Excel generado",
        description: "El archivo Excel se ha generado correctamente.",
      });
    } catch (error) {
      console.error('Error al generar el Excel:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el archivo Excel. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingExcel(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchServicios = async () => {
      setIsLoading(true);
      try {
        const data = await fetchApi('http://localhost:3004/api/servicios');
        setServicios(data);
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
    };
    fetchServicios();
  }, [fetchApi, toast]);

  const columns: ColumnDef<Servicio>[] = React.useMemo(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
      },
      {
        accessorKey: 'endpoint',
        header: 'Endpoint',
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setServicioToDelete(row.original.id)}
              disabled={isLoading}
              aria-label={`Eliminar servicio ${row.original.nombre}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link href={`/servicios/editar/${row.original.id}`} passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar servicio ${row.original.nombre}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/servicios/ver/${row.original.id}`} passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Ver detalles del servicio ${row.original.nombre}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [isLoading]
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <div className="flex space-x-4">
          <Link href="/servicios/nuevo" passHref>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Servicio</span>
            </Button>
          </Link>
          <Button 
            onClick={handleGenerateExcel} 
            disabled={isGeneratingExcel}
            className="flex items-center space-x-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{isGeneratingExcel ? 'Generando Excel...' : 'Generar Excel'}</span>
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={servicios} />
      {isLoading && <div className="text-center mt-4">Cargando...</div>}
      <AlertDialog open={servicioToDelete !== null} onOpenChange={() => setServicioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de que desea eliminar este servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el servicio y todos sus datos relacionados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => servicioToDelete && handleDelete(servicioToDelete)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiciosGrid;

