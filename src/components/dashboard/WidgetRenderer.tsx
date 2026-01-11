import type { DashboardWidget } from '@/types/dashboard';
// NOTA: Estamos importando os componentes NOVOS (Widget) de dentro dos arquivos (que podem ter nomes antigos)
import { BigNumberWidget } from './BigNumberCard'; 
import { TableWidget } from './DataTableWidget';
import { LineChartWidget } from './LineChartWidget';
import { PieChartWidget } from './PieChartWidget';

interface WidgetRendererProps {
  widget: DashboardWidget;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const renderWidget = () => {
    switch (widget.kind) {
      case 'big_number':
        return <BigNumberWidget widget={widget} />;
      
      case 'line':
      case 'area':
        return <LineChartWidget widget={widget} />;
      
      case 'pie':
      case 'donut':
        return <PieChartWidget widget={widget} />;
      
      case 'table':
        return <TableWidget widget={widget} />;
        
      default:
        console.warn(`Unknown widget kind: ${(widget as any).kind}`);
        return null;
    }
  };

  return renderWidget();
}
