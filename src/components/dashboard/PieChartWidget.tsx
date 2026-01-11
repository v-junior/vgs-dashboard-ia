import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatters';
import { extractWidgetData } from '@/lib/utils'; // <--- IMPORTANTE
import type { PieWidget } from '@/types/dashboard';

interface PieChartWidgetProps {
  widget: PieWidget;
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export function PieChartWidget({ widget }: PieChartWidgetProps) {
  const { title, colors, kind } = widget;
  const isDonut = kind === 'donut' || widget.config?.kind === 'donut';

  // Lógica robusta para descobrir quais campos usar (seu JSON usa xField/yField)
  const categoryField = widget.config?.categoryField || widget.xField || widget.labelField || 'name';
  const valueField = widget.config?.angleField || widget.yField || widget.valueField || 'value';

  const chartData = useMemo(() => {
    // CORREÇÃO: Usando extractWidgetData
    const rawData = extractWidgetData(widget.data) as Record<string, unknown>[];
    
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map((item) => ({
      name: String(item[categoryField] || ''),
      value: Number(item[valueField] || 0),
    })).filter(item => item.value > 0); // Filtra valores zerados para não quebrar o gráfico
  }, [widget.data, categoryField, valueField]);

  // Tenta mapear cores customizadas do config se existirem
  const getColor = (index: number, name: string) => {
    if (widget.config?.color?.mapping && widget.config.color.mapping[name]) {
        return widget.config.color.mapping[name];
    }
    return (colors || DEFAULT_COLORS)[index % (colors || DEFAULT_COLORS).length];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isDonut ? 60 : 0}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(index, entry.name)} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Total']}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
               Sem dados disponíveis
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
