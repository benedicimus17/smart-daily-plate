import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { X, User, Mail, Phone, Lock, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Збережіть свій прогрес у NUTRIQ',
  subtitle = 'Зареєструйтесь в 1 крок, щоб синхронізувати щоденник, отримувати персональні плани та зберегти ваші страви.'
}) => {
  const { registerUser } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [useBiometrics, setUseBiometrics] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      setError('Будь ласка, вкажіть Email та номер телефону');
      return;
    }
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      registerUser({
        name: name.trim() || 'Alistair',
        email: email.trim(),
        phone: phone.trim(),
        password
      });
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    }, 450);
  };

  const handleBiometricAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      registerUser({
        name: name.trim() || 'Користувач Apple',
        email: email.trim() || 'apple.user@nutriq.studio',
        phone: phone.trim() || '+380501234567'
      });
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-[32px] overflow-hidden p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, rgba(24,34,28,0.95) 0%, rgba(13,18,15,0.98) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.12)'
        }}
      >
        {/* Фонове атмосферне золоте світіння */}
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,180,56,0.16) 0%, transparent 70%)',
            filter: 'blur(24px)'
          }}
        />

        {/* Кнопка закриття */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Шапка модалки */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase">
            NUTRIQ Cloud Profile
          </span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          {subtitle}
        </p>

        {/* Швидкий вхід через Face ID / Touch ID */}
        <button
          type="button"
          onClick={handleBiometricAuth}
          className="w-full mt-4 py-2.5 px-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center gap-2.5 transition-all text-xs font-semibold text-zinc-200 active:scale-[0.98]"
        >
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>Увійти через Face ID / Touch ID</span>
        </button>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">або через пошту</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Ім'я */}
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше ім'я"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (для щотижневого звіту)"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>

          {/* Телефон */}
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Номер телефону (+380...)"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>

          {/* Пароль (опціонально) */}
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль / PIN-код"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>

          {/* Перемикач біометрії */}
          <label className="flex items-center justify-between px-1 py-1 text-[11px] text-zinc-400 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Швидкий вхід за Face ID надалі</span>
            </span>
            <input
              type="checkbox"
              checked={useBiometrics}
              onChange={(e) => setUseBiometrics(e.target.checked)}
              className="rounded accent-amber-400"
            />
          </label>

          {/* Кнопка дії */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 rounded-2xl font-bold text-xs tracking-wide text-zinc-950 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
              boxShadow: '0 8px 20px rgba(245,158,11,0.35)'
            }}
          >
            {isSubmitting ? (
              <span>Збереження профілю...</span>
            ) : (
              <span>Зареєструватися та продовжити</span>
            )}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Продовжити як гість (без збереження в хмару)
          </button>
        </div>
      </div>
    </div>
  );
};
