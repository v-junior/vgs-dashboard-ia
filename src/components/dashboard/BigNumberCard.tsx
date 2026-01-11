import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { extractWidgetData } from "@/lib/utils"; // Importe a função que criamos

interface BigNumberWidgetProps {
  widget: any;
}

export function BigNumberWidget({ widget }: BigNumberWidgetProps) {
  //Usar a função para pegar os dados certos
  const rawData = extractWidgetData(widget.data);
  const currentData = rawData[0] || {}; // Pega o primeiro item do array

  const value = currentData.big_number;
  
  // Lógica para variação (setinha verde/vermelha)
  const variation = currentData.variations?.month;
  const isPositive = variation?.type === "up";
  const hasVariation = variation?.value !== undefined && variation?.value !== null;

  // Formatação do número (se for % coloca no fim)
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) 
    : '-';
    
  const suffix = widget.config?.bigNumber?.suffix || '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {widget.config?.title?.text || widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formattedValue}{suffix}
        </div>
        
        {hasVariation && (
          <p className={`text-xs flex items-center mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
            {Math.abs(variation.value)}%
            <span className="text-muted-foreground ml-1">mês anterior</span>
          </p>
        )}
        {!hasVariation && <p className="text-xs text-muted-foreground mt-1">-</p>}
      </CardContent>
    </Card>
  );
}
