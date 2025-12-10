import { useState, useEffect } from 'react'
import { Auth } from './components/Auth'
import { CustomerView } from './components/CustomerView'
import { AdminView } from './components/AdminView'
import { InditexLanding } from './components/InditexLanding'
import { TierInfoModal, useWelcomeModal } from './components/TierInfoModal'
import { getSession, getProfile } from './utils/api'
import { Toaster } from './components/ui/sonner' 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showLanding, setShowLanding] = useState(true)

  const { isOpen, onClose } = useWelcomeModal()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const session = await getSession()
      if (session) {
        setIsAuthenticated(true)
        const profile = await getProfile()
        setIsAdmin(profile?.isAdmin || false)
      }
    } catch (error) {
      console.error('Auth hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true)
    setShowAuth(false)
    const profile = await getProfile()
    setIsAdmin(profile?.isAdmin || false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsAdmin(false)
    setShowAuth(false)
    setShowLanding(true)
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">YÜKLENİYOR...</div>
  }

  return (
    <>
      {/* Bildirimlerin sağ üstte çıkmasını sağlayan yer. yeni yazdım */}
      <Toaster position="top-right" richColors />
      
      <TierInfoModal isOpen={isOpen} onClose={onClose} />

      {(() => {
        if (showLanding) {
          return <InditexLanding onStart={() => setShowLanding(false)} />
        }

        if (showAuth && !isAuthenticated) {
          return <Auth onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
        }

        if (isAuthenticated && isAdmin) {
          return <AdminView onLogout={handleLogout} />
        }

        return (
          <CustomerView 
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            onShowAuth={() => setShowAuth(true)}
          />
        )
      })()}
    </>
  )
}