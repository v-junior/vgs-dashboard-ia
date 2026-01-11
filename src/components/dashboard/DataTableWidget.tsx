import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, getDataFromWidget } from '@/lib/formatters';
import type { TableWidget, TableDataRow, YAxisConfig } from '@/types/dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataTableWidgetProps {
  widget: TableWidget;
}

export function DataTableWidget({ widget }: DataTableWidgetProps) {
  const { title, config } = widget;
  
  const rawData = useMemo(() => {
    return getDataFromWidget(widget.data) as TableDataRow[];
  }, [widget.data]);

  const headers = useMemo(() => {
    if (!config?.yAxis) return [];
    return Object.entries(config.yAxis).map(([field, cfg]) => ({
      field,
      label: cfg.label,
      format: cfg.format,
      suffix: cfg.suffix,
    }));
  }, [config?.yAxis]);

  const tableRows = useMemo(() => {
    return rawData.map((row, rowIndex) => {
      const cells: Record<string, string | number | null> = {};
      
      if (row.columns) {
        row.columns.forEach((col) => {
          cells[col.field] = col.value;
        });
      }
      
      return { id: rowIndex, cells };
    });
  }, [rawData]);

  const formatCellValue = (
    value: string | number | null, 
    format?: string, 
    suffix?: string
  ): string => {
    if (value === null || value === undefined) return '-';
    
    const formatted = formatNumber(value, format);
    return suffix ? `${formatted}${suffix}` : formatted;
  };

  if (headers.length === 0 || tableRows.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header.field} className="whitespace-nowrap">
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.id}>
                    {headers.map((header) => (
                      <TableCell key={`${row.id}-${header.field}`} className="whitespace-nowrap">
                        {formatCellValue(
                          row.cells[header.field],
                          header.format,
                          header.suffix
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
