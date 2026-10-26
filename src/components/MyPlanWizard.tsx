import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useNutritionStore } from '../store/nutritionStore';
import { calculatePersonalPlan } from '../math/planCalculator';
import { Gender, ActivityLevel, NutritionGoal, WeightLossPace } from '../types/user';
import {
  DietType,
  StandardAllergen,
  ALLERGEN_META,
  UserDietaryRestrictions
} from '../services/allergenService';
import { trackEvent } from '../services/analyticsService';
import {
  ArrowLeft,
  X,
  CheckCircle2,
  Mail,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { LegalModal } from './LegalModal';

interface MyPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const MyPlanWizard: React.FC<MyPlanWizardProps> = ({ isOpen, onClose, onCompleted }) => {
  const { user, savePlanAndRegister } = useUserStore();
  const { updateTargets, generateMenuForTargets } = useNutritionStore();

  // Номер поточного питання: 1..9
  const [questionIndex, setQuestionIndex] = useState<number>(1);

  // Параметри
  const [goal, setGoal] = useState<NutritionGoal>(user.goal || 'lose_weight');
  const [gender, setGender] = useState<Gender>(user.gender || 'female');
  
  // Числові значення у вигляді рядків для вільного вводу без затискання при backspace
  const [ageInput, setAgeInput] = useState<string>(String(user.age || (user.gender === 'male' ? 30 : 25)));
  const [weightInput, setWeightInput] = useState<string>(String(user.weightKg || (user.gender === 'male' ? 82 : 57)));
  const [heightInput, setHeightInput] = useState<string>(String(user.heightCm || (user.gender === 'male' ? 180 : 162)));

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user.activityLevel || 'light');
  const [takesProtein, setTakesProtein] = useState<boolean>(user.takesProtein || false);
  const [eatingRhythm, setEatingRhythm] = useState<'3_meals' | '5_meals'>(user.eatingRhythm || '3_meals');
  const [pace, setPace] = useState<WeightLossPace>(user.pace || 'steady');

  // Особливості харчування та алергії (Stage 6.5)
  const [dietType, setDietType] = useState<DietType>(user.dietType || 'standard');
  const [allergens, setAllergens] = useState<StandardAllergen[]>(user.allergens || []);
  const [customAllergies, setCustomAllergies] = useState<string[]>(user.customAllergies || []);
  const [customInput, setCustomInput] = useState<string>('');

  // Дані реєстрації
  const [email, setEmail] = useState(user.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackEvent('onboarding_started');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Парсинг числових значень із захистом від NaN
  const parsedAge = Math.max(14, Math.min(99, parseInt(ageInput, 10) || 25));
  const parsedWeight = Math.max(35, Math.min(250, parseFloat(weightInput) || 60));
  const parsedHeight = Math.max(120, Math.min(240, parseFloat(heightInput) || 165));

  // Розрахунок плану
  const plan = calculatePersonalPlan({
    gender,
    age: parsedAge,
    weightKg: parsedWeight,
    heightCm: parsedHeight,
    activityLevel,
    goal,
    pace
  });

  const handleBack = () => {
    if (questionIndex > 1) {
      setQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    trackEvent('onboarding_step_completed', { nextStep: questionIndex + 1 });
    setQuestionIndex((prev) => prev + 1);
  };

  // 1-тап вибір для категорій (миттєвий авто-перехід)
  const selectAndAdvance = <T,>(setter: (val: T) => void, val: T) => {
    setter(val);
    trackEvent('onboarding_step_completed', { nextStep: questionIndex + 1 });
    setQuestionIndex((prev) => prev + 1);
  };

  const toggleAllergen = (item: StandardAllergen) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleAddCustomAllergy = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!customAllergies.includes(trimmed)) {
      setCustomAllergies((prev) => [...prev, trimmed]);
    }
    setCustomInput('');
  };

  const handleRemoveCustomAllergy = (name: string) => {
    setCustomAllergies((prev) => prev.filter((a) => a !== name));
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const inputStr = email.trim();
      const effectiveEmail = inputStr || 'test.user@nutriq.app';
      const effectiveName = inputStr || (gender === 'female' ? 'Анна' : 'Олексій');

      savePlanAndRegister(
        {
          gender,
          age: parsedAge,
          weightKg: parsedWeight,
          heightCm: parsedHeight,
          activityLevel,
          goal,
          pace,
          eatingRhythm,
          takesProtein,
          dietType,
          allergens,
          customAllergies
        },
        plan.targets,
        {
          name: effectiveName,
          email: effectiveEmail,
          phone: user.phone || '+380501234567',
          password: ''
        }
      );

      const restrictions: UserDietaryRestrictions = {
        dietType,
        allergens,
        customAllergies
      };

      trackEvent('onboarding_completed', {
        dietType,
        isGuest: false,
        eatingRhythm,
        goal,
        pace
      });
      generateMenuForTargets(plan.targets, eatingRhythm, { userRestrictions: restrictions });
      updateTargets(plan.targets);
      setIsSubmitting(false);
      onCompleted?.();
      onClose();
    }, 350);
  };

  const handleGuestSkip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      trackEvent('onboarding_completed', {
        dietType,
        isGuest: true,
        eatingRhythm,
        goal,
        pace
      });
      savePlanAndRegister(
        {
          gender,
          age: parsedAge,
          weightKg: parsedWeight,
          heightCm: parsedHeight,
          activityLevel,
          goal,
          pace,
          eatingRhythm,
          takesProtein,
          dietType,
          allergens,
          customAllergies
        },
        plan.targets,
        {
          name: 'Гість',
          email: '',
          phone: '',
          password: ''
        }
      );

      const restrictions: UserDietaryRestrictions = {
        dietType,
        allergens,
        customAllergies
      };

      generateMenuForTargets(plan.targets, eatingRhythm, { userRestrictions: restrictions });
      updateTargets(plan.targets);
      setIsSubmitting(false);
      onCompleted?.();
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090D0B] text-zinc-100 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto animate-fadeIn select-none">
      {/* Фонове атмосферне світіння */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Верхня панель: Навігація назад та Закриття */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4 shrink-0 relative z-10">
        {questionIndex > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-90 cursor-pointer"
            title="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        <button
          id="wizard-close-x-btn"
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90 cursor-pointer"
          title="Закрити"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Центральна зона контенту з окремими питаннями */}
      <div className="w-full max-w-md mx-auto my-auto py-2 relative z-10 flex flex-col justify-center">
        {/* ======================================================== */}
        {/* ПИТАННЯ 1: Ціль (1-тап автоперехід) */}
        {/* ======================================================== */}
        {questionIndex === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Чого ви прагнете досягти?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Оберіть головний вектор для розрахунку вашого раціону
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  id: 'lose_weight',
                  title: 'Схуднути',
                  desc: 'Спалити зайвий підшкірний жир без повернення ваги',
                  color: 'border-amber-400/40 hover:border-amber-400 hover:bg-amber-400/10'
                },
                {
                  id: 'recomp',
                  title: 'Рельєф і тонус',
                  desc: 'Підсушити тіло та зберегти пружну м’язову форму',
                  color: 'border-emerald-400/40 hover:border-emerald-400 hover:bg-emerald-400/10'
                },
                {
                  id: 'maintain',
                  title: 'Підтримка ваги',
                  desc: 'Їсти в балансі та зафіксувати поточну форму',
                  color: 'border-indigo-400/40 hover:border-indigo-400 hover:bg-indigo-400/10'
                },
                {
                  id: 'gain',
                  title: 'Набір маси',
                  desc: 'Збільшити об’єм сухої м’язової маси',
                  color: 'border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10'
                }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`goal-${item.id}`}
                  type="button"
                  onClick={() => selectAndAdvance<NutritionGoal>(setGoal, item.id as NutritionGoal)}
                  className={`w-full p-4 rounded-2xl bg-black/40 border text-left transition-all active:scale-[0.98] cursor-pointer shadow-lg ${item.color} ${
                    goal === item.id ? 'ring-2 ring-amber-400/80 bg-white/[0.04]' : ''
                  }`}
                >
                  <div className="text-base font-bold text-white">{item.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 2: Стать (1-тап автоперехід) */}
        {/* ======================================================== */}
        {questionIndex === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ваша стать
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Для коректного підрахунку базового метаболізму
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="gender-female"
                type="button"
                onClick={() => selectAndAdvance<Gender>(setGender, 'female')}
                className={`py-8 px-4 rounded-3xl bg-black/40 border text-center transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-amber-400/80 hover:bg-amber-400/10 ${
                  gender === 'female' ? 'border-amber-400 ring-2 ring-amber-400/80 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-3xl mb-2">🌸</div>
                <div className="text-lg font-bold text-white">Жінка</div>
              </button>

              <button
                id="gender-male"
                type="button"
                onClick={() => selectAndAdvance<Gender>(setGender, 'male')}
                className={`py-8 px-4 rounded-3xl bg-black/40 border text-center transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-amber-400/80 hover:bg-amber-400/10 ${
                  gender === 'male' ? 'border-amber-400 ring-2 ring-amber-400/80 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-lg font-bold text-white">Чоловік</div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 3: Вік (Вільний цифровий ввід без затискання) */}
        {/* ======================================================== */}
        {questionIndex === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Скільки вам повних років?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Введіть число цифрами
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center">
              <div className="relative w-44">
                <input
                  id="wizard-age-input"
                  type="text"
                  inputMode="numeric"
                  value={ageInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setAgeInput(clean);
                  }}
                  placeholder="25"
                  className="w-full py-4 text-center text-4xl sm:text-5xl font-extrabold text-amber-300 bg-black/50 border-2 border-amber-400/50 rounded-3xl focus:outline-none focus:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                  autoFocus
                />
                <span className="block text-center text-xs font-semibold text-zinc-400 mt-2">
                  років
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                id="wizard-age-next"
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Продовжити</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 4: Вага та Зріст (Вільний цифровий ввід) */}
        {/* ======================================================== */}
        {questionIndex === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ваша вага та зріст
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Введіть точні значення для формули Міффліна-Сан Жеора
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Вага (кг)
                </label>
                <input
                  id="wizard-weight-input"
                  type="text"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, '');
                    setWeightInput(clean);
                  }}
                  placeholder="57"
                  className="w-full py-4 text-center text-3xl sm:text-4xl font-extrabold text-amber-300 bg-black/50 border-2 border-amber-400/40 rounded-3xl focus:outline-none focus:border-amber-400 shadow-md"
                />
              </div>

              <div className="flex flex-col items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Зріст (см)
                </label>
                <input
                  id="wizard-height-input"
                  type="text"
                  inputMode="numeric"
                  value={heightInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setHeightInput(clean);
                  }}
                  placeholder="162"
                  className="w-full py-4 text-center text-3xl sm:text-4xl font-extrabold text-white bg-black/50 border-2 border-white/20 rounded-3xl focus:outline-none focus:border-amber-400 shadow-md"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 text-center">
              💡 Базовий метаболізм (BMR): <strong className="text-amber-300 font-bold">{plan.bmr} ккал</strong> — щоденні мінімальні енерговитрати у спокої.
            </div>

            <div className="pt-2">
              <button
                id="wizard-body-next"
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Продовжити</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 5: Рівень активності (1-тап автоперехід) */}
        {/* ======================================================== */}
        {questionIndex === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Скільки ви рухаєтесь щодня?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Займаєтесь спортом? Скільки приблизно ходите пішки?
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  id: 'sedentary',
                  title: 'Малорухливий спосіб',
                  desc: 'Сидяча робота, до 5 000 кроків, без регулярного спорту'
                },
                {
                  id: 'light',
                  title: 'Легка активність',
                  desc: '6 000–8 000 кроків або 1–2 легкі тренування на тиждень'
                },
                {
                  id: 'moderate',
                  title: 'Помірна активність',
                  desc: '9 000–12 000 кроків або 3–4 тренування (оптимально)'
                },
                {
                  id: 'high',
                  title: 'Висока активність',
                  desc: '12 000+ кроків, щоденні важкі фізичні навантаження'
                }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`activity-${item.id}`}
                  type="button"
                  onClick={() => selectAndAdvance<ActivityLevel>(setActivityLevel, item.id as ActivityLevel)}
                  className={`w-full p-3.5 rounded-2xl bg-black/40 border text-left transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-amber-400 hover:bg-amber-400/10 ${
                    activityLevel === item.id ? 'border-amber-400 ring-2 ring-amber-400/70 bg-white/[0.04]' : 'border-white/10'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 6: Спортивне харчування / Протеїн (1-тап автоперехід) */}
        {/* ======================================================== */}
        {questionIndex === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Чи вживаєте ви протеїн?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Спортивні шейки, протеїнові батончики або інші добавки
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="protein-yes"
                type="button"
                onClick={() => selectAndAdvance<boolean>(setTakesProtein, true)}
                className={`py-8 px-4 rounded-3xl bg-black/40 border text-center transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-emerald-400/80 hover:bg-emerald-400/10 ${
                  takesProtein ? 'border-emerald-400 ring-2 ring-emerald-400/80 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-3xl mb-2">🥤</div>
                <div className="text-base font-bold text-white">Так</div>
                <div className="text-xs text-zinc-400 mt-1">Шейки або батончики</div>
              </button>

              <button
                id="protein-no"
                type="button"
                onClick={() => selectAndAdvance<boolean>(setTakesProtein, false)}
                className={`py-8 px-4 rounded-3xl bg-black/40 border text-center transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-amber-400/80 hover:bg-amber-400/10 ${
                  !takesProtein ? 'border-amber-400 ring-2 ring-amber-400/80 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-3xl mb-2">🥗</div>
                <div className="text-base font-bold text-white">Ні</div>
                <div className="text-xs text-zinc-400 mt-1">Лише звичайна їжа</div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 7: Ритм харчування (1-тап автоперехід) */}
        {/* ======================================================== */}
        {questionIndex === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Який ритм їжі вам зручніший?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Система розподілить калораж по прийомах протягом доби
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="rhythm-3meals"
                type="button"
                onClick={() => selectAndAdvance<'3_meals' | '5_meals'>(setEatingRhythm, '3_meals')}
                className={`w-full p-4 rounded-2xl bg-black/40 border text-left transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-amber-400 hover:bg-amber-400/10 ${
                  eatingRhythm === '3_meals' ? 'border-amber-400 ring-2 ring-amber-400/70 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-base font-bold text-amber-300">🍽️ 3 прийоми на день</div>
                <div className="text-xs text-zinc-300 mt-1">
                  Сніданок, ситний обід та легка вечеря (Дзен-формат без перекусів)
                </div>
              </button>

              <button
                id="rhythm-5meals"
                type="button"
                onClick={() => selectAndAdvance<'3_meals' | '5_meals'>(setEatingRhythm, '5_meals')}
                className={`w-full p-4 rounded-2xl bg-black/40 border text-left transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-emerald-400 hover:bg-emerald-400/10 ${
                  eatingRhythm === '5_meals' ? 'border-emerald-400 ring-2 ring-emerald-400/70 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-base font-bold text-emerald-300">🍱 5 дробових прийомів</div>
                <div className="text-xs text-zinc-300 mt-1">
                  Сніданок, перший перекус, обід, полуденок та вечеря кожні 3–3.5 години
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 8: Темп (1-тап автоперехід) */}
        {/* ======================================================== */}
        {questionIndex === 8 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Оберіть темп досягнення цілі
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Швидкість зміни маси тіла
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="pace-steady"
                type="button"
                onClick={() => selectAndAdvance<WeightLossPace>(setPace, 'steady')}
                className={`w-full p-4 rounded-2xl bg-black/40 border text-left transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-amber-400 hover:bg-amber-400/10 ${
                  pace === 'steady' ? 'border-amber-400 ring-2 ring-amber-400/70 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-base font-bold text-amber-300">🌿 Поступово (Золотий стандарт)</div>
                <div className="text-xs text-zinc-300 mt-1">
                  Комфортний збалансований дефіцит без голоду, зривів та стресу для нервової системи.
                </div>
              </button>

              <button
                id="pace-fast"
                type="button"
                onClick={() => selectAndAdvance<WeightLossPace>(setPace, 'fast')}
                className={`w-full p-4 rounded-2xl bg-black/40 border text-left transition-all active:scale-[0.98] cursor-pointer shadow-lg hover:border-rose-400 hover:bg-rose-400/10 ${
                  pace === 'fast' ? 'border-rose-400 ring-2 ring-rose-400/70 bg-white/[0.04]' : 'border-white/10'
                }`}
              >
                <div className="text-base font-bold text-rose-300">⚡ Швидко (Максимальний темп)</div>
                <div className="text-xs text-zinc-300 mt-1">
                  Максимально допустимий здоровий дефіцит калорій для якнайшвидшого результату.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 9: Особливості харчування та алергії (Stage 6.5) */}
        {/* ======================================================== */}
        {questionIndex === 9 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Безпека та адаптація раціону</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Тип дієти та алергії
              </h2>
              <p className="text-xs text-zinc-400">
                Комп'ютер автоматично виключить заборонені продукти з вашого першого меню
              </p>
            </div>

            {/* ВИБІР ТИПУ ДІЄТИ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Тип харчування
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', title: '🥩 Звичайний', desc: 'Мʼясо, птиця, риба, все' },
                  { id: 'vegetarian', title: '🌱 Вегетаріанське', desc: 'Без мʼяса та птиці' },
                  { id: 'vegan', title: '🌿 Веганське', desc: '100% рослинні продукти' },
                  { id: 'pescatarian', title: '🐟 Пескетаріанське', desc: 'Риба, морепродукти' }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`wizard-diet-${item.id}`}
                    type="button"
                    onClick={() => setDietType(item.id as DietType)}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                      dietType === item.id
                        ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/70'
                        : 'border-white/10 bg-black/40 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* СПИСОК АЛЕРГЕНІВ */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Алергії та непереносимості
                </label>
                <span className="text-[10px] text-zinc-500">Оберіть усі, що є</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(ALLERGEN_META) as StandardAllergen[]).map((key) => {
                  const meta = ALLERGEN_META[key];
                  const isSelected = allergens.includes(key);
                  return (
                    <button
                      key={key}
                      id={`wizard-allergen-${key}`}
                      type="button"
                      onClick={() => toggleAllergen(key)}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/15 ring-1 ring-amber-400 text-white'
                          : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-lg shrink-0">{meta.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate leading-tight">
                          {key === 'lactose' ? 'Лактоза' : key === 'gluten' ? 'Глютен' : key === 'nuts' ? 'Горіхи' : key === 'eggs' ? 'Яйця' : key === 'seafood' ? 'Морепродукти' : 'Соя'}
                        </div>
                        <div className="text-[9px] text-zinc-500 leading-none">
                          {isSelected ? 'Виключити 🚫' : 'Дозволено'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ВЛАСНІ АЛЕРГІЇ / ВИКЛЮЧЕННЯ */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Специфічні продукти (наприклад: яблука, мед, селера)
              </label>
              <div className="flex gap-2">
                <input
                  id="wizard-custom-allergy-input"
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAllergy();
                    }
                  }}
                  placeholder="Введіть продукт..."
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                />
                <button
                  id="wizard-add-custom-allergy-btn"
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-zinc-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Додати</span>
                </button>
              </div>

              {customAllergies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customAllergies.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs"
                    >
                      <span>🚫 {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAllergy(item)}
                        className="hover:text-white cursor-pointer ml-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              id="wizard-dietary-continue-btn"
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs tracking-wide shadow-lg shadow-amber-400/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Продовжити до розрахунку калорій</span>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ПИТАННЯ 10: Персональний розрахунок + Шлюз реєстрації */}
        {/* ======================================================== */}
        {questionIndex === 10 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ваш персональний розрахунок готовий</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Твій ліміт — {plan.targetCalories} ккал
              </h2>
              <p className="text-xs text-zinc-400">
                Витрати тіла (TDEE): ~{plan.maintenanceCalories} ккал
              </p>
            </div>

            {/* 4 КОЛОНКИ МАКРОСІВ */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-2xl bg-black/50 border border-amber-400/50 flex flex-col items-center shadow-lg">
                <span className="text-[9.5px] font-bold text-amber-300 uppercase">Калорії</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.calories}
                </span>
                <span className="text-[9px] text-zinc-400">ккал</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/50 border border-emerald-400/50 flex flex-col items-center shadow-lg">
                <span className="text-[9.5px] font-bold text-emerald-300 uppercase">Протеїн</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.protein}
                </span>
                <span className="text-[9px] text-zinc-400">грам</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/50 border border-amber-500/50 flex flex-col items-center shadow-lg">
                <span className="text-[9.5px] font-bold text-amber-400 uppercase">Жири</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.fat}
                </span>
                <span className="text-[9px] text-zinc-400">грам</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/50 border border-indigo-400/50 flex flex-col items-center shadow-lg">
                <span className="text-[9.5px] font-bold text-indigo-300 uppercase">Вуглеводи</span>
                <span className="text-base font-extrabold text-white mt-1">
                  {plan.targets.carbs}
                </span>
                <span className="text-[9px] text-zinc-400">грам</span>
              </div>
            </div>

            {/* Порада нутриціолога проти йо-йо лише коли обрано "Швидко" */}
            {pace === 'fast' && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Порада нутриціолога проти йо-йо ефекту</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  {plan.nutritionistAdvice.message}
                </p>
              </div>
            )}

            {/* Форма збереження розрахунків */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <div className="text-center">
                <h3 className="text-sm font-bold text-white">
                  Зберегти результат
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Введіть пошту (або будь-які тестові слова для перевірки) чи зайдіть як гість
                </p>
              </div>

              <form onSubmit={handleFinalRegister} className="space-y-2">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-zinc-500" />
                  <input
                    id="wizard-email-input"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email або будь-які два слова для тесту"
                    className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <button
                  id="wizard-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs tracking-wide shadow-lg shadow-amber-400/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Збереження...' : 'Зберегти розрахунок та перейти до меню'}</span>
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

                <p className="text-[10px] text-zinc-500 text-center leading-tight px-1 pt-1">
                  Натискаючи кнопку, ви погоджуєтесь з{' '}
                  <button
                    type="button"
                    onClick={() => setLegalOpen(true)}
                    className="text-amber-400/90 underline hover:text-amber-300 cursor-pointer"
                  >
                    Умовами використання та Політикою конфіденційності (GDPR)
                  </button>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Нижня зона відступу для безпечного перегляду на iPhone */}
      <div className="w-full max-w-md mx-auto py-1 shrink-0" />

      {/* ЮРИДИЧНА МОДАЛКА (GDPR / TERMS) */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
      />
    </div>
  );
};
