import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseVideoRecipeWithAi,
  detectVideoPlatform,
  extractSlugOrHint
} from '../videoAiService';

describe('videoAiService - TikTok/Reels Video AI Backend & Whisper Gateway (Stage 6.0)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Platform Detection', () => {
    it('detects TikTok video links', () => {
      expect(detectVideoPlatform('https://www.tiktok.com/@chef/video/crepes-with-meat')).toBe('TikTok');
      expect(detectVideoPlatform('https://vm.tiktok.com/ZM8xYqL/')).toBe('TikTok');
    });

    it('detects Instagram Reels links', () => {
      expect(detectVideoPlatform('https://www.instagram.com/reel/Cx9_12345/')).toBe('Instagram Reels');
    });

    it('detects YouTube Shorts links', () => {
      expect(detectVideoPlatform('https://www.youtube.com/shorts/abcdef123')).toBe('YouTube Shorts');
      expect(detectVideoPlatform('https://youtu.be/shortId')).toBe('YouTube Shorts');
    });
  });

  describe('Slug & Hint Extraction', () => {
    it('extracts human-readable food slug from URL', () => {
      expect(extractSlugOrHint('https://www.tiktok.com/@chef/video/crepes-with-meat')).toBe('crepes with meat');
      expect(extractSlugOrHint('https://instagram.com/reel/pasta_shrimp_spinach')).toBe('pasta shrimp spinach');
    });
  });

  describe('Whisper Audio AI Processing', () => {
    it('accurately parses spoken audio transcript into structured ingredients and macros', async () => {
      const audioTranscript = `
        - 200г Куряче філе
        - 50г Твердий сир
        - 150г Відварений рис
        - 10г Оливкова олія
      `;

      const result = await parseVideoRecipeWithAi({
        videoUrl: 'https://www.tiktok.com/@chef/video/healthy-chicken',
        audioTranscript,
        dishHint: 'Куряче філе з рисом та сиром'
      });

      expect(result.success).toBe(true);
      expect(result.source).toBe('whisper_ai');
      expect(result.confidence).toBe(0.98);
      expect(result.platform).toBe('TikTok');
      expect(result.recipe).toBeDefined();
      expect(result.recipe?.ingredients).toHaveLength(4);
      expect(result.recipe?.totalMacros.calories).toBeGreaterThan(400);
      expect(result.cookLossNote).toContain('-25% уварка вологи');
    });
  });

  describe('Vision OCR Text Processing', () => {
    it('parses recipe text recognized from video frames', async () => {
      const frameOcrText = `
        - 120г Лосось свіжий
        - 80г Авокадо
        - 100г Салатний мікс
      `;

      const result = await parseVideoRecipeWithAi({
        videoUrl: 'https://www.instagram.com/reel/salmon-salad',
        frameOcrText
      });

      expect(result.success).toBe(true);
      expect(result.source).toBe('ocr_vision');
      expect(result.confidence).toBe(0.95);
      expect(result.platform).toBe('Instagram Reels');
      expect(result.recipe?.ingredients).toHaveLength(3);
    });
  });

  describe('Edge Function Backend Integration & Fallback', () => {
    it('calls remote Edge Function when available and returns result', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          platform: 'TikTok',
          confidence: 0.96,
          cookLossEstimate: '-25% уварка вологи (Cook-Loss)'
        })
      });

      const result = await parseVideoRecipeWithAi({
        videoUrl: 'https://www.tiktok.com/@chef/video/crepes-with-meat',
        dishHint: 'крепси з м’ясом',
        endpointUrl: 'https://supabase.co/functions/v1/parse-video-recipe',
        fetchImpl: mockFetch as any
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.source).toBe('edge_function');
      expect(result.confidence).toBe(0.96);
    });

    it('falls back seamlessly to local neural heuristics if endpoint is unreachable', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error or CORS block'));

      const result = await parseVideoRecipeWithAi({
        videoUrl: 'https://www.tiktok.com/@chef/video/crepes-with-meat',
        dishHint: 'крепси з м’ясом',
        endpointUrl: 'https://supabase.co/functions/v1/parse-video-recipe',
        fetchImpl: mockFetch as any
      });

      expect(result.success).toBe(true);
      expect(result.source).toBe('local_neural');
      expect(result.recipe).toBeDefined();
      expect(result.recipe?.totalMacros.calories).toBeGreaterThan(0);
    });
  });
});
