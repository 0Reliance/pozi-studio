import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FileText, BookOpen, GraduationCap, Newspaper, Loader2, CheckCircle2 } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathId: number;
  pathTitle: string;
}

const templates = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, distraction-free layout perfect for documentation",
    icon: FileText,
    features: ["Single page", "Clean typography", "Fast loading"],
  },
  {
    id: "documentation",
    name: "Documentation",
    description: "Technical documentation style with sidebar navigation",
    icon: BookOpen,
    features: ["Sidebar nav", "Search", "Code highlighting"],
  },
  {
    id: "course",
    name: "Course",
    description: "Full-featured course website with progress tracking",
    icon: GraduationCap,
    features: ["Module navigation", "Progress bars", "Interactive"],
  },
  {
    id: "blog",
    name: "Blog",
    description: "Blog-style layout with chronological content flow",
    icon: Newspaper,
    features: ["Card layout", "Timestamps", "Social sharing"],
  },
];

export default function ExportDialog({ open, onOpenChange, pathId, pathTitle }: ExportDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const createExportMutation = trpc.export.create.useMutation();

  const handleExport = async () => {
    setExporting(true);
    setExportComplete(false);

    try {
      await createExportMutation.mutateAsync({
        pathId,
        template: selectedTemplate as any,
        includeAssets: true,
      });

      setExportComplete(true);
      toast.success("Export completed successfully!");

      // Close dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        setExporting(false);
        setExportComplete(false);
      }, 2000);
    } catch (error) {
      toast.error("Export failed. Please try again.");
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Course</DialogTitle>
          <DialogDescription>
            Export "{pathTitle}" as a standalone HTML website. Choose a template and we'll generate a
            production-ready site.
          </DialogDescription>
        </DialogHeader>

        {!exporting && !exportComplete && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {template.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={createExportMutation.isPending}>
                {createExportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  "Export Course"
                )}
              </Button>
            </div>
          </>
        )}

        {exporting && !exportComplete && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating your export...</h3>
            <p className="text-muted-foreground text-center">
              This may take a few moments. We're bundling your content and assets.
            </p>
          </div>
        )}

        {exportComplete && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Complete!</h3>
            <p className="text-muted-foreground text-center">
              Your course has been exported successfully. Check the Exports page to download it.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
