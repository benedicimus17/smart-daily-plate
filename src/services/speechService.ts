/**
 * Web Speech API wrapper for Voice Food Dictation (Stage 8.6)
 * Supports Ukrainian (uk-UA), Spanish (es-ES), and English (en-US)
 * Zero cost, native device speech-to-text with continuous listening
 */

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
}

export type SpeechCallback = (payload: SpeechRecognitionResultPayload) => void;
export type SpeechErrorCallback = (error: string) => void;

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    lang: string = 'uk',
    onResult: SpeechCallback,
    onError?: SpeechErrorCallback,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) {
      onError?.('Браузер не підтримує Web Speech API');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    const localeMap: Record<string, string> = {
      uk: 'uk-UA',
      es: 'es-ES',
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT'
    };
    this.recognition.lang = localeMap[lang] || 'uk-UA';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = (final || interim).trim();
      if (text) {
        onResult({
          transcript: text,
          isFinal: Boolean(final)
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError?.(event.error || 'Помилка розпізнавання голосу');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError?.(err?.message || 'Не вдалося запустити мікрофон');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
