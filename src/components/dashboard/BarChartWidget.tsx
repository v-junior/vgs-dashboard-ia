import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractWidgetData } from '@/lib/utils';

interface BarChartWidgetProps {
  widget: any;
}

const COLORS = ['#09738a', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

function getColorForScore(score: number | string) {
  const s = Number(score);
  if (s === 1) return '#ef4444'; // Vermelho
  if (s === 2) return '#f97316'; // Laranja
  if (s === 3) return '#eab308'; // Amarelo
  if (s === 4) return '#84cc16'; // Verde claro
  if (s === 5) return '#22c55e'; // Verde
  return '#09738a';
}

export function BarChartWidget({ widget }: BarChartWidgetProps) {
  const xField = widget.xField || 'score';
  const yField = widget.yField || 'total';

  // Prepara os dados especificamente para Barras
  const data = useMemo(() => {
    const rawData = extractWidgetData(widget.data);
    if (!rawData || !Array.isArray(rawData)) return [];

    // Converte o eixo X (notas) para String para garantir que sejam categorias
    return rawData.map((item: any) => ({
      ...item,
      [xField]: String(item[xField]), 
      // Garante que o valor Y seja número
      [yField]: Number(item[yField])
    }));
  }, [widget.data, xField, yField]);

  return (
    <Card className="col-span-1 lg:col-span-2 min-h-[400px]">
      <CardHeader>
        <CardTitle>{widget.config?.title?.text || widget.name}</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey={xField} 
                type="category" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                formatter={(value: number) => [value, "Total"]}
                labelFormatter={(label) => `Nota: ${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              
              <Legend />

              <Bar 
                dataKey={yField} 
                name="Avaliações" 
                radius={[4, 4, 0, 0]}
                // Se a cor falhar, usa a padrão
                fill={COLORS[0]} 
              >
                {data.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColorForScore(entry[xField])} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-center px-4">
            {widget._filterActive && widget._noDataForRange
              ? 'Sem dados no período selecionado. Ajuste ou limpe o filtro.'
              : 'Aguardando dados...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
