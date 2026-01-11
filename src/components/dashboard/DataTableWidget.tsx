import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractWidgetData } from "@/lib/utils";

interface TableWidgetProps {
  widget: any;
}

export function TableWidget({ widget }: TableWidgetProps) {
  // 1. Pegar os dados brutos corrigidos
  const rows = extractWidgetData(widget.data);
  
  // 2. Definir as colunas baseadas na configuração do JSON (yAxis)
  const columnsConfig = widget.config?.yAxis || [];

  // Função auxiliar para encontrar o valor dentro do array 'columns' de cada linha
  const getCellContent = (row: any, fieldKey: string) => {
    if (!row.columns) return "-";
    // Procura o objeto onde 'field' é igual à coluna que queremos
    const columnData = row.columns.find((c: any) => c.field === fieldKey);
    
    if (!columnData || columnData.value === null) return "-";
    
    // Formata se for número
    if (typeof columnData.value === 'number') {
       return columnData.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }
    return columnData.value;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{widget.config?.title?.text || widget.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnsConfig.map((col: any, index: number) => (
                    <TableHead key={index}>{col.label || col.field}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any, rowIndex: number) => (
                  <TableRow key={rowIndex}>
                    {columnsConfig.map((col: any, colIndex: number) => (
                      <TableCell key={colIndex}>
                        {getCellContent(row, col.field)}
                        {/* Adiciona % se o config pedir */}
                        {col.suffix ? col.suffix : ''} 
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">Sem dados disponíveis</div>
        )}
      </CardContent>
    </Card>
  );
}
