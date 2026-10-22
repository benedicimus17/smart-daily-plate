import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fadeIn select-none">
      {/* Бекдроп для закриття тапом збоку */}
      <div
        id="legal-modal-backdrop"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-md max-h-[85vh] rounded-[32px] overflow-hidden flex flex-col transition-all border border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, rgba(24,32,26,0.98) 0%, rgba(12,16,14,0.99) 100%)'
        }}
      >
        {/* Шапка */}
        <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">Правова інформація та безпека</h3>
              <p className="text-[10px] text-zinc-400">Європейський стандарт комплаєнсу (GDPR / EU)</p>
            </div>
          </div>

          <button
            id="btn-close-legal-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Перемикач документів */}
        <div className="px-5 pt-3 shrink-0">
          <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Політика конфіденційності (GDPR)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Умови використання (Terms)</span>
            </button>
          </div>
        </div>

        {/* Текстовий контент з прокруткою */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed font-normal">
          {activeTab === 'privacy' ? (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Local-First Архітектура:</strong> Ваші персональні параметри, щоденник та вага зберігаються в зашифрованому локальному сховищі вашого пристрою. Ми не передаємо ваші медичні чи харчові дані стороннім брокерам.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">1. Загальні положення (GDPR 2016/679)</h4>
                <p>
                  Ця Політика конфіденційності регламентує порядок збору, обробки та захисту персональних даних користувачів додатку NUTRIQ на території Європейського Союзу, України та інших юрисдикцій відповідно до Загального регламенту про захист даних (GDPR).
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">2. Які дані ми обробляємо</h4>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>Антропометричні метрики (вік, стать, зріст, поточна вага, рівень щоденної активності).</li>
                  <li>Цілі щодо харчування та калоражу (дефіцит, підтримання або набір маси).</li>
                  <li>Журнал прийомів їжі, записи інгредієнтів та історія ранкової ваги.</li>
                  <li>Контактні дані (ім'я, email, телефон) виключно при добровільній реєстрації профілю.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">3. Ваші невід'ємні права (GDPR Rights)</h4>
                <p>Відповідно до законодавства ЄС ви маєте такі безумовні права:</p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px] mt-1">
                  <li><strong>Право на доступ (ст. 15):</strong> перегляд усіх внесених до додатку даних у будь-який час.</li>
                  <li><strong>Право на видалення / бути забутим (ст. 17):</strong> повне стирання всіх ваших даних з пристрою в один клік у розділі «Профіль».</li>
                  <li><strong>Право на перенесення даних (ст. 20):</strong> експорт вашого повного щоденника та профілю у форматі JSON.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">4. Захист та шифрування</h4>
                <p>
                  Усі розрахункові алгоритми виконуються локально в ізольованій пісочниці браузера (Sandbox). Додаток захищений від Cross-Site Scripting (XSS) та не використовує трекінг геолокації чи сторонні рекламні банери.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Медичний дисклеймер */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Медичне застереження (Medical Disclaimer):</strong> NUTRIQ є математичним інформаційним помічником для контролю раціону. Сервіс не є медичною організацією і не надає медичних діагнозів, лікування чи медичних рекомендацій.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">1. Прийняття умов</h4>
                <p>
                  Використовуючи додаток NUTRIQ або реєструючи обліковий запис, ви підтверджуєте, що досягли 16-річного віку та погоджуєтесь дотримуватися цих Умов використання.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">2. Підписка NUTRIQ PRO та Безкоштовний період (Trial)</h4>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li><strong>7-денний пробний період (0 €):</strong> надає повний доступ до всіх ресторанних страв, Smart Swap та AI відео-парсера без списання коштів.</li>
                  <li><strong>Автоматичне подовження:</strong> якщо підписку не скасовано за 24 години до завершення тріалу, активується обраний план (€2.99/міс при річній оплаті або €4.99/міс).</li>
                  <li><strong>Скасування в 1 клік:</strong> ви можете скасувати або деактивувати підписку в будь-який час у налаштуваннях профілю без штрафів та прихованих комісій.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">3. Інтелектуальна власність</h4>
                <p>
                  Усі алгоритми (Cook-Loss Engine, True Fat Trend, Smart Swap), дизайн-система Deep Dark Glassmorphism та авторські рецепти шефа є об'єктами виключної інтелектуальної власності NUTRIQ Studio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-white/10 shrink-0 bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all active:scale-95"
          >
            Зрозуміло, закрити
          </button>
        </div>
      </div>
    </div>
  );
};
