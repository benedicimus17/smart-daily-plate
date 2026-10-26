import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  X,
  Download,
  Copy,
  CheckCircle2,
  Smartphone,
  Square,
  Sparkles,
  Flame,
  Droplets,
  PiggyBank
} from 'lucide-react';
import {
  ShareCardData,
  renderCardToCanvas,
  createShareCardBlob,
  shareOrDownloadCard
} from '../services/socialShareService';
import { trackEvent } from '../services/analyticsService';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareCardData;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  shareData
}) => {
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;

    const currentData: ShareCardData = {
      ...shareData,
      format
    };

    renderCardToCanvas(currentData, canvas);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
      setIsLoading(false);
    }, 'image/png');

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, format, shareData]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleShareNative = async () => {
    const currentData: ShareCardData = { ...shareData, format };
    try {
      const blob = await createShareCardBlob(currentData);
      const res = await shareOrDownloadCard(blob, `nutriq_daily_${format}.png`);

      if (res.success) {
        trackEvent('social_card_shared', {
          format,
          method: res.method
        });
        if (res.method === 'native') {
          showToast('✓ Надіслано через системний шеринг!');
        } else if (res.method === 'clipboard') {
          showToast('✓ Скопійовано в буфер обміну!');
        } else {
          showToast('✓ Картку збережено на пристрій!');
        }
      } else if (res.error && res.error !== 'Скасовано користувачем') {
        showToast(`Помилка: ${res.error}`);
      }
    } catch {
      showToast('Помилка при створенні картки');
    }
  };

  const handleDownload = async () => {
    const currentData: ShareCardData = { ...shareData, format };
    try {
      const blob = await createShareCardBlob(currentData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutriq_daily_${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✓ Картку успішно завантажено!');
    } catch {
      showToast('Не вдалося завантажити');
    }
  };

  const handleCopy = async () => {
    const currentData: ShareCardData = { ...shareData, format };
    try {
      const blob = await createShareCardBlob(currentData);
      if (navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        showToast('✓ Зображення скопійовано в буфер!');
      } else {
        await handleDownload();
      }
    } catch {
      await handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        id="social-share-modal"
        className="w-full max-w-lg rounded-3xl p-4 sm:p-6 text-zinc-100 relative overflow-hidden flex flex-col max-h-[94vh] border border-white/10"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,24,0.97) 0%, rgba(10,14,12,0.99) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 50px rgba(245,158,11,0.08)'
        }}
      >
        {/* Атмосферне світіння */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Шапка модалки */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                <span>Поділитися днем</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Stories & Post
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Брендова темна картка NUTRIQ з КБЖВ, водою та Flex Bank
              </p>
            </div>
          </div>
          <button
            id="btn-close-social-share"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Перемикач формату (Stories 9:16 vs Пост 1:1) */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 rounded-2xl bg-white/[0.04] border border-white/10 relative z-10 shrink-0">
          <button
            id="btn-format-story"
            type="button"
            onClick={() => setFormat('story')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              format === 'story'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Stories (9:16)</span>
          </button>

          <button
            id="btn-format-square"
            type="button"
            onClick={() => setFormat('square')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              format === 'square'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Квадрат (1:1)</span>
          </button>
        </div>

        {/* Візуальне прев'ю згенерованої картки */}
        <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center py-1">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Генерація зображення...</span>
            </div>
          ) : (
            <div
              className={`relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl transition-all ${
                format === 'story' ? 'w-52 h-92 max-h-[46vh]' : 'w-64 h-64 max-h-[46vh]'
              }`}
            >
              <img
                src={previewUrl}
                alt="NUTRIQ Daily Summary Preview"
                className="w-full h-full object-contain bg-[#090D0B]"
              />
            </div>
          )}
        </div>

        {/* Ключові показники картки */}
        <div className="grid grid-cols-3 gap-1.5 py-2 relative z-10 shrink-0 text-center text-[10px]">
          <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" /> {shareData.caloriesConsumed}
            </span>
            <span className="text-zinc-400 text-[9px]">з {shareData.caloriesTarget} ккал</span>
          </div>

          <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-sky-400 font-bold flex items-center justify-center gap-1">
              <Droplets className="w-3 h-3" /> {shareData.waterMl}
            </span>
            <span className="text-zinc-400 text-[9px]">з {shareData.waterTargetMl} мл</span>
          </div>

          <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
              <PiggyBank className="w-3 h-3" /> {shareData.flexBankKcal >= 0 ? `+${shareData.flexBankKcal}` : shareData.flexBankKcal}
            </span>
            <span className="text-zinc-400 text-[9px]">Flex Bank ккал</span>
          </div>
        </div>

        {/* Кнопки дій */}
        <div className="pt-2 border-t border-white/10 space-y-2 relative z-10 shrink-0">
          <button
            id="btn-do-share-native"
            type="button"
            onClick={handleShareNative}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-98 cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Поділитися в Stories / соцмережах</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-do-download-card"
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Зберегти PNG</span>
            </button>

            <button
              id="btn-do-copy-card"
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Скопіювати</span>
            </button>
          </div>

          {actionToast && (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-center text-xs font-bold animate-fadeIn flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{actionToast}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
