import { useState } from 'react';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { DashboardWidget } from '@/types/dashboard';

const Index = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleFileLoad = (newWidgets: any[]) => {
    if (!newWidgets || newWidgets.length === 0) {
      toast.error("Nenhum dado válido encontrado.");
      return;
    }

    // O segredo: .flat() resolve tanto arrays de arrays quanto arrays de objetos misturados
    const flatWidgets = newWidgets.flat().filter(w => w && (w.kind || w.type));
    
    if (flatWidgets.length === 0) {
      toast.error("O arquivo não contém widgets válidos (falta 'kind' ou 'type').");
      return;
    }

    setWidgets(flatWidgets as DashboardWidget[]);
    setAiAnalysis(null);
    toast.success(`${flatWidgets.length} widgets carregados com sucesso!`);
  };

  const handleAnalysisComplete = (analysis: string) => {
    setAiAnalysis(analysis);
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <DashboardHeader 
          data={widgets} 
          onAnalysisComplete={handleAnalysisComplete} 
        />

        <div className="print:hidden">
            <FileUpload onFileLoad={handleFileLoad} />
        </div>

        {aiAnalysis && <AIInsights content={aiAnalysis} />}

        {widgets && widgets.length > 0 ? (
          <DashboardGrid widgets={widgets} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/30">
            <p className="text-lg text-muted-foreground">
              Arraste arquivos JSON para começar (Suporta múltiplos arquivos)
            </p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
