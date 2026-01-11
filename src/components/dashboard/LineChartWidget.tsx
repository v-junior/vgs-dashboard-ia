import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatNumber, parseYFields } from '@/lib/formatters';
import { extractWidgetData } from '@/lib/utils'; // <--- IMPORTANTE: Usando nossa função
import type { LineWidget, AreaWidget, ChartDataRow } from '@/types/dashboard';

interface LineChartWidgetProps {
  widget: LineWidget | AreaWidget;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  const { title, xField, yField, config, kind } = widget;
  const isArea = kind === 'area';
  
  const yFields = useMemo(() => parseYFields(yField), [yField]);
  
  const chartData = useMemo(() => {
    // CORREÇÃO: Usando extractWidgetData para lidar com a chave dinâmica do pacote
    const rawData = extractWidgetData(widget.data) as ChartDataRow[];
    
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map(row => ({
      ...row,
      // Garante que xField existe antes de formatar
      formattedDate: row[xField] ? formatDate(row[xField] as string) : '',
    }));
  }, [widget.data, xField]);

  const getLabel = (field: string): string => {
    return config?.yAxis?.find((y: any) => y.field === field)?.label || config?.yAxis?.[field]?.label || field;
  };

  const getFormat = (field: string): string | undefined => {
    return config?.yAxis?.find((y: any) => y.field === field)?.format || config?.yAxis?.[field]?.format;
  };

  const ChartComponent = isArea ? AreaChart : LineChart;

  return (
    <Card className="hover:shadow-md transition-shadow col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value, 'abbreviated')}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatNumber(value, getFormat(name)),
                    getLabel(name)
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Legend 
                  formatter={(value) => getLabel(value)}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                {yFields.map((field, index) => (
                  isArea ? (
                    <Area
                      key={field}
                      type="monotone"
                      dataKey={field}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={false}
                      name={getLabel(field)}
                    />
                  ) : (
                    <Line
                      key={field}
                      type="monotone"
                      dataKey={field}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                      name={getLabel(field)}
                    />
                  )
                ))}
              </ChartComponent>
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
