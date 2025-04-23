import { User } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserManagerProps {
  users: User[];
}

export default function UserManager({ users }: UserManagerProps) {
  const { toast } = useToast();
  const [pointsToAdd, setPointsToAdd] = useState<Record<number, number>>({});
  
  // Add points mutation
  const addPointsMutation = useMutation({
    mutationFn: async ({ userId, points }: { userId: number; points: number }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/add-points`, { points });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة النقاط بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setPointsToAdd({});
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إضافة النقاط",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle admin status mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, { isAdmin });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تغيير صلاحيات المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تغيير الصلاحيات",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle points input change
  const handlePointsChange = (userId: number, value: string) => {
    const points = parseInt(value);
    if (!isNaN(points)) {
      setPointsToAdd(prev => ({ ...prev, [userId]: points }));
    }
  };
  
  // Handle add points
  const handleAddPoints = (userId: number) => {
    const points = pointsToAdd[userId];
    if (points && points > 0) {
      addPointsMutation.mutate({ userId, points });
    } else {
      toast({
        title: "يرجى إدخال عدد صحيح من النقاط",
        variant: "destructive",
      });
    }
  };
  
  // Handle toggle admin status
  const handleToggleAdmin = (userId: number, currentStatus: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin: !currentStatus });
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المستخدم</TableHead>
            <TableHead>اسم المستخدم</TableHead>
            <TableHead>النقاط</TableHead>
            <TableHead>إضافة نقاط</TableHead>
            <TableHead>أدمن</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name || "-"}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Input
                    className="w-20"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={pointsToAdd[user.id] || ""}
                    onChange={(e) => handlePointsChange(user.id, e.target.value)}
                  />
                  <Button 
                    size="sm"
                    onClick={() => handleAddPoints(user.id)}
                    disabled={addPointsMutation.isPending}
                  >
                    إضافة
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.isAdmin}
                  onCheckedChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                  disabled={toggleAdminMutation.isPending}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Button variant="outline" className="mt-4 w-full">
        عرض جميع المستخدمين
      </Button>
    </div>
  );
}
