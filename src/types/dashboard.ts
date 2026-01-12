export interface Variation {
  type: 'up' | 'down';
  value: string;
}

export interface Variations {
  month?: Variation;
  year?: Variation;
}

export interface YAxisConfig {
  label: string;
  format?: string;
  suffix?: string;
}

export interface WidgetConfig {
  yAxis?: Record<string, YAxisConfig>;
}

export interface ColumnData {
  field: string;
  type: string;
  value: string | number | null;
}

export interface TableDataRow {
  columns: ColumnData[];
}

export interface ChartDataRow {
  [key: string]: string | number | null;
}

export interface BaseWidget {
  kind: string;
  title: string;
  data: Record<string, unknown[]>;
  config?: WidgetConfig;
  exampleData?: Record<string, unknown[]>;
}

export interface BigNumberWidget extends BaseWidget {
  kind: 'big_number';
  big_number: string | number;
  variations?: Variations;
  suffix?: string;
  format?: string;
}

export interface LineWidget extends BaseWidget {
  kind: 'line';
  xField: string;
  yField: string;
}

export interface AreaWidget extends BaseWidget {
  kind: 'area';
  xField: string;
  yField: string;
}

export interface TableWidget extends BaseWidget {
  kind: 'table';
}

export interface PieWidget extends BaseWidget {
  kind: 'pie' | 'donut';
  labelField?: string;
  valueField?: string;
  colors?: string[];
}

export type DashboardWidget = BigNumberWidget | LineWidget | AreaWidget | TableWidget | PieWidget;

export interface AIAnalysisResponse {
  analise?: string;
  analysis?: string;
  text?: string;
  message?: string;
}
