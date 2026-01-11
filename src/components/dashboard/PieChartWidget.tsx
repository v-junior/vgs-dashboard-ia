import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractWidgetData } from '@/lib/utils';

interface PieChartWidgetProps {
  widget: any;
}

const COLORS = ['#09738a', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];

function getColorForScore(score: number | string) {
  const s = Number(score);
  if (s === 1) return '#ef4444'; 
  if (s === 2) return '#f97316'; 
  if (s === 3) return '#eab308'; 
  if (s === 4) return '#84cc16'; 
  if (s === 5) return '#22c55e'; 
  return null;
}

export function PieChartWidget({ widget }: PieChartWidgetProps) {
  const data = useMemo(() => {
    return extractWidgetData(widget.data);
  }, [widget.data]);

  const dataKey = widget.config?.angleField || widget.yField || 'value';
  const nameKey = widget.config?.categoryField || widget.xField || 'name';

  return (
    <Card className="col-span-1 min-h-[400px]">
      <CardHeader>
        <CardTitle>{widget.config?.title?.text || widget.name}</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry: any, index: number) => {
                  const scoreColor = getColorForScore(entry[nameKey]);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={scoreColor || COLORS[index % COLORS.length]} 
                    />
                  );
                })}
              </Pie>
              <Tooltip formatter={(value: number) => [value, "Total"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
             Aguardando dados...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
