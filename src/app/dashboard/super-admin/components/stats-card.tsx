import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  indicatorColor: "emerald" | "amber" | "red";
  className?: string;
}

export function StatsCard({
  label,
  value,
  indicatorColor,
  className,
}: StatsCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <Card
      className={cn(
        "p-4 flex flex-col border-border shadow-sm",
        className
      )}
    >
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <span
          className={cn("w-2 h-2 rounded-full", colorClasses[indicatorColor])}
        />
        {label}
      </span>
      <span className="text-2xl font-bold text-foreground mt-1">{value}</span>
    </Card>
  );
}

