import { z } from 'zod';

export const ThemeEnum = z.enum(["tech", "humanities", "emotion"]);
export type Theme = z.infer<typeof ThemeEnum>;

export const LanguageEnum = z.enum(["zh", "ja", "en"]);
export type Language = z.infer<typeof LanguageEnum>;

export const TypographyConfigSchema = z.object({
  theme: ThemeEnum.default("humanities"),
  language: LanguageEnum.default("zh"),
});
export type TypographyConfig = z.infer<typeof TypographyConfigSchema>;

// 色彩令牌映射
export const THEME_TOKENS: Record<Theme, { bg: string; textMain: string; textSub: string; border: string }> = {
  tech: {
    bg: "#F8F9FA",
    textMain: "#1A1B1E",
    textSub: "#5C5F66",
    border: "#E9ECEF",
  },
  humanities: {
    bg: "#FAF8F5",
    textMain: "#2C2B29",
    textSub: "#73706B",
    border: "#E6E2DA",
  },
  emotion: {
    bg: "#FDF6E3",
    textMain: "#332F2A",
    textSub: "#857C70",
    border: "#EBE1C5",
  },
};

// 字号基准映射 (对应1080px画布)
export const LANG_BASELINE: Record<Language, number> = {
  zh: 32,
  ja: 30,
  en: 28,
};
