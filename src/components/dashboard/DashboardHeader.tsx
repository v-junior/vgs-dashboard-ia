import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { AIAnalysisResponse } from '@/types/dashboard';

interface DashboardHeaderProps {
  data: unknown[] | null;
  onAnalysisComplete: (analysis: string) => void;
}

const WEBHOOK_URL = 'https://edt.digital-ai.tech/webhook-test/analise';

export function DashboardHeader({ data, onAnalysisComplete }: DashboardHeaderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!data) {
      toast({
        title: 'Nenhum dado carregado',
        description: 'Por favor, carregue um arquivo JSON primeiro.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AIAnalysisResponse | string = await response.json();
      
      let analysisText: string;
      
      if (typeof result === 'string') {
        analysisText = result;
      } else if (result.analise) {
        analysisText = result.analise;
      } else if (result.analysis) {
        analysisText = result.analysis;
      } else if (result.text) {
        analysisText = result.text;
      } else if (result.message) {
        analysisText = result.message;
      } else {
        analysisText = JSON.stringify(result);
      }

      onAnalysisComplete(analysisText);
      
      toast({
        title: 'Análise concluída!',
        description: 'A IA analisou os dados com sucesso.',
      });
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível conectar ao serviço de IA.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard de Métricas
        </h1>
        <p className="mt-1 text-muted-foreground">
          Análise completa de métricas do seu aplicativo
        </p>
      </div>
      
      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing || !data}
        className="gap-2"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            <Bot className="h-5 w-5" />
            🤖 Analisar com IA
          </>
        )}
      </Button>
    </div>
  );
}
