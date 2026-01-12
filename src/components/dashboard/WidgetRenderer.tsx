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
  const usedExampleData = (widget as any)?._usedExampleData || false;

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

  const widgetElement = renderWidget();

  if (usedExampleData) {
    return (
      <div className="relative">
        {widgetElement}
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-1 text-xs font-medium text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          Dados de exemplo
        </div>
      </div>
    );
  }

  return widgetElement;
}
