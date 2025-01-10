export interface ImportedParameter {
    parametro: string;
    tipo: string;
    mandatorio: string;
    descripcion: string;
    owner: string;
    objeto: string;
    columna: string;
  }
  
  export function parseImportedText(text: string): ImportedParameter[] {
    const lines = text.split('\n');
    const parameters: ImportedParameter[] = [];
  
    for (let line of lines) {
      line = line.trim();
      if (line === '') continue;
  
      // Usamos una expresión regular para dividir la línea correctamente
      const match = line.match(/^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);
      
      if (match) {
        const [, tipo, mandatorio, owner, objeto, columna] = match;
  
        parameters.push({
          parametro: '',  // Siempre vacío
          tipo: tipo.trim(),
          mandatorio: mandatorio.toUpperCase() === 'S' ? 'SI' : 'NO',
          descripcion: '',  // Siempre vacío
          owner: owner.trim(),
          objeto: objeto.trim(),
          columna: columna.trim()
        });
      }
    }
  
    return parameters;
  }
  
  