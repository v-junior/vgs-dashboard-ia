import { useState } from 'react';
import { Bot, Loader2, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  data: unknown[] | null;
  onAnalysisComplete: (analysis: string) => void;
  // NOVOS PROPS PARA O FILTRO
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
}

const WEBHOOK_URL = 'https://edt.digital-ai.tech/webhook-test/analise';

export function DashboardHeader({ data, onAnalysisComplete, dateRange, setDateRange }: DashboardHeaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!data) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: JSON.stringify(data) }),
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

  const handleExport = () => {
    setTimeout(() => window.print(), 100);
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
          <Button variant="outline" onClick={handleExport} disabled={!data} className="gap-2">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
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
