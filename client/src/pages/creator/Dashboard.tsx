import { useAuth } from "@/_core/hooks/useAuth";
import CreatorDashboardLayout from "@/components/CreatorDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, FileVideo, Image, Plus, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { data: paths, isLoading: pathsLoading } = trpc.creator.paths.list.useQuery();

  const totalPaths = paths?.length || 0;
  const publishedPaths = paths?.filter(p => p.isPublished).length || 0;
  const totalEnrollments = paths?.reduce((sum, p) => sum + (p.enrollmentCount || 0), 0) || 0;

  return (
    <CreatorDashboardLayout>
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || "Creator"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your learning paths, create engaging content, and track your impact.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paths</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPaths}</div>
              <p className="text-xs text-muted-foreground">
                {publishedPaths} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Total learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Files</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with creating and managing your content
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/creator/paths/new">
              <Button className="w-full h-auto flex-col gap-2 py-6" variant="outline">
                <Plus className="h-6 w-6" />
                <span>New Learning Path</span>
              </Button>
            </Link>

            <Link href="/creator/media">
              <Button className="w-full h-auto flex-col gap-2 py-6" variant="outline">
                <Image className="h-6 w-6" />
                <span>Upload Media</span>
              </Button>
            </Link>

            <Link href="/creator/video-intelligence">
              <Button className="w-full h-auto flex-col gap-2 py-6" variant="outline">
                <FileVideo className="h-6 w-6" />
                <span>Analyze Video</span>
              </Button>
            </Link>

            <Link href="/creator/analytics">
              <Button className="w-full h-auto flex-col gap-2 py-6" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Paths */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Learning Paths</CardTitle>
            <CardDescription>
              Your most recently updated paths
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pathsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : paths && paths.length > 0 ? (
              <div className="space-y-4">
                {paths.slice(0, 5).map((path) => (
                  <Link key={path.id} href={`/creator/paths/${path.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium">{path.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {path.isPublished ? "Published" : "Draft"} • Updated{" "}
                          {new Date(path.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {path.enrollmentCount || 0} enrolled
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't created any learning paths yet.
                </p>
                <Link href="/creator/paths/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Path
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CreatorDashboardLayout>
  );
}
