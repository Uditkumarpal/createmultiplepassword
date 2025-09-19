import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [length, setLength] = useState(12)
  const [numberAllowed, setNumberAllowed] = useState(true)
  const [charAllowed, setCharAllowed] = useState(true)
  const [uppercaseAllowed, setUppercaseAllowed] = useState(true)
  const [lowercaseAllowed, setLowercaseAllowed] = useState(true)
  const [passwords, setPasswords] = useState([])
  const [passwordCount, setPasswordCount] = useState(1)
  const [theme, setTheme] = useState('gradient')
  const [copySuccess, setCopySuccess] = useState('')
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [passwordHistory, setPasswordHistory] = useState([])
  const [passwordTemplate, setPasswordTemplate] = useState('random')
  const [customPattern, setCustomPattern] = useState('')
  const [enforceComposition, setEnforceComposition] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [blacklistWords] = useState(['password', '123456', 'admin', 'qwerty', 'letmein'])
  const [searchTerm, setSearchTerm] = useState('')
  const [showQRCode, setShowQRCode] = useState(null)
  const [qrCodeData, setQrCodeData] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showHistoryManager, setShowHistoryManager] = useState(false)

  const wordList = [
    'correct', 'horse', 'battery', 'staple', 'mountain', 'river', 'sunset', 'ocean',
    'forest', 'thunder', 'lightning', 'rainbow', 'crystal', 'diamond', 'golden',
    'silver', 'purple', 'orange', 'green', 'blue', 'red', 'yellow', 'black', 'white',
    'magic', 'wizard', 'dragon', 'castle', 'kingdom', 'adventure', 'journey', 'quest',
    'treasure', 'island', 'pirate', 'sailor', 'captain', 'anchor', 'compass', 'map'
  ]

  const generatePassword = useCallback(() => {
    switch (passwordTemplate) {
      case 'pin':
        return generatePinCode()
      case 'passphrase':
        return generatePassphrase()
      case 'pattern':
        return generateFromPattern()
      case 'memorable':
        return generateMemorablePassword()
      default:
        return generateRandomPassword()
    }
  }, [length, numberAllowed, charAllowed, uppercaseAllowed, lowercaseAllowed, excludeSimilar, passwordTemplate, customPattern])

  const generatePinCode = () => {
    let pin = ''
    for (let i = 0; i < length; i++) {
      pin += Math.floor(Math.random() * 10)
    }
    return pin
  }

  const generatePassphrase = () => {
    const wordCount = Math.max(3, Math.min(6, Math.floor(length / 4)))
    const selectedWords = []
    
    for (let i = 0; i < wordCount; i++) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)]
      selectedWords.push(randomWord)
    }
    
    let passphrase = selectedWords.join('-')
    
    if (numberAllowed) {
      passphrase += Math.floor(Math.random() * 100)
    }
    
    if (charAllowed) {
      const specialChars = '!@#$%'
      passphrase += specialChars[Math.floor(Math.random() * specialChars.length)]
    }
    
    return passphrase
  }

  const generateFromPattern = () => {
    if (!customPattern) return 'Enter a pattern (e.g., Aaa-000-aaa)'
    
    let result = ''
    for (const char of customPattern) {
      switch (char) {
        case 'A':
          result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
          break
        case 'a':
          result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
          break
        case '0':
          result += Math.floor(Math.random() * 10)
          break
        case '#':
          result += '!@#$%^&*'[Math.floor(Math.random() * 8)]
          break
        default:
          result += char
      }
    }
    return result
  }

  const generateMemorablePassword = () => {
    const adjectives = ['Quick', 'Bright', 'Happy', 'Strong', 'Swift', 'Bold', 'Calm', 'Wise']
    const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Star', 'Ocean', 'Forest', 'Storm']
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 1000)
    const special = charAllowed ? '!@#$'[Math.floor(Math.random() * 4)] : ''
    
    return `${adj}${noun}${num}${special}`
  }

  const generateRandomPassword = () => {
    let charset = ''
    if (uppercaseAllowed) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercaseAllowed) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (numberAllowed) charset += '0123456789'
    if (charAllowed) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '')
    }
    
    if (charset === '') {
      return 'Select at least one character type'
    }
    
    let password = ''
    
    if (enforceComposition && passwordTemplate === 'random') {
      const requiredChars = []
      if (uppercaseAllowed) requiredChars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)])
      if (lowercaseAllowed) requiredChars.push('abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)])
      if (numberAllowed) requiredChars.push('0123456789'[Math.floor(Math.random() * 10)])
      if (charAllowed) requiredChars.push('!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 25)])
      
      for (const char of requiredChars) {
        password += char
      }
      
      for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset.charAt(randomIndex)
      }
      
      password = password.split('').sort(() => Math.random() - 0.5).join('')
    } else {
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset.charAt(randomIndex)
      }
    }
    
    return password
  }

  const generateSinglePassword = useCallback(() => {
    const password = generatePassword()
    
    if (password !== 'Select at least one character type' && 
        password !== 'Enter a pattern (e.g., Aaa-000-aaa)' &&
        !isDuplicateInHistory(password) &&
        !containsBlacklistedWords(password)) {
      
      const newPassword = {
        id: Date.now() + Math.random(),
        value: password,
        strength: calculatePasswordStrength(password),
        created: new Date().toLocaleString(),
        note: '',
        purpose: '',
        status: 'not_filled'
      }
      
      setPasswords([newPassword])
      setEditingNote(newPassword.id) // Automatically open notes for editing
    }
  }, [generatePassword, passwordHistory])

  const isDuplicateInHistory = (password) => {
    return passwordHistory.some(p => p.value === password)
  }

  const containsBlacklistedWords = (password) => {
    const lowerPassword = password.toLowerCase()
    return blacklistWords.some(word => lowerPassword.includes(word.toLowerCase()))
  }

  const calculatePasswordStrength = (password) => {
    let score = 0
    let feedback = []
    
    if (password.length >= 12) score += 25
    else if (password.length >= 8) score += 15
    else feedback.push('Use at least 8 characters')
    
    if (/[a-z]/.test(password)) score += 15
    else feedback.push('Include lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 15
    else feedback.push('Include uppercase letters')
    
    if (/[0-9]/.test(password)) score += 15
    else feedback.push('Include numbers')
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 30
    else feedback.push('Include special characters')
    
    let level = 'Weak'
    let color = 'text-red-500'
    
    if (score >= 80) {
      level = 'Very Strong'
      color = 'text-green-500'
    } else if (score >= 60) {
      level = 'Strong'
      color = 'text-blue-500'
    } else if (score >= 40) {
      level = 'Medium'
      color = 'text-yellow-500'
    }
    
    return { score, level, color, feedback }
  }

  useEffect(() => {
    // Don't auto-generate on load
  }, [])

  const copyToClipboard = useCallback(async (password, index) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopySuccess(`Password ${index + 1} copied!`)
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }, [])

  const copyAllPasswords = useCallback(async () => {
    const allPasswords = passwords.map((p, i) => `${i + 1}. ${p.value}`).join('\n')
    try {
      await navigator.clipboard.writeText(allPasswords)
      setCopySuccess('All passwords copied!')
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }, [passwords])

  const exportPasswords = useCallback((format = 'json') => {
    let dataStr, mimeType, extension
    
    if (format === 'csv') {
      const headers = 'Password,Strength,Created,Purpose,Note,Status\n'
      const rows = passwords.map(p => 
        `"${p.value}","${p.strength.level}","${p.created}","${p.purpose || ''}","${p.note || ''}","${p.status}"`
      ).join('\n')
      dataStr = headers + rows
      mimeType = 'text/csv'
      extension = 'csv'
    } else {
      dataStr = JSON.stringify(passwords, null, 2)
      mimeType = 'application/json'
      extension = 'json'
    }
    
    const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(dataStr)
    const exportFileDefaultName = `passwords_${new Date().toISOString().split('T')[0]}.${extension}`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [passwords])

  const toggleFavorite = useCallback((id) => {
    setPasswords(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ))
  }, [])

  const saveNotesAndAddToHistory = useCallback((id, note, purpose) => {
    setPasswords(prev => prev.map(p => {
      if (p.id === id) {
        const updatedPassword = { ...p, note, purpose }
        // Add to history when notes are saved
        if (note || purpose) {
          setPasswordHistory(prevHistory => {
            const existing = prevHistory.find(h => h.id === id)
            if (existing) {
              return prevHistory.map(h => h.id === id ? updatedPassword : h)
            } else {
              return [updatedPassword, ...prevHistory].slice(0, 50)
            }
          })
        }
        return updatedPassword
      }
      return p
    }))
    setEditingNote(null)
  }, [])

  const generateQRCode = useCallback((password) => {
    setQrCodeData(password)
    setShowQRCode(password)
  }, [])

  const sharePassword = useCallback(async (password, method = 'copy') => {
    switch (method) {
      case 'qr':
        generateQRCode(password)
        break
      case 'email':
        const emailSubject = 'Secure Password'
        const emailBody = `Here is your generated password: ${password}

This password was generated using MultiPass Creator.

Security reminder: Please store this password securely and never share it via unsecured channels.`
        window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`)
        break
      case 'note':
        const noteContent = `Password: ${password}
Generated: ${new Date().toLocaleString()}
Strength: Strong

Remember to store this securely!`
        const blob = new Blob([noteContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `password_${Date.now()}.txt`
        a.click()
        URL.revokeObjectURL(url)
        break
      default:
        await copyToClipboard(password, 0)
    }
  }, [copyToClipboard])

  const regeneratePassword = useCallback(() => {
    const newPassword = generatePassword()
    if (newPassword !== 'Select at least one character type' && newPassword !== 'Enter a pattern (e.g., Aaa-000-aaa)') {
      const passwordObj = {
        id: Date.now() + Math.random(),
        value: newPassword,
        strength: calculatePasswordStrength(newPassword),
        created: new Date().toLocaleString(),
        note: '',
        purpose: '',
        status: 'not_filled'
      }
      setPasswords([passwordObj])
      setEditingNote(passwordObj.id)
    }
  }, [generatePassword])

  const updatePasswordStatus = useCallback((id, status) => {
    setPasswords(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        status, 
        lastUsed: status === 'used' ? new Date().toLocaleString() : p.lastUsed 
      } : p
    ))
  }, [])

  const deleteFromHistory = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this password from history?')) {
      setPasswordHistory(prev => prev.filter(p => p.id !== id))
    }
  }, [])

  const clearSelectedHistory = useCallback((status) => {
    const message = status === 'all' 
      ? 'Are you sure you want to clear all password history?' 
      : `Are you sure you want to clear all ${status.replace('_', ' ')} passwords from history?`
    
    if (window.confirm(message)) {
      if (status === 'all') {
        setPasswordHistory([])
      } else {
        setPasswordHistory(prev => prev.filter(p => p.status !== status))
      }
    }
  }, [])

  const getFilteredHistory = useCallback(() => {
    return passwordHistory.filter(p => {
      // Only show passwords that have notes or purpose
      const hasNotes = p.note || p.purpose
      if (!hasNotes) return false
      
      const matchesSearch = searchTerm === '' || 
        p.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.note && p.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.purpose && p.purpose.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return matchesSearch
    })
  }, [passwordHistory, searchTerm])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault()
        generateSinglePassword()
      }
      if (e.key === 'Escape') {
        setShowQRCode(null)
        setEditingNote(null)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [generateSinglePassword])

  const themeClasses = {
    gradient: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    dark: 'bg-gray-900',
    cosmic: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
    ocean: 'bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900'
  }

  return (
    <div className={`min-h-screen ${themeClasses[theme]} transition-all duration-300`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-pulse">
            🔐 MultiPass Creator
          </h1>
          <p className="text-gray-300 text-lg">
            Generate secure passwords with notes and purpose tracking
          </p>
        </div>

        {/* Theme Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <label className="text-white font-semibold mb-2 block">Choose Theme:</label>
            <div className="flex gap-2">
              {Object.keys(themeClasses).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setTheme(themeName)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    theme === themeName
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Password Template Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Password Template:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { key: 'random', label: '🎲 Random', desc: 'Standard random password' },
                { key: 'memorable', label: '🧠 Memorable', desc: 'Easy to remember format' },
                { key: 'passphrase', label: '📝 Passphrase', desc: 'Word-based password' },
                { key: 'pin', label: '🔢 PIN Code', desc: 'Numbers only' },
                { key: 'pattern', label: '🎨 Pattern', desc: 'Custom pattern' }
              ].map(template => (
                <button
                  key={template.key}
                  onClick={() => setPasswordTemplate(template.key)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    passwordTemplate === template.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">{template.label}</div>
                  <div className="text-xs opacity-80">{template.desc}</div>
                </button>
              ))}
            </div>
            
            {passwordTemplate === 'pattern' && (
              <div className="mt-4">
                <label className="text-white font-medium mb-2 block">
                  Custom Pattern (A=uppercase, a=lowercase, 0=number, #=special):
                </label>
                <input
                  type="text"
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  placeholder="e.g., Aaa-000-###"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Example: "Abc-123-!@#" → "Xyz-789-$%&"
                </p>
              </div>
            )}
          </div>

          {/* Password Length Only */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <label className="text-white font-semibold text-lg mb-2 block text-center">
                {passwordTemplate === 'passphrase' ? 'Approximate Length' : 'Password Length'}: {length}
              </label>
              <input
                type="range"
                min={passwordTemplate === 'pin' ? 4 : passwordTemplate === 'passphrase' ? 12 : 4}
                max={passwordTemplate === 'pin' ? 12 : passwordTemplate === 'passphrase' ? 40 : 128}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                disabled={passwordTemplate === 'pattern'}
              />
            </div>
          </div>

          {/* Character Options */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Character Types:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={uppercaseAllowed}
                  onChange={() => setUppercaseAllowed(prev => !prev)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">Uppercase (A-Z)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={lowercaseAllowed}
                  onChange={() => setLowercaseAllowed(prev => !prev)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">Lowercase (a-z)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={numberAllowed}
                  onChange={() => setNumberAllowed(prev => !prev)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">Numbers (0-9)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={charAllowed}
                  onChange={() => setCharAllowed(prev => !prev)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">Symbols (!@#$%)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={() => setExcludeSimilar(prev => !prev)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">Exclude Similar (0,O,1,l,I)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={enforceComposition}
                  onChange={() => setEnforceComposition(prev => !prev)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">Enforce Rules</span>
              </label>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-all"
            >
              <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 bg-white/5 p-4 rounded-lg">
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Search Passwords:
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by password, note, or purpose..."
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Filter by Status:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="not_filled">Not Filled</option>
                    <option value="filled">Filled</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Security Features:</h4>
                    <div className="text-gray-300 text-sm space-y-1">
                      <div>✓ Duplicate detection</div>
                      <div>✓ Blacklist checking</div>
                      <div>✓ Entropy calculation</div>
                      <div>✓ Composition enforcement</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">History Management:</h4>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setShowHistoryManager(!showHistoryManager)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-all"
                      >
                        📚 Manage History
                      </button>
                      <button
                        onClick={() => clearSelectedHistory('used')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-all"
                      >
                        🗑️ Clear Used
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={generateSinglePassword}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
            >
              🎲 Generate Password
            </button>
          </div>

          {/* Copy Success Message */}
          {copySuccess && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center animate-bounce">
              ✅ {copySuccess}
            </div>
          )}

          {/* Current Password */}
          {passwords.length > 0 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-white font-semibold text-xl">Your Generated Password:</h3>
              </div>
              {passwords.map((passwordObj, index) => (
                <div
                  key={passwordObj.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="text-center mb-4">
                    <div className="bg-black/30 px-4 py-3 rounded-lg mb-4">
                      <span className="text-white font-mono text-xl select-all break-all">
                        {passwordObj.value}
                      </span>
                    </div>
                    
                    <div className="flex justify-center gap-3 mb-4">
                      <button
                        onClick={() => copyToClipboard(passwordObj.value, index)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        📋 Copy Password
                      </button>
                      <button
                        onClick={regeneratePassword}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        🔄 Generate New
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                      <span className="text-gray-300 text-sm">Strength:</span>
                      <span className={`font-semibold ${passwordObj.strength.color}`}>
                        {passwordObj.strength.level}
                      </span>
                      <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            passwordObj.strength.score >= 80 ? 'bg-green-500' :
                            passwordObj.strength.score >= 60 ? 'bg-blue-500' :
                            passwordObj.strength.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${passwordObj.strength.score}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 font-semibold">{passwordObj.strength.score}%</span>
                    </div>
                  </div>
                  
                  {/* Notes Section */}
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-medium mb-3 text-center">Add Notes for This Password:</h4>
                    {editingNote === passwordObj.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="What is this password for? (e.g., Gmail account, Work laptop...)"
                          value={passwordObj.purpose || ''}
                          onChange={(e) => setPasswords(prev => prev.map(p => 
                            p.id === passwordObj.id ? { ...p, purpose: e.target.value } : p
                          ))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                        />
                        <textarea
                          placeholder="Additional notes (optional)..."
                          value={passwordObj.note || ''}
                          onChange={(e) => setPasswords(prev => prev.map(p => 
                            p.id === passwordObj.id ? { ...p, note: e.target.value } : p
                          ))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 h-20 resize-none"
                        />
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => saveNotesAndAddToHistory(passwordObj.id, passwordObj.note, passwordObj.purpose)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                          >
                            ✓ Save Notes
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        {(passwordObj.purpose || passwordObj.note) ? (
                          <div className="bg-white/5 rounded-lg p-4 mb-3">
                            {passwordObj.purpose && (
                              <div className="text-white font-medium mb-2">
                                🎯 Purpose: {passwordObj.purpose}
                              </div>
                            )}
                            {passwordObj.note && (
                              <div className="text-gray-300">
                                📝 Note: {passwordObj.note}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic mb-3">
                            No notes added yet
                          </div>
                        )}
                        <button
                          onClick={() => setEditingNote(passwordObj.id)}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {(passwordObj.purpose || passwordObj.note) ? '✏️ Edit notes' : '+ Add notes for this password'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowQRCode(null)}>
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">📱 QR Code</h3>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-4 border-black">
                    <div className="text-center p-4">
                      <div className="text-xs font-mono break-all text-gray-700 mb-2">
                        {qrCodeData}
                      </div>
                      <div className="text-xs text-gray-500">
                        📱 Scan with your device
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Scan this QR code with your device to access the password
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => copyToClipboard(qrCodeData, 0)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    📋 Copy Password
                  </button>
                  <button
                    onClick={() => setShowQRCode(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Manager Modal */}
        {showHistoryManager && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowHistoryManager(false)}>
            <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">📚 Password History Manager</h3>
                <button
                  onClick={() => setShowHistoryManager(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => clearSelectedHistory('all')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  🗑️ Clear All History
                </button>
                <button
                  onClick={() => clearSelectedHistory('used')}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
                >
                  Clear Used Only
                </button>
                <button
                  onClick={() => clearSelectedHistory('not_filled')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all"
                >
                  Clear Not Filled
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {passwordHistory.length > 0 ? (
                  <div className="space-y-2">
                    {passwordHistory.map((passwordObj, index) => (
                      <div key={passwordObj.id} className="flex items-center justify-between bg-white/5 p-3 rounded hover:bg-white/10 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-300 font-mono text-sm break-all">{passwordObj.value}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              passwordObj.status === 'used' ? 'bg-green-500/20 text-green-400' :
                              passwordObj.status === 'filled' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {passwordObj.status?.replace('_', ' ') || 'not filled'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className={passwordObj.strength?.color || 'text-gray-400'}>
                              {passwordObj.strength?.level || 'Unknown'} ({passwordObj.strength?.score || 0}%)
                            </span>
                            <span className="text-gray-500">
                              {passwordObj.created}
                            </span>
                            {passwordObj.purpose && (
                              <span className="text-yellow-400">
                                🎯 {passwordObj.purpose}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(passwordObj.value, index)}
                            className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded transition-all"
                            title="Copy password"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => deleteFromHistory(passwordObj.id)}
                            className="text-red-400 hover:text-red-300 px-2 py-1 rounded transition-all"
                            title="Delete from history"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>No password history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3 text-xs text-gray-300">
          <div className="font-semibold mb-1">⌨️ Shortcuts:</div>
          <div>Ctrl+G: Generate</div>
          <div>Ctrl+A: Copy All</div>
          <div>Esc: Close Modal</div>
        </div>

        {/* Quick Stats */}
        {passwords.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">📊 Session Statistics</h3>
            <div className="grid md:grid-cols-5 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{passwords.length}</div>
                <div className="text-gray-300 text-sm">Generated</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {passwords.filter(p => p.strength.score >= 60).length}
                </div>
                <div className="text-gray-300 text-sm">Strong+</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">
                  {passwords.filter(p => p.isFavorite).length}
                </div>
                <div className="text-gray-300 text-sm">Favorites</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(passwords.reduce((acc, p) => acc + p.strength.score, 0) / passwords.length || 0)}%
                </div>
                <div className="text-gray-300 text-sm">Avg Strength</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">
                  {passwords.filter(p => p.note || p.purpose).length}
                </div>
                <div className="text-gray-300 text-sm">With Notes</div>
              </div>
            </div>
            
            {/* Status breakdown */}
            <div className="mt-4 grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-500/20 rounded-lg p-2">
                <div className="text-lg font-bold text-gray-400">
                  {passwords.filter(p => p.status === 'not_filled').length}
                </div>
                <div className="text-gray-400 text-xs">Not Filled</div>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-400">
                  {passwords.filter(p => p.status === 'filled').length}
                </div>
                <div className="text-blue-400 text-xs">Filled</div>
              </div>
              <div className="bg-green-500/20 rounded-lg p-2">
                <div className="text-lg font-bold text-green-400">
                  {passwords.filter(p => p.status === 'used').length}
                </div>
                <div className="text-green-400 text-xs">Used</div>
              </div>
            </div>
          </div>
        )}

        {/* Password History - Only show passwords with notes */}
        {getFilteredHistory().length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-semibold text-xl mb-4 text-center">
              📚 Your Password History ({getFilteredHistory().length})
            </h3>
            <p className="text-gray-400 text-center text-sm mb-4">
              Only passwords with notes are saved to history
            </p>
            <div className="space-y-3">
              {getFilteredHistory().slice(0, 10).map((passwordObj, index) => (
                <div key={passwordObj.id} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-gray-300 font-mono text-sm bg-black/30 px-2 py-1 rounded">
                          {passwordObj.value}
                        </span>
                        <span className={`font-medium ${passwordObj.strength?.color || 'text-gray-400'}`}>
                          {passwordObj.strength?.level || 'Unknown'} ({passwordObj.strength?.score || 0}%)
                        </span>
                      </div>
                      {passwordObj.purpose && (
                        <div className="text-white text-sm font-medium">
                          🎯 {passwordObj.purpose}
                        </div>
                      )}
                      {passwordObj.note && (
                        <div className="text-gray-300 text-sm mt-1">
                          📝 {passwordObj.note}
                        </div>
                      )}
                      <div className="text-gray-500 text-xs mt-2">
                        Created: {passwordObj.created}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(passwordObj.value, index)}
                        className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded transition-all"
                        title="Copy password"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => deleteFromHistory(passwordObj.id)}
                        className="text-red-400 hover:text-red-300 px-2 py-1 rounded transition-all"
                        title="Delete from history"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {getFilteredHistory().length > 10 && (
                <div className="text-center text-gray-400 text-sm pt-2">
                  ... and {getFilteredHistory().length - 10} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>🔒 Your passwords are generated locally and never sent to any server</p>
          <p className="text-sm mt-2">Built with React + Vite + Tailwind CSS</p>
          <div className="mt-4 text-xs space-y-1">
            <p>🎯 Simple & Secure: Generate one password at a time with notes</p>
            <p>⌨️ Shortcut: Press Ctrl+G to generate a new password</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
