import type { DashboardWidget } from '@/types/dashboard';
import { BigNumberCard } from './BigNumberCard';
import { LineChartWidget } from './LineChartWidget';
import { PieChartWidget } from './PieChartWidget';
import { DataTableWidget } from './DataTableWidget';

interface WidgetRendererProps {
  widget: DashboardWidget;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.kind) {
    case 'big_number':
      return <BigNumberCard widget={widget} />;
    
    case 'line':
    case 'area':
      return <LineChartWidget widget={widget} />;
    
    case 'pie':
    case 'donut':
      return <PieChartWidget widget={widget} />;
    
    case 'table':
      return <DataTableWidget widget={widget} />;
    
    default:
      return (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-muted-foreground">
            Tipo de widget não suportado: {(widget as DashboardWidget).kind}
          </p>
        </div>
      );
  }
}
