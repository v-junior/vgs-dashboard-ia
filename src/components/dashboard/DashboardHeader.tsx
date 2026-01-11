import { useState } from 'react';
import { Bot, Loader2, Download } from 'lucide-react'; // Adicionado Download
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
// Se o seu arquivo de tipos estiver em outro lugar, ajuste o import
import type { AIAnalysisResponse } from '@/types/dashboard';

interface DashboardHeaderProps {
  data: unknown[] | null;
  onAnalysisComplete: (analysis: string) => void;
}

// URL de produção (ajuste se necessário)
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
        body: JSON.stringify({ content: JSON.stringify(data) }), // Envelopando para garantir formato
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Lógica de fallback para encontrar o texto da IA
      let analysisText = '';
      if (typeof result === 'string') analysisText = result;
      else if (result.analise) analysisText = result.analise;
      else if (result.output) analysisText = result.output; // N8N comum
      else if (result.message?.content) analysisText = result.message.content;
      else analysisText = JSON.stringify(result);

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

  // DIFERENCIAL: Função de Exportação
  const handleExport = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard de Métricas
        </h1>
        <p className="mt-1 text-muted-foreground">
          Análise completa de métricas do seu aplicativo
        </p>
      </div>
      
      <div className="flex gap-2">
        {/* Botão de Exportar PDF */}
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={!data}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>

        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !data}
          className="gap-2"
          size="default"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              Analisar com IA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
