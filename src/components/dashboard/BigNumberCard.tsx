import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatters';
import type { BigNumberWidget } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface BigNumberCardProps {
  widget: BigNumberWidget;
}

export function BigNumberCard({ widget }: BigNumberCardProps) {
  const { title, big_number, variations, suffix, format } = widget;
  
  const formattedValue = formatNumber(big_number, format);
  const displayValue = suffix ? `${formattedValue}${suffix}` : formattedValue;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold text-foreground">{displayValue}</p>
        
        {variations && (
          <div className="flex flex-wrap gap-3 text-xs">
            {variations.month && (
              <VariationBadge 
                label="Mês" 
                type={variations.month.type} 
                value={variations.month.value} 
              />
            )}
            {variations.year && (
              <VariationBadge 
                label="Ano" 
                type={variations.year.type} 
                value={variations.year.value} 
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VariationBadgeProps {
  label: string;
  type: 'up' | 'down';
  value: string;
}

function VariationBadge({ label, type, value }: VariationBadgeProps) {
  const isUp = type === 'up';
  
  return (
    <div className={cn(
      'flex items-center gap-1 rounded-full px-2 py-0.5',
      isUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
    )}>
      {isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">({label})</span>
    </div>
  );
}
