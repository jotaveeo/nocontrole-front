import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  MoreHorizontal, 
  Search, 
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  hideOnMobile?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  searchable?: boolean;
  searchKeys?: string[];
  filterable?: boolean;
  exportable?: boolean;
  actions?: (row: any) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
}

export function ResponsiveTable({
  data,
  columns,
  searchable = false,
  searchKeys = [],
  filterable = false,
  exportable = false,
  actions,
  emptyMessage = "Nenhum item encontrado",
  loading = false,
  onRowClick,
  className = ""
}: ResponsiveTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  // Filtrar dados baseado na pesquisa
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    const keysToSearch = searchKeys.length > 0 ? searchKeys : columns.map(col => col.key);
    return keysToSearch.some(key => {
      const value = item[key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Ordenar dados
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const exportToCSV = () => {
    const headers = columns.filter(col => !hiddenColumns.includes(col.key)).map(col => col.label);
    const rows = sortedData.map(row => 
      columns
        .filter(col => !hiddenColumns.includes(col.key))
        .map(col => row[col.key] || '')
    );
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const visibleColumns = columns.filter(col => !hiddenColumns.includes(col.key));

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header com controles */}
      {(searchable || filterable || exportable) && (
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {searchable && (
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {filterable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Colunas
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {columns.map(column => (
                      <DropdownMenuItem
                        key={column.key}
                        onSelect={() => toggleColumnVisibility(column.key)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{column.label}</span>
                          {hiddenColumns.includes(column.key) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {exportable && (
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`
                    ${column.width || ''} 
                    ${column.hideOnMobile ? 'hidden md:table-cell' : ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && (
                <TableHead className="w-[50px]">
                  <span className="sr-only">Ações</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (actions ? 1 : 0)} 
                  className="text-center py-8"
                >
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  Carregando...
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (actions ? 1 : 0)} 
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow 
                  key={index}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={column.key}
                      className={column.hideOnMobile ? 'hidden md:table-cell' : ''}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Footer com informações */}
      {sortedData.length > 0 && (
        <div className="p-4 border-t bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {sortedData.length} de {data.length} registros
              {searchTerm && ` (filtrado por "${searchTerm}")`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
