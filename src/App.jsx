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

  const generatePassword = useCallback(() => {
    let charset = ''
    if (uppercaseAllowed) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercaseAllowed) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (numberAllowed) charset += '0123456789'
    if (charAllowed) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    // Exclude similar looking characters if option is enabled
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '')
    }
    
    if (charset === '') {
      return 'Select at least one character type'
    }
    
    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset.charAt(randomIndex)
    }
    
    return password
  }, [length, numberAllowed, charAllowed, uppercaseAllowed, lowercaseAllowed, excludeSimilar])

  const generateMultiplePasswords = useCallback(() => {
    const newPasswords = []
    for (let i = 0; i < passwordCount; i++) {
      const password = generatePassword()
      if (password !== 'Select at least one character type') {
        newPasswords.push({
          id: Date.now() + i,
          value: password,
          strength: calculatePasswordStrength(password),
          created: new Date().toLocaleString()
        })
      }
    }
    setPasswords(newPasswords)
    
    // Add to history
    setPasswordHistory(prev => [...newPasswords, ...prev].slice(0, 50)) // Keep last 50
  }, [passwordCount, generatePassword])

  const calculatePasswordStrength = (password) => {
    let score = 0
    let feedback = []
    
    // Length check
    if (password.length >= 12) score += 25
    else if (password.length >= 8) score += 15
    else feedback.push('Use at least 8 characters')
    
    // Character variety
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
    generateMultiplePasswords()
  }, [generateMultiplePasswords])

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

  const exportPasswords = useCallback(() => {
    const dataStr = JSON.stringify(passwords, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `passwords_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [passwords])

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
            Generate multiple secure passwords with advanced customization
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
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Password Count and Length */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold text-lg mb-2 block">
                  Number of Passwords: {passwordCount}
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={passwordCount}
                  onChange={(e) => setPasswordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold text-lg mb-2 block">
                  Password Length: {length}
                </label>
                <input
                  type="range"
                  min={4}
                  max={64}
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateMultiplePasswords}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🎲 Generate New Passwords
            </button>
            
            {passwords.length > 0 && (
              <>
                <button
                  onClick={copyAllPasswords}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  📋 Copy All
                </button>
                <button
                  onClick={exportPasswords}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  💾 Export JSON
                </button>
              </>
            )}
          </div>

          {/* Copy Success Message */}
          {copySuccess && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center animate-bounce">
              ✅ {copySuccess}
            </div>
          )}

          {/* Generated Passwords */}
          {passwords.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-xl mb-4">Generated Passwords:</h3>
              <div className="grid gap-4">
                {passwords.map((passwordObj, index) => (
                  <div
                    key={passwordObj.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-white font-mono text-lg bg-black/30 px-3 py-1 rounded select-all">
                            {passwordObj.value}
                          </span>
                          <button
                            onClick={() => copyToClipboard(passwordObj.value, index)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105"
                            title="Copy password"
                          >
                            📋
                          </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-sm">Strength:</span>
                            <span className={`font-semibold ${passwordObj.strength.color}`}>
                              {passwordObj.strength.level}
                            </span>
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  passwordObj.strength.score >= 80 ? 'bg-green-500' :
                                  passwordObj.strength.score >= 60 ? 'bg-blue-500' :
                                  passwordObj.strength.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${passwordObj.strength.score}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-400 text-sm">{passwordObj.strength.score}%</span>
                          </div>
                        </div>
                        
                        {passwordObj.strength.feedback.length > 0 && (
                          <div className="mt-2">
                            <details className="text-gray-300 text-sm">
                              <summary className="cursor-pointer hover:text-white">Improvement Tips</summary>
                              <ul className="mt-2 ml-4 space-y-1">
                                {passwordObj.strength.feedback.map((tip, i) => (
                                  <li key={i} className="list-disc">{tip}</li>
                                ))}
                              </ul>
                            </details>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        Created: {passwordObj.created}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Password History */}
        {passwordHistory.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <details>
              <summary className="text-white font-semibold text-xl cursor-pointer hover:text-gray-300">
                📚 Password History ({passwordHistory.length})
              </summary>
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {passwordHistory.slice(0, 10).map((passwordObj, index) => (
                  <div key={passwordObj.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                    <span className="text-gray-300 font-mono text-sm">{passwordObj.value}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${passwordObj.strength.color}`}>
                        {passwordObj.strength.level}
                      </span>
                      <button
                        onClick={() => copyToClipboard(passwordObj.value, index)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>🔒 Your passwords are generated locally and never sent to any server</p>
          <p className="text-sm mt-2">Built with React + Vite + Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}

export default App
