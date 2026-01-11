"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Send, Copy, Trash2 } from "lucide-react"

type Medium = "english" | "sinhala"
type AnswerMode = "quick" | "exam"
type Topic = "mechanics" | "waves" | "electricity" | "magnetism" | "modern-physics" | "measurements"

interface Message {
  role: "user" | "assistant"
  content: string
  medium: Medium
}

export default function TutorPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState("")
  const [medium, setMedium] = useState<Medium>("english")
  const [answerMode, setAnswerMode] = useState<AnswerMode>("exam")
  const [topic, setTopic] = useState<Topic>("mechanics")
  const [loading, setLoading] = useState(false)

  const suggestedQuestions = [
    "What is Newton's Second Law of Motion?",
    "Explain the concept of electromagnetic induction",
    "What is the difference between velocity and acceleration?",
    "Describe the photoelectric effect",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    const userMessage: Message = {
      role: "user",
      content: question,
      medium,
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = generateMockResponse(userMessage.content, medium, answerMode, topic)

    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      medium,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setLoading(false)
  }

  const generateMockResponse = (question: string, medium: Medium, mode: AnswerMode, topic: Topic): string => {
    if (medium === "sinhala") {
      if (mode === "quick") {
        return `**ප්‍රශ්නය:** ${question}

**භෞතික විද්‍යා සංකල්පය:**

නිව්ටන්ගේ දෙවන නියමය පවසන්නේ වස්තුවක ත්වරණය එහි ස්කන්ධයට ප්‍රතිලෝමව සහ එයට යොදන ලද ශුද්ධ බලයට සෘජුව සමානුපාතික වන බවයි.

**සූත්‍රය:**
F = ma

මෙහි:
- F = ශුද්ධ බලය (නිව්ටන්)
- m = ස්කන්ධය (කිලෝග්‍රෑම්)
- a = ත්වරණය (මීටර්/තත්පර²)

**ප්‍රායෝගික උදාහරණය:**
2 kg ස්කන්ධයක් ඇති වස්තුවකට 10 N බලයක් යොදන විට, එහි ත්වරණය 5 m/s² වේ.

**ගණනය කිරීම:**
F = ma
10 = 2 × a
a = 5 m/s²

**මූලික අදහස:**
වැඩි බලයක් = වැඩි ත්වරණයක්
වැඩි ස්කන්ධයක් = අඩු ත්වරණයක් (එකම බලය සඳහා)`
      } else {
        return `**ප්‍රශ්නය:** ${question}

---

**I. න්‍යායික සාරාංශය:**

නිව්ටන්ගේ දෙවන චලන නියමය භෞතික විද්‍යාවේ මූලික මූලධර්මයකි. මෙය බලය, ස්කන්ධය සහ ත්වරණය අතර ගණිතමය සම්බන්ධතාවය විස්තර කරයි. උසස් පෙළ විභාගවල මෙය නිතර පරීක්ෂා කෙරේ.

**II. පියවර අනුව පැහැදිලි කිරීම:**

**1. නිර්වචනය:**
වස්තුවක ත්වරණය එහි ස්කන්ධයට ප්‍රතිලෝමව සහ යොදන ලද ශුද්ධ බලයට සෘජුව සමානුපාතික වේ.

**2. ගණිතමය ප්‍රකාශනය:**
F = ma

**SI ඒකක:**
- F: බලය - නිව්ටන් (N) හෝ kg⋅m/s²
- m: ස්කන්ධය - කිලෝග්‍රෑම් (kg)
- a: ත්වරණය - මීටර්/තත්පර² (m/s²)

**3. භෞතික අර්ථය:**
- වැඩි බලයක් යොදන විට → වැඩි ත්වරණයක් ලැබේ
- වැඩි ස්කන්ධයක් → එකම ත්වරණය සඳහා වැඩි බලයක් අවශ්‍ය වේ
- ශුද්ධ බලය = ශුන්‍ය (ස්ථිර වේගය හෝ නිශ්චලව)

**4. විභාග සඳහා වැදගත් කරුණු:**
- සෑම විටම වස්තුවට ක්‍රියා කරන සියලුම බලයන් හඳුනා ගන්න
- ශුද්ධ බලය ගණනය කරන්න (සියලුම බලවල එකතුව)
- SI ඒකක භාවිතා කරන්න
- නිදහස්-වස්තු රූප සටහන් අඳින්න

**III. සූත්‍ර (ඒකක සමඟ):**

F = ma (N = kg⋅m/s²)`
      }
    } else {
      if (mode === "quick") {
        return `**Question:** ${question}

**Physics Explanation:**

Newton's Second Law of Motion states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**Formula:**
F = ma

Where:
- F = Force (Newton)
- m = Mass (Kilogram)
- a = Acceleration (Meter/Second²)

**Practical Example:**
For a 2 kg object with a force of 10 N applied, the acceleration is 5 m/s².

**Calculation:**
F = ma
10 = 2 × a
a = 5 m/s²

**Basic Understanding:**
More force = More acceleration
More mass = Less acceleration (for the same force)`
      } else {
        return `**Question:** ${question}

---

**I. Theoretical Summary:**

Newton's Second Law of Motion is a fundamental principle of physics. It describes the mathematical relationship between force, mass, and acceleration. This law is frequently tested in upper-level exams.

**II. Detailed Explanation:**

**1. Definition:**
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**2. Mathematical Expression:**
F = ma

**SI Units:**
- F: Force - Newton (N) or kg⋅m/s²
- m: Mass - Kilogram (kg)
- a: Acceleration - Meter/Second² (m/s²)

**3. Physical Meaning:**
- More force applied → More acceleration
- More mass → More force required for the same acceleration
- Zero net force → Zero acceleration (object remains stationary or in uniform motion)

**4. Additional Tips for Exam:**
- Always identify all forces acting on the object
- Calculate the net force (sum of all forces)
- Use SI units consistently
- Draw free-body diagrams

**III. Formulas (with Units):**

F = ma (N = kg⋅m/s²)`
      }
    }
  }

  const copyAnswer = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Answer copied to clipboard",
    })
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Learning Assistant</h1>
        <p className="text-muted-foreground">Get direct, complete Physics explanations in English or Sinhala medium</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <RadioGroup value={medium} onValueChange={(value) => setMedium(value as Medium)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="english" id="english" />
                      <Label htmlFor="english" className="font-normal cursor-pointer">
                        English
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sinhala" id="sinhala" />
                      <Label htmlFor="sinhala" className="font-normal cursor-pointer">
                        Sinhala (සිංහල)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Answer Mode</Label>
                  <RadioGroup value={answerMode} onValueChange={(value) => setAnswerMode(value as AnswerMode)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quick" id="quick" />
                      <Label htmlFor="quick" className="font-normal cursor-pointer">
                        Quick Response
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exam" id="exam" />
                      <Label htmlFor="exam" className="font-normal cursor-pointer">
                        Exam-Oriented Response
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select value={topic} onValueChange={(value) => setTopic(value as Topic)}>
                  <SelectTrigger id="topic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanics">Mechanics</SelectItem>
                    <SelectItem value="waves">Waves</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="magnetism">Magnetism</SelectItem>
                    <SelectItem value="modern-physics">Modern Physics</SelectItem>
                    <SelectItem value="measurements">Measurements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Conversation</CardTitle>
                  <Badge variant="outline">{medium === "english" ? "English Medium" : "සිංහල මාධ්‍යය"}</Badge>
                </div>
                {messages.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Ask a Physics question to get started</p>
                  <p className="text-sm text-muted-foreground">Get direct, complete answers tailored for A/L Physics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="space-y-2">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyAnswer(message.content)}
                                className="h-8"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Answer
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg p-4 bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
                          <div
                            className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                          <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Textarea
                    placeholder={
                      medium === "sinhala"
                        ? "ඔබගේ භෞතික විද්‍යා ප්‍රශ්නය මෙහි ටයිප් කරන්න..."
                        : "Type your Physics question here..."
                    }
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {medium === "english" ? "English Medium" : "සිංහල මාධ්‍යය"} •{" "}
                      {answerMode === "quick" ? "Quick Answer" : "Exam-Oriented Answer"}
                    </span>
                    <Button type="submit" disabled={loading || !question.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? "Sending..." : "Ask"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested Questions</CardTitle>
              <CardDescription>Click to ask</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent bg-transparent"
                  onClick={() => setQuestion(q)}
                >
                  <span className="text-sm">{q}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <p className="text-muted-foreground">Ask clear, specific questions about Physics concepts</p>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <p className="text-muted-foreground">
                  Get complete, direct answers with theory, formulas, and examples
                </p>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <p className="text-muted-foreground">Use Exam-Oriented mode for detailed A/L style explanations</p>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">4</span>
                </div>
                <p className="text-muted-foreground">Sinhala mode provides full answers in simple Sinhala</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
