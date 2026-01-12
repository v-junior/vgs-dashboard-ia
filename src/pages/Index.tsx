import { useState, useMemo } from 'react';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { DashboardWidget } from '@/types/dashboard';
import { extractWidgetData } from '@/lib/utils';

const Index = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  // Estado do Filtro
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleFileLoad = (loadedFiles: any[]) => {
    if (!loadedFiles || loadedFiles.length === 0) {
      toast.error("Nenhum dado válido encontrado.");
      return;
    }
    const flatWidgets = loadedFiles.flatMap(item => 
      Array.isArray(item) ? item : [item]
    ).filter(w => w && (w.kind || w.type));
    
    if (flatWidgets.length === 0) {
      toast.error("Os arquivos não contêm widgets válidos.");
      return;
    }
    setWidgets(flatWidgets as DashboardWidget[]);
    setAiAnalysis(null);
    toast.success(`${flatWidgets.length} widgets carregados com sucesso!`);
  };

  // LÓGICA DE FILTRAGEM PODEROSA
  const filteredWidgets = useMemo(() => {
    if (!widgets) return null;
    if (!dateRange.start && !dateRange.end) return widgets;

    return widgets.map(widget => {
      // 1. Extrai os dados originais
      const extracted = extractWidgetData(widget.data);
      const hasRealData = Array.isArray(extracted) && extracted.length > 0;

      // fallback para exampleData.appId quando não há dados reais
      const exampleData = widget.exampleData && Array.isArray(widget.exampleData.appId) ? widget.exampleData.appId : [];
      const dataSource = hasRealData ? extracted : exampleData;

      if (!Array.isArray(dataSource)) return widget;

      // 2. Filtra os dados
      const filteredData = dataSource.filter((item: any) => {
        const dateValue = item.date || item.createdAt || item.formattedDate;
        if (!dateValue) return true; // itens sem data são mantidos

        const itemDate = new Date(dateValue).getTime();
        const start = dateRange.start ? new Date(dateRange.start).getTime() : -Infinity;
        const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;

        return itemDate >= start && itemDate <= end;
      });

      // marcar se o filtro está ativo e se não há dados no intervalo
      const filterActive = Boolean(dateRange.start || dateRange.end);
      const noDataForRange = filterActive && Array.isArray(dataSource) && dataSource.length > 0 && filteredData.length === 0;

      // 3. Reconstruir o objeto data mantendo a chave original quando possível
      const keys = Object.keys(widget.data || {});
      const mainKey = keys.length > 0 ? keys[0] : 'data';

      return {
        ...widget,
        _filterActive: filterActive,
        _noDataForRange: noDataForRange,
        _usedExampleData: !hasRealData && exampleData.length > 0,
        data: {
          [mainKey]: filteredData
        }
      };
    });
  }, [widgets, dateRange]);

  return (
    <div className="relative min-h-screen bg-background pb-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(14,165,233,0.08),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 space-y-8">
        <section className="rounded-2xl border bg-white/80 shadow-sm backdrop-blur-sm dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Desafio RankMyApp</p>
              <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Dashboard de Analytics com IA</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Suba os JSONs fornecidos (ex.: pagina-inteira.json), visualize gráficos automaticamente e peça insights de IA via webhook N8N.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" /> Workflow N8N ativo
              </span>
            </div>
          </div>
          
          <div className="grid gap-4 border-t bg-muted/30 px-6 py-4 text-sm text-muted-foreground md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-semibold text-foreground">1) Envie o JSON</p>
                <p>Arraste arquivos como pagina-inteira.json ou bar-distribuicao-por-estrela.json.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-semibold text-foreground">2) Filtre e visualize</p>
                <p>Use o filtro de datas, navegue pelos widgets e valide os gráficos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-semibold text-foreground">3) Peça insights de IA</p>
                <p>O botão “Analisar com IA” envia para o webhook ativo e traz o texto formatado.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-slate-900/70">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Upload de dados</h2>
            <p className="mb-4 text-sm text-muted-foreground">Arraste múltiplos JSONs ou clique para selecionar. O parser aceita os arquivos fornecidos e monta os widgets automaticamente.</p>
            <div className="print:hidden">
              <FileUpload onFileLoad={handleFileLoad} />
            </div>
          </div>

          
        </section>

        <DashboardHeader 
          data={filteredWidgets}
          onAnalysisComplete={setAiAnalysis} 
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {aiAnalysis && <AIInsights content={aiAnalysis} />}

        {filteredWidgets && filteredWidgets.length > 0 && (
          <DashboardGrid widgets={filteredWidgets} />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
