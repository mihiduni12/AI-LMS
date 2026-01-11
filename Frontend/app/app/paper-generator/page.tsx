"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Save, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generatePaper, savePaper, type PaperConfig, type GeneratedPaper } from "@/lib/paper-generator"
import { useRouter } from "next/navigation"

export default function PaperGeneratorPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [config, setConfig] = useState<PaperConfig>({
    medium: "english",
    difficulty: "medium",
    paperType: "full",
  })
  const [paper, setPaper] = useState<string>("")
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const generatedPaper = generatePaper(config)
    setPaper(generatedPaper)
    setGenerating(false)

    toast({
      title: "Paper Generated!",
      description: "Your A/L Physics exam paper is ready",
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paper)
    toast({
      title: "Copied!",
      description: "Paper copied to clipboard",
    })
  }

  const downloadTXT = () => {
    const blob = new Blob([paper], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `physics-paper-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Paper downloaded as TXT file",
    })
  }

  const downloadPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF generation simulation - Use TXT format instead",
    })
  }

  const saveDraft = () => {
    const draft: GeneratedPaper = {
      id: Date.now().toString(),
      config,
      content: paper,
      timestamp: new Date().toISOString(),
    }

    savePaper(draft)

    toast({
      title: "Saved!",
      description: "Paper saved to history",
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">A/L Physics Paper Generator</h1>
        <p className="text-muted-foreground">Generate structured exam papers for practice and assessment</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paper Configuration</CardTitle>
              <CardDescription>Customize your exam paper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Medium */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Medium</Label>
                <RadioGroup
                  value={config.medium}
                  onValueChange={(value) => setConfig({ ...config, medium: value as "english" | "sinhala" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="english" id="config-english" />
                    <Label htmlFor="config-english" className="font-normal cursor-pointer">
                      English
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sinhala" id="config-sinhala" />
                    <Label htmlFor="config-sinhala" className="font-normal cursor-pointer">
                      Sinhala (සිංහල)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Difficulty</Label>
                <RadioGroup
                  value={config.difficulty}
                  onValueChange={(value) => setConfig({ ...config, difficulty: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="diff-easy" />
                    <Label htmlFor="diff-easy" className="font-normal cursor-pointer">
                      Easy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="diff-medium" />
                    <Label htmlFor="diff-medium" className="font-normal cursor-pointer">
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="diff-hard" />
                    <Label htmlFor="diff-hard" className="font-normal cursor-pointer">
                      Hard
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Paper Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Paper Type</Label>
                <RadioGroup
                  value={config.paperType}
                  onValueChange={(value) => setConfig({ ...config, paperType: value as any })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="type-full" />
                    <Label htmlFor="type-full" className="font-normal cursor-pointer">
                      Full Paper
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mcq" id="type-mcq" />
                    <Label htmlFor="type-mcq" className="font-normal cursor-pointer">
                      MCQ Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="structured" id="type-structured" />
                    <Label htmlFor="type-structured" className="font-normal cursor-pointer">
                      Structured Essay Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="essay" id="type-essay" />
                    <Label htmlFor="type-essay" className="font-normal cursor-pointer">
                      Essay Only
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
            <FileText className="h-5 w-5 mr-2" />
            {generating ? "Generating..." : "Generate Paper"}
          </Button>

          {paper && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" onClick={copyToClipboard} className="w-full justify-start bg-transparent">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline" onClick={downloadTXT} className="w-full justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download as TXT
                </Button>
                <Button variant="outline" onClick={downloadPDF} className="w-full justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
                <Button variant="outline" onClick={saveDraft} className="w-full justify-start bg-transparent">
                  <Save className="h-4 w-4 mr-2" />
                  Save to History
                </Button>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" onClick={() => router.push("/app/paper-generator/history")} className="w-full">
            View Paper History
          </Button>
        </div>

        {/* Paper Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Paper Preview</CardTitle>
                  <CardDescription>
                    {paper ? "Generated paper ready for use" : "Configure and generate your paper"}
                  </CardDescription>
                </div>
                {paper && (
                  <div className="flex gap-2">
                    <Badge variant="outline">{config.medium === "english" ? "English" : "සිංහල"}</Badge>
                    <Badge variant="outline">{config.difficulty}</Badge>
                    <Badge variant="outline">{config.paperType}</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!paper ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Paper Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure your paper settings and click "Generate Paper" to create an A/L Physics exam paper
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-left max-w-md">
                    <p className="font-medium mb-2">Quick Tips:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Choose your preferred medium (English or Sinhala)</li>
                      <li>• Select difficulty level based on your needs</li>
                      <li>• Pick paper type or generate a full paper</li>
                      <li>• Generated papers are exam-standard quality</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-6 rounded-lg max-h-[700px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{paper}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
