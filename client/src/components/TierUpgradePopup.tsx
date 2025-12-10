import { X, Sparkles, Gift, TrendingUp, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TierUpgradePopupProps {
  newTier: string
  onClose: () => void
}

export function TierUpgradePopup({ newTier, onClose }: TierUpgradePopupProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setShow(true), 100)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  const getTierInfo = () => {
    if (newTier === 'bronz') {
      return {
        title: 'Tebrikler! Bronz Üye Oldunuz! 🥈',
        icon: '🥈',
        color: 'from-orange-500 to-amber-600',
        bgColor: 'from-orange-50 to-amber-50',
        accentColor: 'orange-500',
        benefits: [
          {
            icon: '🚚',
            title: 'Ücretsiz Kargo',
            description: 'Tüm siparişlerinizde ücretsiz kargo'
          },
          {
            icon: '💰',
            title: '%10 Otomatik İndirim',
            description: 'Sepetinizde otomatik olarak %10 indirim uygulanır'
          },
          {
            icon: '⭐',
            title: 'Özel Kampanyalar',
            description: 'Bronz üyelere özel fırsatlardan yararlanın'
          }
        ],
        message: 'Artık tüm alışverişlerinizde %10 indirim kazanıyorsunuz!',
        nextGoal: 'Altın seviyeye ulaşmak için 5.000₺ alışveriş hedefine devam edin!'
      }
    } else if (newTier === 'altin') {
      return {
        title: 'Muhteşem! Altın VIP Üye Oldunuz! 🥇',
        icon: '🥇',
        color: 'from-yellow-500 to-amber-600',
        bgColor: 'from-yellow-50 to-amber-50',
        accentColor: 'yellow-500',
        benefits: [
          {
            icon: '🚚',
            title: 'Ücretsiz Kargo',
            description: 'Tüm siparişlerinizde ücretsiz kargo'
          },
          {
            icon: '💎',
            title: '%15 Otomatik İndirim',
            description: 'Sepetinizde otomatik olarak %15 indirim uygulanır'
          },
          {
            icon: '🎯',
            title: 'Özel İndirim Teklifi',
            description: 'Sepette %10\'a kadar ekstra indirim teklif edebilirsiniz'
          },
          {
            icon: '👑',
            title: 'VIP Pazarlık Hakkı',
            description: 'Toplam %25\'e kadar indirimden faydalanabilirsiniz'
          },
          {
            icon: '🎁',
            title: 'Özel Kampanyalar',
            description: 'Altın üyelere özel VIP fırsatlar ve öncelikli erişim'
          }
        ],
        message: 'En üst seviyeye ulaştınız! Tüm VIP ayrıcalıklardan yararlanın!',
        nextGoal: null
      }
    }
    return null
  }

  const tierInfo = getTierInfo()
  if (!tierInfo) return null

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'}`}>
      {/* Confetti Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {['⭐', '✨', '💫', '🎉', '🎊', '🌟'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>

      {/* Popup Card */}
      <div 
        className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl transform transition-all duration-500 max-h-[90vh] overflow-y-auto ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
        }`}
      >
        {/* Header with Gradient */}
        <div className={`relative bg-gradient-to-r ${tierInfo.color} p-8 rounded-t-3xl overflow-hidden`}>
          {/* Animated Circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-64 h-64 bg-white/20 rounded-full -top-32 -right-32 animate-pulse"></div>
            <div className="absolute w-48 h-48 bg-white/10 rounded-full -bottom-24 -left-24 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Icon */}
          <div className="relative flex justify-center mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl animate-bounce">
              {tierInfo.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="relative text-center text-white text-2xl mb-2">
            {tierInfo.title}
          </h2>
          <p className="relative text-center text-white/90 text-sm">
            {tierInfo.message}
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Benefits Section */}
          <div className={`bg-gradient-to-br ${tierInfo.bgColor} rounded-2xl p-6 mb-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Gift className={`w-6 h-6 text-${tierInfo.accentColor}`} />
              <h3 className="text-lg text-gray-900">Yeni Avantajlarınız</h3>
            </div>
            
            <div className="space-y-4">
              {tierInfo.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    animation: `slideInLeft 0.5s ease-out ${index * 0.1}s backwards`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{benefit.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{benefit.title}</p>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Goal */}
          {tierInfo.nextGoal && (
            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border-2 border-indigo-100">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Sonraki Hedef</p>
                  <p className="text-sm text-indigo-700">{tierInfo.nextGoal}</p>
                </div>
              </div>
            </div>
          )}

          {/* VIP Badge for Gold */}
          {newTier === 'altin' && (
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-6 text-center mb-6">
              <Crown className="w-12 h-12 text-white mx-auto mb-3 animate-pulse" />
              <p className="text-white font-bold text-lg">VIP Üye</p>
              <p className="text-white/90 text-sm mt-1">En yüksek seviyeye ulaştınız!</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleClose}
            className={`w-full bg-gradient-to-r ${tierInfo.color} text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Harika! Alışverişe Devam</span>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-confetti {
          animation: confetti 5s linear infinite;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  )
}