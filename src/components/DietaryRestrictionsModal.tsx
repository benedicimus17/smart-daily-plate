import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Leaf
} from 'lucide-react';
import {
  DietType,
  StandardAllergen,
  ALLERGEN_META,
  UserDietaryRestrictions
} from '../services/allergenService';
import { useUserStore } from '../store/userStore';
import { useNutritionStore } from '../store/nutritionStore';
import { useTranslation } from '../store/languageStore';

interface DietaryRestrictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DietaryRestrictionsModal: React.FC<DietaryRestrictionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const { user, updateMetrics } = useUserStore();
  const { generateMenuForTargets, dailyLog } = useNutritionStore();

  const [dietType, setDietType] = useState<DietType>(user.dietType || 'standard');
  const [allergens, setAllergens] = useState<StandardAllergen[]>(user.allergens || []);
  const [customAllergies, setCustomAllergies] = useState<string[]>(user.customAllergies || []);
  const [customInput, setCustomInput] = useState<string>('');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const toggleAllergen = (key: StandardAllergen) => {
    if (allergens.includes(key)) {
      setAllergens(allergens.filter((a) => a !== key));
    } else {
      setAllergens([...allergens, key]);
    }
  };

  const handleAddCustomAllergy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = customInput.trim().toLowerCase();
    if (val && !customAllergies.includes(val)) {
      setCustomAllergies([...customAllergies, val]);
      setCustomInput('');
    }
  };

  const handleRemoveCustomAllergy = (item: string) => {
    setCustomAllergies(customAllergies.filter((c) => c !== item));
  };

  const handleSave = () => {
    const updatedRestrictions: UserDietaryRestrictions = {
      dietType,
      allergens,
      customAllergies
    };

    updateMetrics(updatedRestrictions);

    // Автоматично оновлюємо та фільтруємо меню
    generateMenuForTargets(dailyLog.targets, user.eatingRhythm || '3_meals', {
      userRestrictions: updatedRestrictions
    });

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 700);
  };

  const dietOptions: { id: DietType; label: string; desc: string; icon: string }[] = [
    {
      id: 'standard',
      label: t('w_diet_standard_title', '🥩 Всеїдний (Стандарт)'),
      desc: t('w_diet_standard_desc', "Без обмежень: м'ясо, птиця, риба, молочні та рослинні продукти"),
      icon: '🥩'
    },
    {
      id: 'vegetarian',
      label: t('w_diet_veg_title', '🌱 Вегетаріанство'),
      desc: t('w_diet_veg_desc', "Без м'яса та птиці. Дозволені яйця, молочні продукти"),
      icon: '🥗'
    },
    {
      id: 'vegan',
      label: t('w_diet_vegan_title', '🌿 Веганство (Суто рослинне)'),
      desc: t('w_diet_vegan_desc', "Виключно рослинна їжа: без м'яса, риби, яєць та молочних"),
      icon: '🌱'
    },
    {
      id: 'pescatarian',
      label: t('w_diet_pesco_title', '🐟 Пескетаріанство'),
      desc: t('w_diet_pesco_desc', "Риба та морепродукти дозволені, м'ясо виключено"),
      icon: '🐟'
    }
  ];

  const standardAllergenList: { id: StandardAllergen; labelKey: string; subKey: string }[] = [
    { id: 'lactose', labelKey: 'w_allergen_lactose', subKey: 'lactose' },
    { id: 'gluten', labelKey: 'w_allergen_gluten', subKey: 'gluten' },
    { id: 'nuts', labelKey: 'w_allergen_nuts', subKey: 'nuts' },
    { id: 'eggs', labelKey: 'w_allergen_eggs', subKey: 'eggs' },
    { id: 'seafood', labelKey: 'w_allergen_seafood', subKey: 'seafood' },
    { id: 'soy', labelKey: 'w_allergen_soy', subKey: 'soy' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        id="dietary-restrictions-modal"
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 text-zinc-100 relative overflow-hidden flex flex-col max-h-[92vh] border border-white/10"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,24,0.97) 0%, rgba(10,14,12,0.99) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 50px rgba(16,185,129,0.08)'
        }}
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>{t('dietary_modal_title', 'Алергії та Раціон')}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Guard
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                {t('dietary_modal_subtitle', 'Авто-захист від небезпечних продуктів та підбір раціону')}
              </p>
            </div>
          </div>
          <button
            id="btn-close-dietary-restrictions"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="py-3 space-y-4 overflow-y-auto relative z-10 pr-1 flex-1 text-xs">
          {/* 1. ВИБІР ТИПУ ДІЄТИ */}
          <div>
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('w_diet_section', '1. Тип харчування')}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dietOptions.map((opt) => (
                <button
                  key={opt.id}
                  id={`btn-diet-${opt.id}`}
                  type="button"
                  onClick={() => setDietType(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    dietType === opt.id
                      ? 'bg-emerald-500/15 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{opt.icon}</span>
                    <span
                      className={`font-bold text-xs ${
                        dietType === opt.id ? 'text-emerald-300' : 'text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. ПОШИРЕНІ АЛЕРГЕНИ ТА НЕПЕРЕНОСИМОСТІ */}
          <div>
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('w_allergens_section', '2. Алергії та харчові непереносимості')}</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              {standardAllergenList.map(({ id: key, labelKey }) => {
                const meta = ALLERGEN_META[key];
                const isSelected = allergens.includes(key);

                return (
                  <button
                    key={key}
                    id={`btn-allergen-${key}`}
                    type="button"
                    onClick={() => toggleAllergen(key)}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400/50 text-white'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/20 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{meta.icon}</span>
                      <div className="truncate">
                        <span className="font-bold text-xs block truncate">{t(labelKey as any, meta.labelUk)}</span>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 text-zinc-950'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. КАСТОМНІ АЛЕРГІЇ (НАПРИКЛАД: ЯБЛУКА, МЕД) */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
              {t('w_custom_allergies_label', '3. Індивідуальні алергени (впишіть свій)')}
            </span>
            <p className="text-[10px] text-zinc-400">
              {t('dietary_modal_subtitle', 'Авто-захист від небезпечних продуктів')}
            </p>

            <form onSubmit={handleAddCustomAllergy} className="flex gap-2">
              <input
                id="input-custom-allergy"
                type="text"
                placeholder={t('w_custom_allergies_ph', 'Введіть продукт...')}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 text-xs"
              />
              <button
                id="btn-add-custom-allergy"
                type="submit"
                className="px-3 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('w_custom_allergies_add', 'Додати')}</span>
              </button>
            </form>

            {customAllergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customAllergies.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <span>⚠️ {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomAllergy(item)}
                      className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 space-y-2 relative z-10 shrink-0">
          <button
            id="btn-save-dietary-restrictions"
            type="button"
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('dietary_save_btn', 'Зберегти та оновити раціон')}</span>
          </button>

          {saveToast && (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-center text-xs font-bold animate-fadeIn">
              ✓ Обмеження збережено! Меню персоналізовано без алергенів.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
