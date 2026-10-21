import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Trash2, Sparkles, Store } from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  category: 'meat_fish' | 'dairy' | 'produce' | 'staples';
  categoryLabel: string;
  amount: string;
  note?: string;
  isBought: boolean;
}

const CATEGORIES: { key: GroceryItem['category']; label: string; icon: string }[] = [
  { key: 'meat_fish', label: "М'ясо та риба", icon: '🥩' },
  { key: 'dairy', label: 'Молочне та яйця', icon: '🥛' },
  { key: 'produce', label: 'Овочі та зелень', icon: '🥗' },
  { key: 'staples', label: 'Бакалія та крупи', icon: '🌾' },
];

const INITIAL_GROCERY_ITEMS: GroceryItem[] = [
  {
    id: 'g-1',
    name: 'Філе куряче свіже',
    category: 'meat_fish',
    categoryLabel: "М'ясо та риба",
    amount: '~800 г',
    note: 'Для обідів на 3 дні (облік уварки -25%)',
    isBought: false
  },
  {
    id: 'g-2',
    name: 'Свіжий лосось (філе)',
    category: 'meat_fish',
    categoryLabel: "М'ясо та риба",
    amount: '330 г',
    note: 'Для боулу з кіноа (Обід)',
    isBought: true
  },
  {
    id: 'g-3',
    name: 'Стейк яловичий (Рибай)',
    category: 'meat_fish',
    categoryLabel: "М'ясо та риба",
    amount: '~750 г',
    note: 'Вечеря (Cook-loss розрахунок)',
    isBought: false
  },
  {
    id: 'g-4',
    name: 'Яйця курячі (кат. C0/M)',
    category: 'dairy',
    categoryLabel: 'Молочне та яйця',
    amount: '1 десяток',
    note: 'Ранкові омлети та тости',
    isBought: false
  },
  {
    id: 'g-5',
    name: 'Грецький йогурт 0%',
    category: 'dairy',
    categoryLabel: 'Молочне та яйця',
    amount: '~900 г',
    note: 'Щоденні перекуси',
    isBought: false
  },
  {
    id: 'g-6',
    name: 'Сир Cottage (зернистий)',
    category: 'dairy',
    categoryLabel: 'Молочне та яйця',
    amount: '400 г',
    note: 'Для ранкового білкового тосту',
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
  const [newItemCategory, setNewItemCategory] = useState<GroceryItem['category']>('produce');
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

    const catObj = CATEGORIES.find(c => c.key === newItemCategory);

    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      categoryLabel: catObj ? catObj.label : 'Додатково',
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

  return (
    <div className="space-y-4 pb-28 animate-fadeIn select-none text-white">
      {/* 1. ШАПКА СПИСКУ ПОКУПОК У ТЕМНОМУ СКЛІ */}
      <div className="p-5 rounded-3xl bg-[#121814] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Покупки на тиждень
                </h2>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Авто-меню
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <Store className="w-3 h-3 text-zinc-500" />
                Згруповано за відділами супермаркету
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-9 h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 flex items-center justify-center transition-all active:scale-90"
            title="Додати свій товар"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Прогрес покупок у магазині */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-400">Куплено в магазині</span>
            <span className="text-amber-300 font-bold">{boughtCount} з {items.length} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. ФОРМА ШВИДКОГО ДОДАВАННЯ */}
      {showAddForm && (
        <form onSubmit={addItem} className="p-4 rounded-2xl bg-[#121814] border border-amber-400/40 shadow-xl space-y-3 animate-fadeIn">
          <div className="text-xs font-bold text-amber-300">Додати товар до списку</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Назва товару (наприклад: Лимони)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="К-сть (300 г)"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="w-24 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setNewItemCategory(cat.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  newItemCategory === cat.key
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-black/40 text-zinc-400 border border-white/5 hover:text-white'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Додати
            </button>
          </div>
        </form>
      )}

      {/* 3. ФІЛЬТРИ КАТЕГОРІЙ / ВІДДІЛІВ */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterCategory === 'all'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
              : 'bg-[#121814] text-zinc-400 border border-white/10 hover:text-white'
          }`}
        >
          Всі товари ({items.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat.key).length;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                filterCategory === cat.key
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
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

      {/* 4. СПИСОК ПРОДУКТІВ ЗА ВІДДІЛАМИ СУПЕРМАРКЕТУ */}
      <div className="space-y-4">
        {CATEGORIES.filter(cat => filterCategory === 'all' || filterCategory === cat.key).map(cat => {
          const catItems = items.filter(i => i.category === cat.key);
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
                {catItems.map(item => (
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
                      {/* Чекбокс */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        item.isBought
                          ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'bg-black/50 border border-white/20 group-hover:border-amber-400/60'
                      }`}>
                        {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <h4 className={`text-sm font-bold tracking-tight transition-all ${
                            item.isBought ? 'text-zinc-500 line-through' : 'text-zinc-100'
                          }`}>
                            {item.name}
                          </h4>
                        </div>
                        {item.note && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        item.isBought
                          ? 'text-zinc-500 bg-black/40'
                          : 'text-amber-300 bg-amber-400/10 border border-amber-400/25'
                      }`}>
                        {item.amount}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
        })}
      </div>
    </div>
  );
};
