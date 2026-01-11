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
  const xField = widget.xField || "date";

  // PREPARAÇÃO DE DADOS ROBUSTA
  const data = useMemo(() => {
    const rawData = extractWidgetData(widget.data);
    
    if (isBar && Array.isArray(rawData)) {
      // Para gráficos de barra, convertemos o eixo X para String explicitamente.
      // Isso impede que o Recharts tente criar uma escala linear numérica (que esconde as barras).
      return rawData.map((item: any) => ({
        ...item,
        [xField]: String(item[xField]) 
      }));
    }
    return rawData;
  }, [widget.data, isBar, xField]);

  // Lógica para encontrar campos Y
  let yFields: string[] = [];
  if (Array.isArray(widget.yField)) {
    yFields = widget.yField;
  } else if (typeof widget.yField === "string") {
    yFields = widget.yField.split(",").map((s) => s.trim());
  }
  
  if (yFields.length === 0 && widget.config?.yAxis) {
     if (Array.isArray(widget.config.yAxis)) {
        yFields = widget.config.yAxis.map((y: any) => y.field);
     } else if (widget.config.yAxis.field) {
        yFields = [widget.config.yAxis.field];
     }
  }

  if (yFields.length === 0 && data && data.length > 0) {
     const keys = Object.keys(data[0]).filter(k => k !== xField && k !== 'columns');
     if (keys.length > 0) yFields = [keys[0]];
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
                // IMPORTANTE: 'category' é obrigatório para barras de distribuição
                type="category"
                scale={isBar ? "band" : "auto"}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  if (isBar) return val;
                  try {
                    const d = new Date(val);
                    // Verifica se é data válida e não um número puro
                    if(!isNaN(d.getTime()) && typeof val !== 'number' && String(val).includes('-')) {
                        return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
                    }
                    return val;
                  } catch (e) { return val; }
                }}
              />
              
              <YAxis tick={{ fontSize: 12 }} />
              
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px' }}
                labelFormatter={(label) => isBar ? `Nota: ${label}` : label}
              />
              
              <Legend />
              
              {yFields.map((field, index) => {
                const color = COLORS[index % COLORS.length];
                
                if (isBar) {
                  return (
                    <Bar key={field} dataKey={field} fill={color} name={widget.config?.yAxis?.label || field} radius={[4, 4, 0, 0]}>
                       {data.map((entry: any, i: number) => (
                          <Cell key={`cell-${i}`} fill={entry[xField] ? getColorForScore(entry[xField]) : color} />
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
