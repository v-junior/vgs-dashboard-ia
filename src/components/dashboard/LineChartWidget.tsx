import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractWidgetData } from '@/lib/utils';

interface LineChartWidgetProps {
  widget: any;
}

const COLORS = ['#09738a', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  // Detecta o tipo de gráfico
  const kind = widget.kind || widget.config?.kind || 'line';
  const isArea = kind === 'area';
  const isBar = kind === 'bar';

  // Extrai dados com segurança
  const data = useMemo(() => {
    return extractWidgetData(widget.data);
  }, [widget.data]);

  // Define campos
  const xField = widget.xField || "date";
  
  // Tratamento robusto para yField (pode vir como string ou array)
  let yFields: string[] = [];
  if (Array.isArray(widget.yField)) {
    yFields = widget.yField;
  } else if (typeof widget.yField === "string") {
    // Remove espaços e quebra por vírgula
    yFields = widget.yField.split(",").map((s: string) => s.trim());
  }

  // Se não achou yField, tenta pegar do config ou do primeiro item de dados
  if (yFields.length === 0 && widget.config?.yAxis) {
     yFields = widget.config.yAxis.map((y: any) => y.field);
  }

  // Componente dinâmico do Recharts
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
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  // Só formata data se NÃO for gráfico de barras (geralmente categorias)
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
                
                if (isArea) {
                  return (
                    <Area 
                      key={field} 
                      type="monotone" 
                      dataKey={field} 
                      stroke={color} 
                      fill={color} 
                      fillOpacity={0.3} 
                      name={field}
                    />
                  );
                }
                
                if (isBar) {
                  return (
                    <Bar key={field} dataKey={field} fill={color} name={field} radius={[4, 4, 0, 0]}>
                       {/* Mapeamento de cores para barras (ex: estrelas) */}
                       {data.map((entry: any, i: number) => (
                          <Cell key={`cell-${i}`} fill={entry.score ? getColorForScore(entry.score) : color} />
                       ))}
                    </Bar>
                  );
                }

                return (
                  <Line 
                    key={field} 
                    type="monotone" 
                    dataKey={field} 
                    stroke={color} 
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

// Função auxiliar para cores das estrelas (Opcional, mas dá um toque pro)
function getColorForScore(score: number | string) {
  const s = Number(score);
  if (s === 1) return '#ef4444'; // Vermelho
  if (s === 2) return '#f97316'; // Laranja
  if (s === 3) return '#eab308'; // Amarelo
  if (s === 4) return '#84cc16'; // Verde claro
  if (s === 5) return '#22c55e'; // Verde
  return '#09738a';
}
