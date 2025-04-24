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
    <Card className="p-6 border-r-4 transition-all duration-200 hover:shadow-lg" 
          style={{ borderRightColor: color.includes('blue') ? '#3b82f6' : 
                               color.includes('green') ? '#22c55e' : 
                               color.includes('purple') ? '#9333ea' : 
                               color.includes('yellow') ? '#eab308' : '#ef4444' }}>
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
      <div className={`mt-4 text-sm flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <div className={`${isPositive ? 'bg-green-100' : 'bg-red-100'} p-1 rounded-full mr-2`}>
          {isPositive ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
        </div>
        <span>{change} عن الشهر الماضي</span>
      </div>
    </Card>
  );
}
