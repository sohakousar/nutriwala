import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Shield, 
  User, 
  Package, 
  CreditCard, 
  Settings, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const actionIcons: Record<string, typeof Shield> = {
  ORDER_CREATED: Package,
  PAYMENT_VERIFIED: CreditCard,
  PAYMENT_VERIFICATION_FAILED: Shield,
  COD_ORDER_CREATED: Package,
  USER_LOGIN: User,
  USER_LOGOUT: User,
  SETTINGS_UPDATED: Settings,
};

const actionColors: Record<string, string> = {
  ORDER_CREATED: "bg-primary",
  PAYMENT_VERIFIED: "bg-green-600",
  PAYMENT_VERIFICATION_FAILED: "bg-destructive",
  COD_ORDER_CREATED: "bg-primary",
  USER_LOGIN: "bg-blue-600",
  USER_LOGOUT: "bg-muted",
  SETTINGS_UPDATED: "bg-amber-600",
};

const AuditLogViewer = () => {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [limit, setLimit] = useState(50);

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["audit-logs", actionFilter, entityFilter, limit],
    queryFn: async () => {
      // Build base query - using type assertion since audit_logs might not be in generated types
      const { data, error } = await supabase
        .from("audit_logs" as "profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Filter in JS since we need to work around type limitations
      let filtered = data as unknown as AuditLog[];
      
      if (actionFilter !== "all") {
        filtered = filtered.filter(log => log.action === actionFilter);
      }
      if (entityFilter !== "all") {
        filtered = filtered.filter(log => log.entity_type === entityFilter);
      }
      
      return filtered;
    },
  });

  const uniqueActions = [...new Set(logs?.map((l) => l.action) || [])];
  const uniqueEntities = [...new Set(logs?.map((l) => l.entity_type) || [])];

  if (error) {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You don't have permission to view audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Audit Logs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track all important actions and security events
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const Icon = actionIcons[log.action] || Shield;
                const color = actionColors[log.action] || "bg-muted";

                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${color} text-white`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {log.entity_type}
                        {log.entity_id && (
                          <span className="text-muted-foreground ml-1">
                            ({log.entity_id.slice(0, 8)}...)
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {log.user_id ? `${log.user_id.slice(0, 8)}...` : "System"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {log.ip_address || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <LogDetailsDialog log={log} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-20">
          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      )}
    </div>
  );
};

const LogDetailsDialog = ({ log }: { log: AuditLog }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Audit Log Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Timestamp</p>
              <p className="font-medium">
                {format(new Date(log.created_at), "MMMM d, yyyy 'at' HH:mm:ss")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Action</p>
              <Badge>{log.action}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entity Type</p>
              <p className="font-medium">{log.entity_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entity ID</p>
              <p className="font-mono text-sm">{log.entity_id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{log.user_id || "System"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IP Address</p>
              <p className="font-mono text-sm">{log.ip_address || "N/A"}</p>
            </div>
          </div>

          {log.user_agent && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">User Agent</p>
              <p className="text-xs bg-muted p-2 rounded font-mono break-all">
                {log.user_agent}
              </p>
            </div>
          )}

          {log.old_values && Object.keys(log.old_values).length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Previous Values</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(log.old_values, null, 2)}
              </pre>
            </div>
          )}

          {log.new_values && Object.keys(log.new_values).length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">New Values</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(log.new_values, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Metadata</p>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogViewer;
