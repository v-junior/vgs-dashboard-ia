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
      const originalData = extractWidgetData(widget.data);
      if (!Array.isArray(originalData)) return widget;

      // 2. Filtra os dados
      const filteredData = originalData.filter((item: any) => {
        // Tenta encontrar um campo de data
        const dateValue = item.date || item.createdAt || item.formattedDate;
        if (!dateValue) return true; // Se não tem data, não filtra (ex: tabela de keywords)

        const itemDate = new Date(dateValue).getTime();
        const start = dateRange.start ? new Date(dateRange.start).getTime() : -Infinity;
        const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;

        return itemDate >= start && itemDate <= end;
      });

      // 3. Retorna o widget com os dados filtrados
      // Precisamos manter a estrutura original "data: { br.com.bb... : [] }"
      // Então reconstruímos o objeto data
      const keys = Object.keys(widget.data || {});
      const mainKey = keys.length > 0 ? keys[0] : 'data';
      
      return {
        ...widget,
        data: {
          [mainKey]: filteredData
        }
      };
    });
  }, [widgets, dateRange]);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <DashboardHeader 
          data={filteredWidgets} // Passamos os dados filtrados para a IA também!
          onAnalysisComplete={setAiAnalysis} 
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <div className="print:hidden">
            <FileUpload onFileLoad={handleFileLoad} />
        </div>

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
