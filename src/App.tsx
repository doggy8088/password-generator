import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Copy, RotateRight, Plus, Minus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function App() {
  const [password, setPassword] = useState('')
  const [options, setOptions] = useKV<PasswordOptions>('password-options', {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false
  })

  const generatePassword = useCallback(() => {
    let charset = ''
    if (options.includeUppercase) charset += UPPERCASE
    if (options.includeLowercase) charset += LOWERCASE
    if (options.includeNumbers) charset += NUMBERS
    if (options.includeSymbols) charset += SYMBOLS

    if (charset === '') {
      setOptions(prev => ({ ...prev, includeLowercase: true }))
      return
    }

    let result = ''
    const array = new Uint8Array(options.length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < options.length; i++) {
      result += charset[array[i] % charset.length]
    }
    
    setPassword(result)
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

    if (score <= 2) return { level: '弱', color: 'bg-red-500', text: '弱' }
    if (score <= 4) return { level: '中等', color: 'bg-yellow-500', text: '中等' }
    if (score <= 6) return { level: '強', color: 'bg-blue-500', text: '強' }
    return { level: '非常強', color: 'bg-green-500', text: '非常強' }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      toast.success('密碼已複製到剪貼板')
    } catch {
      toast.error('複製失敗，請手動選取密碼')
    }
  }

  const updateLength = (increment: boolean) => {
    setOptions(prev => ({
      ...prev,
      length: Math.max(8, Math.min(64, prev.length + (increment ? 1 : -1)))
    }))
  }

  const updateOption = (key: keyof PasswordOptions, value: boolean) => {
    const newOptions = { ...options, [key]: value }
    
    // 確保至少選擇一種字元類型
    const hasAnyType = newOptions.includeUppercase || 
                      newOptions.includeLowercase || 
                      newOptions.includeNumbers || 
                      newOptions.includeSymbols
    
    if (!hasAnyType) {
      toast.error('至少需要選擇一種字元類型')
      return
    }
    
    setOptions(newOptions)
  }

  useEffect(() => {
    generatePassword()
  }, [generatePassword])

  const strength = calculateStrength(password)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            隨機密碼產生器
          </h1>
          <p className="text-xl text-muted-foreground">
            立即產生強大且安全的密碼，保護您的線上帳戶安全
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-4">
                <p className="text-2xl font-mono text-foreground break-all select-all">
                  {password || '正在生成密碼...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                className={`${strength.color} text-white px-3 py-1`}
              >
                {strength.text}
              </Badge>
              <Button
                onClick={generatePassword}
                variant="outline"
                size="icon"
                className="h-12 w-12"
              >
                <RotateRight size={20} />
              </Button>
              <Button
                onClick={copyToClipboard}
                className="h-12 px-6"
              >
                <Copy size={20} className="mr-2" />
                複製
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">密碼長度：{options.length}</h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => updateLength(false)}
                variant="outline"
                size="icon"
                disabled={options.length <= 8}
              >
                <Minus size={16} />
              </Button>
              <div className="flex-1">
                <Slider
                  value={[options.length]}
                  onValueChange={([value]) => setOptions(prev => ({ ...prev, length: value }))}
                  min={8}
                  max={64}
                  step={1}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => updateLength(true)}
                variant="outline"
                size="icon"
                disabled={options.length >= 64}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>8</span>
              <span>64</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">使用的字元類型：</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="uppercase"
                  checked={options.includeUppercase}
                  onCheckedChange={(checked) => updateOption('includeUppercase', !!checked)}
                />
                <label htmlFor="uppercase" className="text-sm font-medium">
                  大寫字母 (ABC)
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="lowercase"
                  checked={options.includeLowercase}
                  onCheckedChange={(checked) => updateOption('includeLowercase', !!checked)}
                />
                <label htmlFor="lowercase" className="text-sm font-medium">
                  小寫字母 (abc)
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="numbers"
                  checked={options.includeNumbers}
                  onCheckedChange={(checked) => updateOption('includeNumbers', !!checked)}
                />
                <label htmlFor="numbers" className="text-sm font-medium">
                  數字 (123)
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="symbols"
                  checked={options.includeSymbols}
                  onCheckedChange={(checked) => updateOption('includeSymbols', !!checked)}
                />
                <label htmlFor="symbols" className="text-sm font-medium">
                  特殊符號 (#$&)
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>所有密碼均在您的裝置上本地生成，不會儲存或傳送到任何伺服器</p>
        </div>
      </div>
    </div>
  )
}

export default App