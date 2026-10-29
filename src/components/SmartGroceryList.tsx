import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Store,
  RefreshCw,
  Copy,
  CheckCheck,
  Filter,
  Flame,
  Info
} from 'lucide-react';
import { useGroceryStore } from '../store/groceryStore';
import { useNutritionStore } from '../store/nutritionStore';
import { useTranslation } from '../store/languageStore';
import { GroceryCategory, getLocalizedCategories } from '../types/grocery';
import { generateShareableGroceryText, getDefaultGroceryItems } from '../services/groceryGenerator';
import { MealEntry } from '../types/nutrition';

function getLocalizedQuickSuggestions(lang: string) {
  if (lang === 'es') {
    return [
      { name: 'Agua mineral (sin gas)', amount: '5 L', category: 'other' as GroceryCategory, icon: '💧' },
      { name: 'Limones frescos', amount: '3 uds', category: 'produce' as GroceryCategory, icon: '🍋' },
      { name: 'Aceite de oliva virgen extra', amount: '500 ml', category: 'staples' as GroceryCategory, icon: '🫒' },
      { name: 'Café en grano / molido', amount: '250 g', category: 'staples' as GroceryCategory, icon: '☕' },
      { name: 'Pan integral de centeno', amount: '1 barra', category: 'staples' as GroceryCategory, icon: '🍞' },
      { name: 'Sal marina yodada', amount: '1 paq', category: 'staples' as GroceryCategory, icon: '🧂' },
      { name: 'Chocolate negro 85%', amount: '100 g', category: 'staples' as GroceryCategory, icon: '🍫' },
      { name: 'Hierbas frescas (perejil/cilantro)', amount: '100 g', category: 'produce' as GroceryCategory, icon: '🌿' },
    ];
  }
  if (lang === 'en') {
    return [
      { name: 'Still spring water', amount: '5 L', category: 'other' as GroceryCategory, icon: '💧' },
      { name: 'Fresh lemons', amount: '3 pcs', category: 'produce' as GroceryCategory, icon: '🍋' },
      { name: 'Extra Virgin Olive Oil', amount: '500 ml', category: 'staples' as GroceryCategory, icon: '🫒' },
      { name: 'Ground / bean coffee', amount: '250 g', category: 'staples' as GroceryCategory, icon: '☕' },
      { name: 'Whole grain rye bread', amount: '1 loaf', category: 'staples' as GroceryCategory, icon: '🍞' },
      { name: 'Iodized sea salt', amount: '1 pack', category: 'staples' as GroceryCategory, icon: '🧂' },
      { name: 'Dark chocolate 85%', amount: '100 g', category: 'staples' as GroceryCategory, icon: '🍫' },
      { name: 'Fresh herbs (parsley/dill)', amount: '100 g', category: 'produce' as GroceryCategory, icon: '🌿' },
    ];
  }
  return [
    { name: 'Питна вода (негазована)', amount: '5 л', category: 'other' as GroceryCategory, icon: '💧' },
    { name: 'Лимони свіжі', amount: '3 шт', category: 'produce' as GroceryCategory, icon: '🍋' },
    { name: 'Оливкова олія Extra Virgin', amount: '500 мл', category: 'staples' as GroceryCategory, icon: '🫒' },
    { name: 'Кава в зернах / мелена', amount: '250 г', category: 'staples' as GroceryCategory, icon: '☕' },
    { name: 'Цільнозерновий житній хліб', amount: '1 уп', category: 'staples' as GroceryCategory, icon: '🍞' },
    { name: 'Морська сіль йодована', amount: '1 уп', category: 'staples' as GroceryCategory, icon: '🧂' },
    { name: 'Чорний шоколад 85%', amount: '100 г', category: 'staples' as GroceryCategory, icon: '🍫' },
    { name: 'Свіжа зелень (кріп, петрушка)', amount: '100 г', category: 'produce' as GroceryCategory, icon: '🌿' },
  ];
}

