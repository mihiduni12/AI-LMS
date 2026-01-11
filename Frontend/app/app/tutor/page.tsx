"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Copy, Lightbulb, Send, Trash2, HelpCircle } from "lucide-react"
import { HintGenerator } from "@/components/hint-generator"
import { useToast } from "@/hooks/use-toast"

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
  const [showHints, setShowHints] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")

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
    setCurrentQuestion(question)
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

**ද්‍රව්‍ය විද්‍යා සංකල්පය:**

නිව්ටන්ගේ දෙවන නියමය පවසන්නේ වස්තුවක ත්වරණය එහි ස්කන්ධයට ප්‍රතිලෝමව සහ එයට යොදන ලද ශුද්ධ බලයට සෘජුව සමානුපාතික වන බවයි.

**සූත්‍රය:**
F = ma

**ප්‍රධාන කරුණු:**
- F = ශුද්ධ බලය (නිව්ටන්)
- m = ස්කන්ධය (කිලෝග්‍රෑම්)
- a = ත්වරණය (m/s²)

**ප්‍රායෝගික උදාහරණය:**
2 kg ස්කන්ධයක් ඇති වස්තුවකට 10 N බලයක් යොදන විට, එහි ත්වරණය 5 m/s² වේ.`
      } else {
        return `**ප්‍රශ්නය:** ${question}

**I. න්‍යායික සාරාංශය:**

නිව්ටන්ගේ දෙවන චලන නියමය භෞතික විද්‍යාවේ මූලික මූලධර්මයකි. මෙය බලය, ස්කන්ධය සහ ත්වරණය අතර සම්බන්ධතාවය විස්තර කරයි.

**II. පියවර අනුව පැහැදිලි කිරීම:**

1. **නිර්වචනය:** වස්තුවක ත්වරණය එහි ස්කන්ධයට ප්‍රතිලෝමව සහ යොදන ලද ශුද්ධ බලයට සෘජුව සමානුපාතික වේ.

2. **ගණිතමය ප්‍රකාශනය:** F = ma
   - F: ශුද්ධ බලය (නිව්ටන්)
   - m: ස්කන්ධය (kg)
   - a: ත්වරණය (m/s²)

3. **භෞතික අර්ථය:** වැඩි බලයක් යොදන විට වැඩි ත්වරණයක් ඇති වේ. වැඩි ස්කන්ධයකට එකම ත්වරණය ලබා ගැනීමට වැඩි බලයක් අවශ්‍ය වේ.

**III. විභව ප්‍රශ්න ආකෘති:**
- ගණනය කිරීම් ප්‍රශ්න (අගයන් ලබා දී ඇත)
- සංකල්ප විස්තර කිරීම
- එදිනෙදා උදාහරණ යෙදීම

**IV. ප්‍රායෝගික උදාහරණය:**
පාපන්දු ක්‍රීඩකයෙකු බෝලයක් පයින් ගසන විට, බලය (පාදයෙන්) බෝලයේ ස්කන්ධයට ත්වරණයක් ලබා දෙයි. වැඩි බලවත් පහරක් (වැඩි F) වැඩි ත්වරණයක් (වැඩි a) ඇති කරයි.`
      }
    } else {
      if (mode === "quick") {
        return `**Question:** ${question}

**Physics Concept:**

Newton's Second Law of Motion states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**Formula:**
F = ma

**Key Points:**
- F = Net force (Newtons)
- m = Mass (kilograms)
- a = Acceleration (m/s²)

**Practical Example:**
If you apply a 10 N force to a 2 kg object, it will accelerate at 5 m/s².`
      } else {
        return `**Question:** ${question}

**I. Theory Summary:**

Newton's Second Law of Motion is a fundamental principle in physics that describes the relationship between force, mass, and acceleration. This law is essential for understanding dynamics and is frequently tested in A/L Physics examinations.

**II. Step-by-Step Explanation:**

1. **Definition:** The acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass.

2. **Mathematical Expression:** F = ma
   - F: Net force (measured in Newtons)
   - m: Mass (measured in kilograms)
   - a: Acceleration (measured in m/s²)

3. **Physical Meaning:** When a greater force is applied, the object experiences greater acceleration. An object with greater mass requires more force to achieve the same acceleration.

4. **Exam-Oriented Insights:**
   - Always identify all forces acting on the object
   - Calculate net force before finding acceleration
   - Remember to use consistent SI units
   - Draw free-body diagrams for clarity

**III. Common Exam Question Types:**
- Calculation problems (given values, find unknown)
- Conceptual explanations
- Real-world applications
- Problem-solving with multiple forces

**IV. Practical Example:**
When a football player kicks a ball, the force (from their foot) provides acceleration to the ball's mass. A harder kick (greater F) produces greater acceleration (greater a), sending the ball faster and further.

**V. Important Notes for A/L Exam:**
- This law forms the basis for many mechanics problems
- Always state your assumptions clearly
- Show all working steps
- Include proper units in your final answer`
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
    setCurrentQuestion("")
    setShowHints(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Learning Assistant</h1>
        <p className="text-muted-foreground">Get exam-oriented Physics explanations in English or Sinhala</p>
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
                        Quick Answer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exam" id="exam" />
                      <Label htmlFor="exam" className="font-normal cursor-pointer">
                        Exam-Oriented Answer
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
                  <p className="text-sm text-muted-foreground">
                    Your AI tutor is ready to help with A/L Physics concepts
                  </p>
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
                                Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowHints(true)
                                  setCurrentQuestion(messages[index - 1]?.content || "")
                                }}
                                className="h-8"
                              >
                                <HelpCircle className="h-3 w-3 mr-1" />
                                Get Hints
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
                      {answerMode === "quick" ? "Quick" : "Exam-Oriented"}
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

          {/* Hint Generator */}
          {showHints && currentQuestion && (
            <HintGenerator question={currentQuestion} medium={medium} onClose={() => setShowHints(false)} />
          )}
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
                  className="w-full justify-start text-left h-auto py-3 px-4 bg-transparent"
                  onClick={() => setQuestion(q)}
                >
                  <span className="text-sm">{q}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
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
                <p className="text-muted-foreground">Use exam mode for detailed explanations</p>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <p className="text-muted-foreground">Request hints for guided learning</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
