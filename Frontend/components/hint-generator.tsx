"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, RotateCcw } from "lucide-react"

interface Hint {
  level: number
  content: string
  locked: boolean
}

interface HintGeneratorProps {
  question: string
  medium: "english" | "sinhala"
  onClose?: () => void
}

export function HintGenerator({ question, medium, onClose }: HintGeneratorProps) {
  const [hints, setHints] = useState<Hint[]>([
    { level: 1, content: "", locked: true },
    { level: 2, content: "", locked: true },
    { level: 3, content: "", locked: true },
  ])
  const [currentLevel, setCurrentLevel] = useState(0)

  const generateHint = (level: number) => {
    // Mock hint generation based on level and medium
    const englishHints = [
      "Think about the fundamental principles that apply to this concept. What are the key definitions and laws you've learned about this topic?",
      "Consider the relevant formulas and equations. What variables are involved? How do they relate to each other in this scenario?",
      "Break down the problem step by step. Start with the given information, identify what you need to find, and think about the logical sequence of calculations needed.",
    ]

    const sinhalaHints = [
      "මෙම සංකල්පයට අදාළ මූලික මූලධර්ම ගැන සිතන්න. ඔබ මෙම මාතෘකාව ගැන ඉගෙන ගත් ප්‍රධාන නිර්වචන සහ නීති මොනවාද?",
      "අදාළ සූත්‍ර සහ සමීකරණ සලකා බලන්න. කුමන විචල්‍යයන් සම්බන්ධද? මෙම අවස්ථාවේදී ඒවා එකිනෙකට සම්බන්ධ වන්නේ කෙසේද?",
      "ගැටලුව පියවරෙන් පියවර බිඳ දමන්න. ලබා දී ඇති තොරතුරු වලින් ආරම්භ කරන්න, ඔබට සොයා ගැනීමට අවශ්‍ය දේ හඳුනා ගන්න, සහ අවශ්‍ය ගණනය කිරීම්වල තාර්කික අනුපිළිවෙල ගැන සිතන්න.",
    ]

    const hintContent = medium === "sinhala" ? sinhalaHints[level - 1] : englishHints[level - 1]

    setHints((prev) =>
      prev.map((hint) => (hint.level === level ? { ...hint, content: hintContent, locked: false } : hint)),
    )
    setCurrentLevel(level)
  }

  const resetHints = () => {
    setHints([
      { level: 1, content: "", locked: true },
      { level: 2, content: "", locked: true },
      { level: 3, content: "", locked: true },
    ])
    setCurrentLevel(0)
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Hint-Based Guidance
              <Badge variant="secondary">{medium === "english" ? "English Medium" : "සිංහල මාධ්‍යය"}</Badge>
            </CardTitle>
            <CardDescription>Get progressive hints without revealing the full answer</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetHints}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium mb-1">Question:</p>
          <p className="text-sm">{question || "No question provided"}</p>
        </div>

        <div className="space-y-3">
          {hints.map((hint) => (
            <div key={hint.level} className={`border rounded-lg p-4 ${hint.locked ? "bg-muted/50" : "bg-background"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {hint.locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-600" />
                  )}
                  <span className="font-medium">Level {hint.level} Hint</span>
                  <Badge variant={hint.locked ? "secondary" : "default"} className="text-xs">
                    {hint.level === 1 && "Directional"}
                    {hint.level === 2 && "Conceptual"}
                    {hint.level === 3 && "Detailed"}
                  </Badge>
                </div>
                {hint.locked && currentLevel === hint.level - 1 && (
                  <Button size="sm" onClick={() => generateHint(hint.level)}>
                    Show Hint
                  </Button>
                )}
              </div>
              {!hint.locked && hint.content && (
                <div className="mt-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded">{hint.content}</div>
              )}
              {hint.locked && (
                <div className="text-sm text-muted-foreground">Hint locked - unlock previous hints first</div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Hints are designed to guide your thinking without revealing the complete answer. Use
            them to develop your problem-solving skills.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
