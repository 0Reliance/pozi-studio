import CreatorDashboardLayout from "@/components/CreatorDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { trpc } from "@/lib/trpc";
import { Copy, Eye, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function LearningPaths() {
  const [, setLocation] = useLocation();
  const [newPathOpen, setNewPathOpen] = useState(false);
  const [newPathData, setNewPathData] = useState({
    title: "",
    slug: "",
    description: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
  });

  const utils = trpc.useUtils();
  const { data: paths, isLoading } = trpc.creator.paths.list.useQuery();
  
  const createMutation = trpc.creator.paths.create.useMutation({
    onSuccess: (data) => {
      utils.creator.paths.list.invalidate();
      setNewPathOpen(false);
      setNewPathData({ title: "", slug: "", description: "", difficulty: "beginner" });
      toast.success("Learning path created!");
      setLocation(`/creator/paths/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create path");
    },
  });

  const deleteMutation = trpc.creator.paths.delete.useMutation({
    onSuccess: () => {
      utils.creator.paths.list.invalidate();
      toast.success("Learning path deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete path");
    },
  });

  const duplicateMutation = trpc.creator.paths.duplicate.useMutation({
    onSuccess: (data) => {
      utils.creator.paths.list.invalidate();
      toast.success("Learning path duplicated!");
      setLocation(`/creator/paths/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate path");
    },
  });

  const handleCreatePath = () => {
    if (!newPathData.title || !newPathData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    createMutation.mutate(newPathData);
  };

  const handleTitleChange = (title: string) => {
    setNewPathData({
      ...newPathData,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <CreatorDashboardLayout>
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learning Paths</h1>
            <p className="text-muted-foreground">
              Create and manage your course content
            </p>
          </div>

          <Dialog open={newPathOpen} onOpenChange={setNewPathOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New Learning Path
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Learning Path</DialogTitle>
                <DialogDescription>
                  Start building a new course. You can add modules and lessons after creation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Docker Mastery"
                    value={newPathData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., docker-mastery"
                    value={newPathData.slug}
                    onChange={(e) => setNewPathData({ ...newPathData, slug: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title. Used in URLs.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what learners will achieve..."
                    rows={4}
                    value={newPathData.description}
                    onChange={(e) => setNewPathData({ ...newPathData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={newPathData.difficulty}
                    onValueChange={(value: any) => setNewPathData({ ...newPathData, difficulty: value })}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNewPathOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePath} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Path"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Paths Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paths && paths.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => (
              <Card key={path.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{path.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {path.description || "No description"}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/creator/paths/${path.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateMutation.mutate({ id: path.id })}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(path.id, path.title)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={path.isPublished ? "default" : "secondary"}>
                      {path.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {path.difficultyLevel && (
                      <Badge variant="outline">{path.difficultyLevel}</Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between w-full">
                    <span>{path.enrollmentCount || 0} enrolled</span>
                    <span>Updated {new Date(path.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You haven't created any learning paths yet.
              </p>
              <Button onClick={() => setNewPathOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Path
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CreatorDashboardLayout>
  );
}
