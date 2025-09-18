import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Copy, 
  ArrowClockwise, 
  Plus, 
  Minus, 
  Shield, 
  Lock, 
  Key, 
  CheckCircle, 
  Sparkle,
  Lightning,
  Crown,
  Heart,
  Star,
  Sun,
  Moon,
  Monitor
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}

type Theme = 'light' | 'dark' | 'system'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function App() {
  const [password, setPassword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [theme, setTheme] = useKV<Theme>('theme-preference', 'system')
  const [options, setOptions] = useKV<PasswordOptions>('password-options', {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false
  })

  // 主題管理
  const applyTheme = useCallback((themeValue: Theme) => {
    const root = document.documentElement
    
    if (themeValue === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', themeValue === 'dark')
    }
  }, [])

  const cycleTheme = () => {
    if (!theme) return
    
    const themeOrder: Theme[] = ['system', 'light', 'dark']
    const currentIndex = themeOrder.indexOf(theme)
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length]
    
    setTheme(nextTheme)
    
    const themeLabels = {
      system: '🖥️ 跟隨系統',
      light: '☀️ 淺色模式',
      dark: '🌙 深色模式'
    }
    
    toast.success(`已切換到 ${themeLabels[nextTheme]}`)
  }

  // 監聽系統主題變化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme, applyTheme])

  // 應用主題
  useEffect(() => {
    if (theme) {
      applyTheme(theme)
    }
  }, [theme, applyTheme])

  const generatePassword = useCallback(() => {
    if (!options) return
    
    setIsGenerating(true)
    
    setTimeout(() => {
      let charset = ''
      if (options.includeUppercase) charset += UPPERCASE
      if (options.includeLowercase) charset += LOWERCASE
      if (options.includeNumbers) charset += NUMBERS
      if (options.includeSymbols) charset += SYMBOLS

      if (charset === '') {
        setOptions({
          length: 16,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: false
        })
        setIsGenerating(false)
        return
      }

      let result = ''
      const array = new Uint8Array(options.length)
      crypto.getRandomValues(array)
      
      for (let i = 0; i < options.length; i++) {
        result += charset[array[i] % charset.length]
      }
      
      setPassword(result)
      setIsGenerating(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }, 800)
  }, [options, setOptions])

  const calculateStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    if (pwd.length >= 16) score += 1

    if (score <= 2) return { level: '弱', color: 'bg-gradient-to-r from-red-500 to-red-600', text: '弱', icon: Shield }
    if (score <= 4) return { level: '中等', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', text: '中等', icon: Key }
    if (score <= 6) return { level: '強', color: 'bg-gradient-to-r from-blue-500 to-purple-500', text: '強', icon: Lightning }
    return { level: '非常強', color: 'bg-gradient-to-r from-green-500 to-emerald-600', text: '非常強', icon: Crown }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
      toast.success('🎉 密碼已複製到剪貼板！', {
        description: '您的新密碼已準備就緒'
      })
    } catch {
      toast.error('複製失敗，請手動選取密碼')
    }
  }

  const updateLength = (increment: boolean) => {
    if (!options) return
    setOptions({
      ...options,
      length: Math.max(8, Math.min(64, options.length + (increment ? 1 : -1)))
    })
  }

  const updateOption = (key: keyof PasswordOptions, value: boolean) => {
    if (!options) return
    
    const newOptions = { ...options, [key]: value }
    
    // 確保至少選擇一種字元類型
    const hasAnyType = newOptions.includeUppercase || 
                      newOptions.includeLowercase || 
                      newOptions.includeNumbers || 
                      newOptions.includeSymbols
    
    if (!hasAnyType) {
      toast.error('⚠️ 至少需要選擇一種字元類型')
      return
    }
    
    setOptions(newOptions)
  }

  useEffect(() => {
    if (options) {
      generatePassword()
    }
  }, [generatePassword, options])

  if (!options || !theme) return null

  const strength = calculateStrength(password)
  const StrengthIcon = strength.icon

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun
      case 'dark': return Moon
      case 'system': return Monitor
      default: return Monitor
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <div className="min-h-screen bg-background p-6 slide-up">
      <div className="max-w-4xl mx-auto">
        {/* 標題區域 */}
        <div className="text-center mb-12 relative">
          {/* 主題切換按鈕 - 放在右上角 */}
          <div className="absolute top-0 right-0">
            <Button
              onClick={cycleTheme}
              variant="outline"
              size="icon"
              className="rounded-xl hover:scale-105 transition-all duration-300 border-2"
              title={`當前主題：${theme === 'system' ? '跟隨系統' : theme === 'light' ? '淺色' : '深色'}`}
            >
              <ThemeIcon size={20} className="theme-icon" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Lock size={32} className="text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              隨機密碼產生器
            </h1>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20">
              <Sparkle size={32} className="text-accent" />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ✨ 立即產生強大且安全的密碼，保護您的線上帳戶安全 🛡️
          </p>
        </div>

        {/* 密碼顯示區域 - 增強視覺效果 */}
        <Card className="p-8 mb-8 glow-border backdrop-blur-sm bg-card/80 border-2">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="flex-1 min-w-0 relative">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-border rounded-2xl p-6 relative overflow-hidden">
                {isGenerating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                )}
                <p className={`text-2xl font-mono text-foreground break-all select-all transition-all duration-500 ${
                  isGenerating ? 'blur-sm scale-95' : 'blur-0 scale-100'
                }`}>
                  {password || '🔄 正在生成密碼...'}
                </p>
                {showSuccess && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle size={24} className="text-green-500 bounce-in" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-stretch gap-4">
              <Badge className={`${strength.color} text-white px-6 py-4 text-base font-bold rounded-2xl shadow-lg flex items-center gap-2 h-20`}>
                <StrengthIcon size={20} />
                {strength.text}
              </Badge>
              
              <Button
                onClick={generatePassword}
                disabled={isGenerating}
                variant="outline"
                size="icon"
                className="h-20 w-20 rounded-2xl border-2 hover:scale-110 transition-all duration-300"
              >
                <ArrowClockwise 
                  size={28} 
                  className={isGenerating ? 'animate-spin' : ''} 
                />
              </Button>
              
              <Button
                onClick={copyToClipboard}
                className={`h-20 px-8 rounded-2xl font-semibold gradient-button transition-all duration-300 text-base ${
                  copySuccess ? 'bg-green-500 hover:bg-green-600' : ''
                }`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle size={24} className="mr-2" />
                    已複製！
                  </>
                ) : (
                  <>
                    <Copy size={24} className="mr-2" />
                    複製密碼
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* 控制面板 - 增加視覺豐富度 */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* 長度控制 */}
          <Card className="p-6 backdrop-blur-sm bg-card/90 border hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Star size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">密碼長度：{options.length}</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => updateLength(false)}
                variant="outline"
                size="icon"
                disabled={options.length <= 8}
                className="rounded-xl hover:scale-105 transition-transform"
              >
                <Minus size={16} />
              </Button>
              
              <div className="flex-1 relative">
                <Slider
                  value={[options.length]}
                  onValueChange={([value]) => setOptions({ ...options, length: value })}
                  min={8}
                  max={64}
                  step={1}
                  className="w-full"
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium">
                    {options.length}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => updateLength(true)}
                variant="outline"
                size="icon"
                disabled={options.length >= 64}
                className="rounded-xl hover:scale-105 transition-transform"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground mt-4">
              <span>最短 8</span>
              <span>最長 64</span>
            </div>
          </Card>

          {/* 字元類型選擇 */}
          <Card className="p-6 backdrop-blur-sm bg-card/90 border hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Key size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">使用的字元類型：</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="uppercase"
                  checked={options.includeUppercase}
                  onCheckedChange={(checked) => updateOption('includeUppercase', !!checked)}
                  className="border-2 data-[state=unchecked]:border-border data-[state=unchecked]:bg-background"
                />
                <label htmlFor="uppercase" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  🔤 大寫字母 (ABC)
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="lowercase"
                  checked={options.includeLowercase}
                  onCheckedChange={(checked) => updateOption('includeLowercase', !!checked)}
                  className="border-2 data-[state=unchecked]:border-border data-[state=unchecked]:bg-background"
                />
                <label htmlFor="lowercase" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  🔡 小寫字母 (abc)
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="numbers"
                  checked={options.includeNumbers}
                  onCheckedChange={(checked) => updateOption('includeNumbers', !!checked)}
                  className="border-2 data-[state=unchecked]:border-border data-[state=unchecked]:bg-background"
                />
                <label htmlFor="numbers" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  🔢 數字 (123)
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="symbols"
                  checked={options.includeSymbols}
                  onCheckedChange={(checked) => updateOption('includeSymbols', !!checked)}
                  className="border-2 data-[state=unchecked]:border-border data-[state=unchecked]:bg-background"
                />
                <label htmlFor="symbols" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  ⚡ 特殊符號 (#$&)
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* 安全提示 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
            <Heart size={16} className="text-red-500" />
            <p className="text-sm text-muted-foreground">
              所有密碼均在您的裝置上本地生成，不會儲存或傳送到任何伺服器
            </p>
            <Shield size={16} className="text-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App