import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function BrowseCourses() {
  const { data: paths, isLoading } = trpc.learner.paths.listPublic.useQuery();
  const enrollMutation = trpc.learner.enrollments.enroll.useMutation();
  const utils = trpc.useUtils();

  const handleEnroll = async (pathId: number) => {
    try {
      await enrollMutation.mutateAsync({ pathId });
      toast.success("Enrolled successfully!");
      utils.learner.enrollments.list.invalidate();
    } catch (error) {
      toast.error("Failed to enroll");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  const publishedPaths = paths || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Browse Courses</h1>
              <p className="text-muted-foreground mt-1">Discover new learning paths</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">My Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {publishedPaths.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses available yet</h3>
              <p className="text-muted-foreground">Check back soon for new learning paths</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPaths.map((path: any) => (
              <Card key={path.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{path.difficulty || "Beginner"}</Badge>
                    {path.isPublic && <Badge variant="outline">Free</Badge>}
                  </div>
                  <CardTitle className="line-clamp-2">{path.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{path.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.estimatedHours || 0}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>0 enrolled</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleEnroll(path.id)}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                      </Button>
                      <Link href={`/preview/${path.id}`}>
                        <Button variant="outline">Preview</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
