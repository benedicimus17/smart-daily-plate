import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Trash2, Sparkles } from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  category: 'meat_fish' | 'dairy' | 'produce' | 'staples';
  categoryLabel: string;
  amount: string;
  note?: string;
  isBought: boolean;
}

const INITIAL_GROCERY_ITEMS: GroceryItem[] = [
  {
    id: 'g-1',
    name: 'Філе куряче свіже',
    category: 'meat_fish',
    categoryLabel: 'М\'ясо та риба',
    amount: '~800 г',
    note: 'Для обідів на 3 дні',
    isBought: false
  },
  {
    id: 'g-2',
    name: 'Свіжий лосось (філе)',
    category: 'meat_fish',
    categoryLabel: 'М\'ясо та риба',
    amount: '330 г',
    note: 'Для боулу з кіноа (Обід)',
    isBought: true
  },
  {
    id: 'g-3',
    name: 'Стейк яловичий (Рибай)',
    category: 'meat_fish',
    categoryLabel: 'М\'ясо та риба',
    amount: '~750 г',
    note: 'Вечеря (Cook-loss розрахунок)',
    isBought: false
  },
  {
    id: 'g-4',
    name: 'Яйця курячі (кат. C0/M)',
    category: 'dairy',
    categoryLabel: 'Яйця та молочне',
    amount: '1 десяток',
    note: 'Ранкові омлети та буріто',
    isBought: false
  },
  {
    id: 'g-5',
    name: 'Грецький йогурт 0%',
    category: 'dairy',
    categoryLabel: 'Яйця та молочне',
    amount: '~900 г',
    note: 'Щоденні перекуси',
    isBought: false
  },
  {
    id: 'g-6',
    name: 'Сир Cottage (зернистий)',
    category: 'dairy',
    categoryLabel: 'Яйця та молочне',
    amount: '400 г',
    note: 'Для ранкового буріто',
    isBought: false
  },
  {
    id: 'g-7',
    name: 'Свіжа спаржа',
    category: 'produce',
    categoryLabel: 'Овочі та зелень',
    amount: '350 г',
    note: 'Гарнір до стейку',
    isBought: false
  },
  {
    id: 'g-8',
    name: 'Авокадо Хаас стигле',
    category: 'produce',
    categoryLabel: 'Овочі та зелень',
    amount: '3 шт',
    note: 'Корисні моно-жири',
    isBought: false
  },
  {
    id: 'g-9',
    name: 'Свіжа лохина (чорниця)',
    category: 'produce',
    categoryLabel: 'Овочі та зелень',
    amount: '250 г',
    note: 'До вівсянки та йогурту',
    isBought: true
  },
  {
    id: 'g-10',
    name: 'Вівсяні пластівці цільнозернові',
    category: 'staples',
    categoryLabel: 'Бакалія та крупи',
    amount: '500 г',
    note: 'Складні вуглеводи на тиждень',
    isBought: false
  },
  {
    id: 'g-11',
    name: 'Кіноа біле / триколірне',
    category: 'staples',
    categoryLabel: 'Бакалія та крупи',
    amount: '300 г',
    note: 'Гарнір до риби',
    isBought: false
  }
];

export const SmartGroceryList: React.FC = () => {
  const [items, setItems] = useState<GroceryItem[]>(INITIAL_GROCERY_ITEMS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleBought = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isBought: !item.isBought } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: 'staples',
      categoryLabel: 'Додатково',
      amount: newItemAmount.trim() || '1 шт',
      isBought: false
    };

    setItems([newItem, ...items]);
    setNewItemName('');
    setNewItemAmount('');
    setShowAddForm(false);
  };

  const boughtCount = items.filter(i => i.isBought).length;
  const progressPercent = items.length > 0 ? Math.round((boughtCount / items.length) * 100) : 0;

  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter(i => i.category === filterCategory);

  return (
    <div className="space-y-4 pb-28 animate-fadeIn select-none">
      {/* Шапка списку покупок */}
      <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                  Покупки на тиждень
                </h2>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Авто-меню
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Автоматично підсумовано під норму 2 150 ккал
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-9 h-9 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex items-center justify-center transition-all active:scale-90"
            title="Додати свій товар"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Прогрес покупок у магазині */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-400">Куплено в магазині</span>
            <span className="text-amber-300">{boughtCount} з {items.length} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Форма швидкого додавання */}
      {showAddForm && (
        <form onSubmit={addItem} className="p-3.5 rounded-2xl bg-zinc-900 border border-amber-500/40 shadow-xl space-y-2.5 animate-fadeIn">
          <div className="text-xs font-bold text-amber-300">Додати товар до списку</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Назва товару (наприклад: Лимони)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="К-сть (300 г)"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="w-28 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Додати
            </button>
          </div>
        </form>
      )}

      {/* Фільтри категорій */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
        {[
          { key: 'all', label: 'Всі товари' },
          { key: 'meat_fish', label: '🥩 М\'ясо та риба' },
          { key: 'dairy', label: '🥛 Молочне та яйця' },
          { key: 'produce', label: '🥗 Овочі та фрукти' },
          { key: 'staples', label: '🌾 Бакалія' },
        ].map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setFilterCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === cat.key
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Список продуктів із чекбоксами викреслення */}
      <div className="space-y-2">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => toggleBought(item.id)}
            className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none group ${
              item.isBought
                ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700/80 shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Чекбокс */}
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                item.isBought
                  ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-zinc-800 border border-zinc-700 group-hover:border-amber-400/50'
              }`}>
                {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h4 className={`text-sm font-bold tracking-tight transition-all ${
                    item.isBought ? 'text-zinc-500 line-through' : 'text-zinc-200'
                  }`}>
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {item.categoryLabel}
                  </span>
                </div>
                {item.note && (
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {item.note}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                item.isBought ? 'text-zinc-600 bg-zinc-900' : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
              }`}>
                {item.amount}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="text-zinc-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Видалити"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
