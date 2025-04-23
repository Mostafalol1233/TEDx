import { Order } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface OrderItemProps {
  order: Order;
}

export default function OrderItem({ order }: OrderItemProps) {
  // Get the first order item (simplified for this example)
  const { data: orderDetails } = useQuery({
    queryKey: [`/api/orders/${order.id}/details`],
  });

  // Get the status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Get the status text in Arabic
  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "تم التسليم";
      case "shipped":
        return "قيد الشحن";
      case "cancelled":
        return "ملغي";
      default:
        return "قيد المعالجة";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between flex-wrap gap-2 mb-3">
        <div>
          <span className="text-sm text-gray-500">#{order.id}</span>
          <h4 className="font-bold">
            {orderDetails?.productName || "طلب #" + order.id}
          </h4>
        </div>
        <div className={`text-sm px-3 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span>{order.createdAt ? format(new Date(order.createdAt), "dd MMMM yyyy") : "تاريخ غير متاح"}</span>
        <span className="font-medium">{order.totalPoints} نقطة</span>
      </div>
      <div className="mt-3">
        <Button variant="link" className="p-0 h-auto text-primary hover:underline text-sm">
          عرض التفاصيل
        </Button>
      </div>
    </div>
  );
}
