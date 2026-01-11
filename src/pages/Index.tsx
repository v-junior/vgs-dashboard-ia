import { useState } from 'react';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AIInsights } from '@/components/dashboard/AIInsights';
import type { DashboardWidget } from '@/types/dashboard';

const Index = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleFileLoad = (data: unknown[]) => {
    setWidgets(data as DashboardWidget[]);
    setAiAnalysis(null);
  };

  const handleAnalysisComplete = (analysis: string) => {
    setAiAnalysis(analysis);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          {/* Header with AI Button */}
          <DashboardHeader 
            data={widgets} 
            onAnalysisComplete={handleAnalysisComplete} 
          />

          {/* File Upload Area */}
          <FileUpload onFileLoad={handleFileLoad} />

          {/* AI Insights (when available) */}
          {aiAnalysis && <AIInsights content={aiAnalysis} />}

          {/* Dashboard Widgets */}
          {widgets && widgets.length > 0 ? (
            <DashboardGrid widgets={widgets} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-muted-foreground">
                Carregue um arquivo JSON para visualizar os dados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
