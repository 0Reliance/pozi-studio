import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, BookmarkPlus, StickyNote } from "lucide-react";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function LessonViewer() {
  const [, params] = useRoute("/learn/:pathId/:lessonId");
  const pathId = params?.pathId ? parseInt(params.pathId) : 0;
  const lessonId = params?.lessonId ? parseInt(params.lessonId) : 0;

  const { user } = useAuth();
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<"insight" | "todo" | "question" | "code_snippet">("insight");

  const { data: pathData } = trpc.learner.paths.get.useQuery({ id: pathId });
  const { data: lesson } = trpc.learner.lessons.get.useQuery({ id: lessonId });
  const { data: progress } = trpc.learner.progress.get.useQuery({ pathId });
  const { data: notes } = trpc.learner.notes.list.useQuery({ lessonId });

  const markCompleteMutation = trpc.learner.progress.markComplete.useMutation();
  const markIncompleteMutation = trpc.learner.progress.markIncomplete.useMutation();
  const createNoteMutation = trpc.learner.notes.create.useMutation();
  const createBookmarkMutation = trpc.learner.bookmarks.create.useMutation();
  const utils = trpc.useUtils();

  const isCompleted = progress?.some(
    (p: any) => p.lesson.id === lessonId && p.progress?.status === "completed"
  );

  const handleToggleComplete = async () => {
    try {
      if (isCompleted) {
        await markIncompleteMutation.mutateAsync({ lessonId });
        toast.success("Marked as incomplete");
      } else {
        await markCompleteMutation.mutateAsync({ lessonId });
        toast.success("Lesson completed!");
      }
      utils.learner.progress.get.invalidate();
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        lessonId,
        type: noteType,
        title: noteType.charAt(0).toUpperCase() + noteType.slice(1),
        content: noteContent,
      });
      toast.success("Note created!");
      setNoteContent("");
      utils.learner.notes.list.invalidate();
    } catch (error) {
      toast.error("Failed to create note");
    }
  };

  const handleBookmark = async () => {
    try {
      await createBookmarkMutation.mutateAsync({
        resourceType: "lesson",
        resourceId: lessonId,
      });
      toast.success("Lesson bookmarked!");
    } catch (error) {
      toast.error("Failed to bookmark");
    }
  };

  if (!lesson || !pathData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const modules = pathData.modules || [];
  const allLessons = modules.flatMap((m: any) => m.lessons || []);
  const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Module/Lesson Navigation */}
      <div className="w-80 border-r border-border bg-card hidden lg:block">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="font-bold text-lg line-clamp-2">{pathData.title}</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-4">
            {modules.map((module: any) => (
              <div key={module.id}>
                <h3 className="font-semibold mb-2">{module.title}</h3>
                <div className="space-y-1">
                  {(module.lessons || []).map((l: any) => {
                    const isActive = l.id === lessonId;
                    const isLessonCompleted = progress?.some(
                      (p: any) => p.lesson.id === l.id && p.progress?.status === "completed"
                    );
                    return (
                      <Link key={l.id} href={`/learn/${pathId}/${l.id}`}>
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer ${
                            isActive ? "bg-accent" : ""
                          }`}
                        >
                          {isLessonCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm line-clamp-1">{l.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Lesson Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleComplete}
                  disabled={markCompleteMutation.isPending || markIncompleteMutation.isPending}
                >
                  <Checkbox checked={isCompleted} className="mr-2" />
                  Mark as complete
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBookmark}>
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Bookmark
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)}>
                  <StickyNote className="w-4 h-4 mr-2" />
                  Notes ({notes?.length || 0})
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Lesson Content */}
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-invert max-w-none">
                {lesson.contentBlocks ? (
                  <Streamdown>{typeof lesson.contentBlocks === 'string' ? lesson.contentBlocks : JSON.stringify(lesson.contentBlocks)}</Streamdown>
                ) : (
                  <p className="text-muted-foreground">No content available</p>
                )}
              </div>

              {/* Navigation */}
              <Separator className="my-8" />
              <div className="flex justify-between">
                {prevLesson ? (
                  <Link href={`/learn/${pathId}/${prevLesson.id}`}>
                    <Button variant="outline">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Lesson
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <Link href={`/learn/${pathId}/${nextLesson.id}`}>
                    <Button>
                      Next Lesson
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Notes Panel */}
          {showNotes && (
            <div className="w-96 border-l border-border bg-card p-6">
              <h3 className="font-bold mb-4">Notes</h3>
              <div className="space-y-4 mb-4">
                <Textarea
                  placeholder="Write your note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-background border border-border rounded-md px-3 py-2"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                  >
                    <option value="insight">💡 Insight</option>
                    <option value="todo">✅ Todo</option>
                    <option value="question">❓ Question</option>
                    <option value="code_snippet">💻 Code</option>
                  </select>
                  <Button onClick={handleCreateNote} disabled={createNoteMutation.isPending}>
                    Add Note
                  </Button>
                </div>
              </div>
              <Separator className="my-4" />
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3">
                  {notes?.map((note: any) => (
                    <Card key={note.id} className="p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {note.noteType === "insight"
                            ? "💡"
                            : note.noteType === "todo"
                            ? "✅"
                            : note.noteType === "question"
                            ? "❓"
                            : "💻"}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
