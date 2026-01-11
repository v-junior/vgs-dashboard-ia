import type { DashboardWidget } from '@/types/dashboard';
import { BigNumberWidget } from './BigNumberCard'; 
import { TableWidget } from './DataTableWidget';
import { LineChartWidget } from './LineChartWidget';
import { PieChartWidget } from './PieChartWidget';
import { BarChartWidget } from './BarChartWidget'; 

interface WidgetRendererProps {
  widget: DashboardWidget;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const renderWidget = () => {
    const kind = widget.kind || widget.config?.kind;

    switch (kind) {
      case 'big_number':
        return <BigNumberWidget widget={widget} />;
      
      case 'bar':
        return <BarChartWidget widget={widget} />;

      case 'line':
      case 'area':
        return <LineChartWidget widget={widget} />;
      
      case 'pie':
      case 'donut':
        return <PieChartWidget widget={widget} />;
      
      case 'table':
        return <TableWidget widget={widget} />;
        
      default:
        console.warn(`Unknown widget kind: ${kind}`);
        return null;
    }
  };

  return renderWidget();
}
