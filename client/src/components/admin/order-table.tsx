import { Order } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface OrderTableProps {
  orders: Order[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  // Get order details
  const getOrderDetails = (orderId: number) => {
    return useQuery({
      queryKey: [`/api/orders/${orderId}/details`],
      enabled: !!orderId,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="success">تم التسليم</Badge>;
      case "shipped":
        return <Badge variant="default">قيد الشحن</Badge>;
      case "pending":
        return <Badge variant="warning">قيد المعالجة</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50 text-gray-700 text-sm">
          <TableRow>
            <TableHead className="text-right">رقم الطلب</TableHead>
            <TableHead className="text-right">المستخدم</TableHead>
            <TableHead className="text-right">المنتج</TableHead>
            <TableHead className="text-right">النقاط</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-gray-600 text-sm">
          {orders.map(order => {
            const { data: details } = getOrderDetails(order.id);
            
            return (
              <TableRow key={order.id} className="border-b">
                <TableCell>#{order.id}</TableCell>
                <TableCell>{details?.username || `User #${order.userId}`}</TableCell>
                <TableCell>{details?.productName || "منتج غير معروف"}</TableCell>
                <TableCell>{order.totalPoints}</TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
