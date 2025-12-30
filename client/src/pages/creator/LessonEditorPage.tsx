import CreatorDashboardLayout from "@/components/CreatorDashboardLayout";
import LessonEditor from "@/components/LessonEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function LessonEditorPage() {
  const [, params] = useRoute("/creator/lessons/:id");
  const [, setLocation] = useLocation();
  const lessonId = params?.id ? parseInt(params.id) : null;

  const [lessonData, setLessonData] = useState({
    title: "",
    slug: "",
    estimatedMinutes: 0,
    content: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const utils = trpc.useUtils();
  const { data: lesson, isLoading } = trpc.creator.lessons.get.useQuery(
    { id: lessonId! },
    { enabled: !!lessonId }
  );

  const updateMutation = trpc.creator.lessons.update.useMutation({
    onSuccess: () => {
      utils.creator.lessons.get.invalidate({ id: lessonId! });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success("Lesson saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save lesson");
    },
  });

  const autosaveMutation = trpc.creator.lessons.autosave.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    },
    onError: (error) => {
      console.error("Autosave failed:", error);
    },
  });

  useEffect(() => {
    if (lesson) {
      // Extract HTML content from contentBlocks
      const htmlContent = (lesson.contentBlocks || [])
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.content.html)
        .join("");

      setLessonData({
        title: lesson.title,
        slug: lesson.slug,
        estimatedMinutes: lesson.estimatedMinutes || 0,
        content: htmlContent || "",
      });
    }
  }, [lesson]);

  const handleSave = () => {
    if (!lessonId) return;

    // Convert HTML content back to contentBlocks format
    const contentBlocks = [
      {
        id: "main-content",
        type: "text" as const,
        order: 0,
        content: {
          html: lessonData.content,
        },
      },
    ];

    updateMutation.mutate({
      id: lessonId,
      title: lessonData.title,
      slug: lessonData.slug,
      estimatedMinutes: lessonData.estimatedMinutes,
      contentBlocks,
    });
  };

  const handleAutoSave = () => {
    if (!lessonId || !hasUnsavedChanges) return;

    const contentBlocks = [
      {
        id: "main-content",
        type: "text" as const,
        order: 0,
        content: {
          html: lessonData.content,
        },
      },
    ];

    autosaveMutation.mutate({
      id: lessonId,
      contentBlocks,
    });
  };

  const handleContentChange = (html: string) => {
    setLessonData({ ...lessonData, content: html });
    setHasUnsavedChanges(true);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  if (!lessonId) {
    return (
      <CreatorDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Invalid lesson ID</p>
        </div>
      </CreatorDashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <CreatorDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </CreatorDashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <CreatorDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Lesson not found</p>
        </div>
      </CreatorDashboardLayout>
    );
  }

  return (
    <CreatorDashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container max-w-7xl py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">{lessonData.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {hasUnsavedChanges ? (
                      <span className="text-amber-500">Unsaved changes</span>
                    ) : lastSaved ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    ) : (
                      "No changes"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button onClick={() => toast.info("Preview feature coming soon")}>
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="border-b border-border bg-card">
          <div className="container max-w-7xl py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={lessonData.title}
                  onChange={(e) => {
                    setLessonData({ ...lessonData, title: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-slug">URL Slug</Label>
                <Input
                  id="lesson-slug"
                  value={lessonData.slug}
                  onChange={(e) => {
                    setLessonData({ ...lessonData, slug: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-minutes">Estimated Minutes</Label>
                <Input
                  id="estimated-minutes"
                  type="number"
                  min="0"
                  value={lessonData.estimatedMinutes}
                  onChange={(e) => {
                    setLessonData({ ...lessonData, estimatedMinutes: parseInt(e.target.value) || 0 });
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <LessonEditor
            content={lessonData.content}
            onChange={handleContentChange}
            onSave={handleAutoSave}
            autoSave={true}
          />
        </div>
      </div>
    </CreatorDashboardLayout>
  );
}
