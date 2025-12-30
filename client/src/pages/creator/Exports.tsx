import CreatorDashboardLayout from "@/components/CreatorDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Loader2, Trash2, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function Exports() {
  const utils = trpc.useUtils();
  const { data: exports, isLoading } = trpc.export.list.useQuery();

  const deleteExportMutation = trpc.export.delete.useMutation({
    onSuccess: () => {
      utils.export.list.invalidate();
      toast.success("Export deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete export");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this export?")) {
      deleteExportMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "building":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Building
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <CreatorDashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Exports</h1>
          <p className="text-muted-foreground">
            Manage your exported course websites. Download or delete previous exports.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : exports && exports.length > 0 ? (
          <div className="grid gap-4">
            {exports.map((exportJob) => (
              <Card key={exportJob.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Export #{exportJob.id}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(exportJob.createdAt), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(exportJob.exportStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Export Type</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {exportJob.exportType.replace(/_/g, " ")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {exportJob.exportStatus === "completed" && exportJob.exportUrl && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(exportJob.exportUrl!, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              // Create a temporary link to download
                              const link = document.createElement("a");
                              link.href = exportJob.exportUrl!;
                              link.download = `export-${exportJob.id}.html`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast.success("Download started");
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}

                      {exportJob.exportStatus === "failed" && exportJob.buildLog && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.error(exportJob.buildLog || "Export failed");
                          }}
                        >
                          View Error
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(exportJob.id)}
                        disabled={deleteExportMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No exports yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Export your courses as standalone HTML websites from the Path Editor
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CreatorDashboardLayout>
  );
}
