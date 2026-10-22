import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useNutritionStore } from '../store/nutritionStore';
import { calculatePersonalPlan } from '../math/planCalculator';
import { Gender, ActivityLevel, NutritionGoal, WeightLossPace } from '../types/user';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  X
} from 'lucide-react';

interface MyPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const MyPlanWizard: React.FC<MyPlanWizardProps> = ({ isOpen, onClose, onCompleted }) => {
  const { user, savePlanAndRegister } = useUserStore();
  const { updateTargets } = useNutritionStore();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Кроки форми
  const [goal, setGoal] = useState<NutritionGoal>(user.goal || 'lose_weight');
  const [gender, setGender] = useState<Gender>(user.gender || 'female');
  const [age, setAge] = useState<number>(user.age || 29);
  const [weightKg, setWeightKg] = useState<number>(user.weightKg || 70);
  const [heightCm, setHeightCm] = useState<number>(user.heightCm || 160);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user.activityLevel || 'moderate');
  const [pace, setPace] = useState<WeightLossPace>(user.pace || 'fast');
  const [eatingRhythm, setEatingRhythm] = useState<'3_meals' | '5_meals'>(user.eatingRhythm || '3_meals');
  const [takesProtein, setTakesProtein] = useState<boolean>(user.takesProtein || false);

  // Дані фінальної реєстрації
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Детермінований розрахунок
  const plan = calculatePersonalPlan({
    gender,
    age,
    weightKg,
    heightCm,
    activityLevel,
    goal,
    pace
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Зберігаємо план та реєструємо користувача (приймає будь-які слова / символи для тесту)
      const inputStr = email.trim();
      const effectiveEmail = inputStr || 'test.user@nutriq.app';
      const effectiveName = inputStr || (gender === 'female' ? 'Анна' : 'Олексій');

      savePlanAndRegister(
        { gender, age, weightKg, heightCm, activityLevel, goal, pace, eatingRhythm, takesProtein },
        plan.targets,
        {
          name: effectiveName,
          email: effectiveEmail,
          phone: phone.trim() || '+380501234567',
          password
        }
      );

      // 2. Оновлюємо цілі в щоденнику головного екрана
      updateTargets(plan.targets);

      setIsSubmitting(false);
      onCompleted?.();
      onClose();
    }, 400);
  };

  const handleGuestSkip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      savePlanAndRegister(
        { gender, age, weightKg, heightCm, activityLevel, goal, pace, eatingRhythm, takesProtein },
        plan.targets,
        {
          name: 'Гість',
          email: '',
          phone: '',
          password: ''
        }
      );
      updateTargets(plan.targets);
      setIsSubmitting(false);
      onCompleted?.();
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/85 backdrop-blur-lg animate-fadeIn select-none overflow-y-auto">
      <div
        className="relative w-full max-w-sm rounded-[32px] overflow-hidden p-5 my-auto transition-all"
        style={{
          background: 'linear-gradient(165deg, rgba(22,32,26,0.96) 0%, rgba(11,16,13,0.98) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.14)'
        }}
      >
        {/* Фонове золоте світіння */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,180,56,0.18) 0%, transparent 70%)',
            filter: 'blur(30px)'
          }}
        />

        {/* Кнопка закриття */}
        <button
          id="wizard-close-x-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Прогрес-бар */}
        <div className="flex items-center gap-1.5 mb-4 pr-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-amber-400' : 'bg-white/10'
              }`}
            />
          ))}
          <span className="text-[10px] font-bold text-amber-400/90 pl-1">
            {step}/{totalSteps}
          </span>
        </div>

        {/* КРОК 1: Ціль */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Крок 1 • Мета
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Чого саме ви хочете досягти?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Комп'ютер підбере індивідуальний калораж та БЖУ під вашу ціль
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setGoal('lose_weight')}
                className={`w-full p-3 rounded-2xl border text-left transition-all ${
                  goal === 'lose_weight'
                    ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm text-amber-300">Схуднути</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Спалити зайвий жир без повернення ваги</div>
              </button>

              <button
                type="button"
                onClick={() => setGoal('recomp')}
                className={`w-full p-3 rounded-2xl border text-left transition-all ${
                  goal === 'recomp'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm text-emerald-300">Рельєф і тонус</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Підсушити тіло та зберегти пружні м’язи</div>
              </button>

              <button
                type="button"
                onClick={() => setGoal('maintain')}
                className={`w-full p-3 rounded-2xl border text-left transition-all ${
                  goal === 'maintain'
                    ? 'bg-indigo-500/20 border-indigo-500/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm text-indigo-300">Підтримка ваги</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Їсти в балансі та зафіксувати поточну форму</div>
              </button>
            </div>

            <button
              id="wizard-step1-next"
              type="button"
              onClick={handleNext}
              className="w-full mt-4 py-3 rounded-2xl font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                boxShadow: '0 6px 18px rgba(245,158,11,0.35)'
              }}
            >
              <span>Далі</span>
              <ArrowRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        )}

        {/* КРОК 2: Стать та Вік */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Крок 2 • Фізіологія
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Ваша стать та вік
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Для точного розрахунку базового метаболізму (BMR)
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Стать
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    gender === 'female'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Жінка
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    gender === 'male'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Чоловік
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Вік (років)
              </label>
              <input
                type="number"
                min="14"
                max="95"
                value={age}
                onChange={(e) => setAge(Math.max(14, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-base font-bold text-white text-center focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-2xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/5 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                id="wizard-step2-next"
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                  boxShadow: '0 6px 18px rgba(245,158,11,0.35)'
                }}
              >
                <span>Далі</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>
            </div>
          </div>
        )}

        {/* КРОК 3: Зріст та Вага */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Крок 3 • Параметри тіла
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Скільки ви важите і який зріст?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Наприклад: 70 кг та 160 см
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Вага (кг)
                </label>
                <input
                  type="number"
                  min="35"
                  max="220"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(35, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-lg font-black text-amber-300 text-center focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Зріст (см)
                </label>
                <input
                  type="number"
                  min="120"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(120, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-lg font-black text-white text-center focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
              💡 Базовий метаболізм (BMR): <strong className="text-amber-300">{plan.bmr} ккал</strong> — стільки тіло спалює у спокої щодня.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-2xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/5 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                id="wizard-step2-next"
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                  boxShadow: '0 6px 18px rgba(245,158,11,0.35)'
                }}
              >
                <span>Далі</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>
            </div>
          </div>
        )}

        {/* КРОК 4: Активність та кроки */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Крок 4 • Рух
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Скільки ви рухаєтесь щодня?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Займаєтесь спортом? Скільки приблизно ходите?
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setActivityLevel('sedentary')}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all ${
                  activityLevel === 'sedentary'
                    ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-zinc-200">Малорухливий</div>
                <div className="text-[11px] text-zinc-500">Сидяча робота, до 5 000 кроків, без спорту</div>
              </button>

              <button
                type="button"
                onClick={() => setActivityLevel('light')}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all ${
                  activityLevel === 'light'
                    ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-zinc-200">Легка активність</div>
                <div className="text-[11px] text-zinc-500">6 000–8 000 кроків або 1-2 тренування на тиждень</div>
              </button>

              <button
                type="button"
                onClick={() => setActivityLevel('moderate')}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all ${
                  activityLevel === 'moderate'
                    ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-amber-300">Помірна активність</div>
                <div className="text-[11px] text-zinc-400">9 000–12 000 кроків або 3-4 тренування (оптимально)</div>
              </button>

              <button
                type="button"
                onClick={() => setActivityLevel('high')}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all ${
                  activityLevel === 'high'
                    ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-zinc-200">Висока активність</div>
                <div className="text-[11px] text-zinc-500">12 000+ кроків, важкі щоденні навантаження</div>
              </button>
            </div>

            {/* Добавки / Протеїн */}
            <div className="pt-2 border-t border-white/5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Чи вживаєте протеїн або спортивні добавки?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTakesProtein(true)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    takesProtein
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-black/30 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  Так (шейки / снеки)
                </button>
                <button
                  type="button"
                  onClick={() => setTakesProtein(false)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    !takesProtein
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
                      : 'bg-black/30 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  Ні, лише звичайна їжа
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-2xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/5 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                id="wizard-step4-next"
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                  boxShadow: '0 6px 18px rgba(245,158,11,0.35)'
                }}
              >
                <span>Далі</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>
            </div>
          </div>
        )}

        {/* КРОК 5: Ритм харчування + Темп схуднення + Розумна порада нутриціолога проти йо-йо */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Крок 5 • Ритм і темп
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Як вам зручніше харчуватися?
              </h3>
            </div>

            {/* Ритм прийомів їжі */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Ритм прийомів їжі
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEatingRhythm('3_meals')}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    eatingRhythm === '3_meals'
                      ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300">3 прийоми</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Сніданок, обід, вечеря (Дзен)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setEatingRhythm('5_meals')}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    eatingRhythm === '5_meals'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-sm'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-emerald-300">5 прийомів</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Дробове з перекусами</div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Темп схуднення
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPace('fast')}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    pace === 'fast'
                      ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-sm'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-rose-300">Швидко</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Максимальний темп</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPace('steady')}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    pace === 'steady'
                      ? 'bg-amber-400/20 border-amber-400/60 text-white shadow-sm'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300">Поступово</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Без стресу та зривів</div>
                </button>
              </div>
            </div>

            {/* ВЕРДИКТ КОМП'ЮТЕРА ТА ПОРАДА ПРОТИ ЙО-ЙО */}
            <div
              className={`p-3.5 rounded-2xl border ${
                pace === 'fast'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-white mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{plan.nutritionistAdvice.title}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-zinc-200">
                {plan.nutritionistAdvice.message}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-zinc-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Витрати тіла (TDEE):</span>
                <span className="font-bold text-white">~{plan.maintenanceCalories} ккал</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Рекомендований ліміт:</span>
                <span className="font-extrabold text-amber-300">{plan.targetCalories} ккал</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-2xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/5 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                id="wizard-step5-next"
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                  boxShadow: '0 6px 18px rgba(245,158,11,0.35)'
                }}
              >
                <span>Переглянути розрахунок</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>
            </div>
          </div>
        )}

        {/* КРОК 6: 4 КОЛОНКИ + ОБОВ'ЯЗКОВА РЕЄСТРАЦІЯ (GATE) */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Ваш персональний розрахунок готовий
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Твій ліміт — {plan.targetCalories} ккал
              </h3>
            </div>

            {/* 4 КОЛОНКИ БЖУ */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-2 rounded-2xl bg-black/50 border border-amber-400/40 flex flex-col items-center">
                <span className="text-[9.5px] font-bold text-amber-300 uppercase">Калорії</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.calories}
                </span>
                <span className="text-[9px] text-zinc-400">ккал</span>
              </div>

              <div className="p-2 rounded-2xl bg-black/50 border border-emerald-400/40 flex flex-col items-center">
                <span className="text-[9.5px] font-bold text-emerald-300 uppercase">Протеїн</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.protein}
                </span>
                <span className="text-[9px] text-zinc-400">грам</span>
              </div>

              <div className="p-2 rounded-2xl bg-black/50 border border-amber-500/40 flex flex-col items-center">
                <span className="text-[9.5px] font-bold text-amber-400 uppercase">Жири</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.fat}
                </span>
                <span className="text-[9px] text-zinc-400">грам</span>
              </div>

              <div className="p-2 rounded-2xl bg-black/50 border border-indigo-400/40 flex flex-col items-center">
                <span className="text-[9.5px] font-bold text-indigo-300 uppercase">Вуглеводи</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.carbs}
                </span>
                <span className="text-[9px] text-zinc-400">грам</span>
              </div>
            </div>

            {/* ШЛЮЗ РЕЄСТРАЦІЇ: "Зафіксуйте свій план та перейдіть до меню" */}
            <div className="pt-2 border-t border-white/10">
              <div className="mb-2.5">
                <h4 className="text-xs font-bold text-white">
                  Збережіть свій розрахунок
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Введіть Email (або будь-які тестові слова для перевірки), або зайдіть як гість.
                </p>
              </div>

              {regError && (
                <div className="mb-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 text-center">
                  {regError}
                </div>
              )}

              <form onSubmit={handleFinalRegister} className="space-y-2">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-zinc-500" />
                  <input
                    id="wizard-email-input"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email або будь-які два слова для тесту"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-zinc-500" />
                  <input
                    id="wizard-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль або PIN (необов'язково для тесту)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-zinc-500" />
                  <input
                    id="wizard-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон (необов'язково)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <button
                  id="wizard-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3 rounded-2xl font-bold text-xs tracking-wide text-zinc-950 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                    boxShadow: '0 8px 22px rgba(245,158,11,0.35)'
                  }}
                >
                  {isSubmitting ? (
                    <span>Збереження плану...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                      <span>Зареєструватися та перейти до меню</span>
                    </>
                  )}
                </button>

                <button
                  id="wizard-guest-btn"
                  type="button"
                  onClick={handleGuestSkip}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Пропустити та зайти як гість</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
