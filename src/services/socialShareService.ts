/**
 * NUTRIQ Social Share & Daily Progress Card Generator (Stage 6.3)
 * Генерація брендованих скляних карток у форматах Stories (9:16, 1080x1920) та Квадрат (1:1, 1080x1080)
 * з підтримкою Web Share API, Canvas 2D рендерингу та 1-клік збереження/копіювання.
 */

export interface ShareCardData {
  dateTitle: string;
  userName: string;
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinGrams: number;
  proteinTarget: number;
  fatGrams: number;
  fatTarget: number;
  carbsGrams: number;
  carbsTarget: number;
  waterMl: number;
  waterTargetMl: number;
  flexBankKcal: number;
  cookLossGramsSaved?: number;
  format?: 'story' | 'square';
}

export type ShareResult = {
  success: boolean;
  method: 'native' | 'download' | 'clipboard' | 'failed';
  error?: string;
};

/**
 * Рендеринг зображення на HTML5 Canvas (висока роздільна здатність Retina)
 */
export function renderCardToCanvas(data: ShareCardData, canvas: HTMLCanvasElement): void {
  const isStory = data.format !== 'square';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Темний градієнт фону (Slate Moss Luxury Dark)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090D0B');
  bgGrad.addColorStop(0.5, '#121915');
  bgGrad.addColorStop(1, '#070A08');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Атмосферне неонове світіння (Amber & Emerald)
  const drawGlow = (x: number, y: number, radius: number, color: string) => {
    const radial = ctx.createRadialGradient(x, y, 0, x, y, radius);
    radial.addColorStop(0, color);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  drawGlow(width * 0.5, height * 0.28, 450, 'rgba(245, 158, 11, 0.12)');
  drawGlow(width * 0.2, height * 0.75, 400, 'rgba(16, 185, 129, 0.08)');
  drawGlow(width * 0.85, height * 0.5, 350, 'rgba(99, 102, 241, 0.07)');

  // 3. Основна картка зі скляним ефектом
  const cardMargin = 60;
  const cardY = isStory ? 160 : 60;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - cardY - (isStory ? 160 : 60);
  const cardRadius = 50;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardMargin, cardY, cardWidth, cardHeight, cardRadius);
  ctx.fillStyle = 'rgba(18, 25, 21, 0.75)';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();
  ctx.restore();

  // 4. Брендовий логотип NUTRIQ у шапці
  const headerY = cardY + 90;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "NUTRI" (білий) + "Q" (золото)
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('NUTRI', width * 0.5 - 22, headerY);
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('Q', width * 0.5 + 46, headerY);

  ctx.font = '500 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('INTELLIGENT NUTRITION', width * 0.5, headerY + 45);

  // Дата та користувач
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(data.dateTitle || 'Сьогоднішній баланс', width * 0.5, headerY + 115);

  ctx.font = '400 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#A1A1AA';
  ctx.fillText(`Раціон: ${data.userName || 'Користувач'}`, width * 0.5, headerY + 160);

  // 5. Головне кільце / КБЖВ статус
  const ringCenterY = isStory ? cardY + 580 : cardY + 440;
  const ringRadius = isStory ? 180 : 130;
  const ringStroke = 26;

  // Підкладка кільця
  ctx.save();
  ctx.beginPath();
  ctx.arc(width * 0.5, ringCenterY, ringRadius, 0, Math.PI * 2);
  ctx.lineWidth = ringStroke;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();

  // Заповнена дуга калорій
  const calPercent = Math.min(1, data.caloriesConsumed / (data.caloriesTarget || 1));
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + calPercent * Math.PI * 2;

  ctx.beginPath();
  ctx.arc(width * 0.5, ringCenterY, ringRadius, startAngle, endAngle);
  ctx.lineWidth = ringStroke;
  ctx.lineCap = 'round';
  const ringGrad = ctx.createLinearGradient(0, ringCenterY - ringRadius, 0, ringCenterY + ringRadius);
  ringGrad.addColorStop(0, '#F59E0B');
  ringGrad.addColorStop(1, '#D97706');
  ctx.strokeStyle = ringGrad;
  ctx.stroke();
  ctx.restore();

  // Текст у центрі кільця
  ctx.textAlign = 'center';
  ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(String(data.caloriesConsumed), width * 0.5, ringCenterY - 15);

  ctx.font = '500 28px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`/ ${data.caloriesTarget} ккал`, width * 0.5, ringCenterY + 40);

  // 6. Три макро-колонки (БЖУ)
  const macroY = isStory ? ringCenterY + 280 : ringCenterY + 200;
  const colWidth = 260;
  const colGap = 35;
  const startX = width * 0.5 - (colWidth * 3 + colGap * 2) * 0.5;

  const macros = [
    {
      name: 'БІЛКИ',
      val: data.proteinGrams,
      target: data.proteinTarget,
      unit: 'г',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    {
      name: 'ЖИРИ',
      val: data.fatGrams,
      target: data.fatTarget,
      unit: 'г',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    {
      name: 'ВУГЛЕВОДИ',
      val: data.carbsGrams,
      target: data.carbsTarget,
      unit: 'г',
      color: '#818CF8',
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.3)'
    }
  ];

  macros.forEach((m, idx) => {
    const x = startX + idx * (colWidth + colGap);
    const boxHeight = isStory ? 170 : 130;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, macroY, colWidth, boxHeight, 26);
    ctx.fillStyle = m.bg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = m.border;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = m.color;
    ctx.fillText(m.name, x + colWidth * 0.5, macroY + 35);

    ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${m.val}${m.unit}`, x + colWidth * 0.5, macroY + (isStory ? 85 : 75));

    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`з ${m.target}${m.unit}`, x + colWidth * 0.5, macroY + (isStory ? 128 : 108));
    ctx.restore();
  });

  // 7. Додаткові показники (Flex Bank, Гідратація, Cook-Loss)
  const badgesY = isStory ? macroY + 230 : macroY + 160;
  const badgeWidth = cardWidth - 80;
  const badgeX = cardMargin + 40;

  const drawInfoBadge = (y: number, iconText: string, title: string, subtitle: string, accentColor: string) => {
    const bHeight = isStory ? 95 : 75;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(badgeX, y, badgeWidth, bHeight, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Емодзі / Іконка
    ctx.textAlign = 'left';
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillText(iconText, badgeX + 25, y + bHeight * 0.5 + 2);

    // Заголовок
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(title, badgeX + 80, y + (isStory ? 38 : 30));

    // Підзаголовок
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(subtitle, badgeX + 80, y + (isStory ? 70 : 56));
    ctx.restore();
  };

  const flexStr = data.flexBankKcal >= 0 ? `+${data.flexBankKcal} ккал у резерві` : `${data.flexBankKcal} ккал`;
  drawInfoBadge(badgesY, '🏦', 'Weekly Flex Bank', flexStr, '#F59E0B');

  const waterStr = `${data.waterMl} / ${data.waterTargetMl} мл (${Math.min(100, Math.round((data.waterMl / (data.waterTargetMl || 1)) * 100))}%)`;
  drawInfoBadge(badgesY + (isStory ? 115 : 90), '💧', 'Водний баланс', waterStr, '#38BDF8');

  if (isStory) {
    const cookLossGrams = data.cookLossGramsSaved || 85;
    drawInfoBadge(
      badgesY + 230,
      '🍳',
      'Cook-Loss Engine',
      `Враховано уварку: -25% (збережено точність на ${cookLossGrams} г)`,
      '#10B981'
    );
  }

  // 8. Футер картки
  const footerY = cardY + cardHeight - 50;
  ctx.textAlign = 'center';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Створено в NUTRIQ • nutriq.app • Дзен-контроль харчування', width * 0.5, footerY);
}

/**
 * Створення Blob зображення з Canvas у форматі PNG
 */
export async function createShareCardBlob(data: ShareCardData): Promise<Blob> {
  if (typeof document === 'undefined') {
    return new Blob([], { type: 'image/png' });
  }

  const canvas = document.createElement('canvas');
  renderCardToCanvas(data, canvas);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob failed'));
      }
    }, 'image/png');
  });
}

/**
 * 1-клік шеринг або збереження:
 * Спроба нативного Web Share API з файлом -> fallback копіювання в буфер -> fallback завантаження файлу
 */
export async function shareOrDownloadCard(
  blob: Blob,
  filename = 'nutriq-daily-summary.png'
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' });

  // 1. Спроба нативного Web Share API з підтримкою файлів (iOS Safari, Android Chrome)
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: 'Мій щоденний баланс NUTRIQ',
        text: 'Збалансований раціон з урахуванням Cook-Loss уварки та Flex Bank у застосунку NUTRIQ',
        files: [file]
      });
      return { success: true, method: 'native' };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: false, method: 'native', error: 'Скасовано користувачем' };
      }
      // Якщо системний шеринг викликав помилку, плавно переходимо до завантаження
    }
  }

  // 2. Спроба копіювання в буфер обміну (Clipboard Item)
  if (typeof navigator !== 'undefined' && navigator.clipboard && (window as any).ClipboardItem) {
    try {
      const item = new (window as any).ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return { success: true, method: 'clipboard' };
    } catch {
      // Ігноруємо та йдемо на завантаження файлу
    }
  }

  // 3. Пряме завантаження через <a> tag
  if (typeof document !== 'undefined') {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, method: 'download' };
    } catch (err: any) {
      return { success: false, method: 'failed', error: err.message };
    }
  }

  return { success: false, method: 'failed', error: 'Середовище не підтримує експорт' };
}
