// 브라우저 언어 자동 감지 및 지원 언어 매핑

export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'de';

// 지원 언어 목록
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['ko', 'en', 'ja', 'zh', 'fr', 'de'];

// 브라우저 언어를 지원 언어로 매핑
export const mapBrowserLanguageToSupported = (browserLang: string): SupportedLanguage => {
  if (!browserLang) return 'en';
  
  const lang = browserLang.toLowerCase().split('-')[0];
  
  const languageMap: Record<string, SupportedLanguage> = {
    // 한국어
    'ko': 'ko', 'kr': 'ko', 'ko-kr': 'ko',
    
    // 영어
    'en': 'en', 'us': 'en', 'gb': 'en', 'en-us': 'en', 'en-gb': 'en',
    
    // 일본어
    'ja': 'ja', 'jp': 'ja', 'ja-jp': 'ja',
    
    // 중국어
    'zh': 'zh', 'cn': 'zh', 'tw': 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh',
    
    // 프랑스어
    'fr': 'fr', 'fr-fr': 'fr', 'ca': 'fr', 'fr-ca': 'fr',
    
    // 독일어
    'de': 'de', 'de-de': 'de', 'at': 'de', 'de-at': 'de', 'ch': 'de', 'de-ch': 'de'
  };
  
  return languageMap[lang] || 'en'; // 기본값: 영어
};

// 브라우저 언어 자동 감지
export const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en'; // 서버사이드에서는 기본값
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  return mapBrowserLanguageToSupported(browserLang);
};

// 언어별 국가/지역 정보
export const getLanguageInfo = (lang: SupportedLanguage) => {
  const languageInfo = {
    ko: { name: '한국어', country: '대한민국', flag: '🇰🇷' },
    en: { name: 'English', country: 'United States', flag: '🇺🇸' },
    ja: { name: '日本語', country: '日本', flag: '🇯🇵' },
    zh: { name: '中文', country: '中国', flag: '🇨🇳' },
    fr: { name: 'Français', country: 'France', flag: '🇫🇷' },
    de: { name: 'Deutsch', country: 'Deutschland', flag: '🇩🇪' }
  };
  
  return languageInfo[lang];
};

// 언어 우선순위 정렬 (브라우저 언어 우선)
export const sortLanguagesByPriority = (browserLang: SupportedLanguage): SupportedLanguage[] => {
  const otherLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== browserLang);
  return [browserLang, ...otherLanguages];
};
