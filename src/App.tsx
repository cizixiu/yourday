/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Solar, Lunar } from 'lunar-javascript';
import { QUOTES, ADVICE_POOL } from './data/quotes';
import { Palette, X, Download, RefreshCw, RotateCcw, Type, Baseline, Layers, Check, ChevronLeft, ChevronRight, Calendar, Pipette, Link, Link2Off } from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { ColorPicker } from './components/ColorPicker';

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

type ThemeType = 'classic' | 'bold' | 'dark' | 'warm' | 'technical' | 'poster' | 'traditional' | 'editorial' | 'vintage' | 'zen' | 'crimson' | 'vanguard' | 'neo-traditional';
type DateFontType = 'bungee' | 'bebas' | 'cormorant' | 'abril' | 'mono' | 'satisfy' | 'space' | 'outfit';
type QuoteFontType = 'serif' | 'sans' | 'kaiti' | 'calligraphy' | 'handwrite' | 'display' | 'modern' | 'mono';
type TearAnimationType = 'classic' | 'slide-left' | 'float' | 'zoom';

export default function App() {
  const [theme, setTheme] = useState<ThemeType>('bold');
  const [dateFont, setDateFont] = useState<DateFontType>('space');
  const [quoteFont, setQuoteFont] = useState<QuoteFontType>('serif');
  const [scheme, setScheme] = useState<string>('original');
  const [bgId, setBgId] = useState<string>('default');
  const [quoteFontSize, setQuoteFontSize] = useState<number | undefined>(undefined);
  const [adviceFontSize, setAdviceFontSize] = useState<number | undefined>(undefined);
  const [dayFontSize, setDayFontSize] = useState<number | undefined>(undefined);
  const [dayStyle, setDayStyle] = useState<string>('standard');
  const [hasShadow, setHasShadow] = useState(true);
  const [borderRadius, setBorderRadius] = useState<number | undefined>(undefined);
  const [borderWidth, setBorderWidth] = useState<number | undefined>(undefined);
  const [borderColor, setBorderColor] = useState<string>('');
  const [isFontSync, setIsFontSync] = useState(false);
  const [cardBg, setCardBg] = useState<string>('');
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('');
  const [customMutedColor, setCustomMutedColor] = useState<string>('');
  const [isColorLinked, setIsColorLinked] = useState(true);
  const [customAppBgColor, setCustomAppBgColor] = useState<string>('');
  const [customCardBgColor, setCustomCardBgColor] = useState<string>('');
  const [customQuoteText, setCustomQuoteText] = useState<string>('');
  const [customQuoteSource, setCustomQuoteSource] = useState<string>('');
  const [customBorderColor, setCustomBorderColor] = useState<string>('');
  const [isCustomBorder, setIsCustomBorder] = useState(false);
  const [isCustomCardBg, setIsCustomCardBg] = useState(false);
  const [cardTexture, setCardTexture] = useState('none');
  const [footerText, setFooterText] = useState('Your Day');
  const [isManualMode, setIsManualMode] = useState(false);
  const [showSuitable, setShowSuitable] = useState(true);
  const [showAvoid, setShowAvoid] = useState(true);
  const [tearAnimation, setTearAnimation] = useState<TearAnimationType>('classic');
  const [isTearing, setIsTearing] = useState(false);

  const [isShadowOverlayEnabled, setIsShadowOverlayEnabled] = useState(false);
  const [shadowOverlayUrl, setShadowOverlayUrl] = useState('https://pic1.imgdb.cn/item/69fb18da4498ed47aaabf1ef.png');
  const [shadowOpacity, setShadowOpacity] = useState(0.5);
  const [shadowBlur, setShadowBlur] = useState(10);

  const cardBgs = [
    { id: 'default', color: '', label: '跟随主题' },
    { id: 'white', color: '#FFFFFF', label: '纯白' },
    { id: 'paper', color: '#FDFCF8', label: '纸张' },
    { id: 'sepia', color: '#F4ECD8', label: '复古' },
    { id: 'dark', color: '#1A1A1A', label: '深邃' },
    { id: 'cream', color: '#F5F5DC', label: '奶油' },
    { id: 'blue', color: '#EBF5FF', label: '淡蓝' },
    { id: 'green', color: '#F0FDF4', label: '浅艾' },
    { id: 'oat', color: '#F4F1EA', label: '燕麦' },
    { id: 'wheat', color: '#FBF8F1', label: '麦香' },
  ];
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'font' | 'quote' | 'scheme' | 'background' | 'card' | 'border' | 'personal' | 'calendar' | 'visibility' | 'system' | 'shadow'>('theme');
  const [randomSeed, setRandomSeed] = useState(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);

  // Click away to close settings panel or date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // If we clicked inside the settings panel or its trigger, do nothing
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;

      // If we clicked inside the date picker or its trigger, do nothing
      if ((target as HTMLElement).closest('.date-picker-modal') || dateTriggerRef.current?.contains(target)) return;
      
      // If we clicked inside action buttons, do nothing
      if (actionButtonsRef.current?.contains(target)) return;

      // Otherwise, close both
      if (isSwitcherOpen) setIsSwitcherOpen(false);
      if (isDatePickerOpen) setIsDatePickerOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSwitcherOpen, isDatePickerOpen]);
  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('calendar-theme') as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    const savedFont = localStorage.getItem('calendar-date-font') as DateFontType;
    if (savedFont) setDateFont(savedFont);

    const savedQuoteFont = localStorage.getItem('calendar-quote-font') as QuoteFontType;
    if (savedQuoteFont) setQuoteFont(savedQuoteFont);

    const savedFontSync = localStorage.getItem('calendar-font-sync') === 'true';
    setIsFontSync(savedFontSync);

    const savedScheme = localStorage.getItem('calendar-scheme');
    if (savedScheme) setScheme(savedScheme);

    const savedBgId = localStorage.getItem('calendar-bg-id');
    if (savedBgId) setBgId(savedBgId);

    const savedShadow = localStorage.getItem('calendar-shadow');
    if (savedShadow !== null) setHasShadow(savedShadow === 'true');

    const savedQuoteFontSize = localStorage.getItem('calendar-quote-font-size');
    if (savedQuoteFontSize) setQuoteFontSize(parseInt(savedQuoteFontSize));

    const savedAdviceFontSize = localStorage.getItem('calendar-advice-font-size');
    if (savedAdviceFontSize) setAdviceFontSize(parseInt(savedAdviceFontSize));

    const savedDayFontSize = localStorage.getItem('calendar-day-font-size');
    if (savedDayFontSize) setDayFontSize(parseInt(savedDayFontSize));

    const savedDayStyle = localStorage.getItem('calendar-day-style');
    if (savedDayStyle) setDayStyle(savedDayStyle);

    const savedRadius = localStorage.getItem('calendar-radius');
    if (savedRadius) setBorderRadius(parseInt(savedRadius));

    const savedBorderWidth = localStorage.getItem('calendar-border-width');
    if (savedBorderWidth) setBorderWidth(parseInt(savedBorderWidth));

    const savedBorderColor = localStorage.getItem('calendar-border-color');
    if (savedBorderColor) {
      setBorderColor(savedBorderColor);
      setCustomBorderColor(savedBorderColor);
      setIsCustomBorder(localStorage.getItem('calendar-border-custom') === 'true');
    }

    const savedCardBg = localStorage.getItem('calendar-card-bg');
    if (savedCardBg) {
      setCardBg(savedCardBg);
      setIsCustomCardBg(localStorage.getItem('calendar-card-custom') === 'true');
    }

    const savedCustomPrimary = localStorage.getItem('calendar-custom-primary');
    if (savedCustomPrimary) setCustomPrimaryColor(savedCustomPrimary);

    const savedCustomMuted = localStorage.getItem('calendar-custom-muted');
    if (savedCustomMuted) setCustomMutedColor(savedCustomMuted);

    const savedColorLinked = localStorage.getItem('calendar-color-linked');
    if (savedColorLinked !== null) setIsColorLinked(savedColorLinked === 'true');

    const savedCustomAppBg = localStorage.getItem('calendar-custom-app-bg');
    if (savedCustomAppBg) setCustomAppBgColor(savedCustomAppBg);

    const savedCustomCardBg = localStorage.getItem('calendar-custom-card-bg');
    if (savedCustomCardBg) setCustomCardBgColor(savedCustomCardBg);

    const savedCustomQuoteText = localStorage.getItem('calendar-custom-quote-text');
    if (savedCustomQuoteText) setCustomQuoteText(savedCustomQuoteText);

    const savedCustomQuoteSource = localStorage.getItem('calendar-custom-quote-source');
    if (savedCustomQuoteSource) setCustomQuoteSource(savedCustomQuoteSource);

    const savedFooterText = localStorage.getItem('calendar-footer-text');
    if (savedFooterText) setFooterText(savedFooterText);

    const savedManualMode = localStorage.getItem('calendar-manual-mode') === 'true';
    setIsManualMode(savedManualMode);

    const savedShowSuitable = localStorage.getItem('calendar-show-suitable');
    if (savedShowSuitable !== null) setShowSuitable(savedShowSuitable === 'true');

    const savedShowAvoid = localStorage.getItem('calendar-show-avoid');
    if (savedShowAvoid !== null) setShowAvoid(savedShowAvoid === 'true');

    const savedTearAnimation = localStorage.getItem('calendar-tear-animation') as TearAnimationType;
    if (savedTearAnimation) setTearAnimation(savedTearAnimation);

    const savedShadowOverlayEnabled = localStorage.getItem('calendar-shadow-overlay-enabled') === 'true';
    setIsShadowOverlayEnabled(savedShadowOverlayEnabled);

    const savedShadowOverlayUrl = localStorage.getItem('calendar-shadow-overlay-url');
    if (savedShadowOverlayUrl) setShadowOverlayUrl(savedShadowOverlayUrl);

    const savedShadowOpacity = localStorage.getItem('calendar-shadow-opacity');
    if (savedShadowOpacity) setShadowOpacity(parseFloat(savedShadowOpacity));

    const savedShadowBlur = localStorage.getItem('calendar-shadow-blur');
    if (savedShadowBlur) setShadowBlur(parseFloat(savedShadowBlur));
    
    // If manual mode, try to load last valid date
    if (savedManualMode) {
      const savedDate = localStorage.getItem('calendar-last-date');
      if (savedDate) {
        const d = new Date(savedDate);
        if (!isNaN(d.getTime())) {
          // If the saved date is older than today, keep it. 
          // If it's today or future, just use today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (d < today) {
            setCurrentDate(d);
          }
        }
      }
    }
  }, []);

  const handleShadowOverlayToggle = (val: boolean) => {
    setIsShadowOverlayEnabled(val);
    localStorage.setItem('calendar-shadow-overlay-enabled', String(val));
  };

  const handleShadowOpacityChange = (val: number) => {
    setShadowOpacity(val);
    localStorage.setItem('calendar-shadow-opacity', String(val));
  };

  const handleShadowBlurChange = (val: number) => {
    setShadowBlur(val);
    localStorage.setItem('calendar-shadow-blur', String(val));
  };

  const handleShadowUrlChange = (url: string) => {
    setShadowOverlayUrl(url);
    localStorage.setItem('calendar-shadow-overlay-url', url);
  };

  const handleManualModeToggle = (val: boolean) => {
    setIsManualMode(val);
    localStorage.setItem('calendar-manual-mode', String(val));
    if (!val) {
      setCurrentDate(new Date());
    }
  };

  const handleToggleSuitable = (val: boolean) => {
    setShowSuitable(val);
    localStorage.setItem('calendar-show-suitable', String(val));
  };

  const handleToggleAvoid = (val: boolean) => {
    setShowAvoid(val);
    localStorage.setItem('calendar-show-avoid', String(val));
  };

  const handleCustomQuoteChange = (val: string) => {
    setCustomQuoteText(val);
    localStorage.setItem('calendar-custom-quote-text', val);
  };

  const handleCustomQuoteSourceChange = (val: string) => {
    setCustomQuoteSource(val);
    localStorage.setItem('calendar-custom-quote-source', val);
  };

  const handleTear = () => {
    if (isTearing) return;
    
    setIsTearing(true);
    
    // Change date after a small delay to allow for interaction feedback
    // but fast enough that the animation starts almost immediately
    setTimeout(() => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const targetDate = nextDate > today ? today : nextDate;
      setCurrentDate(targetDate);
      localStorage.setItem('calendar-last-date', targetDate.toISOString());
      
      // Keep isTearing true for the duration of the animation
      setTimeout(() => {
        setIsTearing(false);
      }, 2000); 
    }, 100);
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('calendar-theme', newTheme);
  };

  const handleFontChange = (newFont: DateFontType) => {
    setDateFont(newFont);
    localStorage.setItem('calendar-date-font', newFont);
  };

  const handleQuoteFontChange = (newFont: QuoteFontType) => {
    setQuoteFont(newFont);
    localStorage.setItem('calendar-quote-font', newFont);
  };

  const toggleFontSync = () => {
    const nextState = !isFontSync;
    setIsFontSync(nextState);
    localStorage.setItem('calendar-font-sync', String(nextState));
  };

  const handleSchemeChange = (newScheme: string) => {
    setScheme(newScheme);
    localStorage.setItem('calendar-scheme', newScheme);
    
    // Update custom color inputs to match the preset
    const schemeData = colorSchemes.find(s => s.id === newScheme);
    if (schemeData) {
      const colors = isThemeDark ? schemeData.dark : schemeData.light;
      if (colors) {
        if (colors['--color-primary'] || colors['--border-accent']) {
          const mainColor = colors['--color-primary'] || colors['--border-accent'];
          setCustomPrimaryColor(mainColor);
          localStorage.setItem('calendar-custom-primary', mainColor);
        }
        if (colors['--color-text']) {
          setCustomMutedColor(colors['--color-text']);
          localStorage.setItem('calendar-custom-muted', colors['--color-text']);
        }
      }
    } else if (newScheme === 'original') {
      const defaultColor = getThemeDefaultColor(theme);
      setCustomPrimaryColor(defaultColor);
      setCustomMutedColor(defaultColor);
      localStorage.setItem('calendar-custom-primary', defaultColor);
      localStorage.setItem('calendar-custom-muted', defaultColor);
    }
  };

  const handleCustomPrimaryChange = (color: string) => {
    setCustomPrimaryColor(color);
    if (isColorLinked) {
      setCustomMutedColor(color);
      localStorage.setItem('calendar-custom-muted', color);
    }
    setScheme('custom');
    localStorage.setItem('calendar-custom-primary', color);
    localStorage.setItem('calendar-scheme', 'custom');
  };

  const handleCustomMutedChange = (color: string) => {
    setCustomMutedColor(color);
    setScheme('custom');
    localStorage.setItem('calendar-custom-muted', color);
    localStorage.setItem('calendar-scheme', 'custom');
  };

  const toggleColorLink = () => {
    const newState = !isColorLinked;
    setIsColorLinked(newState);
    localStorage.setItem('calendar-color-linked', String(newState));
    if (newState) {
      // When linking, sync muted to primary
      setCustomMutedColor(customPrimaryColor);
      localStorage.setItem('calendar-custom-muted', customPrimaryColor);
    }
  };

  const handleBgChange = (newBg: string) => {
    setBgId(newBg);
    localStorage.setItem('calendar-bg-id', newBg);
    
    // Update custom color input to match preset
    const bgData = backgrounds.find(b => b.id === newBg);
    if (bgData && bgData.color !== 'transparent') {
      setCustomAppBgColor(bgData.color);
      localStorage.setItem('calendar-custom-app-bg', bgData.color);
    }
  };

  const handleFooterTextChange = (text: string) => {
    // Limit to 20 Chinese or 40 English
    // Simple heuristic: Chinese characters count as 2, English as 1
    let totalLen = 0;
    let slicedText = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      totalLen += (charCode >= 0 && charCode <= 128) ? 1 : 2;
      if (totalLen <= 40) {
        slicedText += text[i];
      } else {
        break;
      }
    }
    setFooterText(slicedText);
    localStorage.setItem('calendar-footer-text', slicedText);
  };

  const handleCustomAppBgChange = (color: string) => {
    setCustomAppBgColor(color);
    setBgId('custom-color');
    localStorage.setItem('calendar-custom-app-bg', color);
    localStorage.setItem('calendar-bg-id', 'custom-color');
  };

  const handleShadowChange = (newVal: boolean) => {
    setHasShadow(newVal);
    localStorage.setItem('calendar-shadow', String(newVal));
  };

  const handleRadiusChange = (newVal: number) => {
    setBorderRadius(newVal);
    localStorage.setItem('calendar-radius', String(newVal));
  };

  const handleBorderWidthChange = (newVal: number) => {
    setBorderWidth(newVal);
    localStorage.setItem('calendar-border-width', String(newVal));
  };

  const handleQuoteFontSizeChange = (newSize: number) => {
    setQuoteFontSize(newSize);
    localStorage.setItem('calendar-quote-font-size', String(newSize));
  };

  const handleAdviceFontSizeChange = (newSize: number) => {
    setAdviceFontSize(newSize);
    localStorage.setItem('calendar-advice-font-size', String(newSize));
  };

  const handleDayFontSizeChange = (newSize: number) => {
    setDayFontSize(newSize);
    localStorage.setItem('calendar-day-font-size', String(newSize));
  };

  const handleDayStyleChange = (style: string) => {
    setDayStyle(style);
    localStorage.setItem('calendar-day-style', style);
  };

  const handleSelectDate = (dateStr: string) => {
    if (!dateStr) return;
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return;
      const newDate = new Date(year, month - 1, day);
      if (isNaN(newDate.getTime())) return;
      setCurrentDate(newDate);
    } catch (e) {
      console.error('Invalid date selection:', e);
    }
  };

  const handleBorderColorChange = (newColor: string, isCustom = false) => {
    setBorderColor(newColor);
    setIsCustomBorder(isCustom);
    setCustomBorderColor(newColor);
    localStorage.setItem('calendar-border-color', newColor);
    localStorage.setItem('calendar-border-custom', String(isCustom));
  };

  const handleCardBgChange = (newVal: string) => {
    setCardBg(newVal);
    setIsCustomCardBg(false);
    setCustomCardBgColor(newVal);
    localStorage.setItem('calendar-card-bg', newVal);
    localStorage.setItem('calendar-card-custom', 'false');
    localStorage.setItem('calendar-custom-card-bg', newVal);
  };

  const handleCustomCardBgChange = (color: string) => {
    setCustomCardBgColor(color);
    setCardBg(color);
    setIsCustomCardBg(true);
    localStorage.setItem('calendar-custom-card-bg', color);
    localStorage.setItem('calendar-card-bg', color);
    localStorage.setItem('calendar-card-custom', 'true');
  };

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDefaults = () => {
    // Reset fundamental themes
    setTheme('bold');
    setDateFont('space');
    setQuoteFont('serif');

    // Reset Overrides to Theme Defaults (undefined/empty)
    setBorderRadius(undefined);
    setBorderWidth(undefined);
    setQuoteFontSize(undefined);
    setAdviceFontSize(undefined);
    setDayFontSize(undefined);
    setDayStyle('standard');
    setBorderColor('');
    setCardBg('');
    setCardTexture('none');
    setScheme('original');
    setBgId('default');
    setCustomQuoteText('');
    setCustomQuoteSource('');
    setIsFontSync(false);
    setIsCustomBorder(false);
    setIsCustomCardBg(false);
    setIsManualMode(false);
    setShowSuitable(true);
    setShowAvoid(true);
    setTearAnimation('classic');
    setHasShadow(true);
    setFooterText('Your Day');
    setIsShadowOverlayEnabled(false);
    setShadowOverlayUrl('https://pic1.imgdb.cn/item/69fb18da4498ed47aaabf1ef.png');
    setShadowOpacity(0.5);
    setShadowBlur(10);
    
    // Clear custom color inputs
    setCustomPrimaryColor('');
    setCustomAppBgColor('');
    setCustomCardBgColor('');
    setCustomBorderColor('');

    // Clear LocalStorage overrides
    const overrideKeys = [
      'calendar-theme',
      'calendar-date-font',
      'calendar-quote-font',
      'calendar-scheme',
      'calendar-bg-id', 
      'calendar-radius', 
      'calendar-shadow', 
      'calendar-border-width',
      'calendar-border-color', 
      'calendar-card-bg', 
      'calendar-font-sync',
      'calendar-custom-primary', 
      'calendar-custom-app-bg', 
      'calendar-custom-card-bg',
      'calendar-quote-font-size',
      'calendar-advice-font-size',
      'calendar-day-font-size',
      'calendar-day-style',
      'calendar-footer-text',
      'calendar-custom-quote',
      'calendar-custom-source',
      'calendar-manual-mode',
      'calendar-show-suitable',
      'calendar-show-avoid',
      'calendar-tear-animation',
      'calendar-last-date',
      'calendar-shadow-overlay-enabled',
      'calendar-shadow-overlay-url',
      'calendar-shadow-opacity',
      'calendar-shadow-blur'
    ];
    overrideKeys.forEach(key => localStorage.removeItem(key));
    
    // Provide feedback
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  const calendarData = useMemo(() => {
    // Defensive check for valid date
    const safeDate = (currentDate && !isNaN(currentDate.getTime())) ? currentDate : new Date();
    
    const solar = Solar.fromDate(safeDate);
    const lunar = Lunar.fromSolar(solar);
    
    const year = solar.getYear();
    const month = solar.getMonth();
    const day = solar.getDay();
    const weekIdx = solar.getWeek();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthNamesEn = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    const lunarYearGanzhi = lunar.getYearInGanZhi();
    const lunarMonthGanzhi = lunar.getMonthInGanZhi();
    const lunarDayGanzhi = lunar.getDayInGanZhi();
    
    const festivals = [...lunar.getFestivals(), ...lunar.getOtherFestivals(), ...solar.getFestivals()];
    const solarTerm = lunar.getJieQi();

    const dateStr = `${year}-${month}-${day}`;
    // Use the base hash if seed is 0, otherwise use randomSeed
    const hash = randomSeed === 0 ? getHash(dateStr) : randomSeed;
    
    // Custom Quote Logic
    const quote = customQuoteText 
      ? { text: customQuoteText, author: customQuoteSource, book: '' }
      : QUOTES[hash % QUOTES.length];
      
    const advice = ADVICE_POOL[hash % ADVICE_POOL.length];

    const dayYi = lunar.getDayYi();
    const dayJi = lunar.getDayJi();

    const isModern = ['bold', 'dark', 'technical', 'poster', 'editorial', 'crimson', 'vanguard'].includes(theme);

    return {
      year,
      monthName: theme === 'crimson' 
        ? monthNames[month - 1] 
        : (isModern ? `${monthNamesEn[month - 1]} ${monthNames[month - 1]}` : monthNames[month - 1]),
      monthNameEn: monthNamesEn[month - 1],
      day,
      weekday: isModern ? `${weekDays[weekIdx]} ${weekDaysEn[weekIdx].toUpperCase()}` : weekDays[weekIdx],
      weekdayCn: weekDays[weekIdx],
      lunarDate: theme === 'classic' ? `农历${lunarMonth}月${lunarDay}${festivals.length > 0 ? '·' + festivals[0] : solarTerm ? '·' + solarTerm : ''}` : `农历${lunarMonth}月${lunarDay}`,
      lunarGanzhi: `${lunarYearGanzhi}年${lunarMonthGanzhi}月${lunarDayGanzhi}日`,
      lunarYearGanzhi,
      lunarShengxiao: lunar.getYearShengXiao(),
      lunarMonthName: lunarMonth,
      lunarDayName: lunarDay,
      festivals: festivals.join(' '),
      solarTerm: solarTerm || '',
      lunarDayGanzhi,
      quote,
      dayYi,
      dayJi
    };
  }, [currentDate, theme, randomSeed, customQuoteText, customQuoteSource]);

  const handleRandomQuote = () => {
    // Pick a truly random quote from QUOTES
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    const q = QUOTES[randomIndex];
    handleCustomQuoteChange(q.text);
    handleCustomQuoteSourceChange(q.author);
  };

  const handleRandomStyle = () => {
    // 1. Random Theme
    const themeList: ThemeType[] = ['classic', 'bold', 'dark', 'warm', 'technical', 'poster', 'traditional', 'editorial', 'vintage', 'zen', 'crimson', 'vanguard', 'neo-traditional'];
    const newTheme = themeList[Math.floor(Math.random() * themeList.length)];
    setTheme(newTheme);

    // 2. Random Scheme
    const schemes = ['default', 'monochrome', 'vibrant', 'soft', 'earth', 'midnight', 'rose', 'forest', 'original'];
    const newScheme = schemes[Math.floor(Math.random() * schemes.length)];
    setScheme(newScheme);

    // 3. Random Fonts
    const fontIds = ['serif', 'sans', 'pixel', 'technical', 'display', 'brush', 'classic'];
    const newDateFont = fontIds[Math.floor(Math.random() * fontIds.length)] as any;
    const newQuoteFont = fontIds[Math.floor(Math.random() * fontIds.length)] as any;
    setDateFont(newDateFont);
    setQuoteFont(newQuoteFont);

    // 4. Random Layout Styles
    const dayStyles = ['standard', 'outline', 'shadow', 'neumorphic', 'minimal'];
    const newDayStyle = dayStyles[Math.floor(Math.random() * dayStyles.length)];
    setDayStyle(newDayStyle);

    // 5. Borders and Corners
    setBorderRadius(Math.floor(Math.random() * 40));
    setBorderWidth(Math.floor(Math.random() * 6));

    // 6. Other Params
    setHasShadow(Math.random() > 0.5);
    
    // 7. Background Style
    const bgs = ['default', 'glass', 'mesh', 'paper', 'gradient'];
    const newBg = bgs[Math.floor(Math.random() * bgs.length)];
    setBgId(newBg);

    // Reset custom colors to let scheme take over
    setCustomPrimaryColor('');
    setCustomAppBgColor('');
  };

  const themes: { id: ThemeType; name: string; class: string }[] = [
    { id: 'classic', name: '经典', class: 'bg-[#F5F3F0] border-gray-300' },
    { id: 'bold', name: '包豪斯', class: 'bg-[#E5E5E1] border-black' },
    { id: 'dark', name: '暗夜', class: 'bg-[#121212] border-gray-700' },
    { id: 'warm', name: '和风', class: 'bg-[#EDE0D4] border-[#D7CCC8]' },
    { id: 'poster', name: '海报', class: 'bg-white border-red-600' },
    { id: 'traditional', name: '传统', class: 'bg-[#F4EBE2] border-[#B03A2E]' },
    { id: 'technical', name: '蓝图', class: 'bg-[#0A192F] border-[#64FFDA]' },
    { id: 'editorial', name: '社论', class: 'bg-white border-black' },
    { id: 'vintage', name: '复古', class: 'bg-[#E9C46A] border-[#264653]' },
    { id: 'zen', name: '禅意', class: 'bg-[#F1F8E9] border-[#558B2F]' },
    { id: 'crimson', name: '赤金', class: 'bg-white border-[#e3b245]' },
    { id: 'vanguard', name: '前卫', class: 'bg-[#130A19] border-[#CE93D8]' },
    { id: 'neo-traditional', name: '墨水屏', class: 'bg-[#D8E2DC] border-[#2C3E50]' },
  ];

  const fonts: { id: DateFontType; name: string; value: string }[] = [
    { id: 'space', name: '艺术设计', value: 'var(--font-date-space)' },
    { id: 'bungee', name: '摩登像素', value: 'var(--font-date-bungee)' },
    { id: 'bebas', name: 'Bebas', value: 'var(--font-date-bebas)' },
    { id: 'cormorant', name: 'Cormorant', value: 'var(--font-date-cormorant)' },
    { id: 'abril', name: 'Abril', value: 'var(--font-date-abril)' },
    { id: 'mono', name: 'Typewriter', value: 'var(--font-date-mono)' },
    { id: 'satisfy', name: 'Handwrite', value: 'var(--font-date-satisfy)' },
    { id: 'outfit', name: 'Minimal', value: 'var(--font-date-outfit)' },
  ];

  const quoteFonts: { id: QuoteFontType; name: string; value: string }[] = [
    { id: 'serif', name: '典雅宋体', value: 'var(--font-quote-serif)' },
    { id: 'sans', name: '现代黑体', value: 'var(--font-quote-sans)' },
    { id: 'kaiti', name: '人文楷体', value: 'var(--font-quote-kaiti)' },
    { id: 'calligraphy', name: '苍劲书法', value: 'var(--font-quote-calligraphy)' },
    { id: 'handwrite', name: '随性手写', value: 'var(--font-quote-handwrite)' },
    { id: 'display', name: '现代美术', value: 'var(--font-quote-display)' },
    { id: 'modern', name: '时尚黄油', value: 'var(--font-quote-modern)' },
    { id: 'mono', name: '极客等宽', value: 'var(--font-quote-mono)' },
  ];

  const getThemeDefaultColor = (t: ThemeType) => {
    switch (t) {
      case 'classic': return '#2C3E50';
      case 'bold': return '#000000';
      case 'dark': return '#58A6FF';
      case 'warm': return '#8D6E63';
      case 'poster': return '#C41E3A';
      case 'traditional': return '#B03A2E';
      case 'technical': return '#64FFDA';
      case 'editorial': return '#000000';
      case 'vintage': return '#E76F51';
      case 'zen': return '#8BC34A';
      case 'crimson': return '#e3b245';
      case 'vanguard': return '#CE93D8';
      case 'neo-traditional': return '#000000';
      default: return '#9CA3AF';
    }
  };

  const getThemeDefaultBgColor = (t: ThemeType) => {
    switch (t) {
      case 'bold': return '#E5E5E1';
      case 'classic': return '#F5F3F0';
      case 'dark': return '#121212';
      case 'warm': return '#EDE0D4';
      case 'technical': return '#0A192F';
      case 'poster': return '#1A1A1A';
      case 'traditional': return '#F4EBE2';
      case 'editorial': return '#F8F8F8';
      case 'vintage': return '#E76F51';
      case 'zen': return '#DCEDC8';
      case 'crimson': return '#F5F5F0';
      case 'vanguard': return '#130A19';
      case 'neo-traditional': return '#D8E2DC';
      default: return '#F5F5F0';
    }
  };

  const colorSchemes = [
    { id: 'original', name: '默认', bg: 'bg-neutral-200' },
    { 
      id: 'sakura', 
      name: '樱花', 
      bg: 'bg-[#FF80AB]', 
      light: { '--bg-page': '#FFF5F7', '--bg-card': '#FFFFFF', '--color-text': '#D81B60', '--color-muted': '#C2185B', '--border-card': '#F8D7DA', '--border-accent': '#D81B60' },
      dark: { '--bg-page': '#1A0B10', '--bg-card': '#2D141C', '--color-text': '#FF80AB', '--color-muted': '#F06292', '--border-card': '#4A0E2E', '--border-accent': '#FF80AB' }
    },
    { 
      id: 'forest', 
      name: '森林', 
      bg: 'bg-[#81C784]', 
      light: { '--bg-page': '#F1F8E9', '--bg-card': '#FFFFFF', '--color-text': '#2E7D32', '--color-muted': '#388E3C', '--border-card': '#C8E6C9', '--border-accent': '#2E7D32' },
      dark: { '--bg-page': '#0D1B12', '--bg-card': '#152A1E', '--color-text': '#81C784', '--color-muted': '#A5D6A7', '--border-card': '#1B3C2A', '--border-accent': '#81C784' }
    },
    { 
      id: 'ocean', 
      name: '海洋', 
      bg: 'bg-[#4FC3F7]', 
      light: { '--bg-page': '#E1F5FE', '--bg-card': '#FFFFFF', '--color-text': '#0277BD', '--color-muted': '#0288D1', '--border-card': '#B3E5FC', '--border-accent': '#0277BD' },
      dark: { '--bg-page': '#010D1A', '--bg-card': '#021B35', '--color-text': '#4FC3F7', '--color-muted': '#81D4FA', '--border-card': '#072F5F', '--border-accent': '#4FC3F7' }
    },
    { 
      id: 'matcha', 
      name: '抹茶', 
      bg: 'bg-[#AED581]', 
      light: { '--bg-page': '#F9FBE7', '--bg-card': '#FFFFFF', '--color-text': '#558B2F', '--color-muted': '#689F38', '--border-card': '#DCEDC8', '--border-accent': '#558B2F' },
      dark: { '--bg-page': '#12160C', '--bg-card': '#1D2413', '--color-text': '#AED581', '--color-muted': '#C5E1A5', '--border-card': '#2A341C', '--border-accent': '#AED581' }
    },
    { 
      id: 'terracotta', 
      name: '陶土', 
      bg: 'bg-[#FF8A65]', 
      light: { '--bg-page': '#FBE9E7', '--bg-card': '#FFFFFF', '--color-text': '#BF360C', '--color-muted': '#D84315', '--border-card': '#FFCCBC', '--border-accent': '#BF360C' },
      dark: { '--bg-page': '#1C100D', '--bg-card': '#2F1A16', '--color-text': '#FF8A65', '--color-muted': '#FFAB91', '--border-card': '#4A281E', '--border-accent': '#FF8A65' }
    },
    { 
      id: 'mist', 
      name: '薄雾', 
      bg: 'bg-[#90A4AE]', 
      light: { '--bg-page': '#ECEFF1', '--bg-card': '#FFFFFF', '--color-text': '#37474F', '--color-muted': '#455A64', '--border-card': '#CFD8DC', '--border-accent': '#37474F' },
      dark: { '--bg-page': '#101416', '--bg-card': '#1B2124', '--color-text': '#90A4AE', '--color-muted': '#B0BEC5', '--border-card': '#263238', '--border-accent': '#90A4AE' }
    },
    { 
      id: 'gold', 
      name: '流金', 
      bg: 'bg-[#FFF176]', 
      light: { '--bg-page': '#FFFDE7', '--bg-card': '#FFFFFF', '--color-text': '#F57F17', '--color-muted': '#FBC02D', '--border-card': '#FFF9C4', '--border-accent': '#F57F17' },
      dark: { '--bg-page': '#1A1400', '--bg-card': '#2B2100', '--color-text': '#FFF176', '--color-muted': '#FFF59D', '--border-card': '#403100', '--border-accent': '#FFF176' }
    },
    { 
      id: 'crimson_gold', 
      name: '赤金', 
      bg: 'bg-[#e3b245]', 
      light: { '--bg-page': '#FDF9F0', '--bg-card': '#FFFFFF', '--color-text': '#e3b245', '--color-muted': '#D4AF37', '--border-card': '#F2E8D5', '--border-accent': '#e3b245' },
      dark: { '--bg-page': '#1A140B', '--bg-card': '#2A2112', '--color-text': '#e3b245', '--color-muted': '#C59A3D', '--border-card': '#3D2F1B', '--border-accent': '#e3b245' }
    },
    { 
      id: 'violet', 
      name: '罗兰', 
      bg: 'bg-[#BA68C8]', 
      light: { '--bg-page': '#F3E5F5', '--bg-card': '#FFFFFF', '--color-text': '#6A1B9A', '--color-muted': '#7B1FA2', '--border-card': '#E1BEE7', '--border-accent': '#6A1B9A' },
      dark: { '--bg-page': '#130A19', '--bg-card': '#21112D', '--color-text': '#CE93D8', '--color-muted': '#E1BEE7', '--border-card': '#311B92', '--border-accent': '#CE93D8' }
    },
    { 
      id: 'slate', 
      name: '石板', 
      bg: 'bg-[#475569]', 
      light: { '--bg-page': '#F1F5F9', '--bg-card': '#FFFFFF', '--color-text': '#334155', '--color-muted': '#475569', '--border-card': '#E2E8F0', '--border-accent': '#334155' },
      dark: { '--bg-page': '#0F172A', '--bg-card': '#1E293B', '--color-text': '#94A3B8', '--color-muted': '#CBD5E1', '--border-card': '#334155', '--border-accent': '#94A3B8' }
    },
    { 
      id: 'amber', 
      name: '琥珀', 
      bg: 'bg-[#D97706]', 
      light: { '--bg-page': '#FFFBEB', '--bg-card': '#FFFFFF', '--color-text': '#92400E', '--color-muted': '#B45309', '--border-card': '#FEF3C7', '--border-accent': '#92400E' },
      dark: { '--bg-page': '#451A03', '--bg-card': '#78350F', '--color-text': '#FBBF24', '--color-muted': '#FCD34D', '--border-card': '#92400E', '--border-accent': '#FBBF24' }
    },
    { 
      id: 'rosewood', 
      name: '檀香', 
      bg: 'bg-[#991B1B]', 
      light: { '--bg-page': '#FEF2F2', '--bg-card': '#FFFFFF', '--color-text': '#7F1D1D', '--color-muted': '#991B1B', '--border-card': '#FEE2E2', '--border-accent': '#7F1D1D' },
      dark: { '--bg-page': '#450A0A', '--bg-card': '#7F1D1D', '--color-text': '#FCA5A5', '--color-muted': '#FECACA', '--border-card': '#991B1B', '--border-accent': '#FCA5A5' }
    },
    { 
      id: 'ebony', 
      name: '乌木', 
      bg: 'bg-[#1A1A1A]', 
      light: { '--bg-page': '#F5F5F5', '--bg-card': '#FFFFFF', '--color-text': '#1A1A1A', '--color-muted': '#666666', '--border-card': '#E5E5E5', '--border-accent': '#1A1A1A' },
      dark: { '--bg-page': '#0A0A0A', '--bg-card': '#121212', '--color-text': '#FFFFFF', '--color-muted': '#A0A0A0', '--border-card': '#1A1A1A', '--border-accent': '#FFFFFF' }
    },
    { 
      id: 'clay', 
      name: '粘土', 
      bg: 'bg-[#8D6241]', 
      light: { '--bg-page': '#FDF9F6', '--bg-card': '#FFFFFF', '--color-text': '#8D6241', '--color-muted': '#A6866D', '--border-card': '#F3E9E2', '--border-accent': '#8D6241' },
      dark: { '--bg-page': '#1A120B', '--bg-card': '#2A1D12', '--color-text': '#C59A78', '--color-muted': '#A6866D', '--border-card': '#3D2A1B', '--border-accent': '#C59A78' }
    },
    { 
      id: 'nordic', 
      name: '北欧', 
      bg: 'bg-[#2C3E50]', 
      light: { '--bg-page': '#F0F4F7', '--bg-card': '#FFFFFF', '--color-text': '#2C3E50', '--color-muted': '#7F8C8D', '--border-card': '#D6DBDF', '--border-accent': '#2C3E50' },
      dark: { '--bg-page': '#0C1117', '--bg-card': '#161B22', '--color-text': '#8B949E', '--color-muted': '#C9D1D9', '--border-card': '#30363D', '--border-accent': '#58A6FF' }
    },
    { 
      id: 'coffee', 
      name: '咖啡', 
      bg: 'bg-[#6F4E37]', 
      light: { '--bg-page': '#FAF3E0', '--bg-card': '#FFFFFF', '--color-text': '#6F4E37', '--color-muted': '#8B5E3C', '--border-card': '#EBD5B3', '--border-accent': '#6F4E37' },
      dark: { '--bg-page': '#1B1411', '--bg-card': '#2D1E17', '--color-text': '#D2B48C', '--color-muted': '#A68966', '--border-card': '#402D24', '--border-accent': '#D2B48C' }
    },
    { 
      id: 'teal', 
      name: '清新', 
      bg: 'bg-[#008080]', 
      light: { '--bg-page': '#E0F2F1', '--bg-card': '#FFFFFF', '--color-text': '#00695C', '--color-muted': '#00796B', '--border-card': '#B2DFDB', '--border-accent': '#00695C' },
      dark: { '--bg-page': '#001A1A', '--bg-card': '#002B2B', '--color-text': '#4DB6AC', '--color-muted': '#80CBC4', '--border-card': '#004D40', '--border-accent': '#4DB6AC' }
    },
  ];

  const backgrounds = [
    { id: 'default', name: '默认', color: '#FFFFFF', preview: 'bg-white' },
    { id: 'white', name: '纯白', color: '#FFFFFF', preview: 'bg-white shadow-inner border-gray-100' },
    { id: 'paper', name: '故纸', color: '#FDFBF7', preview: 'bg-[#FDFBF7]' },
    { id: 'cream', name: '杏黄', color: '#FFF9E1', preview: 'bg-[#FFF9E1]' },
    { id: 'sage', name: '竹青', color: '#E8F0E8', preview: 'bg-[#E8F0E8]' },
    { id: 'mist', name: '瓦青', color: '#F0F4F8', preview: 'bg-[#F0F4F8]' },
    { id: 'rose', name: '藕粉', color: '#FDF0F0', preview: 'bg-[#FDF0F0]' },
    { id: 'charcoal', name: '玄灰', color: '#2C2C2C', preview: 'bg-[#2C2C2C]' },
    { id: 'midnight', name: '黛蓝', color: '#0F172A', preview: 'bg-[#0F172A]' },
    { id: 'snow', name: '积雪', color: '#F9FAFB', preview: 'bg-[#F9FAFB]' },
    { id: 'obsidian', name: '曜石', color: '#171717', preview: 'bg-[#171717]' },
    { id: 'silk', name: '蚕丝', color: '#F8F7F3', preview: 'bg-[#F8F7F3]' },
    { id: 'cloud', name: '云中', color: '#E8EEF2', preview: 'bg-[#E8EEF2]' },
    { id: 'dust', name: '烟粉', color: '#F4E7E7', preview: 'bg-[#F4E7E7]' },
  ];

  const currentFontValue = (() => {
    if (theme === 'vanguard' && !dateFont) return 'var(--font-date-outfit)';
    return fonts.find(f => f.id === dateFont)?.value || 'var(--font-serif)';
  })();
  const currentQuoteFontValue = quoteFonts.find(f => f.id === quoteFont)?.value || 'var(--font-quote-serif)';
  
  const isThemeDark = ['dark', 'technical', 'vanguard'].includes(theme);
  
  const hexToRgb = (hex: string): string => {
    if (!hex) return '0, 0, 0';
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(char => char + char).join('');
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return isNaN(r) ? '0, 0, 0' : `${r}, ${g}, ${b}`;
  };

  const schemeStyles = useMemo(() => {
    let styles: any = {};
    if (scheme === 'custom' && (customPrimaryColor || customMutedColor)) {
      styles = { 
        '--color-primary': customPrimaryColor || '#3B82F6',
        '--border-accent': customPrimaryColor || '#3B82F6',
        '--color-text': (isColorLinked ? customPrimaryColor : customMutedColor) || customPrimaryColor || '#3B82F6',
        '--color-muted': (isColorLinked ? customPrimaryColor : customMutedColor) || customPrimaryColor || '#3B82F6'
      };
    } else {
      const currentSchemeData = colorSchemes.find(s => s.id === scheme);
      const rawStyles = currentSchemeData ? (isThemeDark ? currentSchemeData.dark : currentSchemeData.light) || {} : {};
      
      // Filter out backgrounds to preserve theme or custom background settings
      Object.entries(rawStyles).forEach(([key, value]) => {
        if (key !== '--bg-page' && key !== '--bg-card') {
          styles[key] = value;
        }
      });
    }
    
    // Ensure --color-primary is set if not present but --border-accent is
    if (!styles['--color-primary'] && styles['--border-accent']) {
      styles['--color-primary'] = styles['--border-accent'];
    }
    
    // Ensure --border-accent is set if not present but --color-primary is
    if (styles['--color-primary'] && !styles['--border-accent']) {
      styles['--border-accent'] = styles['--color-primary'];
    }

    // Extract primary color for RGB variable usage in filters/shadows
    const primary = styles['--color-primary'] || styles['--border-accent'] || '#000000';
    styles['--color-primary-rgb'] = hexToRgb(primary);
    
    return styles;
  }, [scheme, customPrimaryColor, customMutedColor, isColorLinked, isThemeDark]);

  const [isDownloading, setIsDownloading] = useState(false);

  const primaryColor = useMemo(() => {
    if (schemeStyles['--color-primary'] || schemeStyles['--border-accent']) {
      return schemeStyles['--color-primary'] || schemeStyles['--border-accent'];
    }
    // Fallbacks based on theme
    switch (theme) {
      case 'technical': return '#64FFDA';
      case 'vanguard': return '#CE93D8';
      case 'neo-traditional': return '#000000';
      case 'dark': return '#3B82F6';
      case 'warm': return '#5D4037';
      case 'traditional': return '#B03A2E';
      case 'poster': return '#C41E3A';
      case 'zen': return '#8BC34A';
      case 'vintage': return '#E76F51';
      case 'crimson': return '#e3b245';
      case 'editorial': return '#000000';
      case 'bold': return '#1A1A1A';
      case 'classic': return '#000000';
      default: return isThemeDark ? '#3B82F6' : '#E11D48';
    }
  }, [schemeStyles, isThemeDark, theme]);

  const handleDownload = async () => {
    const node = document.getElementById('calendar-container');
    if (!node || isDownloading) return;

    setIsDownloading(true);
    
    // Increased timeout for mobile devices
    const TIMEOUT_DURATION = 35000;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Download timeout')), TIMEOUT_DURATION)
    );

    const performRendering = async (scale: number) => {
      // Ensure all fonts are loaded before capturing
      if ('fonts' in document) {
        await (document as any).fonts.ready;
      }

      return await toCanvas(node, { 
        pixelRatio: scale, 
        backgroundColor: getComputedStyle(node).backgroundColor || '#ffffff',
        cacheBust: true,
        style: {
          transform: 'scale(1)', 
        },
        filter: (domNode) => {
          if (domNode instanceof HTMLElement && domNode.classList.contains('download-overlay')) {
            return false;
          }
          return true;
        }
      });
    };

    try {
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      let canvas: HTMLCanvasElement;
      
      try {
        // Try high resolution first
        canvas = await Promise.race([
          performRendering(2),
          timeoutPromise
        ]) as HTMLCanvasElement;
      } catch (err) {
        console.warn('High-res render failed or timed out, trying standard resolution...', err);
        // Fallback to standard resolution if high-res fails or times out
        canvas = await performRendering(1.2);
      }
      
      if (!canvas) throw new Error('Failed to generate canvas');

      // Use a more compatible way to trigger download
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.92));
      
      if (!blob || blob.size < 100) throw new Error('Generated image is empty');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Du-Almanac-${calendarData.year}${calendarData.monthName}${calendarData.day}.png`;
      link.href = url;
      link.target = '_blank'; // Essential for some mobile browsers
      
      // For iOS Safari compatibility
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        if (link.parentNode) document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
      
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (err) {
      console.error('Download failed:', err);
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      alert(`下载遇到了点困难 (${errorMsg})。\n\n常见解决方案：\n1. 稍等几秒后刷新页面重试\n2. 尝试切换网络环境\n3. 在电脑浏览器上打开可获得最佳下载体验`);
    } finally {
      setIsDownloading(false);
    }
  };
  
  const bgPageValue = useMemo(() => {
    if (bgId === 'custom-color' && customAppBgColor) return customAppBgColor;
    const currentBg = backgrounds.find(b => b.id === bgId);
    if (currentBg && currentBg.id !== 'default') return currentBg.color;
    return undefined; // Let CSS handle it via var(--bg-page)
  }, [bgId, customAppBgColor]);

  // Sync body background color to avoid gaps on mobile "bounce" or overscroll
  useEffect(() => {
    if (bgPageValue) {
      document.body.style.backgroundColor = bgPageValue;
    } else {
      // Fallback is more complex because it depends on the theme
      // For simplicity, we just set it to the root div's background-color
      const rootDiv = document.getElementById('root-bg');
      if (rootDiv) {
        const computedBg = getComputedStyle(rootDiv).backgroundColor;
        document.body.style.backgroundColor = computedBg;
      }
    }
  }, [bgPageValue, theme, scheme]);

  // Helper for dynamic button classes
  const hexToBrightness = (hex: string): number => {
    if (!hex || !hex.startsWith('#')) return 255;
    const h = hex.slice(1);
    let r, g, b;
    if (h.length === 3) {
      r = parseInt(h[0] + h[0], 16);
      g = parseInt(h[1] + h[1], 16);
      b = parseInt(h[2] + h[2], 16);
    } else {
      r = parseInt(h.substring(0, 2), 16);
      g = parseInt(h.substring(2, 4), 16);
      b = parseInt(h.substring(4, 6), 16);
    }
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  const isDarkBg = useMemo(() => {
    if (bgPageValue && bgPageValue.startsWith('#')) {
      const hex = bgPageValue.slice(1);
      if (hex.length === 3 || hex.length === 6) {
        let r, g, b;
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 140; // Slightly higher threshold for better "dark" experience
      }
    }
    return ['dark', 'technical', 'vanguard'].includes(theme) || ['charcoal', 'midnight', 'obsidian'].includes(bgId);
  }, [bgPageValue, theme, bgId]);

  // Semi-dynamic styling for the tear button
  const tearButtonStyle = useMemo(() => {
    let baseColor = primaryColor || '#e11d48'; // Use calculated primaryColor
    let shadowColor = `${baseColor}44`;
    
    // Calculate if text should be dark or light based on baseColor brightness
    let isLightText = true;
    if (baseColor.startsWith('#')) {
      const hex = baseColor.slice(1);
      let r, g, b;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      isLightText = brightness < 160; // Standard threshold
    }

    return { 
      baseColor, 
      shadowColor, 
      textColor: isLightText ? '#FFFFFF' : '#121212',
      badgeBgColor: isLightText ? '#FACC15' : 'rgba(0,0,0,0.15)',
      badgeTextColor: isLightText ? '#991B1B' : '#121212' 
    };
  }, [primaryColor, theme, isDarkBg]);

  const btnBaseClass = isDarkBg 
    ? 'bg-black/40 backdrop-blur-md text-white border-white/10 hover:bg-black/60' 
    : 'bg-white text-black border-gray-100 hover:bg-gray-50';
  const mainBtnClass = isDarkBg
    ? 'bg-black text-white border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]'
    : 'bg-white text-black border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)]';
  const menuClass = isDarkBg
    ? 'bg-[#0A0A0A]/95 text-white border-white/10'
    : 'bg-white/80 text-black border-gray-200';
  const tabActiveClass = isDarkBg ? 'bg-white/20 text-white' : 'bg-white text-black shadow-sm';
  const itemHoverClass = isDarkBg ? 'hover:bg-white/10' : 'hover:bg-gray-100/50';
  const itemActiveClass = isDarkBg ? 'bg-white text-black' : 'bg-white text-black ring-2 ring-rose-600 shadow-sm';

  return (
    <div 
      id="root-bg"
      className={`min-h-svh w-full flex items-center justify-center p-4 md:p-8 pb-32 transition-colors duration-500 theme-${theme} scheme-${scheme}`} 
      style={{ 
        backgroundColor: bgPageValue || 'var(--bg-page)', 
        ...schemeStyles,
        '--bg-page': bgPageValue || undefined
      } as React.CSSProperties}
    >
      <motion.main 
        key={`${theme}-${dateFont}-${bgId}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`calendar-container theme-${theme} w-full max-w-[560px] aspect-[3/4] border relative p-7 md:p-12 ${dayStyle === 'shadow' ? '' : 'overflow-hidden'} select-none flex flex-col transition-all duration-500 ${hasShadow ? 'shadow-[0_40px_100px_rgba(0,0,0,0.12)]' : 'shadow-none'} ${themes.find(t => t.id === theme)?.class || ''}`}
        id="calendar-container"
        style={{ 
          '--dynamic-font': currentFontValue,
          ...schemeStyles,
          fontFamily: isFontSync ? currentQuoteFontValue : 'inherit',
          backgroundColor: cardBg || undefined,
          borderRadius: borderRadius !== undefined ? `${borderRadius}px` : undefined,
          borderWidth: borderWidth !== undefined ? `${borderWidth}px` : undefined,
          borderColor: borderColor || undefined,
          borderStyle: (borderWidth !== undefined && borderWidth > 0) ? 'solid' : undefined,
          boxShadow: hasShadow ? undefined : 'none',
          perspective: '1200px',
          overflow: isTearing ? 'visible' : (dayStyle === 'shadow' ? 'visible' : 'hidden')
        } as React.CSSProperties}
      >
        {/* Layered pages background for depth - improved for realistic look */}
        <div 
          className="absolute inset-0 -z-10 translate-y-[2px] scale-[0.998] shadow-sm opacity-70 transition-colors duration-500 border-b border-black/5" 
          style={{ backgroundColor: cardBg || 'var(--bg-card)', borderRadius: 'inherit' }} 
        />
        <div 
          className="absolute inset-0 -z-20 translate-y-[4px] scale-[0.996] shadow-sm opacity-50 transition-colors duration-500 border-b border-black/5" 
          style={{ backgroundColor: cardBg || 'var(--bg-card)', borderRadius: 'inherit' }} 
        />
        <div 
          className="absolute inset-0 -z-30 translate-y-[6px] scale-[0.994] shadow-sm opacity-30 transition-colors duration-500 border-b border-black/5" 
          style={{ backgroundColor: cardBg || 'var(--bg-card)', borderRadius: 'inherit' }} 
        />
        
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentDate.toISOString()}
            initial={isTearing ? { opacity: 0, y: -20, rotateX: -15, scale: 1.02 } : false}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotateX: 0, 
              scale: 1,
              backgroundColor: 'transparent',
              transition: { type: 'spring', damping: 20, stiffness: 100 }
            }}
            exit={(() => {
              const exitBg = { backgroundColor: cardBg || 'var(--bg-card)' };
              switch (tearAnimation) {
                case 'slide-left':
                  return {
                    opacity: [1, 1, 0],
                    x: [0, -100, -1500],
                    y: [0, -20, 100],
                    rotateZ: [0, -15, -45],
                    rotateX: [0, 5, 20],
                    filter: ['blur(0px)', 'blur(2px)', 'blur(10px)'],
                    scale: [1, 1.02, 0.9],
                    transformOrigin: 'top right',
                    ...exitBg,
                    transition: { duration: 1.8, times: [0, 0.4, 1], ease: [0.4, 0, 0.2, 1] }
                  };
                case 'float':
                  return {
                    opacity: [1, 0.8, 0],
                    y: [0, -100, -300],
                    x: [0, 50, 100],
                    rotateZ: [0, 10, 25],
                    rotateY: [0, 20, 45],
                    scale: [1, 1.1, 1.2],
                    filter: ['blur(0px)', 'blur(4px)', 'blur(12px)'],
                    ...exitBg,
                    transition: { duration: 2.5, ease: "easeOut" }
                  };
                case 'zoom':
                  return {
                    opacity: [1, 1, 0],
                    scale: [1, 0.5, 0],
                    rotateZ: [0, 180, 720],
                    rotateX: [0, 45, 90],
                    y: [0, 100, 500],
                    filter: ['blur(0px)', 'blur(4px)', 'blur(20px)'],
                    ...exitBg,
                    transition: { duration: 1.5, times: [0, 0.5, 1], ease: "backIn" }
                  };
                default: // classic
                  return { 
                    opacity: [1, 1, 0],
                    y: [0, 50, 1500], 
                    rotateX: [0, 45, 90],
                    rotateY: [0, -10, -20],
                    rotateZ: [0, -5, -15],
                    skewX: [0, -5, -20],
                    filter: ['blur(0px)', 'blur(2px)', 'blur(8px)'],
                    scale: [1, 1.05, 0.8],
                    transformOrigin: 'top center',
                    ...exitBg,
                    transition: { 
                      duration: 2.2, 
                      times: [0, 0.8, 1],
                      ease: [0.45, 0.05, 0.55, 0.95]
                    }
                  };
              }
            })()}
            drag={isManualMode && (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const cur = new Date(currentDate);
              cur.setHours(0, 0, 0, 0);
              return cur < today;
            })() ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) {
                handleTear();
              }
            }}
            onDragStart={() => {
              // Ensure background is visible during drag
              const el = document.getElementById('calendar-info-page');
              if (el) el.style.backgroundColor = cardBg || 'var(--bg-card)';
            }}
            id="calendar-info-page"
            style={{ 
              backgroundColor: cardBg || 'var(--bg-card)',
              borderRadius: 'inherit'
            }}
            className="flex flex-col flex-1 h-full w-full relative z-10 transition-colors duration-500"
          >
            {theme !== 'neo-traditional' && (
              <header className="flex justify-between items-start mb-5" id="header">
          <div className="month-box" id="header-month">
            {calendarData.monthName}
          </div>
          <div className="text-right flex flex-col items-end gap-3" id="header-advice">
            {showSuitable && theme !== 'vanguard' && (
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">今日宜</span>
                <div 
                  className="text-xs font-bold opacity-60 leading-tight max-w-[140px] flex flex-wrap justify-end gap-x-2 gap-y-0.5 overflow-hidden" 
                  style={{ 
                    fontFamily: currentQuoteFontValue, 
                    fontSize: adviceFontSize ? `${adviceFontSize}px` : undefined,
                    maxHeight: adviceFontSize ? `${adviceFontSize * 1.35 * 2}px` : '2.7em'
                  }}
                >
                  {calendarData.dayYi.map((item: string, i: number) => (
                    <span key={i} className="whitespace-nowrap">{item}</span>
                  ))}
                </div>
              </div>
            )}
            {showAvoid && theme !== 'vanguard' && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">今日忌</span>
                <div 
                  className="text-xs font-bold opacity-60 leading-tight max-w-[140px] flex flex-wrap justify-end gap-x-2 gap-y-0.5 overflow-hidden" 
                  style={{ 
                    fontFamily: currentQuoteFontValue, 
                    fontSize: adviceFontSize ? `${adviceFontSize}px` : undefined,
                    maxHeight: adviceFontSize ? `${adviceFontSize * 1.35 * 2}px` : '2.7em'
                  }}
                >
                  {calendarData.dayJi.map((item: string, i: number) => (
                    <span key={i} className="whitespace-nowrap">{item}</span>
                  ))}
                </div>
              </div>
            )}
            </div>
            </header>
          )}

          {theme === 'neo-traditional' && (
            <header className="flex flex-col items-center mb-2 md:mb-10 px-2 capsule-header-nest" id="neo-header">
              <div 
                className="text-[1.8rem] md:text-[3.2rem] font-serif font-black tracking-tighter mb-1 leading-none capsule-month-scale"
                style={{ fontFamily: '"Abril Fatface", serif', color: primaryColor }}
              >
                {calendarData.monthNameEn}
              </div>
              <div className="w-full flex items-center gap-2 mb-1.5 font-serif font-black opacity-80 capsule-compact-header" style={{ color: 'var(--color-text)' }}>
                <div className="flex-1 border-t border-dotted border-current opacity-30 capsule-hide" />
                <span 
                  className="text-[1.1rem] md:text-[1.4rem] tracking-widest pt-1 capsule-text-sm"
                  style={{ fontFamily: '"Abril Fatface", serif' }}
                >
                  {currentDate.getFullYear()}.{String(currentDate.getMonth() + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 border-t border-dotted border-current opacity-30 capsule-hide" />
              </div>

              {(calendarData.festivals || calendarData.solarTerm) && (
                <div className="mt-0.5 md:mt-1 text-[0.8rem] md:text-[0.95rem] font-medium tracking-[2px] opacity-70 text-[var(--color-text)] transition-colors duration-500 capsule-text-xs">
                  {calendarData.festivals ? calendarData.festivals.split(' ')[0] : calendarData.solarTerm}
                </div>
              )}
            </header>
          )}

        {theme !== 'neo-traditional' && (
          <section className="flex-1 relative flex items-center justify-center date-section">
          {/* Theme-specific Festival/Solar Term Layouts */}
          {(calendarData.festivals || calendarData.solarTerm || theme === 'vanguard') && theme !== 'classic' && (
            <div className="absolute inset-0 pointer-events-none select-none" id="festival-layer">
              {/* 1. Traditional/Vintage: Red Stamp Style */}
              {(theme === 'traditional' || theme === 'vintage') && (
                <div className="absolute right-4 top-[1px] flex flex-col gap-2 z-10">
                  {calendarData.festivals && (
                    <div className="transform rotate-[21deg] flex items-center justify-center">
                      <div className="border-2 p-0.5 rounded-sm flex items-center justify-center min-w-[32px] min-h-[32px]" style={{ borderColor: 'var(--color-text)', color: 'var(--color-text)' }}>
                        <div className="border px-1 py-1 text-[10px] font-serif font-black leading-tight flex flex-col items-center" style={{ borderColor: 'var(--color-text)' }}>
                          {calendarData.festivals.split(' ')[0].split('').map((char, index) => (
                            <span key={index}>{char}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {calendarData.solarTerm && (
                    <div className="transform -rotate-6 flex items-center justify-center self-end -mt-2">
                      <div className="border p-0.5 rounded-sm flex items-center justify-center min-w-[28px] min-h-[28px]" style={{ borderColor: 'var(--color-text)', color: 'var(--color-text)' }}>
                        <div className="px-0.5 py-0.5 text-[8px] font-serif font-bold leading-tight flex flex-col items-center">
                          {calendarData.solarTerm.split('').map((char, index) => (
                            <span key={index}>{char}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Editorial/Crimson: Vertical Label */}
              {(theme === 'editorial' || theme === 'crimson') && (
                <div 
                  className="absolute flex items-start gap-1 z-10"
                  style={{ top: '-12px', right: '2px' }}
                >
                  {calendarData.festivals && (
                    <div className="bg-[var(--color-text)]/10 border border-[var(--color-text)]/20 text-[var(--color-text)] py-1 px-1 flex flex-col items-center gap-0.5">
                      <div className="w-[1px] h-1.5 bg-current opacity-30 mb-0.5" />
                      <div className="text-[9px] font-bold [writing-mode:vertical-rl] tracking-[1px] py-1">
                        {calendarData.festivals.split(' ')[0]}
                      </div>
                      <div className="w-[1px] h-1.5 bg-current opacity-30 mt-0.5" />
                    </div>
                  )}
                  {calendarData.solarTerm && (
                    <div className={`bg-[var(--color-text)]/10 text-[var(--color-text)] py-1 px-0.5 flex flex-col items-center gap-0.5 ${
                      theme === 'crimson' ? 'border border-[var(--color-text)]/20 rounded-full px-1' : 
                      theme === 'editorial' ? 'border-b border-[var(--color-text)]/20' : 
                      'border border-[var(--color-text)]/20'
                    }`}>
                      <div className="text-[10px] font-bold [writing-mode:vertical-rl] tracking-[1px] py-1">
                        {calendarData.solarTerm}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Poster: Top Left below Month/Year */}
              {theme === 'poster' && (
                <div className="absolute left-1 top-10 flex flex-col items-start gap-1 z-10">
                  {calendarData.festivals && (
                    <div className="border border-[var(--color-text)] text-[var(--color-text)] px-2 py-0.5 flex items-center gap-2">
                      <div className="text-[9px] font-black uppercase tracking-[2px]">
                        {calendarData.festivals.split(' ')[0]}
                      </div>
                    </div>
                  )}
                  {calendarData.solarTerm && (
                    <div className="border border-[var(--color-text)] text-[var(--color-text)] px-2 py-0.5 flex items-center gap-2">
                      <div className="text-[8px] font-bold uppercase tracking-[1px]">
                        {calendarData.solarTerm}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Technical: New Refined Badge - Standard position */}
              {(theme === 'technical') && (
                <div className="absolute top-0 right-1 flex flex-col items-end gap-1 z-10">
                  {calendarData.festivals && (
                    <div className="flex items-center gap-2 border border-[var(--color-text)] text-[var(--color-text)] px-3 py-1 text-[11px] font-black tracking-widest leading-none bg-[var(--color-text)]/5">
                      {calendarData.festivals.split(' ')[0]}
                      <span className="opacity-50 text-[8px]">●</span>
                    </div>
                  )}
                  {calendarData.solarTerm && (
                    <div className="flex items-center gap-2 border border-[var(--color-text)] text-[var(--color-text)] px-2 py-0.5 text-[9px] font-bold tracking-wider leading-none">
                      {calendarData.solarTerm}
                      <span className="opacity-30 text-[6px]">○</span>
                    </div>
                  )}
                </div>
              )}
              {/* 5. Vanguard: Bold Overlapping Text */}
              {theme === 'vanguard' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <span className="text-[180px] font-black tracking-tighter break-all leading-none text-center text-[var(--color-text)]">
                    {calendarData.festivals ? calendarData.festivals.split(' ')[0] : (calendarData.solarTerm || calendarData.lunarDayGanzhi)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 sidebar sidebar-left ${theme === 'classic' || theme === 'traditional' ? '-mt-[15px]' : ''}`} 
            id="side-left"
            style={theme === 'vanguard' ? { color: 'var(--color-text)', opacity: 1 } : {}}
          >
            {calendarData.lunarDate}
          </div>

          <h1 
            className={`date-number date-style-${dayStyle} ${theme === 'vanguard' ? 'main-date' : ''}`} 
            id="center-date"
            data-date={calendarData.day}
            style={{ 
              fontFamily: currentFontValue, 
              '--date-font-size': dayFontSize ? `${dayFontSize}px` : (theme === 'vanguard' ? '360px' : undefined),
              '--card-border-color': customBorderColor || (scheme === 'original' ? 'rgba(0,0,0,0.1)' : undefined),
              '--card-border-width': borderWidth !== undefined ? `${borderWidth}px` : undefined
            } as React.CSSProperties}
          >
            {calendarData.day}
          </h1>

          {/* 5. Minimal & New Below-Date Styles: Festivals as subtext under the day */}
          {(calendarData.festivals || calendarData.solarTerm) && (
            <>
              {(theme === 'zen' || theme === 'minimal' || theme === 'journal') && (
                <div className="absolute bottom-6 right-0 left-0 text-center animate-in fade-in duration-700 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold tracking-[6px] uppercase opacity-40 border-t border-current/20 pt-1">
                    {[calendarData.festivals.split(' ')[0], calendarData.solarTerm].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}

              {(theme === 'bold' || theme === 'dark' || theme === 'warm') && (
                <div className="absolute bottom-2 md:bottom-4 right-0 left-0 text-center animate-in slide-in-from-top-2 duration-500 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-3">
                    {calendarData.festivals && (
                      <span 
                        className={`text-[10px] font-black tracking-[4px] uppercase ${theme === 'bold' ? 'text-[var(--color-text)]' : 'opacity-60'}`}
                        style={theme === 'vanguard' ? { color: 'var(--color-text)', opacity: 1 } : {}}
                      >
                        {calendarData.festivals.split(' ')[0]}
                      </span>
                    )}
                    {calendarData.solarTerm && (
                      <span className={`text-[9px] font-bold tracking-[2px] uppercase opacity-40 border-l border-current/30 pl-3`}>
                        {calendarData.solarTerm}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 sidebar sidebar-right ${theme === 'classic' || theme === 'traditional' ? '-mt-[15px]' : ''}`} 
            id="side-right"
            style={theme === 'vanguard' ? { color: 'var(--color-text)', opacity: 1 } : {}}
          >
            {calendarData.lunarGanzhi}
          </div>
        </section>
        )}

        {theme === 'neo-traditional' && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-2 md:-mt-6">
            <div 
              className={`date-number date-style-${dayStyle === 'outline' ? 'hollow' : dayStyle === 'neumorphic' ? 'standard' : dayStyle} font-serif font-black leading-none tracking-tighter capsule-scale-date`}
              data-date={calendarData.day.toString().padStart(2, '0')}
              style={{ 
                fontFamily: dateFont === 'space' ? '"Abril Fatface", serif' : currentFontValue,
                color: primaryColor,
                fontSize: dayFontSize ? `${dayFontSize}px` : 'clamp(80px, 32cqw, 200px)',
                '--date-font-size': dayFontSize ? `${dayFontSize}px` : 'clamp(80px, 32cqw, 200px)'
              } as React.CSSProperties}
            >
              {calendarData.day.toString().padStart(2, '0')}
            </div>
            <div className="text-[1.4rem] md:text-[1.8rem] font-medium opacity-80 mt-1 md:mt-2 mb-2 md:mb-4 capsule-text-sm" style={{ color: 'var(--color-text)' }}>
              {calendarData.weekdayCn}
            </div>
            
            {/* Quote placed under weekday for this theme */}
            <div className="max-w-[240px] md:max-w-[280px] text-center px-4 capsule-quote-area">
              <div 
                className="text-[0.9rem] md:text-[1.1rem] leading-relaxed text-[var(--color-text)] opacity-80 mb-2 italic capsule-quote-text"
                style={{ 
                  fontFamily: currentQuoteFontValue,
                  fontSize: quoteFontSize ? `${quoteFontSize}px` : undefined
                }}
              >
                「{calendarData.quote.text}」
              </div>
              <div className="text-[10px] md:text-[12px] opacity-60 font-serif tracking-widest capsule-hide" style={{ fontSize: quoteFontSize ? `${Math.max(10, quoteFontSize * 0.6)}px` : undefined }}>
                —— {calendarData.quote.author}
              </div>
            </div>
          </div>
        )}

        {theme !== 'neo-traditional' && (
          <section className="bottom-section" id="bottom-quote">
          <div 
            className={`quote-text mb-5 ${theme === 'classic' ? 'text-center max-w-[360px] mx-auto' : ''}`} 
            id="quote-text"
            style={{ fontFamily: currentQuoteFontValue, fontSize: quoteFontSize ? `${quoteFontSize}px` : undefined }}
          >
            {calendarData.quote.text}
          </div>
          <div 
            className={`quote-meta text-xs italic ${theme === 'classic' ? 'text-center' : 'text-right'}`} 
            id="quote-meta"
            style={theme === 'vanguard' ? { color: 'var(--color-text)', opacity: 1 } : {}}
          >
            —— {calendarData.quote.author} {calendarData.quote.book ? `《${calendarData.quote.book}》` : ''}
          </div>
        </section>
        )}

        {theme !== 'neo-traditional' && (
          <footer className="mt-auto pt-3 md:pt-5 flex justify-between items-center border-t border-current/40 relative" id="footer-main">
          <div className="text-xs font-black tracking-[3px] uppercase" id="brand">
            {footerText}
          </div>

          {/* 手撕按钮 - 挪到中间 */}
          {isManualMode && (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const cur = new Date(currentDate);
            cur.setHours(0, 0, 0, 0);
            const diff = Math.ceil((today.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
            
            if (cur >= today) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-3 md:bottom-5 z-20 -translate-y-[2px]"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTear}
                  disabled={isTearing}
                  className="flex items-center gap-3 pl-6 pr-2 py-2 rounded-full shadow-lg transition-all group relative border border-white/20 backdrop-blur-md"
                  style={{ 
                    backgroundColor: tearButtonStyle.baseColor,
                    color: tearButtonStyle.textColor,
                    boxShadow: `0 8px 30px ${tearButtonStyle.shadowColor}`
                  }}
                  title="撕掉当前页，开启新的一天"
                >
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[15px] md:text-[16px] font-black uppercase mb-0.5">撕掉过去</span>
                    <span className="text-[10px] font-black opacity-80 uppercase tracking-tight">下拽或点击</span>
                  </div>

                  <div 
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0"
                    style={{ backgroundColor: tearButtonStyle.badgeBgColor }}
                  >
                    <span 
                      className="text-2xl md:text-3xl font-black leading-none"
                      style={{ color: (theme === 'technical' || theme === 'vanguard') ? tearButtonStyle.baseColor : tearButtonStyle.badgeTextColor }}
                    >{diff}</span>
                  </div>

                  {/* Highlight/Pulse */}
                  <div className="absolute -top-1 -right-1">
                    <div 
                      className="w-3 h-3 rounded-full animate-ping opacity-75" 
                      style={{ backgroundColor: tearButtonStyle.badgeBgColor }}
                    />
                    <div 
                      className="absolute inset-0 w-3 h-3 rounded-full border border-black/10 shadow-sm" 
                      style={{ backgroundColor: tearButtonStyle.badgeBgColor }}
                    />
                  </div>
                </motion.button>
              </motion.div>
            );
          })()}

          <div className="text-right flex flex-col items-end gap-0.5 footer-day-year" id="footer-day-year">
            <div 
              className={`text-[11px] ${theme === 'vanguard' ? 'font-bold' : 'text-[var(--color-muted)]'}`}
              style={theme === 'vanguard' ? { color: 'var(--color-text)', opacity: 1 } : {}}
            >
              {calendarData.year}年
            </div>
            <div className="text-xs font-bold">{calendarData.weekday}</div>
          </div>
        </footer>
        )}

        {/* Neo-Traditional Footer */}
        {theme === 'neo-traditional' && (
          <footer className="mt-auto px-1 pb-2 flex flex-col gap-0 relative" id="neo-footer">
            {/* 手撕按钮 */}
            {isManualMode && (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const cur = new Date(currentDate);
              cur.setHours(0, 0, 0, 0);
              const diff = Math.ceil((today.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
              
              if (cur >= today) return null;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-[100px] z-20"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTear}
                    disabled={isTearing}
                    className="flex items-center gap-3 pl-6 pr-2 py-2 rounded-full shadow-lg transition-all group relative border border-white/20 backdrop-blur-md"
                    style={{ 
                      backgroundColor: tearButtonStyle.baseColor,
                      color: tearButtonStyle.textColor,
                      boxShadow: `0 8px 30px ${tearButtonStyle.shadowColor}`
                    }}
                    title="撕掉当前页，开启新的一天"
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[15px] md:text-[16px] font-black uppercase mb-0.5">撕掉过去</span>
                      <span className="text-[10px] font-black opacity-80 uppercase tracking-tight">下拽或点击</span>
                    </div>

                    <div 
                      className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0"
                      style={{ backgroundColor: tearButtonStyle.badgeBgColor }}
                    >
                      <span 
                        className="text-2xl md:text-3xl font-black leading-none"
                        style={{ color: (theme === 'technical' || theme === 'vanguard') ? tearButtonStyle.baseColor : tearButtonStyle.badgeTextColor }}
                      >{diff}</span>
                    </div>

                    {/* Highlight/Pulse */}
                    <div className="absolute -top-1 -right-1">
                      <div 
                        className="w-3 h-3 rounded-full animate-ping opacity-75" 
                        style={{ backgroundColor: tearButtonStyle.badgeBgColor }}
                      />
                      <div 
                        className="absolute inset-0 w-3 h-3 rounded-full border border-black/10 shadow-sm" 
                        style={{ backgroundColor: tearButtonStyle.badgeBgColor }}
                      />
                    </div>
                  </motion.button>
                </motion.div>
              );
            })()}
            <div className="w-full flex items-center gap-1 mb-5 opacity-40 text-[var(--color-text)]">
              <div className="flex-1 border-t border-dotted border-current" />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              {/* Left Badge: Lunar Month */}
              <div 
                className="py-2 md:py-3 px-2 md:px-3 flex flex-col items-center justify-center rounded-sm shadow-sm transition-colors duration-500 min-w-[34px] md:min-w-[44px] shrink-0"
                style={{ 
                  backgroundColor: 'var(--color-text)', 
                  color: (hexToBrightness(schemeStyles['--color-text'] || '#000000') < 160 ? '#FFFFFF' : 'rgba(0,0,0,0.8)') 
                }}
              >
                <span className="text-[0.9rem] md:text-[1.2rem] font-serif font-black [writing-mode:vertical-rl] leading-none tracking-[2px] md:tracking-[4px]">
                  {calendarData.lunarMonthName}月
                </span>
              </div>
              
              {/* Middle Section: Fortune & Details */}
              <div className="flex-1 flex flex-col items-center gap-1 md:gap-2">
                <div className="text-[0.85rem] md:text-[0.95rem] font-medium tracking-[1px] opacity-70 text-[var(--color-text)] whitespace-nowrap transition-colors duration-500">
                  {calendarData.lunarGanzhi} {calendarData.lunarShengxiao}年
                </div>
                <div className="flex flex-col gap-0.5 md:gap-1 items-center capsule-hide">
                  {showSuitable && (
                    <div 
                      className="font-bold text-[var(--color-text)] flex items-center gap-2 md:gap-3 transition-colors duration-500"
                      style={{ fontSize: adviceFontSize ? `${adviceFontSize}px` : 'clamp(0.9rem, 2.5vw, 1.1rem)' }}
                    >
                      <span className="opacity-40 font-normal">宜</span>
                      <div className="flex gap-1.5 md:gap-2">
                        {calendarData.dayYi.slice(0, 4).map((y: string, idx: number) => (
                          <span key={idx} className="whitespace-nowrap">{y}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {showAvoid && (
                    <div 
                      className="font-bold text-[var(--color-text)] flex items-center gap-2 md:gap-3 transition-colors duration-500"
                      style={{ fontSize: adviceFontSize ? `${adviceFontSize}px` : 'clamp(0.9rem, 2.5vw, 1.1rem)' }}
                    >
                      <span className="opacity-40 font-normal">忌</span>
                      <div className="flex gap-1.5 md:gap-2">
                        {calendarData.dayJi.slice(0, 4).map((j: string, idx: number) => (
                          <span key={idx} className="whitespace-nowrap">{j}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div 
                  className="mt-1 pt-2 border-t border-dotted w-full flex justify-center text-[0.7rem] font-black tracking-[4px] uppercase opacity-70 text-[var(--color-text)] transition-colors duration-500 transform translate-y-[10px]"
                  style={{ borderTopColor: 'var(--color-text)' }}
                >
                  {footerText}
                </div>
              </div>
              
              {/* Right Box: Lunar Day */}
              <div 
                className="py-2 md:py-3 px-2 md:px-3 flex flex-col items-center justify-center rounded-sm border-2 transition-all duration-500 min-w-[34px] md:min-w-[44px] shrink-0"
                style={{ borderColor: 'var(--color-text)', color: 'var(--color-text)' }}
              >
                <span className="text-[0.9rem] md:text-[1.2rem] font-serif font-black [writing-mode:vertical-rl] leading-none tracking-[2px] md:tracking-[4px]">
                  {calendarData.lunarDayName}
                </span>
              </div>
            </div>
          </footer>
        )}
        </motion.div>
      </AnimatePresence>

        <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03] z-[30] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        {cardTexture === 'grain' && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-multiply z-[30]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        )}
        {cardTexture === 'linen' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-[30]">
            <div className="absolute -inset-[50px] opacity-[0.06]" style={{ 
              background: `
                repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 60% 60%/3000px 3000px,
                repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 40% 40%/4000px 3000px
              `,
              backgroundBlendMode: 'difference',
              filter: 'blur(1px) contrast(120) brightness(110)',
            }} />
          </div>
        )}
        {cardTexture === 'recycled' && (
          <>
            <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-100 z-[30]" style={{ 
              backgroundImage: `
                radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                repeating-linear-gradient(
                  0deg,
                  rgba(0,0,0,0.03),
                  rgba(0,0,0,0.03) 1px,
                  transparent 1px,
                  transparent 3px
                )
              `,
              backgroundSize: '3px 3px, 5px 5px, auto'
            }} />
            <div className="absolute inset-0 pointer-events-none opacity-100" style={{ 
              background: 'radial-gradient(ellipse at center, transparent 70%, rgba(200,180,120,0.15))' 
            }} />
          </>
        )}

        {/* Shadow Overlay */}
        {isShadowOverlayEnabled && (
          <div 
            className="absolute inset-0 z-40 pointer-events-none overflow-hidden" 
            style={{ borderRadius: 'inherit' }}
          >
            <img 
              src={shadowOverlayUrl} 
              alt="shadow-overlay" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover max-w-none"
              style={{ 
                opacity: shadowOpacity, 
                filter: shadowBlur > 0 ? `blur(${shadowBlur}px)` : 'none',
                width: `calc(100% + ${shadowBlur * 3}px)`,
                height: `calc(100% + ${shadowBlur * 3}px)`,
              }}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </motion.main>

      {/* Global Download Progress Overlay (Circular Design) */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              backgroundColor: ["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.4)"],
              backdropFilter: ["blur(20px)", "blur(12px)", "blur(4px)"]
            }}
            exit={{ opacity: 0 }}
            transition={{
              backgroundColor: { duration: 12, times: [0, 0.1, 1], ease: "linear" },
              backdropFilter: { duration: 12, times: [0, 0.1, 1], ease: "linear" },
              opacity: { duration: 0.3 }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden download-overlay"
          >
            <div className="relative flex items-center justify-center">
              {/* Circular Progress Path (Background) */}
              <svg className="absolute w-[260px] h-[260px] rotate-[-90deg]">
                <circle
                  cx="130"
                  cy="130"
                  r="128"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                {/* Animated Progress Path */}
                <motion.circle
                  cx="130"
                  cy="130"
                  r="128"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 0.75, 0.99] }}
                  transition={{ 
                    duration: 12, 
                    times: [0, 0.2, 1],
                    ease: "linear" 
                  }}
                  style={{
                    filter: `drop-shadow(0 0 8px ${primaryColor})`
                  }}
                />
              </svg>

              {/* Main Circular Window */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-[240px] h-[240px] bg-white/10 backdrop-blur-2xl rounded-full shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-4 border border-white/20 relative overflow-hidden"
              >
                {/* Inner decorative light */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-transparent"
                  style={{ 
                    backgroundImage: `linear-gradient(to top right, ${primaryColor}20, transparent)` 
                  }}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      backgroundColor: primaryColor,
                      boxShadow: `0 10px 15px -3px ${primaryColor}40`
                    }}
                  >
                    <Download size={20} className="text-white" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-[14px] font-bold text-white tracking-widest uppercase">正在高清渲染</h3>
                    <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                      正在合成视网膜级画面<br/>请保持页面开启
                    </p>
                  </div>

                  {/* Pulse active indicator */}
                  <div className="flex gap-1.5 items-center justify-center pt-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Preference Switcher */}
      <motion.div 
        className="fixed right-0 top-1/2 -translate-y-1/2 flex items-center z-50 group"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => {
          setIsSidebarHovered(false);
          // If the settings panel is not open, we can close the date picker when mouse leaves the sidebar area
          if (!isSwitcherOpen && isDatePickerOpen) {
            setIsDatePickerOpen(false);
          }
        }}
      >
        <motion.div 
          ref={actionButtonsRef}
          variants={{
            hidden: { x: '100%', opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          initial="hidden"
          animate={(isSidebarHovered || isSwitcherOpen || isDatePickerOpen) ? 'visible' : 'hidden'}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="flex flex-col items-end gap-4 p-4 pr-0"
        >
            <motion.button
            ref={dateTriggerRef}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsDatePickerOpen(!isDatePickerOpen);
              if (isSwitcherOpen) setIsSwitcherOpen(false);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all ${isDatePickerOpen ? tabActiveClass : btnBaseClass}`}
            title="选择日期"
          >
            <Calendar size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all ${btnBaseClass} ${
              isDownloading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="下载图片"
          >
            {isDownloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Download size={18} />
              </motion.div>
            ) : (
              <Download size={20} />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ rotate: 180, scale: 0.95 }}
            onClick={handleRandomStyle}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all ${btnBaseClass}`}
            title="生成随机样式组合"
          >
            <RefreshCw size={20} />
          </motion.button>

          <div className="relative" ref={triggerRef}>
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ${mainBtnClass}`}
            >
              {isSwitcherOpen ? <X size={20} /> : <Palette size={20} />}
            </button>
          </div>


          {/* Date Picker Modal */}
          <AnimatePresence>
            {isDatePickerOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={`date-picker-modal fixed right-[60px] top-1/2 -translate-y-1/2 backdrop-blur-md p-4 rounded-[2.5rem] border shadow-2xl flex flex-col gap-4 w-[290px] transition-colors duration-500 ${menuClass} z-[60]`}
              >
                {/* Header: Month & Year selection */}
                <div className="flex items-center justify-between px-1">
                  <button 
                    onClick={() => {
                      const prev = new Date(currentDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setCurrentDate(prev);
                    }}
                    className={`p-2 rounded-xl transition-all ${isDarkBg ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-0.5">
                      {currentDate.getFullYear()}年
                    </span>
                    <span className="text-base font-bold">
                      {currentDate.getMonth() + 1}月
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      const next = new Date(currentDate);
                      next.setMonth(next.getMonth() + 1);
                      setCurrentDate(next);
                    }}
                    className={`p-2 rounded-xl transition-all ${isDarkBg ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day Grid Header */}
                <div className="grid grid-cols-7 gap-1 px-1">
                  {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <div key={d} className="text-[10px] font-bold opacity-30 text-center py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day Grid Content */}
                <div className="grid grid-cols-7 gap-1 px-1">
                  {(() => {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    
                    const days = [];
                    // Padding for first day
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`pad-${i}`} className="h-8" />);
                    }
                    
                    // Fill days
                    for (let d = 1; d <= daysInMonth; d++) {
                      const isSelected = currentDate.getDate() === d;
                      days.push(
                        <motion.button
                          key={d}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(d);
                            setCurrentDate(newDate);
                            setIsDatePickerOpen(false);
                          }}
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                            isSelected 
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                              : isDarkBg ? 'hover:bg-white/10' : 'hover:bg-black/5'
                          }`}
                        >
                          {d}
                        </motion.button>
                      );
                    }
                    return days;
                  })()}
                </div>

                {/* Year Selection (Fast jump) */}
                <div className="mt-2 pt-4 border-t border-black/5 px-1">
                  <div className="flex items-center gap-2 mb-3">
                    <button 
                      onClick={() => {
                        const next = new Date(currentDate);
                        next.setFullYear(next.getFullYear() - 1);
                        setCurrentDate(next);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${isDarkBg ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                      title="上一年"
                    >
                      <ChevronLeft size={12} />
                    </button>

                    <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-center">
                      {(() => {
                        const selectedYear = currentDate.getFullYear();
                        const years = [];
                        // Show 3 years before and 3 years after the currently selected year
                        for (let y = selectedYear - 3; y <= selectedYear + 3; y++) {
                          years.push(
                            <button
                              key={y}
                              onClick={() => {
                                const newDate = new Date(currentDate);
                                newDate.setFullYear(y);
                                setCurrentDate(newDate);
                              }}
                              className={`px-3 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all ${
                                selectedYear === y 
                                  ? 'bg-black text-white px-4' 
                                  : isDarkBg ? 'bg-white/10 opacity-60 hover:opacity-100' : 'bg-black/5 opacity-40 hover:opacity-100'
                              }`}
                            >
                              {y}
                            </button>
                          );
                        }
                        return years;
                      })()}
                    </div>

                    <button 
                      onClick={() => {
                        const next = new Date(currentDate);
                        next.setFullYear(next.getFullYear() + 1);
                        setCurrentDate(next);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${isDarkBg ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                      title="下一年"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentDate(new Date());
                      setIsDatePickerOpen(false);
                    }}
                    className="w-full py-2 rounded-xl text-[10px] font-bold opacity-60 hover:opacity-100 transition-all border border-dashed border-black/20"
                  >
                    返回今天
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSwitcherOpen && (
                <motion.div 
                  ref={panelRef}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  className={`fixed right-[60px] top-1/2 -translate-y-1/2 backdrop-blur-md p-4 rounded-[2.5rem] border shadow-2xl flex flex-col gap-4 w-[290px] transition-colors duration-500 ${menuClass}`}
                >
                  {/* Tabs */}
                  <div className={`grid grid-cols-4 rounded-[1.5rem] p-1.5 gap-1 ${isDarkBg ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <button 
                      onClick={() => setActiveTab('theme')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'theme' ? tabActiveClass : 'opacity-40'}`}
                    >
                      风格
                    </button>
                    <button 
                      onClick={() => setActiveTab('scheme')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'scheme' ? tabActiveClass : 'opacity-40'}`}
                    >
                      配色
                    </button>
                    <button 
                      onClick={() => setActiveTab('background')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'background' ? tabActiveClass : 'opacity-40'}`}
                    >
                      背景
                    </button>
                    <button 
                      onClick={() => setActiveTab('card')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'card' ? tabActiveClass : 'opacity-40'}`}
                    >
                      卡片
                    </button>
                    <button 
                      onClick={() => setActiveTab('border')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'border' ? tabActiveClass : 'opacity-40'}`}
                    >
                      边框
                    </button>
                    <button 
                      onClick={() => setActiveTab('shadow')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'shadow' ? tabActiveClass : 'opacity-40'}`}
                    >
                      光影
                    </button>
                    <button 
                      onClick={() => setActiveTab('font')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'font' ? tabActiveClass : 'opacity-40'}`}
                    >
                      日期
                    </button>
                    <button 
                      onClick={() => setActiveTab('quote')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'quote' ? tabActiveClass : 'opacity-40'}`}
                    >
                      金句
                    </button>
                    <button 
                      onClick={() => setActiveTab('calendar')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'calendar' ? tabActiveClass : 'opacity-40'}`}
                    >
                      日历
                    </button>
                    <button 
                      onClick={() => setActiveTab('visibility')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'visibility' ? tabActiveClass : 'opacity-40'}`}
                    >
                      显隐
                    </button>
                    <button 
                      onClick={() => setActiveTab('personal')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'personal' ? tabActiveClass : 'opacity-40'}`}
                    >
                      个性
                    </button>
                    <button 
                      onClick={() => setActiveTab('system')}
                      className={`text-[11px] py-1.5 rounded-xl transition-all ${activeTab === 'system' ? tabActiveClass : 'opacity-40'}`}
                    >
                      设置
                    </button>
                  </div>

                                    {/* Theme List */}
                  {activeTab === 'theme' && (
                    <div className="flex flex-col gap-5 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-2 gap-2 max-h-[520px] overflow-y-auto pr-1 pb-4">
                        {themes.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleThemeChange(t.id)}
                              className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl text-xs transition-all border ${
                                theme === t.id 
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' 
                                  : `${isDarkBg ? 'bg-white/10' : 'bg-black/5'} border-transparent ${isDarkBg ? 'hover:bg-white/20' : 'hover:bg-black/10'}`
                              }`}
                            >
                            <span className="text-sm truncate w-full text-left font-medium">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheme List */}
                  {activeTab === 'scheme' && (
                    <div className="flex flex-col gap-5 pt-3 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-6 gap-3 gap-y-5 px-1">
                          {colorSchemes.map((s) => {
                            const currentPalette = isThemeDark ? s.dark : s.light;
                            const actualColor = s.id === 'original' 
                              ? getThemeDefaultColor(theme) 
                              : (currentPalette?.['--color-primary'] || currentPalette?.['--border-accent'] || '#CCCCCC');
                            
                            return (
                              <button
                                key={s.id}
                                onClick={() => handleSchemeChange(s.id)}
                                className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center mx-auto ${
                                  scheme === s.id ? 'ring-2 ring-rose-600 border-rose-600' : `hover:scale-110 ${isDarkBg ? 'border-white/10' : 'border-black/5'} opacity-80 hover:opacity-100`
                                }`}
                                style={{ backgroundColor: actualColor }}
                                title={s.name}
                              />
                            );
                          })}
                      </div>

                      {/* Custom Color Area */}
                      <div className={`mt-2 p-4 rounded-2xl border ${isDarkBg ? 'bg-white/5 border-white/10' : 'bg-black/5 border-transparent'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">自定义配色方案</span>
                          <button 
                            onClick={toggleColorLink}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                              isColorLinked 
                                ? 'bg-rose-600/10 text-rose-600' 
                                : isDarkBg ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                            }`}
                            title={isColorLinked ? "当前：联动调整" : "当前：独立调整"}
                          >
                            {isColorLinked ? <Link className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-bold">{isColorLinked ? '联动中' : '已断开'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-6 justify-center">
                          <div className="flex flex-col items-center gap-2">
                             <ColorPicker 
                              color={customPrimaryColor || '#3B82F6'} 
                              onChange={(val) => handleCustomPrimaryChange(val)}
                              title="月份 & 日期"
                              isDarkBg={isDarkBg}
                              triggerShape="pill"
                            />
                            <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">月份与日期</span>
                          </div>

                          {!isColorLinked && (
                            <>
                              <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                              <div className="flex flex-col items-center gap-2">
                                <ColorPicker 
                                  color={customMutedColor || customPrimaryColor || '#3B82F6'} 
                                  onChange={(val) => handleCustomMutedChange(val)}
                                  title="引言 & 节日"
                                  isDarkBg={isDarkBg}
                                  triggerShape="pill"
                                />
                                <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">金句与节日</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Background List */}
                  {activeTab === 'background' && (
                    <div className="flex flex-col gap-4 pt-3 pb-4">
                      <div className="grid grid-cols-6 gap-3 gap-y-5 px-1">
                        {backgrounds.map((b) => {
                          const actualBgColor = b.id === 'default' ? getThemeDefaultBgColor(theme) : b.color;
                          return (
                            <button
                              key={b.id}
                              onClick={() => handleBgChange(b.id)}
                              className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center mx-auto ${
                                bgId === b.id ? 'ring-2 ring-rose-600 border-rose-600' : 'hover:scale-110 border-black/5 opacity-80 hover:opacity-100'
                              } ${b.preview}`}
                              title={b.name}
                              style={{ backgroundColor: actualBgColor === 'transparent' ? 'transparent' : actualBgColor }}
                            />
                          );
                        })}
                        <ColorPicker 
                          color={customAppBgColor || '#F5F5F5'} 
                          onChange={(val) => handleCustomAppBgChange(val)}
                          title="自定义背景"
                          isDarkBg={isDarkBg}
                          triggerShape="pill"
                        />
                      </div>
                    </div>
                  )}
{/* Card Background Tab */}
                   {activeTab === 'card' && (
                     <div className="flex flex-col gap-4 pt-3 pb-4">
                       {/* 纸张纹理选择 */}
                       <div className="">
                         <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                           <Layers className="w-3 h-3" />
                           纸张纹理
                         </div>
                         <div className="grid grid-cols-4 gap-2">
                           {[
                             { id: 'none', label: '无', class: 'bg-white' },
                             { id: 'grain', label: '细砂', class: 'bg-gray-100' },
                             { id: 'linen', label: '亚麻', class: 'bg-gray-200' },
                             { id: 'recycled', label: '再生', class: 'bg-[#F4F1EA]' }
                           ].map(t => (
                             <button
                               key={t.id}
                               onClick={() => setCardTexture(t.id)}
                               className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                                 cardTexture === t.id 
                                   ? 'bg-rose-600 border-rose-600 text-white' 
                                   : `${isDarkBg ? 'bg-white/10' : 'bg-black/5'} border-transparent ${isDarkBg ? 'hover:bg-white/20' : 'hover:bg-black/10'}`
                               }`}
                             >
                               <div className={`w-full h-5 rounded-lg shadow-inner ${t.class} relative overflow-hidden`}>
                                 {t.id === 'grain' && <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />}
                                 {t.id === 'linen' && (
                                   <div className="absolute inset-0 opacity-[0.07] overflow-hidden">
                                     <div className="absolute -inset-[20px]" style={{ 
                                       background: `
                                         repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 60% 60%/1000px 1000px,
                                         repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 40% 40%/1000px 1000px
                                       `,
                                       backgroundBlendMode: 'difference',
                                       filter: 'blur(0.5px) contrast(100) brightness(110)',
                                       mixBlendMode: 'lighten'
                                     }} />
                                   </div>
                                 )}
                                 {t.id === 'recycled' && (
                                   <div className="absolute inset-0 opacity-40">
                                     <div className="absolute inset-0" style={{ 
                                       backgroundImage: `radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)`,
                                       backgroundSize: '2px 2px, 3px 3px'
                                     }} />
                                     <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(200,180,120,0.4))' }} />
                                   </div>
                                 )}
                               </div>
                               <span className="text-[9px] font-bold uppercase tracking-tight">{t.label}</span>
                             </button>
                           ))}
                         </div>
                       </div>

                       <div className="px-1 mt-2">
                         <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider mb-2">背景色</div>
                         <div className="grid grid-cols-6 gap-3 gap-y-5 px-1 pt-3">
                           {cardBgs.map((bg) => (
                             <button
                               key={bg.id}
                               onClick={() => handleCardBgChange(bg.color)}
                               className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center mx-auto ${
                                 cardBg === bg.color && !isCustomCardBg ? 'ring-2 ring-rose-600 border-rose-600' : `hover:scale-110 ${isDarkBg ? 'border-white/10' : 'border-black/5'} opacity-80 hover:opacity-100`
                               }`}
                               style={{ backgroundColor: bg.color }}
                               title={bg.label}
                             />
                           ))}
                           <ColorPicker 
                             color={customCardBgColor || '#FFFFFF'} 
                             onChange={(val) => handleCustomCardBgChange(val)}
                             title="自定义卡片背景"
                             isDarkBg={isDarkBg}
                             triggerShape="pill"
                           />
                         </div>
                       </div>
                        
                        {/* 卡片效果 */}
                        <div className="px-1 mt-4 pt-4 border-t border-black/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">卡片阴影</span>
                            <button 
                              onClick={() => handleShadowChange(!hasShadow)}
                              className={`w-8 h-4 rounded-full transition-colors relative ${hasShadow ? "bg-rose-600" : "bg-gray-400"}`}
                            >
                              <motion.div 
                                animate={{ x: hasShadow ? 18 : 2 }}
                                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                              />
                            </button>
                          </div>
                        </div>
                     </div>
                   )}

                   {/* Border Tab */}
                   {activeTab === 'border' && (
                     <div className="flex flex-col gap-4 pt-3 pb-4">
                        <div className="grid grid-cols-6 gap-3 gap-y-5 px-1">
                          {['#E5E7EB', '#9CA3AF', '#4B5563', '#1F2937', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF'].map(c => (
                            <button
                              key={c}
                              onClick={() => handleBorderColorChange(c)}
                              className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center mx-auto ${
                                borderColor === c && !isCustomBorder ? 'ring-2 ring-rose-600 border-rose-600' : 'hover:scale-110 border-black/5 opacity-80 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <ColorPicker 
                            color={customBorderColor || '#000000'} 
                            onChange={(val) => handleBorderColorChange(val, true)}
                            title="自定义边框颜色"
                            isDarkBg={isDarkBg}
                            triggerShape="pill"
                          />
                        </div>

                        <div className="space-y-4 pt-4 px-1">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">圆角半径 ({borderRadius !== undefined ? `${borderRadius}px` : '主题默认'})</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="60" 
                                value={borderRadius !== undefined ? borderRadius : 4} 
                                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-rose-600"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">边框粗细 ({borderWidth !== undefined ? `${borderWidth}px` : '主题默认'})</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                value={borderWidth !== undefined ? borderWidth : 1} 
                                onChange={(e) => handleBorderWidthChange(parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-rose-600"
                              />
                            </div>
                          </div>
                     </div>
                   )}

                   {/* Shadow Tab */}
                   {activeTab === 'shadow' && (
                     <div className="flex flex-col gap-4 pt-3 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${isDarkBg ? 'bg-white/5 border-white/5' : 'bg-black/5 border-transparent'}`}>
                         <div className="flex items-center gap-2">
                           <Layers className={`w-3.5 h-3.5 ${isShadowOverlayEnabled ? 'text-rose-600' : 'opacity-40'}`} />
                           <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">开启光影效果</span>
                         </div>
                         <button 
                           onClick={() => handleShadowOverlayToggle(!isShadowOverlayEnabled)}
                           className={`w-8 h-4 rounded-full relative transition-colors ${isShadowOverlayEnabled ? 'bg-rose-600' : 'bg-gray-400'}`}
                         >
                           <motion.div 
                             animate={{ x: isShadowOverlayEnabled ? 18 : 2 }}
                             className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                           />
                         </button>
                       </div>

                       <div className="space-y-3 px-1">
                         <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider mb-2">选择样式</div>
                         <div className="grid grid-cols-3 gap-2">
                           {[
                             { id: 'shadow1', url: 'https://pic1.imgdb.cn/item/69fb18da4498ed47aaabf1ef.png' },
                             { id: 'shadow2', url: 'https://pic1.imgdb.cn/item/69fb31674498ed47aaac0d59.png' },
                             { id: 'shadow3', url: 'https://pic1.imgdb.cn/item/69fb31674498ed47aaac0d5b.png' },
                             { id: 'shadow4', url: 'https://pic1.imgdb.cn/item/69fb31674498ed47aaac0d5a.png' },
                             { id: 'shadow5', url: 'https://pic1.imgdb.cn/item/69fb31674498ed47aaac0d58.png' },
                             { id: 'shadow6', url: 'https://pic1.imgdb.cn/item/69fb31664498ed47aaac0d56.png' },
                           ].map((s, idx) => (
                             <button
                               key={idx}
                               onClick={() => s.url && shadowOverlayUrl !== s.url && handleShadowUrlChange(s.url)}
                               className={`h-16 rounded-xl border-2 transition-all flex items-center justify-center relative overflow-hidden ${
                                 shadowOverlayUrl === s.url && s.url
                                   ? 'border-rose-600 shadow-md scale-105' 
                                   : `border-transparent ${isDarkBg ? 'bg-white/5' : 'bg-black/5'} opacity-80 hover:opacity-100 hover:scale-105`
                               }`}
                             >
                               {s.url ? (
                                 <img src={s.url} alt={`shadow-${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <span className="text-[10px] opacity-30 font-bold uppercase">待增加</span>
                               )}
                               {shadowOverlayUrl === s.url && s.url && (
                                 <div className="absolute top-1 right-1 bg-rose-600 rounded-full p-0.5">
                                   <Check className="w-2 h-2 text-white" />
                                 </div>
                               )}
                             </button>
                           ))}
                         </div>
                       </div>

                       <div className="space-y-4 pt-2 px-1">
                         <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">透明度 ({Math.round(shadowOpacity * 100)}%)</span>
                           </div>
                           <input 
                             type="range" 
                             min="0" 
                             max="1" 
                             step="0.01"
                             value={shadowOpacity} 
                             onChange={(e) => handleShadowOpacityChange(parseFloat(e.target.value))}
                             className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-rose-600"
                           />
                         </div>

                         <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">模糊程度 ({shadowBlur}px)</span>
                           </div>
                           <input 
                             type="range" 
                             min="0" 
                             max="20" 
                             step="1"
                             value={shadowBlur} 
                             onChange={(e) => handleShadowBlurChange(parseInt(e.target.value))}
                             className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-rose-600"
                           />
                         </div>
                       </div>
                     </div>
                   )}

                  {/* Font List */}
                  {activeTab === 'font' && (
                    <div className="flex flex-col gap-5 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Typography Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Type className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest">字体选择</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {fonts.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => handleFontChange(f.id)}
                              className={`flex flex-col items-start gap-1 py-2 px-3 rounded-2xl text-xs transition-all border ${
                                dateFont === f.id 
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' 
                                  : `${isDarkBg ? 'bg-white/10' : 'bg-black/5'} border-transparent ${isDarkBg ? 'hover:bg-white/20' : 'hover:bg-black/10'}`
                              }`}
                            >
                              <span className="text-sm truncate w-full text-left" style={{ fontFamily: f.value }}>{f.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Baseline className="w-3.5 h-3.5 opacity-50" />
                            <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest">排版尺寸</span>
                          </div>
                          <span className="text-[10px] font-bold text-rose-600">
                            {dayFontSize || (theme === 'vanguard' ? 360 : 200)}px
                          </span>
                        </div>
                        <div className={`${isDarkBg ? 'bg-white/5' : 'bg-black/5'} rounded-2xl p-3 space-y-3`}>
                          <div className="flex gap-1.5">
                            {[120, 200, 280, 360, 450].map((size) => (
                              <button
                                key={size}
                                onClick={() => handleDayFontSizeChange(size)}
                                className={`flex-1 h-9 rounded-xl text-[10px] font-bold transition-all ${
                                  dayFontSize === size || (!dayFontSize && size === (theme === 'vanguard' ? 360 : 200))
                                    ? 'bg-white text-rose-700 shadow-sm'
                                    : `${isDarkBg ? 'text-white/40 hover:text-white/80' : 'text-black/40 hover:text-black/80'}`
                                }`}
                              >
                                {size === (theme === 'vanguard' ? 360 : 200) ? '默认' : size}
                              </button>
                            ))}
                          </div>
                          <input 
                            type="range" 
                            min="80" 
                            max="500" 
                            step="10"
                            value={dayFontSize || (theme === 'vanguard' ? 360 : 200)} 
                            onChange={(e) => handleDayFontSizeChange(parseInt(e.target.value))}
                            className={`w-full h-1 ${isDarkBg ? 'bg-white/20' : 'bg-black/10'} rounded-lg appearance-none cursor-pointer accent-rose-600`}
                          />
                        </div>
                      </div>

                      {/* Style Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Layers className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest">展现样式</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'standard', name: theme === 'neo-traditional' ? '极简' : '默认' },
                            { id: 'shadow', name: '投影' },
                            { id: 'glow', name: '流光' },
                            { id: 'hollow', name: '描边' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleDayStyleChange(s.id)}
                              className={`flex items-center justify-center h-12 rounded-2xl transition-all border font-medium ${
                                dayStyle === s.id
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                                  : `${isDarkBg ? 'bg-white/10' : 'bg-black/5'} border-transparent ${isDarkBg ? 'hover:bg-white/20' : 'hover:bg-black/10'}`
                              }`}
                            >
                              <span className="text-[11px]">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quote Font List */}
                  {activeTab === 'quote' && (
                    <div className="flex flex-col gap-3 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Sync Switch */}
                      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${isDarkBg ? 'bg-white/5 border-white/5' : 'bg-black/5 border-transparent'}`}>
                        <div className="flex items-center gap-2">
                          <RefreshCw className={`w-3 h-3 ${isFontSync ? 'text-green-500' : 'opacity-40'}`} />
                          <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">全局字体同步</span>
                        </div>
                        <button 
                          onClick={toggleFontSync}
                          className={`w-8 h-4 rounded-full relative transition-colors ${isFontSync ? 'bg-green-500' : 'bg-gray-400'}`}
                        >
                          <motion.div 
                            animate={{ x: isFontSync ? 18 : 2 }}
                            className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      {/* Font Section */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <Type className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest">金句字体</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                          {quoteFonts.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => handleQuoteFontChange(f.id)}
                              className={`flex flex-col items-start gap-0.5 py-1.5 px-3 rounded-xl text-xs transition-all border ${
                                quoteFont === f.id 
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' 
                                  : `${isDarkBg ? 'bg-white/10' : 'bg-black/5'} border-transparent ${isDarkBg ? 'hover:bg-white/20' : 'hover:bg-black/10'}`
                              }`}
                            >
                              <span className="text-xs truncate w-full text-left" style={{ fontFamily: f.value }}>{f.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 px-1">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 px-1">
                            <Baseline className="w-3.5 h-3.5 opacity-50" />
                            <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest">字号调节</span>
                          </div>
                          
                          <div className={`${isDarkBg ? 'bg-white/5' : 'bg-black/5'} rounded-2xl p-2 space-y-2`}>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">金句字号</span>
                                <span className="text-[10px] font-bold text-rose-600">{quoteFontSize || 18}px</span>
                              </div>
                              <div className="flex gap-1.5">
                                {[14, 18, 24, 32, 40].map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => handleQuoteFontSizeChange(size)}
                                    className={`flex-1 h-6 rounded-lg text-[10px] font-bold transition-all ${
                                      quoteFontSize === size || (!quoteFontSize && size === 18)
                                        ? 'bg-white text-rose-700 shadow-sm'
                                        : `${isDarkBg ? 'text-white/40 hover:text-white/80' : 'text-black/40 hover:text-black/80'}`
                                    }`}
                                  >
                                    {size === 18 ? '默认' : size}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">宜忌字号</span>
                                <span className="text-[10px] font-bold text-rose-600">{adviceFontSize || 14}px</span>
                              </div>
                              <div className="flex gap-1.5">
                                {[10, 14, 18, 22, 26].map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => handleAdviceFontSizeChange(size)}
                                    className={`flex-1 h-6 rounded-lg text-[10px] font-bold transition-all ${
                                      adviceFontSize === size || (!adviceFontSize && size === 14)
                                        ? 'bg-white text-rose-700 shadow-sm'
                                        : `${isDarkBg ? 'text-white/40 hover:text-white/80' : 'text-black/40 hover:text-black/80'}`
                                    }`}
                                  >
                                    {size === 14 ? '默认' : size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calendar Tab */}
                  {activeTab === 'calendar' && (
                    <div className="flex flex-col gap-6 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-4">
                        {/* Manual Mode Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold">手撕日历模式</span>
                            <span className="text-[10px] opacity-40 leading-tight">开启后需手撕旧日期才有新日期</span>
                          </div>
                          <button 
                            onClick={() => handleManualModeToggle(!isManualMode)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative ${isManualMode ? 'bg-rose-600' : 'bg-gray-300'}`}
                          >
                            <motion.div 
                              animate={{ x: isManualMode ? 20 : 0 }}
                              className="w-4 h-4 bg-white rounded-full shadow-md"
                            />
                          </button>
                        </div>

                        {/* Tear Animation Selection */}
                        <div className="space-y-3 p-3 rounded-2xl bg-black/5">
                          <div className="flex flex-col gap-0.5 px-0.5">
                            <span className="text-[13px] font-bold">撕页动画效果</span>
                            <span className="text-[10px] opacity-40 leading-tight">选择你喜欢的撕页过渡动画</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             {[
                              { id: 'classic', label: '经典' },
                              { id: 'slide-left', label: '滑出' },
                              { id: 'float', label: '飘动' },
                              { id: 'zoom', label: '旋转' },
                            ].map((anim) => (
                              <button
                                key={anim.id}
                                onClick={() => {
                                  setTearAnimation(anim.id as TearAnimationType);
                                  localStorage.setItem('calendar-tear-animation', anim.id);
                                }}
                                className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                  tearAnimation === anim.id 
                                    ? 'bg-rose-600 text-white border-transparent shadow-sm' 
                                    : 'bg-white/50 hover:bg-white border-black/5 opacity-60 hover:opacity-100'
                                }`}
                              >
                                {anim.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visibility Tab */}
                  {activeTab === 'visibility' && (
                    <div className="flex flex-col gap-6 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold">显示“宜”</span>
                            <span className="text-[10px] opacity-40 leading-tight">控制卡片右上角“今日宜”内容显示</span>
                          </div>
                          <button 
                            onClick={() => handleToggleSuitable(!showSuitable)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative ${showSuitable ? 'bg-rose-600' : 'bg-gray-300'}`}
                          >
                            <motion.div 
                              animate={{ x: showSuitable ? 20 : 0 }}
                              className="w-4 h-4 bg-white rounded-full shadow-md"
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold">显示“忌”</span>
                            <span className="text-[10px] opacity-40 leading-tight">控制卡片右上角“今日忌”内容显示</span>
                          </div>
                          <button 
                            onClick={() => handleToggleAvoid(!showAvoid)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative ${showAvoid ? 'bg-rose-600' : 'bg-gray-300'}`}
                          >
                            <motion.div 
                              animate={{ x: showAvoid ? 20 : 0 }}
                              className="w-4 h-4 bg-white rounded-full shadow-md"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Tab (Footer Text & Custom Quote) */}
                  {activeTab === 'personal' && (
                    <div className="flex flex-col gap-6 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-4">
                        {/* Random Quote Button */}
                        <button 
                          onClick={handleRandomQuote}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                            isDarkBg 
                              ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' 
                              : 'bg-rose-50 border-rose-100 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <RefreshCw className={`w-3 h-3 ${isDarkBg ? 'text-rose-400' : 'text-rose-600'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkBg ? 'text-rose-300' : 'text-rose-600'}`}>随机切换金句</span>
                          </div>
                          <div className="px-2 py-0.5 rounded-full bg-rose-500/10 text-[9px] font-bold text-rose-500">
                            RANDOM
                          </div>
                        </button>

                        {/* Footer Text */}
                        <div className="space-y-2">
                          <div className="px-1 text-[10px] font-bold opacity-40 uppercase tracking-widest">页脚文字内容</div>
                          <input 
                            type="text"
                            value={footerText}
                            onChange={(e) => handleFooterTextChange(e.target.value)}
                            className={`w-full px-4 py-3 rounded-2xl border bg-black/5 focus:outline-none focus:ring-2 focus:ring-rose-600/30 transition-all text-sm font-bold ${isDarkBg ? 'border-white/10' : 'border-gray-100'}`}
                            placeholder="自定义页脚内容..."
                          />
                        </div>

                        {/* Custom Quote Text */}
                        <div className="space-y-2 pt-2 border-t border-black/5">
                          <div className="px-1 text-[10px] font-bold opacity-40 uppercase tracking-widest">自定义金句内容</div>
                          <textarea 
                            value={customQuoteText || calendarData.quote.text}
                            onChange={(e) => handleCustomQuoteChange(e.target.value)}
                            className={`w-full h-24 px-4 py-3 rounded-2xl border bg-black/5 focus:outline-none focus:ring-2 focus:ring-rose-600/30 transition-all text-sm font-bold resize-none ${isDarkBg ? 'border-white/10' : 'border-gray-100'}`}
                            placeholder="让今天更有力量的文字..."
                          />
                        </div>

                        {/* Custom Quote Source */}
                        <div className="space-y-2">
                          <div className="px-1 text-[10px] font-bold opacity-40 uppercase tracking-widest">金句署名</div>
                          <input 
                            type="text" 
                            value={customQuoteSource || calendarData.quote.author}
                            onChange={(e) => handleCustomQuoteSourceChange(e.target.value)}
                            className={`w-full px-4 py-3 rounded-2xl border bg-black/5 focus:outline-none focus:ring-2 focus:ring-rose-600/30 transition-all text-sm font-bold ${isDarkBg ? 'border-white/10' : 'border-gray-100'}`}
                            placeholder="署名，例如：苏轼、尼采..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Tab (Reset) */}
                  {activeTab === 'system' && (
                    <div className="flex flex-col gap-6 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-4">
                        {/* Reset Button */}
                        <div className="pt-2">
                          <div className="px-1 mb-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">系统管理</div>
                          <button 
                            onClick={handleResetDefaults}
                            className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all group relative overflow-hidden ${
                              resetSuccess 
                                ? 'bg-green-500 text-white shadow-lg' 
                                : 'bg-black/5 hover:bg-rose-600 hover:text-white border border-transparent'
                            }`}
                          >
                            {resetSuccess ? (
                              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                <Check size={16} />
                                <span className="font-bold text-sm">已重置所有设置</span>
                              </motion.div>
                            ) : (
                              <>
                                <RotateCcw size={16} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                                <span className="font-bold text-sm">恢复默认设置</span>
                              </>
                            )}
                          </button>
                          <p className="text-[10px] opacity-30 text-center mt-2 px-4 leading-tight italic">
                            * 此操作将清除所有自定义配置，包括配色、字体及排版尺寸。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        {/* Trigger Handle - Improved hit area */}
        <div className={`w-1.5 h-40 flex items-center justify-end cursor-pointer z-50 group/trigger`}>
          <div className={`w-1.5 h-20 rounded-l-full transition-all duration-300 ${isDarkBg ? 'bg-white/20 group-hover/trigger:bg-white/50 group-hover/trigger:h-28' : 'bg-black/10 group-hover/trigger:bg-black/30 group-hover/trigger:h-28'}`} />
        </div>
      </motion.div>
    </div>
  );
}
