import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Users, Sparkles, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.role === "creator" || user.role === "learner") {
        setLocation("/creator/dashboard");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              POZI STUDIO
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-Powered Learning Management System for Modern Educators
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur">
              <BookOpen className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Rich Content Creation</h3>
              <p className="text-sm text-muted-foreground">
                Build interactive lessons with our powerful editor, YouTube embeds, and code blocks
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur">
              <Users className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Student Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor learner engagement and completion rates across all your courses
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur">
              <Sparkles className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">AI-Assisted Tools</h3>
              <p className="text-sm text-muted-foreground">
                Leverage AI for video analysis, content generation, and intelligent insights
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 mt-12">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => setLocation("/creator/dashboard")}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container max-w-7xl text-center text-sm text-muted-foreground">
          <p>© 2025 POZI STUDIO. Built with ❤️ for educators and learners.</p>
        </div>
      </footer>
    </div>
  );
}
