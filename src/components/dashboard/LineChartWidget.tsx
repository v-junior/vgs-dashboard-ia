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
  // 1. Detecta o tipo de gráfico com segurança
  const kind = widget.kind || widget.config?.kind || 'line';
  const isArea = kind === 'area';
  const isBar = kind === 'bar';

  // 2. Extrai e valida os dados
  const data = useMemo(() => {
    return extractWidgetData(widget.data);
  }, [widget.data]);

  // 3. Define campos dos eixos
  const xField = widget.xField || "date";
  
  // Lógica robusta para encontrar os campos Y (evita o crash do Area Chart)
  let yFields: string[] = [];
  
  // Prioridade 1: Campo explícito no widget
  if (Array.isArray(widget.yField)) {
    yFields = widget.yField;
  } else if (typeof widget.yField === "string") {
    yFields = widget.yField.split(",").map((s: string) => s.trim());
  }
  
  // Prioridade 2: Tenta ler do config se não achou nada (com proteção contra Objeto vs Array)
  if (yFields.length === 0 && widget.config?.yAxis) {
     if (Array.isArray(widget.config.yAxis)) {
        yFields = widget.config.yAxis.map((y: any) => y.field);
     } else if (widget.config.yAxis.field) {
        // Suporte para quando yAxis é um objeto único
        yFields = [widget.config.yAxis.field];
     }
  }

  // Se ainda assim não achou, tenta adivinhar pelo primeiro dado (fallback final)
  if (yFields.length === 0 && data.length > 0) {
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
                // CORREÇÃO BARRA: scale="band" distribui as barras uniformemente
                scale={isBar ? "band" : "auto"}
                padding={isBar ? { left: 10, right: 10 } : { left: 0, right: 0 }}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  if (isBar) return val; 
                  try {
                    const d = new Date(val);
                    // Só formata se for data válida e não for número puro
                    if(!isNaN(d.getTime()) && typeof val !== 'number') {
                        return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
                    }
                    return val;
                  } catch (e) { return val; }
                }}
              />
              
              <YAxis tick={{ fontSize: 12 }} />
              
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                labelFormatter={(label) => {
                   if (isBar) return `Nota: ${label}`;
                   try { 
                       const d = new Date(label);
                       if(!isNaN(d.getTime()) && typeof label !== 'number') return d.toLocaleDateString('pt-BR');
                       return label;
                   } catch { return label; }
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
  if (s === 1) return '#ef4444'; // Vermelho
  if (s === 2) return '#f97316'; // Laranja
  if (s === 3) return '#eab308'; // Amarelo
  if (s === 4) return '#84cc16'; // Verde claro
  if (s === 5) return '#22c55e'; // Verde
  return '#09738a';
}
