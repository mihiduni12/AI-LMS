"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Unlock, RotateCcw, Copy, Check, Lightbulb, BookOpen } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Hint {
  level: number
  title: string
  content: string
  locked: boolean
}

type Medium = "EN" | "SI"
type Topic = "Mechanics" | "Waves" | "Electricity" | "Magnetism" | "Modern Physics" | "Measurements"

export default function HintGeneratorPage() {
  const [question, setQuestion] = useState("")
  const [medium, setMedium] = useState<Medium>("EN")
  const [topic, setTopic] = useState<Topic>("Mechanics")
  const [hints, setHints] = useState<Hint[]>([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [contextKey, setContextKey] = useState("")

  useEffect(() => {
    // Generate a unique context key for this session
    const key = `hint_${Date.now()}`
    setContextKey(key)

    // Try to restore previous state
    const savedState = localStorage.getItem(`studywise_hint_progress_${key}`)
    if (savedState) {
      const { hints: savedHints, currentLevel: savedLevel } = JSON.parse(savedState)
      setHints(savedHints)
      setCurrentLevel(savedLevel)
    }
  }, [])

  useEffect(() => {
    // Save state to localStorage
    if (hints.length > 0) {
      localStorage.setItem(`studywise_hint_progress_${contextKey}`, JSON.stringify({ hints, currentLevel }))
    }
  }, [hints, currentLevel, contextKey])

  const generateHints = () => {
    if (!question.trim()) return

    const mockHints = getMockHints(topic, medium)

    setHints([
      {
        level: 1,
        title: medium === "EN" ? "Directional Guidance" : "දිශානුගත මාර්ගෝපදේශය",
        content: mockHints[0],
        locked: false,
      },
      {
        level: 2,
        title: medium === "EN" ? "Key Concepts & Formulas" : "ප්‍රධාන සංකල්ප සහ සූත්‍ර",
        content: mockHints[1],
        locked: true,
      },
      {
        level: 3,
        title: medium === "EN" ? "Near-Complete Guidance" : "සම්පූර්ණ මාර්ගෝපදේශයට ආසන්න",
        content: mockHints[2],
        locked: true,
      },
    ])
    setCurrentLevel(1)
  }

  const unlockNextHint = (level: number) => {
    setHints((prev) => prev.map((hint) => (hint.level === level ? { ...hint, locked: false } : hint)))
    setCurrentLevel(level)
  }

  const resetHints = () => {
    setHints([])
    setCurrentLevel(0)
    setQuestion("")
    localStorage.removeItem(`studywise_hint_progress_${contextKey}`)
  }

  const copyHint = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getMockHints = (topic: Topic, medium: Medium): string[] => {
    const hints: Record<Topic, { EN: string[]; SI: string[] }> = {
      Mechanics: {
        EN: [
          "Start by identifying the type of motion involved. Is it linear motion, circular motion, or projectile motion? Consider what forces are acting on the object and how Newton's laws apply to this situation.",
          "Key concepts: Newton's Laws (F=ma), Work-Energy Theorem (W=ΔKE), Conservation of Momentum (p=mv). Identify which physical quantities are given (mass, velocity, acceleration, force) and which need to be calculated. Draw a free body diagram to visualize all forces.",
          "Set up your equations step by step: 1) List all given values 2) Identify the unknown 3) Select the appropriate formula 4) Substitute values with correct units. Complete the final calculation yourself to arrive at the numerical answer.",
        ],
        SI: [
          "චලිතය වර්ගය හඳුනා ගැනීමෙන් ආරම්භ කරන්න. එය රේඛීය චලිතයද, වෘත්තාකාර චලිතයද, ප්‍රක්ෂේපණ චලිතයද? වස්තුව මත ක්‍රියා කරන බල මොනවාද සහ නිව්ටන් නියම මෙම තත්ත්වයට අදාළ වන්නේ කෙසේදැයි සලකා බලන්න.",
          "ප්‍රධාන සංකල්ප: නිව්ටන් නියම (F=ma), ශක්ති ප්‍රමේයය (W=ΔKE), ගම්‍යතා සංරක්ෂණය (p=mv). කුමන භෞතික ප්‍රමාණ ලබා දී ඇත්ද (ස්කන්ධය, ප්‍රවේගය, ත්වරණය, බලය) සහ කුමක් ගණනය කළ යුතුද යන්න හඳුනා ගන්න. සියලු බල දෘශ්‍යමාන කිරීමට නිදහස් ශරීර රූප සටහනක් ඇඳීම.",
          "ඔබේ සමීකරණ පියවරෙන් පියවර සකසන්න: 1) ලබා දී ඇති සියලු අගයන් ලැයිස්තුගත කරන්න 2) නොදන්නා දේ හඳුනා ගන්න 3) සුදුසු සූත්‍රය තෝරන්න 4) නිවැරදි ඒකක සමඟ අගයන් ආදේශ කරන්න. සංඛ්‍යාත්මක පිළිතුර ලබා ගැනීමට අවසාන ගණනය කිරීම ඔබම සම්පූර්ණ කරන්න.",
        ],
      },
      Waves: {
        EN: [
          "Identify the wave characteristics: Is it transverse or longitudinal? What are the wave parameters (wavelength λ, frequency f, velocity v)? Remember the fundamental wave equation v = fλ.",
          "Key formulas: Wave equation (v=fλ), Period (T=1/f), Energy transmission, Interference conditions (constructive: path difference = nλ, destructive: path difference = (n+0.5)λ). Consider whether phenomena like reflection, refraction, or diffraction are involved.",
          "Apply the appropriate formula: 1) Convert all units to SI 2) Check if the wave is in a specific medium (sound in air, light in glass) and use correct velocity 3) For interference, calculate path difference first. Complete the final step yourself.",
        ],
        SI: [
          "තරංග ලක්ෂණ හඳුනා ගන්න: එය තීර්යක් තරංගයක්ද නැතහොත් අනුදිශ තරංගයක්ද? තරංග පරාමිති (තරංග ආයාමය λ, සංඛ්‍යාතය f, ප්‍රවේගය v) මොනවාද? මූලික තරංග සමීකරණය v = fλ මතක තබා ගන්න.",
          "ප්‍රධාන සූත්‍ර: තරංග සමීකරණය (v=fλ), කාල පරිච්ඡේදය (T=1/f), ශක්ති සම්ප්‍රේෂණය, අභිනිෂ්පාදන තත්ත්වයන් (සාධක: මාර්ග වෙනස = nλ, විනාශකාරී: මාර්ග වෙනස = (n+0.5)λ). පරාවර්තනය, පරාවර්තනය, හෝ විවර්තනය වැනි සංසිද්ධීන් සම්බන්ධද යන්න සලකා බලන්න.",
          "සුදුසු සූත්‍රය යොදන්න: 1) සියලු ඒකක SI වෙත පරිවර්තනය කරන්න 2) තරංගය නිශ්චිත මාධ්‍යයක (වාතයේ ශබ්දය, වීදුරුවේ ආලෝකය) තිබේදැයි පරීක්ෂා කර නිවැරදි ප්‍රවේගය භාවිතා කරන්න 3) අභිනිෂ්පාදනය සඳහා, මුලින්ම මාර්ග වෙනස ගණනය කරන්න. අවසාන පියවර ඔබම සම්පූර්ණ කරන්න.",
        ],
      },
      Electricity: {
        EN: [
          "Analyze the circuit structure: Series or parallel? Identify all resistors, voltage sources, and current paths. Apply Ohm's Law (V=IR) and Kirchhoff's laws (current and voltage laws).",
          "Essential formulas: Ohm's Law (V=IR), Power (P=VI=I²R=V²/R), Series resistance (R_total = R₁+R₂+...), Parallel resistance (1/R_total = 1/R₁+1/R₂+...), Electrical energy (E=Pt). Identify whether to find voltage, current, resistance, or power.",
          "Solve systematically: 1) Simplify the circuit by combining resistors 2) Find total resistance 3) Calculate total current using V=IR 4) Find voltage drops or branch currents as needed. Complete the final numerical answer yourself.",
        ],
        SI: [
          "පරිපථ ව්‍යුහය විශ්ලේෂණය කරන්න: ශ්‍රේණිද නැතහොත් සමාන්තරද? සියලු ප්‍රතිරෝධක, වෝල්ටීයතා ප්‍රභව, සහ ධාරා මාර්ග හඳුනා ගන්න. ඕම් නියමය (V=IR) සහ කිර්ච්හොෆ් නීති (ධාරා සහ වෝල්ටීයතා නීති) යොදන්න.",
          "අත්‍යවශ්‍ය සූත්‍ර: ඕම් නියමය (V=IR), බලය (P=VI=I²R=V²/R), ශ්‍රේණි ප්‍රතිරෝධය (R_total = R₁+R₂+...), සමාන්තර ප්‍රතිරෝධය (1/R_total = 1/R₁+1/R₂+...), විද්‍යුත් ශක්තිය (E=Pt). වෝල්ටීයතාව, ධාරාව, ප්‍රතිරෝධය, හෝ බලය සොයා ගත යුතුද යන්න හඳුනා ගන්න.",
          "ක්‍රමානුකූලව විසඳන්න: 1) ප්‍රතිරෝධක ඒකාබද්ධ කිරීමෙන් පරිපථය සරල කරන්න 2) සම්පූර්ණ ප්‍රතිරෝධය සොයන්න 3) V=IR භාවිතයෙන් සම්පූර්ණ ධාරාව ගණනය කරන්න 4) අවශ්‍ය පරිදි වෝල්ටීයතා පහත වැටීම් හෝ ශාඛා ධාරා සොයන්න. අවසාන සංඛ්‍යාත්මක පිළිතුර ඔබම සම්පූර්ණ කරන්න.",
        ],
      },
      Magnetism: {
        EN: [
          "Identify the magnetic phenomenon: Is it electromagnetic induction, magnetic force on a moving charge, or magnetic field around a conductor? Consider Faraday's Law for induction and Fleming's rules for forces.",
          "Key equations: Magnetic force F=BILsinθ or F=qvBsinθ, Induced EMF ε=-N(dΦ/dt), Magnetic flux Φ=BAcosθ, Solenoid field B=μ₀nI. Determine which quantities are given and what needs to be found.",
          "Set up the solution: 1) Identify the geometry (straight wire, coil, solenoid) 2) Apply the right-hand rule for direction 3) Substitute into the appropriate formula with correct units. Complete the calculation yourself to get the final answer.",
        ],
        SI: [
          "චුම්බක සංසිද්ධිය හඳුනා ගන්න: එය විද්‍යුත් චුම්බක ප්‍රේරණයද, චලනය වන ආරෝපිතයක් මත චුම්බක බලයද, නැතහොත් සන්නායකයක් වටා චුම්බක ක්ෂේත්‍රයද? ප්‍රේරණය සඳහා ෆැරඩේ නියමය සහ බල සඳහා ෆ්ලෙමිං රීති සලකා බලන්න.",
          "ප්‍රධාන සමීකරණ: චුම්බක බලය F=BILsinθ හෝ F=qvBsinθ, ප්‍රේරිත EMF ε=-N(dΦ/dt), චුම්බක ප්‍රවාහය Φ=BAcosθ, සොලිනොයිඩ් ක්ෂේත්‍රය B=μ₀nI. කුමන ප්‍රමාණ ලබා දී ඇත්ද සහ කුමක් සොයා ගත යුතුද යන්න තීරණය කරන්න.",
          "විසඳුම සකසන්න: 1) ජ්‍යාමිතිය හඳුනා ගන්න (සෘජු රැහැන, දඟර, සොලිනොයිඩ්) 2) දිශාව සඳහා දකුණු-අත් රීතිය යොදන්න 3) නිවැරදි ඒකක සමඟ සුදුසු සූත්‍රයට ආදේශ කරන්න. අවසාන පිළිතුර ලබා ගැනීමට ගණනය කිරීම ඔබම සම්පූර්ණ කරන්න.",
        ],
      },
      "Modern Physics": {
        EN: [
          "Determine the quantum phenomenon: Photoelectric effect, Compton scattering, radioactive decay, or nuclear reactions? Remember Einstein's photon energy equation E=hf and mass-energy equivalence E=mc².",
          "Important formulas: Photon energy E=hf=hc/λ, de Broglie wavelength λ=h/p, Half-life N=N₀(1/2)^(t/t½), Energy levels E=-13.6/n² eV for hydrogen. Identify whether the problem involves energy, momentum, or decay calculations.",
          "Approach the solution: 1) Convert energies to correct units (eV or Joules) 2) Use Planck's constant h=6.63×10⁻³⁴ Js 3) For radioactive decay, determine the number of half-lives elapsed. Complete the final numerical step yourself.",
        ],
        SI: [
          "ක්වොන්ටම් සංසිද්ධිය තීරණය කරන්න: ප්‍රකාශ විද්‍යුත් ආචරණය, කොම්ප්ටන් විසිරීම, විකිරණශීලී ක්ෂය, හෝ න්‍යෂ්ටික ප්‍රතික්‍රියාද? අයින්ස්ටයින්ගේ ෆොටෝන ශක්ති සමීකරණය E=hf සහ ස්කන්ධ-ශක්ති සමානකම E=mc² මතක තබා ගන්න.",
          "වැදගත් සූත්‍ර: ෆොටෝන ශක්තිය E=hf=hc/λ, ද බ්‍රොග්ලි තරංග ආයාමය λ=h/p, අර්ධ ආයු කාලය N=N₀(1/2)^(t/t½), හයිඩ්‍රජන් සඳහා ශක්ති මට්ටම් E=-13.6/n² eV. ගැටලුව ශක්තිය, ගම්‍යතාව, හෝ ක්ෂය ගණනය කිරීම් සම්බන්ධද යන්න හඳුනා ගන්න.",
          "විසඳුමට ප්‍රවේශ වන්න: 1) ශක්තීන් නිවැරදි ඒකකවලට පරිවර්තනය කරන්න (eV හෝ Joules) 2) ප්ලෑන්ක් නියතය භාවිතා කරන්න h=6.63×10⁻³⁴ Js 3) විකිරණශීලී ක්ෂය සඳහා, ගත වූ අර්ධ ආයු ගණන තීරණය කරන්න. අවසාන සංඛ්‍යාත්මක පියවර ඔබම සම්පූර්ණ කරන්න.",
        ],
      },
      Measurements: {
        EN: [
          "Understand measurement concepts: Precision vs accuracy, significant figures, systematic vs random errors. Consider the measuring instrument's least count and how to calculate uncertainty.",
          "Key principles: Absolute uncertainty (Δx), Relative uncertainty (Δx/x), Percentage uncertainty (Δx/x × 100%), Error propagation in calculations (addition: add absolute errors, multiplication: add relative errors).",
          "Calculate carefully: 1) Identify the least count of the instrument 2) Determine the number of significant figures needed 3) Calculate percentage uncertainty for each measurement 4) Propagate errors through calculations. Complete the final answer with proper significant figures yourself.",
        ],
        SI: [
          "මිනුම් සංකල්ප තේරුම් ගන්න: නිරවද්‍යතාව සහ නිරවද්‍යතාවය, වැදගත් අංක, ක්‍රමානුකූල සහ අහඹු දෝෂ. මිනුම් උපකරණයේ අවම ගණනය සහ අවිනිශ්චිතතාව ගණනය කරන ආකාරය සලකා බලන්න.",
          "ප්‍රධාන මූලධර්ම: නිරපේක්ෂ අවිනිශ්චිතතාව (Δx), සාපේක්ෂ අවිනිශ්චිතතාව (Δx/x), ප්‍රතිශත අවිනිශ්චිතතාව (Δx/x × 100%), ගණනය කිරීම්වල දෝෂ ප්‍රචාරණය (එකතු කිරීම: නිරපේක්ෂ දෝෂ එකතු කරන්න, ගුණ කිරීම: සාපේක්ෂ දෝෂ එකතු කරන්න).",
          "ප්‍රවේශමෙන් ගණනය කරන්න: 1) උපකරණයේ අවම ගණනය හඳුනා ගන්න 2) අවශ්‍ය වැදගත් අංක ගණන තීරණය කරන්න 3) එක් එක් මිනුම සඳහා ප්‍රතිශත අවිනිශ්චිතතාව ගණනය කරන්න 4) ගණනය කිරීම් හරහා දෝෂ ප්‍රචාරණය කරන්න. සුදුසු වැදගත් අංක සමඟ අවසාන පිළිතුර ඔබම සම්පූර්ණ කරන්න.",
        ],
      },
    }

    return hints[topic][medium]
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
          <Lightbulb className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Hint-Based Answer Generator</h1>
          <p className="text-muted-foreground mt-1">
            Get progressive hints to guide your thinking without revealing the complete answer
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Your Question</CardTitle>
          <CardDescription>
            Enter your physics question and select preferences to receive tailored hints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Select value={medium} onValueChange={(value) => setMedium(value as Medium)}>
                <SelectTrigger id="medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="SI">Sinhala (සිංහල)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Physics Topic</Label>
              <Select value={topic} onValueChange={(value) => setTopic(value as Topic)}>
                <SelectTrigger id="topic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanics">Mechanics</SelectItem>
                  <SelectItem value="Waves">Waves</SelectItem>
                  <SelectItem value="Electricity">Electricity</SelectItem>
                  <SelectItem value="Magnetism">Magnetism</SelectItem>
                  <SelectItem value="Modern Physics">Modern Physics</SelectItem>
                  <SelectItem value="Measurements">Measurements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Your Question</Label>
            <Textarea
              id="question"
              placeholder={
                medium === "EN"
                  ? "Enter your physics question here... (e.g., 'A car accelerates from rest to 20 m/s in 5 seconds. Calculate the acceleration.')"
                  : "ඔබේ භෞතික විද්‍යා ප්‍රශ්නය මෙහි ඇතුළත් කරන්න... (උදා: 'මෝටර් රථයක් විවේකයෙන් තත්පර 5ක් තුළ තත්පරයකට මීටර 20ක් දක්වා ත්වරණය වේ. ත්වරණය ගණනය කරන්න.')"
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={generateHints} disabled={!question.trim()} className="w-full" size="lg">
            <Lightbulb className="h-4 w-4 mr-2" />
            {medium === "EN" ? "Generate Hints" : "ඉඟි උත්පාදනය කරන්න"}
          </Button>
        </CardContent>
      </Card>

      {/* Hints Display */}
      {hints.length > 0 && (
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  {medium === "EN" ? "Progressive Hints" : "ප්‍රගතිශීලී ඉඟි"}
                </CardTitle>
                <CardDescription>
                  {medium === "EN"
                    ? "Unlock hints one by one to guide your problem-solving"
                    : "ඔබේ ගැටලු විසඳීම මාර්ගෝපදේශනය කිරීමට එකින් එක ඉඟි අගුළු හරින්න"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetHints}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {medium === "EN" ? "Reset" : "යළි පිහිටුවන්න"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">{medium === "EN" ? "Question:" : "ප්‍රශ්නය:"}</p>
              <p className="text-sm text-blue-800">{question}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{topic}</Badge>
                <Badge variant="secondary">{medium === "EN" ? "English" : "සිංහල"}</Badge>
              </div>
            </div>

            {/* Hints */}
            <div className="space-y-3">
              {hints.map((hint, index) => (
                <div
                  key={hint.level}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    hint.locked
                      ? "bg-muted/30 border-muted"
                      : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {hint.locked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Unlock className="h-5 w-5 text-amber-600" />
                      )}
                      <div>
                        <div className="font-semibold text-base">
                          {medium === "EN" ? `Level ${hint.level} Hint` : `මට්ටම ${hint.level} ඉඟිය`}
                        </div>
                        <div className="text-sm text-muted-foreground">{hint.title}</div>
                      </div>
                    </div>
                    {!hint.locked && (
                      <Button size="sm" variant="ghost" onClick={() => copyHint(hint.content, index)}>
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {!hint.locked ? (
                    <div className="bg-white border border-amber-200 rounded-lg p-4 mb-3">
                      <p className="text-sm leading-relaxed">{hint.content}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mb-3">
                      {medium === "EN"
                        ? "Unlock previous hints to access this level"
                        : "මෙම මට්ටමට ප්‍රවේශ වීමට පෙර ඉඟි අගුළු හරින්න"}
                    </div>
                  )}

                  {hint.locked && currentLevel === hint.level - 1 && (
                    <Button
                      size="sm"
                      onClick={() => unlockNextHint(hint.level)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {medium === "EN" ? "Unlock This Hint" : "මෙම ඉඟිය අගුළු හරින්න"}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Important Note */}
            <Alert className="border-amber-300 bg-amber-50">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm">
                <strong>{medium === "EN" ? "Important:" : "වැදගත්:"}</strong>{" "}
                {medium === "EN"
                  ? "These hints are designed to guide your thinking process without revealing the final answer. Level 3 will bring you close to the solution, but you must complete the final step yourself to develop problem-solving skills."
                  : "මෙම ඉඟි ඔබේ අවසාන පිළිතුර හෙළි නොකර ඔබේ චින්තන ක්‍රියාවලිය මාර්ගෝපදේශනය කිරීමට නිර්මාණය කර ඇත. මට්ටම 3 ඔබව විසඳුමට ආසන්න කරනු ඇත, නමුත් ගැටලු විසඳීමේ කුසලතා වර්ධනය කර ගැනීමට ඔබ අවසාන පියවර සම්පූර්ණ කළ යුතුය."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      {hints.length === 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Use the Hint Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </div>
              <p className="text-blue-900">
                {medium === "EN"
                  ? "Enter your physics question in the text area above"
                  : "ඉහත පෙළ ප්‍රදේශයේ ඔබේ භෞතික විද්‍යා ප්‍රශ්නය ඇතුළත් කරන්න"}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </div>
              <p className="text-blue-900">
                {medium === "EN"
                  ? "Select your preferred medium (English/Sinhala) and physics topic"
                  : "ඔබේ කැමති මාධ්‍යය (ඉංග්‍රීසි/සිංහල) සහ භෞතික විද්‍යා මාතෘකාව තෝරන්න"}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </div>
              <p className="text-blue-900">
                {medium === "EN"
                  ? "Click 'Generate Hints' to receive three levels of progressive guidance"
                  : "ප්‍රගතිශීලී මාර්ගෝපදේශනයේ මට්ටම් තුනක් ලබා ගැනීමට 'ඉඟි උත්පාදනය කරන්න' ක්ලික් කරන්න"}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                4
              </div>
              <p className="text-blue-900">
                {medium === "EN"
                  ? "Unlock hints one by one and try to solve the problem yourself with the guidance provided"
                  : "ඉඟි එකින් එක අගුළු හැර ලබා දී ඇති මාර්ගෝපදේශනය සමඟ ගැටලුව ඔබම විසඳීමට උත්සාහ කරන්න"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
