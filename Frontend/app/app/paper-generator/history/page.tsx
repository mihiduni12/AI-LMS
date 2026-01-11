"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, FileText, Calendar, Clock } from "lucide-react"
import { getPapers, deletePaper, type GeneratedPaper } from "@/lib/paper-generator"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PaperHistoryPage() {
  const { toast } = useToast()
  const [papers, setPapers] = useState<GeneratedPaper[]>([])
  const [selectedPaper, setSelectedPaper] = useState<GeneratedPaper | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null)

  useEffect(() => {
    setPapers(getPapers())
  }, [])

  const handleView = (paper: GeneratedPaper) => {
    setSelectedPaper(paper)
  }

  const handleDelete = (id: string) => {
    setPaperToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (paperToDelete) {
      deletePaper(paperToDelete)
      setPapers(getPapers())
      if (selectedPaper?.id === paperToDelete) {
        setSelectedPaper(null)
      }
      toast({
        title: "Deleted!",
        description: "Paper removed from history",
      })
    }
    setDeleteDialogOpen(false)
    setPaperToDelete(null)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Paper History</h1>
        <p className="text-muted-foreground">View and manage your generated exam papers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Papers List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Saved Papers</CardTitle>
              <CardDescription>{papers.length} papers saved</CardDescription>
            </CardHeader>
            <CardContent>
              {papers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No papers saved yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Generate papers from the Paper Generator</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {papers
                    .slice()
                    .reverse()
                    .map((paper) => (
                      <div
                        key={paper.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedPaper?.id === paper.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-border hover:border-blue-300"
                        }`}
                        onClick={() => handleView(paper)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {paper.config.medium === "english" ? "English" : "සිංහල"}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {paper.config.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium capitalize">{paper.config.paperType} Paper</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(paper.timestamp)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(paper.timestamp)}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 bg-transparent"
                            onClick={() => handleView(paper)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(paper.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Paper Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Paper Content</CardTitle>
                  <CardDescription>{selectedPaper ? "Viewing saved paper" : "Select a paper to view"}</CardDescription>
                </div>
                {selectedPaper && (
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedPaper.config.medium === "english" ? "English" : "සිංහල"}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {selectedPaper.config.difficulty}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {selectedPaper.config.paperType}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedPaper ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Paper Selected</h3>
                  <p className="text-muted-foreground">
                    Click on a paper from the list to view its content, or generate a new paper from the Paper Generator
                  </p>
                </div>
              ) : (
                <div className="bg-muted p-6 rounded-lg max-h-[700px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{selectedPaper.content}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Paper?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the paper from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
