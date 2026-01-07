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
import { CheckCircle2, AlertCircle, Copy, Download, RotateCcw, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { HintGenerator } from "@/components/hint-generator"
import {
  calculateGrade,
  getPerformanceBand,
  saveEvaluation,
  type EvaluationResult,
  type SectionResult,
} from "@/lib/evaluation"

type Medium = "english" | "sinhala"

export default function AnswerEvaluatorPage() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [medium, setMedium] = useState<Medium>("english")

  // Step 1: Correct Answers / Marking Scheme
  const [correctAnswers, setCorrectAnswers] = useState("")
  const [totalMarks, setTotalMarks] = useState("100")

  // Step 2: Student Answer
  const [studentAnswer, setStudentAnswer] = useState("")

  // Step 3: Evaluation Result
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [showHints, setShowHints] = useState(false)

  const handleFileUpload = (type: "correct" | "student") => {
    toast({
      title: "File Upload",
      description: "PDF upload simulation - This is a frontend-only demo",
    })
  }

  const handleEvaluate = async () => {
    if (!correctAnswers.trim() || !studentAnswer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both correct answers and student answers",
        variant: "destructive",
      })
      return
    }

    setEvaluating(true)

    // Simulate evaluation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = generateMockEvaluation(correctAnswers, studentAnswer, Number.parseInt(totalMarks), medium)
    setEvaluation(result)
    saveEvaluation(result)
    setEvaluating(false)
    setStep(3)
  }

  const generateMockEvaluation = (
    correct: string,
    student: string,
    maxScore: number,
    medium: Medium,
  ): EvaluationResult => {
    // Mock evaluation logic
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

පුහුණු වීම දිගටම කරගෙන යන්න සහ ඉහත සඳහන් කරන ලද ක්ෂේත්‍ර කෙරෙහි අවධානය යොමු කරන්න. ඔබගේ පදනම ශක්තිමත් වන අතර, විස්තර කෙරෙහි අවධානය යොමු කිරීමෙන්, ඔබට ඔබේ A/L විභාගයේදී විශිෂ්ට ප්‍රතිඵල ලබා ගත හැකිය.`

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
    setStep(1)
    setCorrectAnswers("")
    setStudentAnswer("")
    setEvaluation(null)
    setShowHints(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Answer Evaluator</h1>
        <p className="text-muted-foreground">Get your Physics answers evaluated with detailed examiner feedback</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-muted"}`}
              >
                1
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                Marking Scheme
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-muted mx-4" />
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-muted"}`}
              >
                2
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                Student Answer
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-muted mx-4" />
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-muted"}`}
              >
                3
              </div>
              <span className={`text-sm font-medium ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                Evaluation
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Correct Answers / Marking Scheme */}
      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Options</CardTitle>
                <CardDescription>Upload PDF files (simulation)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleFileUpload("correct")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Marking Scheme PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleFileUpload("correct")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Model Answers PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Correct Answers / Marking Scheme</CardTitle>
              <CardDescription>Paste or type the correct answers or marking scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  medium === "sinhala"
                    ? "නිවැරදි පිළිතුරු හෝ ලකුණු සටහන මෙහි අලවන්න..."
                    : "Paste correct answers or marking scheme here..."
                }
                value={correctAnswers}
                onChange={(e) => setCorrectAnswers(e.target.value)}
                rows={15}
                className="resize-none font-mono text-sm"
              />
              <Button onClick={() => setStep(2)} disabled={!correctAnswers.trim()} className="w-full">
                Next: Student Answer →
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Student Answer */}
      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Correct Answers</CardTitle>
                  <CardDescription>Marking scheme provided</CardDescription>
                </div>
                <Badge variant="outline">{medium === "english" ? "English Medium" : "සිංහල මාධ්‍යය"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg h-[400px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">{correctAnswers}</pre>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Options</CardTitle>
                <CardDescription>Upload student answer PDF (simulation)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleFileUpload("student")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Handwritten Answer PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleFileUpload("student")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Typed Answer PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Answer</CardTitle>
                <CardDescription>Paste or type the student's answer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={medium === "sinhala" ? "ශිෂ්‍ය පිළිතුර මෙහි අලවන්න..." : "Paste student answer here..."}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    ← Back
                  </Button>
                  <Button onClick={handleEvaluate} disabled={!studentAnswer.trim() || evaluating} className="flex-1">
                    {evaluating ? "Evaluating..." : "Evaluate Answer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 3: Evaluation Result */}
      {step === 3 && evaluation && (
        <div className="space-y-6">
          {/* Score Summary */}
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
              <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="weaknesses">Areas to Improve</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Examiner Feedback</CardTitle>
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
                    <div className="whitespace-pre-wrap">{evaluation.feedback}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowHints(!showHints)}>
                  {showHints ? "Hide Hints" : "Get Hints for Improvement"}
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Evaluation
                </Button>
              </div>

              {showHints && (
                <HintGenerator
                  question="How can I improve my answer based on the evaluation feedback?"
                  medium={medium}
                />
              )}
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Section-wise Performance</CardTitle>
                  <CardDescription>Detailed breakdown of marks by section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {evaluation.sections.map((section, index) => {
                    const sectionPercentage = (section.score / section.maxScore) * 100
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{section.section}</h4>
                            <p className="text-sm text-muted-foreground">{section.details}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {section.score}/{section.maxScore}
                            </div>
                            <div className="text-xs text-muted-foreground">{sectionPercentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={sectionPercentage} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strengths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Strengths Identified
                  </CardTitle>
                  <CardDescription>Areas where you performed well</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm">{strength}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weaknesses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Areas for Improvement
                  </CardTitle>
                  <CardDescription>Focus on these areas to enhance your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluation.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-sm">{weakness}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
