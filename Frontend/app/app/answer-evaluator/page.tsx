"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, Copy, Download, RotateCcw, Upload, FileText, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { HintGenerator } from "@/components/hint-generator"
import {
  calculateGrade,
  getPerformanceBand,
  saveEvaluation,
  type EvaluationResult,
  type SectionResult,
} from "@/lib/evaluation"
import { getPapers, type GeneratedPaper } from "@/lib/paper-generator"

type Medium = "english" | "sinhala"

export default function AnswerEvaluatorPage() {
  const { toast } = useToast()
  const [medium, setMedium] = useState<Medium>("english")
  const [totalMarks, setTotalMarks] = useState("100")

  const [step, setStep] = useState<"select" | "evaluate">("select")
  const [selectedPaper, setSelectedPaper] = useState<GeneratedPaper | null>(null)
  const [savedPapers, setSavedPapers] = useState<GeneratedPaper[]>([])

  const [studentAnswer, setStudentAnswer] = useState("")

  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [showHints, setShowHints] = useState(false)

  useState(() => {
    setSavedPapers(getPapers())
  })

  const handleFileUpload = () => {
    toast({
      title: "File Upload",
      description: "PDF upload simulation - This is a frontend-only demo",
    })
  }

  const handlePaperSelect = (paper: GeneratedPaper) => {
    setSelectedPaper(paper)
    setMedium(paper.config.medium)
    setStep("evaluate")
  }

  const handleSkipPaperSelection = () => {
    setSelectedPaper(null)
    setStep("evaluate")
  }

  const handleEvaluate = async () => {
    if (!studentAnswer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your answer to evaluate",
        variant: "destructive",
      })
      return
    }

    setEvaluating(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = generateMockEvaluation(studentAnswer, Number.parseInt(totalMarks), medium)
    setEvaluation(result)
    saveEvaluation(result)
    setEvaluating(false)
  }

  const generateMockEvaluation = (student: string, maxScore: number, medium: Medium): EvaluationResult => {
    const score = Math.floor(maxScore * (0.55 + Math.random() * 0.35)) // 55-90% range
    const percentage = (score / maxScore) * 100

    const sections: SectionResult[] = [
      {
        section: medium === "english" ? "Part A: Multiple Choice" : "කොටස A: බහු තෝරා",
        score: Math.floor(maxScore * 0.2 * 0.8),
        maxScore: Math.floor(maxScore * 0.2),
        details: medium === "english" ? "8 out of 10 correct" : "10න් 8ක් නිවැරදියි",
      },
      {
        section: medium === "english" ? "Part B: Structured Questions" : "කොටස B: ව්‍යුහගත ප්‍රශ්න",
        score: Math.floor(maxScore * 0.5 * 0.75),
        maxScore: Math.floor(maxScore * 0.5),
        details:
          medium === "english" ? "Good understanding with minor calculation errors" : "සුළු ගණනය කිරීම් දෝෂ සමඟ හොඳ අවබෝධයක්",
      },
      {
        section: medium === "english" ? "Part C: Essay Questions" : "කොටස C: රචනා ප්‍රශ්න",
        score: Math.floor(maxScore * 0.3 * 0.65),
        maxScore: Math.floor(maxScore * 0.3),
        details:
          medium === "english"
            ? "Concepts explained but lacks depth in some areas"
            : "සංකල්ප පැහැදිලි කර ඇති නමුත් සමහර ක්ෂේත්‍රවල ගැඹුර නොමැත",
      },
    ]

    const strengths =
      medium === "english"
        ? [
            "Strong understanding of fundamental concepts",
            "Correct application of formulas in most cases",
            "Clear logical reasoning in problem-solving",
            "Good diagram presentation where applicable",
          ]
        : [
            "මූලික සංකල්ප පිළිබඳ ශක්තිමත් අවබෝධයක්",
            "බොහෝ අවස්ථාවන්හිදී සූත්‍ර නිවැරදිව යෙදීම",
            "ගැටලු විසඳීමේදී පැහැදිලි තාර්කික චින්තනය",
            "අදාළ තැන්වල හොඳ රූප සටහන් ඉදිරිපත් කිරීම",
          ]

    const weaknesses =
      medium === "english"
        ? [
            "Minor calculation errors in numerical problems",
            "Some key points missing in essay answers",
            "Could provide more detailed explanations",
            "Unit conversions need more attention",
          ]
        : [
            "සංඛ්‍යාත්මක ගැටලුවල සුළු ගණනය කිරීම් දෝෂ",
            "රචනා පිළිතුරු වල සමහර ප්‍රධාන කරුණු අතුරුදහන්",
            "වඩාත් විස්තරාත්මක පැහැදිලි කිරීම් සැපයිය හැකිය",
            "ඒකක පරිවර්තන සඳහා වැඩි අවධානයක් අවශ්‍යයි",
          ]

    const feedback =
      medium === "english"
        ? `**Overall Performance:**

Your answer demonstrates a solid understanding of A/L Physics concepts, achieving ${percentage.toFixed(1)}% (${score}/${maxScore}). This is a ${getPerformanceBand(percentage).toLowerCase()} performance.

**Detailed Analysis:**

1. **Conceptual Understanding:** You have shown good grasp of the theoretical aspects. Your explanations include relevant definitions and principles.

2. **Problem-Solving Skills:** Your approach to numerical problems is generally correct. However, pay attention to calculation accuracy and intermediate steps.

3. **Presentation:** The structure of your answers is clear, but some sections could benefit from more detailed explanations and examples.

**Recommendations for Improvement:**

- Review calculation techniques and practice more numerical problems
- Include all key points from the marking scheme in essay-type answers
- Draw diagrams and graphs where appropriate to support your explanations
- Always show your working clearly, even for simple calculations
- Double-check units and conversions before finalizing answers

**Areas of Excellence:**

${strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

**Focus Areas:**

${weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}

Keep practicing and focus on the areas mentioned above. Your foundation is strong, and with attention to detail, you can achieve excellent results in your A/L examination.`
        : `**සමස්ත කාර්ය සාධනය:**

ඔබේ පිළිතුර A/L භෞතික විද්‍යා සංකල්ප පිළිබඳ ස්ථිර අවබෝධයක් පෙන්නුම් කරයි, ${percentage.toFixed(1)}% (${score}/${maxScore}) ලබා ගනී. මෙය ${getPerformanceBand(percentage).toLowerCase()} කාර්ය සාධනයකි.

**විස්තරාත්මක විශ්ලේෂණය:**

1. **සංකල්පමය අවබෝධය:** ඔබ න්‍යායාත්මක අංශ පිළිබඳ හොඳ අවබෝධයක් පෙන්වා දී ඇත. ඔබගේ පැහැදිලි කිරීම්වල අදාළ නිර්වචන සහ මූලධර්ම ඇතුළත් වේ.

2. **ගැටලු විසඳීමේ කුසලතා:** සංඛ්‍යාත්මක ගැටලු සඳහා ඔබගේ ප්‍රවේශය සාමාන්‍යයෙන් නිවැරදියි. කෙසේ වෙතත්, ගණනය කිරීමේ නිරවද්‍යතාවය සහ අතරමැදි පියවර කෙරෙහි අවධානය යොමු කරන්න.

3. **ඉදිරිපත් කිරීම:** ඔබේ පිළිතුරුවල ව්‍යුහය පැහැදිලියි, නමුත් සමහර කොටස් වඩාත් විස්තරාත්මක පැහැදිලි කිරීම් සහ උදාහරණ වලින් ප්‍රයෝජන ලබා ගත හැකිය.

**වැඩි දියුණු කිරීම සඳහා නිර්දේශ:**

- ගණනය කිරීමේ ශිල්පීය ක්‍රම සමාලෝචනය කර වැඩි සංඛ්‍යාත්මක ගැටලු පුහුණු කරන්න
- රචනා වර්ගයේ පිළිතුරුවල ලකුණු සටහනෙන් සියලුම ප්‍රධාන කරුණු ඇතුළත් කරන්න
- ඔබේ පැහැදිලි කිරීම් සඳහා සහාය වීමට අදාළ තැන්වල රූප සටහන් සහ ප්‍රස්ථාර අඳින්න
- සරල ගණනය කිරීම් සඳහා වුවද ඔබේ ක්‍රියා කිරීම පැහැදිලිව පෙන්වන්න
- පිළිතුරු අවසන් කිරීමට පෙර ඒකක සහ පරිවර්තන දෙ වරක් පරීක්ෂා කරන්න

**විශිෂ්ටතා ක්ෂේත්‍ර:**

${strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

**අවධානය යොමු කළ යුතු ක්ෂේත්‍ර:**

${weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}

පුහුණු වීම දිගටම කරගෙන යන්න සහ ඉහත සඳහන් කරන ලද ක්ෂේත්‍ර කෙරෙහි අවධානය යොමු කිරීමෙන්, ඔබට ඔබේ A/L විභාගයේදී විශිෂ්ට ප්‍රතිඵල ලබා ගත හැකිය.`

    return {
      totalScore: score,
      maxScore,
      percentage,
      grade: calculateGrade(percentage),
      performanceBand: getPerformanceBand(percentage),
      sections,
      strengths,
      weaknesses,
      feedback,
    }
  }

  const copyFeedback = () => {
    if (evaluation) {
      navigator.clipboard.writeText(evaluation.feedback)
      toast({
        title: "Copied!",
        description: "Feedback copied to clipboard",
      })
    }
  }

  const downloadReport = () => {
    toast({
      title: "Download Started",
      description: "Evaluation report download simulation",
    })
  }

  const reset = () => {
    setStudentAnswer("")
    setEvaluation(null)
    setShowHints(false)
    setStep("select")
    setSelectedPaper(null)
  }

  if (step === "select") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Answer Evaluator</h1>
          <p className="text-muted-foreground">Choose a paper to evaluate or skip to enter your answer directly</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Saved Papers */}
          <Card>
            <CardHeader>
              <CardTitle>Select from Generated Papers</CardTitle>
              <CardDescription>Choose a paper you've previously generated</CardDescription>
            </CardHeader>
            <CardContent>
              {savedPapers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-2">No saved papers found</p>
                  <p className="text-sm text-muted-foreground">
                    Generate papers from the Paper Generator to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {savedPapers.map((paper) => (
                    <Card
                      key={paper.id}
                      className="cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => handlePaperSelect(paper)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">
                                {paper.config.medium === "english" ? "English" : "සිංහල"} •{" "}
                                {paper.config.difficulty.charAt(0).toUpperCase() + paper.config.difficulty.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {paper.config.paperType === "full"
                                ? "Full Paper"
                                : paper.config.paperType === "mcq"
                                  ? "MCQ Only"
                                  : paper.config.paperType === "structured"
                                    ? "Structured Questions"
                                    : "Essay Questions"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(paper.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skip Option */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluate Any Answer</CardTitle>
              <CardDescription>Skip paper selection and evaluate your answer directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Don't have a generated paper? No problem!</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Skip this step and paste your answer for evaluation with detailed feedback and hints.
                </p>
                <Button onClick={handleSkipPaperSelection} size="lg" className="w-full">
                  Skip & Enter Answer
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Answer Evaluator</h1>
        <p className="text-muted-foreground">Get your Physics answers evaluated with detailed examiner feedback</p>
        {selectedPaper && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">
              <FileText className="h-3 w-3 mr-1" />
              Selected Paper: {selectedPaper.config.medium === "english" ? "English" : "සිංහල"} •{" "}
              {selectedPaper.config.difficulty.charAt(0).toUpperCase() + selectedPaper.config.difficulty.slice(1)}
            </Badge>
          </div>
        )}
      </div>

      {!evaluation ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set evaluation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medium</Label>
                <RadioGroup value={medium} onValueChange={(value) => setMedium(value as Medium)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="english" id="medium-english" />
                    <Label htmlFor="medium-english" className="font-normal cursor-pointer">
                      English
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sinhala" id="medium-sinhala" />
                    <Label htmlFor="medium-sinhala" className="font-normal cursor-pointer">
                      Sinhala (සිංහල)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3 text-sm">Upload Options</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    size="sm"
                    onClick={handleFileUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Answer PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
              <CardDescription>Paste or type your answer for evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPaper && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Selected Paper Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[200px] overflow-y-auto text-xs font-mono whitespace-pre-wrap">
                      {selectedPaper.content.substring(0, 500)}...
                    </div>
                  </CardContent>
                </Card>
              )}
              <Textarea
                placeholder={medium === "sinhala" ? "ඔබේ පිළිතුර මෙහි අලවන්න..." : "Paste your answer here..."}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                rows={20}
                className="resize-none font-mono text-sm"
              />
              <Button
                onClick={handleEvaluate}
                disabled={!studentAnswer.trim() || evaluating}
                className="w-full"
                size="lg"
              >
                {evaluating ? "Evaluating..." : "Evaluate My Answer"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {evaluation.totalScore}/{evaluation.maxScore}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{evaluation.percentage.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{evaluation.grade}</div>
                <p className="text-xs text-muted-foreground mt-1">Letter Grade</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    evaluation.performanceBand === "Excellent"
                      ? "default"
                      : evaluation.performanceBand === "Good"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-base px-3 py-1"
                >
                  {evaluation.performanceBand}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Overall Band</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Medium</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {medium === "english" ? "English" : "සිංහල"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Evaluation Language</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="sections">Section Breakdown</TabsTrigger>
              <TabsTrigger value="analysis">Strengths & Weaknesses</TabsTrigger>
              <TabsTrigger value="hints">Get Hints</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Detailed Feedback</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyFeedback}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{evaluation.feedback}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              {evaluation.sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{section.section}</CardTitle>
                      <Badge variant="outline">
                        {section.score}/{section.maxScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={(section.score / section.maxScore) * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground">{section.details}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evaluation.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">•</span>
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Improvement Hints</CardTitle>
                  <CardDescription>Get progressive hints to improve your answer</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showHints ? (
                    <Button onClick={() => setShowHints(true)} className="w-full">
                      Generate Improvement Hints
                    </Button>
                  ) : (
                    <HintGenerator embedded />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button onClick={reset} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Evaluate Another Answer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
