import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Camera,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { MealType } from '../types/nutrition';
import { useNutritionStore } from '../store/nutritionStore';
import { useTranslation } from '../store/languageStore';
import { speechService } from '../services/speechService';
import {
  resolveMealTimeAndSlot,
  parseMealWithAiOrLocal,
  executeAutoMealLog,
  AiParsedMealResult
} from '../services/aiAssistantService';

interface ZenAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoggedSuccess?: (result: any) => void;
}

export const ZenAiAssistantModal: React.FC<ZenAiAssistantModalProps> = ({
  isOpen,
  onClose,
  onLoggedSuccess
}) => {
  const { lang } = useTranslation();
  const { updateMealEntry, removeFoodFromMeal } = useNutritionStore();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Стан часу та прийому їжі (динамічно визначається, але юзер може змінити в 1 клік)
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [selectedMealType, setSelectedMealType] = useState<MealType>('snack');
  const [isCustomTimeEdited, setIsCustomTimeEdited] = useState(false);

  // Останній успішний результат запису
  const [lastLoggedEntry, setLastLoggedEntry] = useState<{
    entryId: string;
    mealType: MealType;
    dishName: string;
    weightGrams: number;
    caloriesAdded: number;
    timestamp: string;
    remainingCalories: number;
    targetCalories: number;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Синхронізація авто-детекції слоту та часу при зміні введеного тексту
  useEffect(() => {
    if (!isCustomTimeEdited && inputText.trim()) {
      const resolution = resolveMealTimeAndSlot(inputText);
      if (resolution.explicitTimeFound) {
        setSelectedTime(resolution.timestamp);
      }
      setSelectedMealType(resolution.mealType);
    }
  }, [inputText, isCustomTimeEdited]);

  // Запуск / Зупинка голосового вводу
  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const supported = speechService.startListening(
        lang,
        (payload) => {
          setInputText(payload.transcript);
          // Якщо фінальний транскрипт — авто-визначення слоту
          const res = resolveMealTimeAndSlot(payload.transcript);
          if (res.explicitTimeFound) {
            setSelectedTime(res.timestamp);
          }
          setSelectedMealType(res.mealType);
        },
        (error) => {
          setToastMessage(`Помилка мікрофона: ${error}`);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      if (supported) {
        setIsListening(true);
      } else {
        setToastMessage('Ваш браузер не підтримує Web Speech API. Введіть текст вручну.');
      }
    }
  };

  // Обробка вибору зображення
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Головна дія: Розпізнати та записати в Щоденник
  const handleAutoLog = async (overrideText?: string) => {
    const query = (overrideText || inputText).trim();
    if (!query && !imagePreview) {
      setToastMessage('Будь ласка, скажіть або напишіть, що ви з’їли');
      return;
    }

    setIsProcessing(true);
    setToastMessage(null);

    try {
      // 1. Розбір через ШІ або локальний детермінований NLP
      const parsed = await parseMealWithAiOrLocal(query, {
        imageBase64: imagePreview || undefined,
        referenceDate: new Date()
      });

      // Перевизначаємо час і слот, якщо користувач вручну коригував їх у модалці
      const finalResult: AiParsedMealResult = {
        ...parsed,
        timestamp: selectedTime || parsed.timestamp,
        mealType: selectedMealType || parsed.mealType
      };

      // 2. Детермінований запис у щоденник
      const logOutcome = executeAutoMealLog(finalResult);

      setLastLoggedEntry({
        entryId: logOutcome.entryId,
        mealType: logOutcome.mealType,
        dishName: finalResult.dishName,
        weightGrams: finalResult.weightGrams,
        caloriesAdded: logOutcome.caloriesAdded,
        timestamp: logOutcome.timestamp,
        remainingCalories: logOutcome.remainingCalories,
        targetCalories: logOutcome.targetCalories
      });

      onLoggedSuccess?.(logOutcome);
      setInputText('');
      setImagePreview(null);
    } catch (err: any) {
      setToastMessage('Не вдалося зберегти страву. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Швидка зміна часу запису (наприклад з 11:00 на 10:00)
  const handleQuickAdjustTime = (newHour: string) => {
    if (!lastLoggedEntry) return;
    updateMealEntry(lastLoggedEntry.mealType, lastLoggedEntry.entryId, {
      timestamp: newHour
    });
    setLastLoggedEntry(prev => (prev ? { ...prev, timestamp: newHour } : null));
    setSelectedTime(newHour);
    setToastMessage(`✓ Час оновлено на ${newHour}`);
  };

  // Скасування запису (Undo)
  const handleUndo = () => {
    if (!lastLoggedEntry) return;
    removeFoodFromMeal(lastLoggedEntry.mealType, lastLoggedEntry.entryId);
    setLastLoggedEntry(null);
    setToastMessage('✓ Запис скасовано');
  };

  if (!isOpen) return null;

  const mealSlots: Array<{ type: MealType; label: string; icon: string }> = [
    { type: 'breakfast', label: 'Сніданок', icon: '🌅' },
    { type: 'lunch', label: 'Обід', icon: '☀️' },
    { type: 'snack', label: 'Перекус', icon: '🍎' },
    { type: 'dinner', label: 'Вечеря', icon: '🌙' }
  ];

  return (
    <div
      id="modal-zen-ai-assistant"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#0F1411]/95 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Шапка модалки */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">ШІ-Нутриціолог NUTRIQ</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  VOICE AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Скажіть голосом або введіть: «Я з'їв яблуко»
              </p>
            </div>
          </div>
          <button
            id="btn-close-zen-assistant"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Тіло модалки */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Спливаючий тост */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Голосова кнопка-мікрофон з пульсацією */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              id="btn-zen-assistant-mic"
              type="button"
              onClick={toggleListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                isListening
                  ? 'bg-rose-500 text-white ring-8 ring-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:brightness-110 ring-4 ring-emerald-500/20'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            <p className="text-xs font-semibold text-zinc-300 mt-2 flex items-center gap-1.5">
              {isListening ? (
                <span className="text-rose-400 animate-pulse">● Слухаю вас... Говоріть...</span>
              ) : (
                <span className="text-zinc-400">Натисніть мікрофон і скажіть страву</span>
              )}
            </p>
          </div>

          {/* Поле вводу / Розпізнаного тексту */}
          <div className="relative">
            <textarea
              id="input-zen-assistant-text"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Наприклад: «Я з'їв яблуко» або «О 10:00 кава лате і круасан»..."
              className="w-full bg-zinc-900/80 border border-white/10 focus:border-emerald-500/50 rounded-2xl p-3.5 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer"
                title="Додати фото / скріншот"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Прев'ю прикріпленого зображення */}
          {imagePreview && (
            <div className="relative inline-block rounded-xl overflow-hidden border border-emerald-500/40 max-w-[120px] shadow-md">
              <img src={imagePreview} alt="Прев'ю страви" className="w-full h-16 object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-all text-[10px]"
              >
                ✕
              </button>
            </div>
          )}

          {/* Швидкі чіпси вибору */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAutoLog("Я з'їв яблуко")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
            >
              🍎 <span>Я з'їв яблуко</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoLog("Кава лате і круасан")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
            >
              ☕ <span>Кава лате і круасан</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoLog("О 10:00 вівсянка з бананом")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
            >
              🥣 <span>Вівсянка з бананом (10:00)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoLog("Стейк рибай та спаржа на вечерю")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
            >
              🥩 <span>Стейк та спаржа</span>
            </button>
          </div>

          {/* Панель часу та слоту прийому їжі */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Час та прийом їжі:</span>
              </span>
              <div className="flex items-center gap-1">
                <input
                  id="input-zen-assistant-time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    setIsCustomTimeEdited(true);
                  }}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-0.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            {/* Вибір слоту прийому */}
            <div className="grid grid-cols-4 gap-1.5">
              {mealSlots.map((slot) => {
                const isActive = selectedMealType === slot.type;
                return (
                  <button
                    key={slot.type}
                    type="button"
                    onClick={() => {
                      setSelectedMealType(slot.type);
                      setIsCustomTimeEdited(true);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{slot.icon}</span>
                    <span className="text-[10px]">{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Головна кнопка дії */}
          <button
            id="btn-zen-assistant-submit"
            type="button"
            disabled={isProcessing || (!inputText.trim() && !imagePreview)}
            onClick={() => handleAutoLog()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Аналізую страву...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Записати в щоденник (Auto-Log)</span>
              </>
            )}
          </button>

          {/* Динамічна картка успішного результату */}
          {lastLoggedEntry && (
            <div
              id="card-zen-assistant-result"
              className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-zinc-200 space-y-2.5 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    ✓ Записано в {lastLoggedEntry.mealType === 'snack' ? 'Перекус' : lastLoggedEntry.mealType === 'breakfast' ? 'Сніданок' : lastLoggedEntry.mealType === 'lunch' ? 'Обід' : 'Вечерю'} о {lastLoggedEntry.timestamp}!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Скасувати</span>
                </button>
              </div>

              <div className="bg-black/30 rounded-xl p-2.5 flex items-center justify-between border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">{lastLoggedEntry.dishName}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {lastLoggedEntry.weightGrams}г порція • +{lastLoggedEntry.caloriesAdded} ккал
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">Залишок на день:</span>
                  <div className="text-base font-extrabold text-amber-300 leading-tight">
                    {lastLoggedEntry.remainingCalories} ккал
                  </div>
                </div>
              </div>

              {/* Швидка корекція часу (наприклад з 11:00 на 10:00) */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                <span>Їли раніше? Змінити час:</span>
                <div className="flex items-center gap-1">
                  <button
                    id="btn-quick-adjust-10"
                    type="button"
                    onClick={() => handleQuickAdjustTime('10:00')}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
                  >
                    10:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjustTime('09:30')}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
                  >
                    09:30
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjustTime('12:00')}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
                  >
                    12:00
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
