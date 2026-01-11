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

        {/* Upload sempre visível */}
        <div className="print:hidden">
            <FileUpload onFileLoad={handleFileLoad} />
        </div>

        {aiAnalysis && <AIInsights content={aiAnalysis} />}

        {}
        {widgets && widgets.length > 0 && (
          <DashboardGrid widgets={widgets} />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