export const SmartGroceryList: React.FC = () => {
  const { t, lang } = useTranslation();
  const categories = useMemo(() => getLocalizedCategories(t), [t]);
  const quickSuggestions = useMemo(() => getLocalizedQuickSuggestions(lang), [lang]);

  const defaultLocalizedMap = useMemo(() => {
    const defaults = getDefaultGroceryItems(lang);
    const map = new Map<string, (typeof defaults)[0]>();
    defaults.forEach(d => map.set(d.id, d));
    return map;
  }, [lang]);

  const {
    items,
    activeFilter,
    toggleBought,
    addItem,
    removeItem,
    clearBought,
    syncFromMeals,
    setActiveFilter
  } = useGroceryStore();

  const { dailyLog, historyLogs } = useNutritionStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>('produce');
  const [newItemNote, setNewItemNote] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [syncedToast, setSyncedToast] = useState(false);

  // Обчислення прогресу
  const totalCount = items.length;
  const boughtCount = items.filter(i => i.isBought).length;
  const remainingCount = totalCount - boughtCount;
  const progressPercent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

  // Фільтрація
  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unbought') return !item.isBought;
    return item.category === activeFilter;
  });

  // Додавання власного товару (Дописування)
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addItem({
      name: newItemName.trim(),
      amount: newItemAmount.trim() || '1 шт',
      category: newItemCategory,
      note: newItemNote.trim() || undefined
    });

    setNewItemName('');
    setNewItemAmount('');
    setNewItemNote('');
    setShowAddForm(false);
  };

  const applyQuickSuggestion = (sug: ReturnType<typeof getLocalizedQuickSuggestions>[0]) => {
    addItem({
      name: sug.name,
      amount: sug.amount,
      category: sug.category,
      note: t('grocery_quick_buy', 'Швидка покупка')
    });
  };

  // Синхронізація з розкладом страв
  const handleSyncWeeklyMeals = () => {
    const allMeals: MealEntry[] = [];
    Object.values(dailyLog.meals).forEach(c => allMeals.push(...c.entries));
    Object.values(historyLogs).forEach(log => {
      if (log.date !== dailyLog.date) {
        Object.values(log.meals).forEach(c => allMeals.push(...c.entries));
      }
    });

    syncFromMeals(allMeals);
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 2500);
  };

  // Копіювання списку для месенджерів
  const handleCopyList = async () => {
    const text = generateShareableGroceryText(items, lang);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn select-none text-white">
      {/* 1. ВЕРХНІЙ СТУДІЙНИЙ БЛОК: ШАПКА, ПРОГРЕС ТА ШВИДКІ ДІЇ */}
      <div className="p-5 rounded-3xl bg-[#121814] border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  {t('grocery_title', 'Покупки на тиждень')}
                </h2>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Cook-Loss Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <Store className="w-3 h-3 text-zinc-500" />
                {t('grocery_subtitle', 'Згруповано за 4 відділами супермаркету')}
              </p>
            </div>
          </div>

          <button
            id="btn-add-custom-grocery"
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all active:scale-95"
            title={t('grocery_add_custom_btn', 'Дописати свій товар')}
          >
            <Plus className="w-5 h-5 stroke-[2.6]" />
          </button>
        </div>

        {/* Прогрес-бар покупок */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span>{t('grocery_collected_cart', 'Зібрано у візок')}</span>
              {remainingCount > 0 && (
                <span className="text-amber-400/90 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded text-[11px]">
                  {t('grocery_remaining_badge', 'залишилось {count}').replace('{count}', String(remainingCount))}
                </span>
              )}
            </span>
            <span className="text-amber-300 font-bold">
              {t('grocery_progress_ratio', '{bought} з {total} ({percent}%)')
                .replace('{bought}', String(boughtCount))
                .replace('{total}', String(totalCount))
                .replace('{percent}', String(progressPercent))}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ПАНЕЛЬ ДІЙ: Синхронізація з меню + Копіювати в Telegram + Очистити */}
        <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <button
            id="btn-sync-groceries"
            type="button"
            onClick={handleSyncWeeklyMeals}
            className="flex-1 py-2 px-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title={t('grocery_sync_tooltip', 'Оновити список за стравами з розкладу')}
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('grocery_sync_btn', 'Синхронізувати')}</span>
          </button>

          <button
            id="btn-copy-groceries"
            type="button"
            onClick={handleCopyList}
            className="flex-1 py-2 px-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title={t('grocery_copy_tooltip', 'Скопіювати готовий список для месенджера')}
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('grocery_copy_btn', 'Скопіювати')}</span>
          </button>

          {boughtCount > 0 && (
            <button
              id="btn-clear-bought-groceries"
              type="button"
              onClick={clearBought}
              className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
              title={t('grocery_clear_bought_tooltip', 'Видалити відмічені як куплені')}
            >
              <CheckCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('grocery_clear_btn', 'Очистити')}</span>
            </button>
          )}
        </div>

        {/* Спливаючі сповіщення */}
        {copiedToast && (
          <div className="absolute inset-x-4 bottom-3 py-2 px-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-2xl animate-fadeIn">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('grocery_copied_toast', 'Список скопійовано для Telegram / WhatsApp!')}</span>
          </div>
        )}

        {syncedToast && (
          <div className="absolute inset-x-4 bottom-3 py-2 px-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-2xl animate-fadeIn">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>{t('grocery_synced_toast', 'Список оновлено за розкладом щоденника!')}</span>
          </div>
        )}
      </div>

      {/* 2. ФОРМА ДОПИСУВАННЯ ВЛАСНОГО ТОВАРУ */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="p-4 rounded-3xl bg-[#121814] border border-amber-400/50 shadow-2xl space-y-3.5 animate-fadeIn backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-black tracking-wide text-amber-300 flex items-center gap-1.5 uppercase">
              <Plus className="w-3.5 h-3.5" />
              <span>{t('grocery_form_title', 'Дописати товар до списку')}</span>
            </div>
            <span className="text-[10px] text-zinc-500">{t('grocery_form_cloud', 'Збережеться у хмарі/кеші')}</span>
          </div>

          <div className="flex gap-2">
            <input
              id="input-grocery-name"
              type="text"
              placeholder={t('grocery_name_ph', 'Назва товару (наприклад: Лимони, Оливкова олія)')}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <input
              id="input-grocery-amount"
              type="text"
              placeholder={t('grocery_amount_ph', 'К-сть (500 г / 2 шт)')}
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="w-28 bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-center"
            />
          </div>

          <input
            id="input-grocery-note"
            type="text"
            placeholder={t('grocery_note_ph', "Примітка (необов'язково: для салату, на суботу)")}
            value={newItemNote}
            onChange={(e) => setNewItemNote(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />

          {/* Вибір відділу супермаркету */}
          <div>
            <div className="text-[10.5px] font-bold text-zinc-400 mb-1.5">{t('grocery_dept_label', 'Відділ супермаркету:')}</div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setNewItemCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    newItemCategory === cat.key
                      ? 'bg-amber-400/25 text-amber-300 border border-amber-400/60 shadow-sm'
                      : 'bg-black/50 text-zinc-400 border border-white/5 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Кнопки збереження */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              {t('grocery_cancel', 'Скасувати')}
            </button>
            <button
              id="btn-submit-grocery-item"
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
            >
              {t('grocery_add_cart_btn', 'Додати в кошик')}
            </button>
          </div>
        </form>
      )}

      {/* 3. ШВИДКІ ПІДКАЗКИ ДЛЯ 1-ТАП ДОПИСУВАННЯ */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            {t('grocery_quick_1tap', 'Швидке дописування базових покупок (1-тап):')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {quickSuggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyQuickSuggestion(sug)}
              className="px-2.5 py-1.5 rounded-xl bg-[#121814] hover:bg-[#1a231d] border border-white/10 hover:border-amber-400/40 text-zinc-300 hover:text-white text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title={`+ ${sug.name}`}
            >
              <span>{sug.icon}</span>
              <span>{sug.name}</span>
              <span className="text-[10px] text-amber-300/80 font-bold bg-black/40 px-1 py-0.2 rounded">
                +{sug.amount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. ФІЛЬТРИ ВІДДІЛІВ ТА РЕЖИМІВ */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
        <button
          id="filter-groceries-all"
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
              : 'bg-[#121814] text-zinc-400 border border-white/10 hover:text-white'
          }`}
        >
          {t('grocery_all_items_count', 'Всі товари ({count})').replace('{count}', String(totalCount))}
        </button>

        <button
          id="filter-groceries-unbought"
          type="button"
          onClick={() => setActiveFilter('unbought')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeFilter === 'unbought'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
              : 'bg-[#121814] text-zinc-400 border border-white/10 hover:text-white'
          }`}
        >
          <Filter className="w-3 h-3 text-amber-400" />
          <span>{t('grocery_to_buy_count', 'Ще купити ({count})').replace('{count}', String(remainingCount))}</span>
        </button>

        {categories.map(cat => {
          const count = items.filter(i => i.category === cat.key).length;
          if (count === 0 && activeFilter !== cat.key) return null;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveFilter(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeFilter === cat.key
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'bg-[#121814] text-zinc-400 border border-white/10 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] text-zinc-500 ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 5. СПИСОК ТОВАРІВ ЗА ВІДДІЛАМИ СУПЕРМАРКЕТУ */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#121814] border border-white/10 text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto stroke-[2.5]" />
            <h4 className="text-sm font-bold text-white">{t('grocery_empty_cat_title', 'Усі товари в цьому відділі куплено!')}</h4>
            <p className="text-xs text-zinc-400">
              {t('grocery_empty_cat_desc', 'Ви можете перемкнути фільтр на «Всі товари» або натиснути «+ Дописати товар».')}
            </p>
          </div>
        ) : (
          categories.filter(cat => activeFilter === 'all' || activeFilter === 'unbought' || activeFilter === cat.key).map(cat => {
            const catItems = filteredItems.filter(i => i.category === cat.key);
            if (catItems.length === 0) return null;

            const catBought = catItems.filter(i => i.isBought).length;

            return (
              <div key={cat.key} className="space-y-2">
                {/* Заголовок відділу супермаркету */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs font-black tracking-wide uppercase text-zinc-400">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-zinc-500">
                    {catBought}/{catItems.length}
                  </span>
                </div>

                {/* Картки товарів у цьому відділі */}
                <div className="space-y-1.5">
                  {catItems.map(item => {
                    const localizedDefault = defaultLocalizedMap.get(item.id);
                    const displayName = localizedDefault ? localizedDefault.name : item.name;
                    const displayNote = localizedDefault ? localizedDefault.note : item.note;
                    const displayAmount = localizedDefault ? localizedDefault.amount : item.amount;

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleBought(item.id)}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none group ${
                          item.isBought
                            ? 'bg-black/30 border-white/5 opacity-55'
                            : 'bg-[#121814] border-white/10 hover:border-amber-400/40 shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Інтерактивний чекбокс */}
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                              item.isBought
                                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                : 'bg-black/50 border border-white/20 group-hover:border-amber-400/60'
                            }`}
                          >
                            {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <h4
                                className={`text-sm font-bold tracking-tight transition-all ${
                                  item.isBought ? 'text-zinc-500 line-through' : 'text-zinc-100'
                                }`}
                              >
                                {displayName}
                              </h4>
                            </div>

                            {displayNote && (
                              <p className="text-[11px] text-zinc-400 mt-0.5 truncate flex items-center gap-1">
                                {item.rawWeightGrams ? (
                                  <Info className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                ) : null}
                                <span>{displayNote}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Бейдж кількості */}
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap ${
                              item.isBought
                                ? 'text-zinc-500 bg-black/40'
                                : item.rawWeightGrams
                                ? 'text-amber-300 bg-amber-400/15 border border-amber-400/35 shadow-sm'
                                : 'text-amber-300 bg-amber-400/10 border border-amber-400/25'
                            }`}
                          >
                            {displayAmount}
                          </span>

                          {/* Кнопка видалення */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="text-zinc-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                            title={t('grocery_delete_item', 'Видалити зі списку')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
