import CreatorDashboardLayout from "@/components/CreatorDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  GripVertical,
  MoreVertical,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import ExportDialog from "@/components/ExportDialog";
import { SortableList } from "@/components/SortableList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function PathEditor() {
  const [, params] = useRoute("/creator/paths/:id");
  const pathId = params?.id ? parseInt(params.id) : null;

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [newModuleOpen, setNewModuleOpen] = useState(false);
  const [newModuleData, setNewModuleData] = useState({ title: "", slug: "", description: "" });

  const utils = trpc.useUtils();
  const { data: path, isLoading } = trpc.creator.paths.get.useQuery(
    { id: pathId! },
    { enabled: !!pathId }
  );

  const publishMutation = trpc.creator.paths.publish.useMutation({
    onSuccess: () => {
      utils.creator.paths.get.invalidate({ id: pathId! });
      toast.success("Publishing settings updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update publishing settings");
    },
  });

  const updatePathMutation = trpc.creator.paths.update.useMutation({
    onSuccess: () => {
      utils.creator.paths.get.invalidate({ id: pathId! });
      toast.success("Path updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update path");
    },
  });

  const handlePathUpdate = (data: any) => {
    updatePathMutation.mutate({ id: pathId!, ...data });
  };

  const createModuleMutation = trpc.creator.modules.create.useMutation({
    onSuccess: () => {
      utils.creator.paths.get.invalidate({ id: pathId! });
      setNewModuleOpen(false);
      setNewModuleData({ title: "", slug: "", description: "" });
      toast.success("Module created");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create module");
    },
  });

  const reorderModulesMutation = trpc.creator.modules.reorder.useMutation({
    onSuccess: () => {
      utils.creator.paths.get.invalidate({ id: pathId! });
      toast.success("Modules reordered");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder modules");
    },
  });

  const deleteModuleMutation = trpc.creator.modules.delete.useMutation({
    onSuccess: () => {
      utils.creator.paths.get.invalidate({ id: pathId! });
      setSelectedModuleId(null);
      toast.success("Module deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete module");
    },
  });

  const handleModuleTitleChange = (title: string) => {
    setNewModuleData({
      ...newModuleData,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    });
  };

  const handleCreateModule = () => {
    if (!newModuleData.title || !newModuleData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const moduleCount = path?.modules?.length || 0;
    createModuleMutation.mutate({
      pathId: pathId!,
      ...newModuleData,
      orderIndex: moduleCount,
    });
  };

  const handleDeleteModule = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete module "${title}"? This will also delete all lessons in this module.`)) {
      deleteModuleMutation.mutate({ id });
    }
  };

  if (!pathId) {
    return (
      <CreatorDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Invalid path ID</p>
        </div>
      </CreatorDashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <CreatorDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </CreatorDashboardLayout>
    );
  }

  if (!path) {
    return (
      <CreatorDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Path not found</p>
        </div>
      </CreatorDashboardLayout>
    );
  }

  return (
    <CreatorDashboardLayout>
      <div className="flex h-full">
        {/* Left Panel - Modules List */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          {/* Path Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold truncate">{path.title}</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                >
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={path.isPublished ? "default" : "secondary"}>
                {path.isPublished ? "Published" : "Draft"}
              </Badge>
              {path.difficultyLevel && (
                <Badge variant="outline">{path.difficultyLevel}</Badge>
              )}
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">MODULES</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewModuleOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {path.modules && path.modules.length > 0 ? (
              <SortableList
                items={path.modules}
                getId={(module) => module.id}
                onReorder={(reorderedModules) => {
                  // Update order indices and call reorder mutation
                  const moduleOrders = reorderedModules.map((mod, idx) => ({
                    id: mod.id,
                    orderIndex: idx,
                  }));
                  reorderModulesMutation.mutate({
                    pathId: pathId!,
                    moduleOrders,
                  });
                }}
                renderItem={(module, index) => (
                  <div
                    key={module.id}
                    className={`group flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedModuleId === module.id
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => setSelectedModuleId(module.id)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{module.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Module {index + 1}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id, module.title);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              />
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  No modules yet
                </p>
                <Button size="sm" onClick={() => setNewModuleOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Module
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Module/Lesson Content */}
        <div className="flex-1 overflow-auto">
          {selectedModuleId ? (
            <ModuleView
              pathId={pathId}
              moduleId={selectedModuleId}
              onSelectLesson={setSelectedLessonId}
              selectedLessonId={selectedLessonId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a module to edit</h3>
                <p className="text-muted-foreground">
                  Choose a module from the left panel or create a new one
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Settings (Collapsible) */}
        {showSettings && (
          <div className="w-80 border-l border-border bg-card overflow-auto">
            <PathSettings path={path} pathId={pathId!} onUpdate={handlePathUpdate} publishMutation={publishMutation} />
          </div>
        )}
      </div>

      {/* New Module Dialog */}
      <Dialog open={newModuleOpen} onOpenChange={setNewModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>
              Add a new module to organize your lessons
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                placeholder="e.g., Introduction to Docker"
                value={newModuleData.title}
                onChange={(e) => handleModuleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-slug">URL Slug *</Label>
              <Input
                id="module-slug"
                placeholder="e.g., introduction-to-docker"
                value={newModuleData.slug}
                onChange={(e) => setNewModuleData({ ...newModuleData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                placeholder="Brief description of this module..."
                rows={3}
                value={newModuleData.description}
                onChange={(e) => setNewModuleData({ ...newModuleData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewModuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule} disabled={createModuleMutation.isPending}>
              {createModuleMutation.isPending ? "Creating..." : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        pathId={pathId}
        pathTitle={path.title}
      />
    </CreatorDashboardLayout>
  );
}

// Module View Component
function ModuleView({
  pathId,
  moduleId,
  onSelectLesson,
  selectedLessonId,
}: {
  pathId: number;
  moduleId: number;
  onSelectLesson: (id: number | null) => void;
  selectedLessonId: number | null;
}) {
  const [newLessonOpen, setNewLessonOpen] = useState(false);
  const [newLessonData, setNewLessonData] = useState({ title: "", slug: "" });

  const utils = trpc.useUtils();
  const { data: module } = trpc.creator.modules.get.useQuery({ id: moduleId });

  const createLessonMutation = trpc.creator.lessons.create.useMutation({
    onSuccess: () => {
      utils.creator.modules.get.invalidate({ id: moduleId });
      utils.creator.paths.get.invalidate({ id: pathId! });
      setNewLessonOpen(false);
      setNewLessonData({ title: "", slug: "" });
      toast.success("Lesson created");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create lesson");
    },
  });

  const reorderLessonsMutation = trpc.creator.lessons.reorder.useMutation({
    onSuccess: () => {
      utils.creator.modules.get.invalidate({ id: moduleId });
      utils.creator.paths.get.invalidate({ id: pathId! });
      toast.success("Lessons reordered");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder lessons");
    },
  });

  const deleteLessonMutation = trpc.creator.lessons.delete.useMutation({
    onSuccess: () => {
      utils.creator.modules.get.invalidate({ id: moduleId });
      utils.creator.paths.get.invalidate({ id: pathId! });
      onSelectLesson(null);
      toast.success("Lesson deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete lesson");
    },
  });

  const handleLessonTitleChange = (title: string) => {
    setNewLessonData({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    });
  };

  const handleCreateLesson = () => {
    if (!newLessonData.title || !newLessonData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const lessonCount = module?.lessons?.length || 0;
    createLessonMutation.mutate({
      moduleId,
      ...newLessonData,
      contentBlocks: [],
      orderIndex: lessonCount,
    });
  };

  const handleDeleteLesson = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete lesson "${title}"?`)) {
      deleteLessonMutation.mutate({ id });
    }
  };

  if (!module) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Module Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
        {module.description && (
          <p className="text-muted-foreground">{module.description}</p>
        )}
      </div>

      <Separator className="my-6" />

      {/* Lessons Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lessons</h3>
          <Button onClick={() => setNewLessonOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </div>

        {module.lessons && module.lessons.length > 0 ? (
          <SortableList
            items={module.lessons}
            getId={(lesson) => lesson.id}
            onReorder={(reorderedLessons) => {
              const lessonOrders = reorderedLessons.map((les, idx) => ({
                id: les.id,
                orderIndex: idx,
              }));
              reorderLessonsMutation.mutate({
                moduleId,
                lessonOrders,
              });
            }}
            renderItem={(lesson, index) => (
              <Card
                key={lesson.id}
                className={`cursor-pointer transition-colors ${
                  selectedLessonId === lesson.id ? "border-primary" : ""
                }`}
                onClick={() => {
                  onSelectLesson(lesson.id);
                  window.location.href = `/creator/lessons/${lesson.id}`;
                }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{lesson.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Lesson {index + 1} • {lesson.estimatedMinutes || 0} min
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLesson(lesson.id, lesson.title);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            )}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No lessons yet</p>
              <Button onClick={() => setNewLessonOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Lesson
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Lesson Dialog */}
      <Dialog open={newLessonOpen} onOpenChange={setNewLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
            <DialogDescription>
              Add a new lesson to this module
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Title *</Label>
              <Input
                id="lesson-title"
                placeholder="e.g., What is Docker?"
                value={newLessonData.title}
                onChange={(e) => handleLessonTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-slug">URL Slug *</Label>
              <Input
                id="lesson-slug"
                placeholder="e.g., what-is-docker"
                value={newLessonData.slug}
                onChange={(e) => setNewLessonData({ ...newLessonData, slug: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewLessonOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLesson} disabled={createLessonMutation.isPending}>
              {createLessonMutation.isPending ? "Creating..." : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Path Settings Component
function PathSettings({
  path,
  pathId,
  onUpdate,
  publishMutation,
}: {
  path: any;
  pathId: number;
  onUpdate: (data: any) => void;
  publishMutation: any;
}) {
  const [localPath, setLocalPath] = useState(path);

  useEffect(() => {
    setLocalPath(path);
  }, [path]);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Path Settings</h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="path-title">Title</Label>
          <Input
            id="path-title"
            value={localPath.title}
            onChange={(e) => setLocalPath({ ...localPath, title: e.target.value })}
            onBlur={() => onUpdate({ title: localPath.title })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="path-description">Description</Label>
          <Textarea
            id="path-description"
            rows={4}
            value={localPath.description || ""}
            onChange={(e) => setLocalPath({ ...localPath, description: e.target.value })}
            onBlur={() => onUpdate({ description: localPath.description })}
          />
        </div>

        <div className="space-y-2">                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Publishing</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="published">Published</Label>
                        <p className="text-xs text-muted-foreground">
                          Make this path visible to learners
                        </p>
                      </div>
                      <Switch
                        id="published"
                        checked={path.isPublished}
                        onCheckedChange={(checked) => {
                          publishMutation.mutate({
                            id: pathId,
                            isPublished: checked,
                            isPublic: path.isPublic,
                            gatingStrategy: path.gatingStrategy || "none",
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="public">Public Access</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow anyone to enroll without login
                        </p>
                      </div>
                      <Switch
                        id="public"
                        checked={path.isPublic}
                        onCheckedChange={(checked) => {
                          publishMutation.mutate({
                            id: pathId,
                            isPublished: path.isPublished,
                            isPublic: checked,
                            gatingStrategy: path.gatingStrategy || "none",
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gating">Content Gating</Label>
                      <Select
                        value={path.gatingStrategy || "none"}
                        onValueChange={(value: any) => {
                          publishMutation.mutate({
                            id: pathId,
                            isPublished: path.isPublished,
                            isPublic: path.isPublic,
                            gatingStrategy: value,
                          });
                        }}
                      >
                        <SelectTrigger id="gating">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Gating</SelectItem>
                          <SelectItem value="signup_required">Signup Required</SelectItem>
                          <SelectItem value="partial_free">First 3 Lessons Free</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Control how content is accessed
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  
                  <Label htmlFor="difficulty">Difficulty Level</Label>         <Select
            value={localPath.difficultyLevel || "beginner"}
            onValueChange={(value) => {
              setLocalPath({ ...localPath, difficultyLevel: value });
              onUpdate({ difficulty: value });
            }}
          >
            <SelectTrigger id="path-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Publishing</h4>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="published">Published</Label>
              <p className="text-xs text-muted-foreground">
                Make this path visible to learners
              </p>
            </div>
            <Switch
              id="published"
              checked={localPath.isPublished}
              onCheckedChange={(checked) => {
                setLocalPath({ ...localPath, isPublished: checked });
                onUpdate({ isPublished: checked });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public">Public</Label>
              <p className="text-xs text-muted-foreground">
                Anyone can view this path
              </p>
            </div>
            <Switch
              id="public"
              checked={localPath.isPublic}
              onCheckedChange={(checked) => {
                setLocalPath({ ...localPath, isPublic: checked });
                onUpdate({ isPublic: checked });
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Statistics</Label>
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              Views: <span className="text-foreground">{path.viewCount || 0}</span>
            </p>
            <p className="text-muted-foreground">
              Enrollments: <span className="text-foreground">{path.enrollmentCount || 0}</span>
            </p>
            <p className="text-muted-foreground">
              Created: <span className="text-foreground">{new Date(path.createdAt).toLocaleDateString()}</span>
            </p>
            <p className="text-muted-foreground">
              Updated: <span className="text-foreground">{new Date(path.updatedAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
