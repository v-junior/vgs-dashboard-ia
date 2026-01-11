import type { DashboardWidget } from '@/types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { cn } from '@/lib/utils';

interface DashboardGridProps {
  widgets: DashboardWidget[];
}

export function DashboardGrid({ widgets }: DashboardGridProps) {
  // Separate widgets by type for better layout
  const bigNumbers = widgets.filter(w => w.kind === 'big_number');
  const charts = widgets.filter(w => ['line', 'area', 'bar', 'pie', 'donut'].includes(w.kind));
  const tables = widgets.filter(w => w.kind === 'table');

  return (
    <div className="space-y-6">
      {/* Big Number Cards - Grid of 4 columns */}
      {bigNumbers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Indicadores</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bigNumbers.map((widget, index) => (
              <WidgetRenderer key={`big-${index}`} widget={widget} />
            ))}
          </div>
        </section>
      )}

      {/* Charts - Grid of 2 columns */}
      {charts.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Gráficos</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {charts.map((widget, index) => (
              <WidgetRenderer key={`chart-${index}`} widget={widget} />
            ))}
          </div>
        </section>
      )}

      {/* Tables - Full width */}
      {tables.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Tabelas</h2>
          <div className="grid gap-4">
            {tables.map((widget, index) => (
              <WidgetRenderer key={`table-${index}`} widget={widget} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
