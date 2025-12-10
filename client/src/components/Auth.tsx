import { useState } from 'react'
import { login, signup } from '../utils/api'
import { AlertCircle, X } from 'lucide-react'

interface AuthProps {
  onSuccess: () => void
  onClose?: () => void
}

export function Auth({ onSuccess, onClose }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        console.log('Attempting login with:', email)
        const { data, error } = await login(email, password)
        console.log('Login response:', { data, error })
        if (error) {
          setError(error.message)
        } else if (data?.session) {
          console.log('Login successful!')
          onSuccess()
        } else {
          setError('Giriş başarısız oldu')
        }
      } else {
        console.log('Attempting signup with:', email, name)
        const result = await signup(email, password, name)
        console.log('Signup response:', result)
        if (result.error) {
          setError(result.error)
        } else if (result.success) {
          console.log('Signup successful!')
          onSuccess()
        } else {
          setError(result.error || 'Kayıt başarısız oldu')
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl uppercase tracking-wider mb-2">BUTIK</h1>
            <p className="text-sm text-gray-600">
              {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Lütfen Bekleyin...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              {isLogin ? (
                <>
                  Hesabınız yok mu?{' '}
                  <span className="underline">Kayıt olun</span>
                </>
              ) : (
                <>
                  Hesabınız var mı?{' '}
                  <span className="underline">Giriş yapın</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}