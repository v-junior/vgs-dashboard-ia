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
import { formatNumber, getDataFromWidget } from '@/lib/formatters';
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
  const { title, labelField = 'name', valueField = 'value', colors, kind } = widget;
  const isDonut = kind === 'donut';

  const chartData = useMemo(() => {
    const rawData = getDataFromWidget(widget.data) as Record<string, unknown>[];
    return rawData.map((item) => ({
      name: String(item[labelField] || ''),
      value: Number(item[valueField] || 0),
    }));
  }, [widget.data, labelField, valueField]);

  const chartColors = colors || DEFAULT_COLORS;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
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
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatNumber(value), 'Valor']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
