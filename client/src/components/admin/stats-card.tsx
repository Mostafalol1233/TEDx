import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({ title, value, change, isPositive, icon, color }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      <div className={`mt-4 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpIcon className="inline-block w-4 h-4 mr-1" />
        ) : (
          <ArrowDownIcon className="inline-block w-4 h-4 mr-1" />
        )}
        <span>{change} عن الشهر الماضي</span>
      </div>
    </Card>
  );
}
