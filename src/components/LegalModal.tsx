import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../store/languageStore';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

const LEGAL_TEXTS = {
  es: {
    title: 'Información legal y seguridad',
    subtitle: 'Estándar europeo de conformidad (RGPD / UE)',
    privacy_tab: 'Política de privacidad (RGPD)',
    terms_tab: 'Términos de servicio (Terms)',
    close_btn: 'Entendido, cerrar',
    privacy: {
      local_first_title: 'Arquitectura Local-First:',
      local_first_desc: 'Tus métricas personales, diario y peso se guardan en el almacenamiento local cifrado de tu dispositivo. No vendemos ni compartimos tus datos de salud con terceros.',
      sec1_title: '1. Disposiciones Generales (RGPD 2016/679)',
      sec1_desc: 'Esta Política de Privacidad regula la recopilación, tratamiento y protección de datos personales de los usuarios de NUTRIQ en la Unión Europea y España conforme al Reglamento General de Protección de Datos (RGPD UE 2016/679) y la LOPD-GDD.',
      sec2_title: '2. Qué datos tratamos',
      sec2_items: [
        'Métricas antropométricas (edad, sexo, altura, peso actual, nivel de actividad).',
        'Objetivos nutricionales y de déficit calórico.',
        'Registro de comidas diarias, ingredientes y pesaje matutino.',
        'Datos de contacto (email o nombre de usuario opcional) solo para sincronización.'
      ],
      sec3_title: '3. Tus derechos irrenunciables (Derechos RGPD)',
      sec3_desc: 'De acuerdo con la legislación de la UE, dispones de los siguientes derechos:',
      sec3_items: [
        'Derecho de acceso (art. 15): consulta todos tus datos en cualquier momento.',
        'Derecho de supresión / al olvido (art. 17): eliminación irreversible de tu perfil con 1 toque en la app.',
        'Derecho a la portabilidad (art. 20): descarga tu historial completo en formato JSON.'
      ],
      sec4_title: '4. Cifrado y seguridad',
      sec4_desc: 'Todos los cálculos nutricionales y el filtro True Fat Trend se ejecutan en local en tu dispositivo (Sandbox). Sin rastreadores invasivos ni venta de datos.'
    },
    terms: {
      medical_title: 'Aviso Médico (Medical Disclaimer):',
      medical_desc: 'NUTRIQ es un asistente matemático y de estilo de vida para el control nutricional. No constituye asesoramiento médico ni sustituye la consulta con un facultativo o dietista colegiado.',
      sec1_title: '1. Aceptación de los términos',
      sec1_desc: 'Al utilizar NUTRIQ confirmas tener al menos 16 años y aceptar estos Términos de Servicio y la política de privacidad.',
      sec2_title: '2. Suscripción NUTRIQ PRO y Prueba Gratuita (Trial)',
      sec2_items: [
        'Prueba de 7 días gratis (0 €): acceso completo a platos de restaurante, Smart Swap y escáner de códigos de barras sin cobro inicial.',
        'Renovación transparente: si no cancelas 24 horas antes de terminar la prueba, se activa el plan seleccionado (2,99 €/mes en plan anual o 4,99 €/mes).',
        'Cancelación en 1 toque: puedes cancelar en cualquier momento desde Google Play o ajustes sin permanencia ni penalización.'
      ],
      sec3_title: '3. Propiedad intelectual',
      sec3_desc: 'Los algoritmos de Cook-Loss Engine, cálculo de masa grasa filtrada y las recetas maestras pertenecen a NUTRIQ Studio bajo licencia protegida.'
    }
  },
  en: {
    title: 'Legal Compliance & Security',
    subtitle: 'European compliance standard (GDPR / EU)',
    privacy_tab: 'Privacy Policy (GDPR)',
    terms_tab: 'Terms of Service',
    close_btn: 'Understood, close',
    privacy: {
      local_first_title: 'Local-First Architecture:',
      local_first_desc: 'Your personal health metrics, diary logs, and weight history stay strictly on your device storage. We do not sell or monetize personal data.',
      sec1_title: '1. General Provisions (GDPR 2016/679)',
      sec1_desc: 'This Privacy Policy governs the collection, processing, and protection of personal data of NUTRIQ users across the European Union and globally pursuant to the General Data Protection Regulation (EU 2016/679).',
      sec2_title: '2. Data We Process',
      sec2_items: [
        'Anthropometric metrics (age, biological sex, height, current weight, activity level).',
        'Nutrition goals and caloric target deficits.',
        'Meal logs, custom ingredients, and morning weight trends.',
        'Contact info (email or nickname) solely upon voluntary account creation.'
      ],
      sec3_title: '3. Your GDPR Rights',
      sec3_desc: 'Under European Union law, you hold the following fundamental rights:',
      sec3_items: [
        'Right of access (Art. 15): view all personal data within the app at any time.',
        'Right to erasure / to be forgotten (Art. 17): one-tap full wipe of profile and records.',
        'Right to data portability (Art. 20): instant export of your entire history in JSON format.'
      ],
      sec4_title: '4. Encryption & Privacy by Design',
      sec4_desc: 'All Cook-Loss calculations and caloric balancing run locally inside your browser/app sandbox. No third-party ad brokers or location trackers.'
    },
    terms: {
      medical_title: 'Medical Disclaimer:',
      medical_desc: 'NUTRIQ is an informational mathematical tool for nutritional balance. It is not a medical organization and does not provide medical diagnoses or prescriptions.',
      sec1_title: '1. Acceptance of Terms',
      sec1_desc: 'By accessing NUTRIQ, you confirm you are at least 16 years of age and agree to comply with these Terms of Service.',
      sec2_title: '2. NUTRIQ PRO & 7-Day Free Trial',
      sec2_items: [
        '7-Day Free Trial ($0.00 / €0.00): full access to restaurant dining, Smart Swap, and barcode scanner with zero initial charge.',
        'Transparent renewal: cancel anytime 24 hours prior to trial end to prevent automatic rollover to €2.99/mo annual or €4.99/mo plan.',
        '1-Click cancellation: cancel directly in Google Play or profile settings without penalty.'
      ],
      sec3_title: '3. Intellectual Property',
      sec3_desc: 'Cook-Loss Engine algorithms, True Fat Trend filters, and chef database are proprietary assets of NUTRIQ Studio.'
    }
  },
  uk: {
    title: 'Правова інформація та безпека',
    subtitle: 'Європейський стандарт комплаєнсу (GDPR / EU)',
    privacy_tab: 'Політика конфіденційності (GDPR)',
    terms_tab: 'Умови використання (Terms)',
    close_btn: 'Зрозуміло, закрити',
    privacy: {
      local_first_title: 'Local-First Архітектура:',
      local_first_desc: 'Ваші персональні параметри, щоденник та вага зберігаються в зашифрованому локальному сховищі вашого пристрою. Ми не передаємо ваші медичні чи харчові дані стороннім брокерам.',
      sec1_title: '1. Загальні положення (GDPR 2016/679)',
      sec1_desc: 'Ця Політика конфіденційності регламентує порядок збору, обробки та захисту персональних даних користувачів додатку NUTRIQ на території Європейського Союзу, України та інших юрисдикцій відповідно до Загального регламенту про захист даних (GDPR).',
      sec2_title: '2. Які дані ми обробляємо',
      sec2_items: [
        'Антропометричні метрики (вік, стать, зріст, поточна вага, рівень щоденної активності).',
        'Цілі щодо харчування та калоражу (дефіцит, підтримання або набір маси).',
        'Журнал прийомів їжі, записи інгредієнтів та історія ранкової ваги.',
        'Контактні дані (ім\'я, email, телефон) виключно при добровільній реєстрації профілю.'
      ],
      sec3_title: '3. Ваші невід\'ємні права (GDPR Rights)',
      sec3_desc: 'Відповідно до законодавства ЄС ви маєте такі безумовні права:',
      sec3_items: [
        'Право на доступ (ст. 15): перегляд усіх внесених до додатку даних у будь-який час.',
        'Право на видалення / бути забутим (ст. 17): повне стирання всіх ваших даних з пристрою в один клік у розділі «Профіль».',
        'Право на перенесення даних (ст. 20): експорт вашого повного щоденника та профілю у форматі JSON.'
      ],
      sec4_title: '4. Захист та шифрування',
      sec4_desc: 'Усі розрахункові алгоритми виконуються локально в ізольованій пісочниці браузера (Sandbox). Додаток захищений від Cross-Site Scripting (XSS) та не використовує трекінг геолокації чи сторонні рекламні банери.'
    },
    terms: {
      medical_title: 'Медичне застереження (Medical Disclaimer):',
      medical_desc: 'NUTRIQ є математичним інформаційним помічником для контролю раціону. Сервіс не є медичною організацією і не надає медичних діагнозів, лікування чи медичних рекомендацій.',
      sec1_title: '1. Прийняття умов',
      sec1_desc: 'Використовуючи додаток NUTRIQ або реєструючи обліковий запис, ви підтверджуєте, що досягли 16-річного віку та погоджуєтесь дотримуватися цих Умов використання.',
      sec2_title: '2. Підписка NUTRIQ PRO та Безкоштовний період (Trial)',
      sec2_items: [
        '7-денний пробний період (0 €): надає повний доступ до всіх ресторанних страв, Smart Swap та AI відео-парсера без списання коштів.',
        'Автоматичне подовження: якщо підписку не скасовано за 24 години до завершення тріалу, активується обраний план (€2.99/міс при річній оплаті або €4.99/міс).',
        'Скасування в 1 клік: ви можете скасувати або деактивувати підписку в будь-який час у налаштуваннях профілю без штрафів та прихованих комісій.'
      ],
      sec3_title: '3. Інтелектуальна власність',
      sec3_desc: 'Усі алгоритми (Cook-Loss Engine, True Fat Trend, Smart Swap), дизайн-система Deep Dark Glassmorphism та авторські рецепти шефа є об\'єктами виключної інтелектуальної власності NUTRIQ Studio.'
    }
  }
};

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const { lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  const content = LEGAL_TEXTS[lang as keyof typeof LEGAL_TEXTS] || (lang === 'es' ? LEGAL_TEXTS.es : lang === 'uk' ? LEGAL_TEXTS.uk : LEGAL_TEXTS.en);

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
              <h3 className="text-sm font-black text-white tracking-tight">{content.title}</h3>
              <p className="text-[10px] text-zinc-400">{content.subtitle}</p>
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
              id="tab-privacy-policy"
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{content.privacy_tab}</span>
            </button>

            <button
              id="tab-terms-of-service"
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{content.terms_tab}</span>
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
                  <strong>{content.privacy.local_first_title}</strong> {content.privacy.local_first_desc}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.privacy.sec1_title}</h4>
                <p>{content.privacy.sec1_desc}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.privacy.sec2_title}</h4>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                  {content.privacy.sec2_items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.privacy.sec3_title}</h4>
                <p>{content.privacy.sec3_desc}</p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px] mt-1">
                  {content.privacy.sec3_items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.privacy.sec4_title}</h4>
                <p>{content.privacy.sec4_desc}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Медичний дисклеймер */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>{content.terms.medical_title}</strong> {content.terms.medical_desc}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.terms.sec1_title}</h4>
                <p>{content.terms.sec1_desc}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.terms.sec2_title}</h4>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                  {content.terms.sec2_items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">{content.terms.sec3_title}</h4>
                <p>{content.terms.sec3_desc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-white/10 shrink-0 bg-black/40">
          <button
            id="btn-close-legal-action"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all active:scale-95"
          >
            {content.close_btn}
          </button>
        </div>
      </div>
    </div>
  );
};
