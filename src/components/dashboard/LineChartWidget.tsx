import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractWidgetData } from '@/lib/utils';

interface LineChartWidgetProps {
  widget: any;
}

const COLORS = ['#09738a', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  const kind = widget.kind || widget.config?.kind || 'line';
  const isArea = kind === 'area';
  const isBar = kind === 'bar';

  const data = useMemo(() => extractWidgetData(widget.data), [widget.data]);

  const xField = widget.xField || "date";
  
  let yFields: string[] = [];
  if (Array.isArray(widget.yField)) yFields = widget.yField;
  else if (typeof widget.yField === "string") yFields = widget.yField.split(",").map((s) => s.trim());
  
  if (yFields.length === 0 && widget.config?.yAxis) {
     yFields = widget.config.yAxis.map((y: any) => y.field);
  }

  const ChartComponent = isArea ? AreaChart : isBar ? BarChart : LineChart;

  return (
    <Card className="col-span-1 lg:col-span-2 min-h-[400px]">
      <CardHeader>
        <CardTitle>{widget.config?.title?.text || widget.name}</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey={xField} 
                // CORREÇÃO CRÍTICA: Força tipo categoria para barras (estrelas 1,2,3..)
                type={isBar ? "category" : "category"} 
                allowDuplicatedCategory={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  if (isBar) return val; 
                  try {
                    const d = new Date(val);
                    if(!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
                    return val;
                  } catch (e) { return val; }
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(label) => {
                   if (isBar) return `Nota: ${label}`;
                   try { return new Date(label).toLocaleDateString('pt-BR'); } catch { return label; }
                }}
              />
              <Legend />
              {yFields.map((field, index) => {
                const color = COLORS[index % COLORS.length];
                if (isBar) {
                  return (
                    <Bar key={field} dataKey={field} fill={color} name={field} radius={[4, 4, 0, 0]}>
                       {data.map((entry: any, i: number) => (
                          <Cell key={`cell-${i}`} fill={entry.score ? getColorForScore(entry.score) : color} />
                       ))}
                    </Bar>
                  );
                }
                const SeriesComponent = isArea ? Area : Line;
                return (
                  <SeriesComponent 
                    key={field} 
                    type="monotone" 
                    dataKey={field} 
                    stroke={color} 
                    fill={isArea ? color : undefined} 
                    fillOpacity={isArea ? 0.3 : 1} 
                    strokeWidth={2} 
                    dot={false}
                    name={field} 
                  />
                );
              })}
            </ChartComponent>
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

function getColorForScore(score: number | string) {
  const s = Number(score);
  if (s === 1) return '#ef4444'; 
  if (s === 2) return '#f97316'; 
  if (s === 3) return '#eab308'; 
  if (s === 4) return '#84cc16'; 
  if (s === 5) return '#22c55e'; 
  return '#09738a';
}
