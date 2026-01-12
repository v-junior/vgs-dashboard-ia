import { useMemo, useState } from 'react';
import { Bot, Loader2, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { extractWidgetData } from '@/lib/utils';

interface DashboardHeaderProps {
  data: unknown[] | null;
  onAnalysisComplete: (analysis: string) => void;
  // NOVOS PROPS PARA O FILTRO
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
}

const WEBHOOK_URL = 'https://webhook.digital-ai.tech/webhook/analise';

export function DashboardHeader({ data, onAnalysisComplete, dateRange, setDateRange }: DashboardHeaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const csvPayload = useMemo(() => {
    if (!data || !Array.isArray(data)) return '';

    const lines: string[] = [];

    data.forEach((widget, idx) => {
      const kind = (widget as any)?.kind || 'widget';
      const title = (widget as any)?.title || `Widget ${idx + 1}`;

      lines.push(`"${title}" (${kind})`);

      if (kind === 'big_number') {
        const value = (widget as any)?.big_number ?? '';
        const suffix = (widget as any)?.suffix ?? '';
        lines.push('label,value');
        lines.push(`"${title}","${value}${suffix ? ` ${suffix}` : ''}"`);
        lines.push('');
        return;
      }

      const rows = extractWidgetData((widget as any)?.data) || [];
      if (!Array.isArray(rows) || rows.length === 0) {
        lines.push('');
        return;
      }

      const columns = Array.from(
        rows.reduce((set: Set<string>, row: any) => {
          Object.keys(row || {}).forEach((key) => set.add(key));
          return set;
        }, new Set<string>())
      );

      lines.push(columns.join(','));
      rows.forEach((row: any) => {
        const values = columns.map((col) => {
          const raw = row?.[col];
          if (raw === null || raw === undefined) return '';
          const str = String(raw).replace(/"/g, '""');
          return `"${str}"`;
        });
        lines.push(values.join(','));
      });
      lines.push('');
    });

    return lines.join('\n');
  }, [data]);

  const handleAnalyze = async () => {
    if (!data) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: JSON.stringify(data), metadata: { widgetCount: Array.isArray(data) ? data.length : 0 } }),
      });
      if (!response.ok) throw new Error('Erro na API');
      const result = await response.json();
      
      let analysisText = '';
      if (typeof result === 'string') analysisText = result;
      else if (result.analise) analysisText = result.analise;
      else if (result.output) analysisText = result.output;
      else if (result.message) analysisText = result.message;
      else analysisText = JSON.stringify(result);

      onAnalysisComplete(analysisText);
      toast({ title: 'Análise concluída!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro na análise', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPdf = () => {
    setTimeout(() => window.print(), 100);
  };

  const handleExportCsv = () => {
    if (!csvPayload) return;
    const blob = new Blob([csvPayload], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exportação CSV gerada' });
  };

  return (
    <div className="flex flex-col gap-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Dashboard de Métricas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Análise completa de métricas do seu aplicativo
          </p>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!data} className="gap-2">
                <Download className="h-4 w-4" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPdf} disabled={!data}>Exportar PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCsv} disabled={!data}>Exportar CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !data} className="gap-2">
            {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analisando...</> : <><Bot className="h-4 w-4" /> Analisar com IA</>}
          </Button>
        </div>
      </div>

      {/* ÁREA DE FILTROS */}
      {data && (
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filtros:
          </div>
          <div className="flex gap-2 items-center">
            <Input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-auto bg-background"
            />
            <span className="text-muted-foreground">-</span>
            <Input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-auto bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
