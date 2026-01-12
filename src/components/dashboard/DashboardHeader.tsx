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
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
}

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL ?? 'https://webhook.digital-ai.tech/webhook/analise';
const TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      const isLastAttempt = attempt === retries - 1;
      if (isLastAttempt) break;
      const backoffMs = 1000 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Erro na API');
}

export function DashboardHeader({ data, onAnalysisComplete, dateRange, setDateRange }: DashboardHeaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const setQuickRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    const toIso = (d: Date) => d.toISOString().slice(0, 10);
    setDateRange({ start: toIso(startDate), end: toIso(endDate) });
  };

  const clearRange = () => setDateRange({ start: '', end: '' });

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

      const columns: string[] = Array.from(
        rows.reduce((set: Set<string>, row: any) => {
          Object.keys(row || {}).forEach((key) => set.add(key));
          return set;
        }, new Set<string>())
      );

      lines.push(columns.join(','));
      rows.forEach((row: Record<string, any>) => {
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
    if (!data || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const response = await fetchWithRetry(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(data),
          metadata: {
            widgetCount: Array.isArray(data) ? data.length : 0,
            period: dateRange.start && dateRange.end ? `${dateRange.start} - ${dateRange.end}` : 'full-range',
            ts: new Date().toISOString(),
          },
        }),
      });
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
      const description = error instanceof Error ? error.message : 'Erro na análise';
      console.error(error);
      toast({ title: 'Erro na análise', description, variant: 'destructive' });
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

  const handleExportJson = () => {
    if (!data || !Array.isArray(data)) return;
    const jsonPayload = {
      exportDate: new Date().toISOString(),
      metadata: {
        widgetCount: data.length,
        period: dateRange.start && dateRange.end ? `${dateRange.start} - ${dateRange.end}` : 'full-range',
      },
      widgets: data,
    };
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard_report.json';
    link.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Relatório JSON gerado' });
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
              <DropdownMenuItem onClick={handleExportJson} disabled={!data}>Exportar Relatório (JSON)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !data} className="gap-2">
            {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analisando...</> : <><Bot className="h-4 w-4" /> Analisar com IA</>}
          </Button>
        </div>
      </div>

      {/* ÁREA DE FILTROS */}
      {data && (
        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filtros:
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setQuickRange(7)}>Últimos 7d</Button>
              <Button size="sm" variant="secondary" onClick={() => setQuickRange(30)}>Últimos 30d</Button>
              <Button size="sm" variant="secondary" onClick={() => setQuickRange(90)}>Últimos 90d</Button>
              <Button size="sm" variant="ghost" onClick={clearRange}>Limpar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
