import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type Locale = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
    locale: Locale;
    direction: Direction;
    toggleLanguage: () => void;
    setLocale: (nextLocale: Locale, options?: { persist?: boolean }) => void;
    t: (key: string) => string;
    tr: (ar: string, en: string) => string;
}

const translations = {
    ar: {
        // Header
        'header.dashboard': 'لوحة التحكم',
        'header.pos': 'نقطة البيع',
        'header.categories': 'التصنيفات',
        'header.items': 'الأصناف',
        'header.tables': 'الطاولات',
        'header.kitchen': 'شاشة المطبخ',
        'header.askAi': 'اسأل الذكاء الاصطناعي',

        // Common
        'common.add': 'إضافة',
        'common.edit': 'تعديل',
        'common.delete': 'حذف',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء',
        'common.search': 'بحث',
        'common.active': 'نشط',
        'common.inactive': 'غير نشط',
        'common.yes': 'نعم',
        'common.no': 'لا',

        // Categories
        'categories.title': 'إدارة التصنيفات',
        'categories.addNew': 'إضافة تصنيف جديد',
        'categories.nameAr': 'الاسم (عربي)',
        'categories.nameEn': 'الاسم (English)',
        'categories.total': 'إجمالي التصنيفات',

        // Items
        'items.title': 'إدارة الأصناف',
        'items.addNew': 'إضافة صنف جديد',
        'items.price': 'السعر',
        'items.sku': 'SKU',
        'items.category': 'التصنيف',

        // AI
        'ai.title': 'RunBrain - مساعد الذكاء الاصطناعي',
        'ai.placeholder': 'اسأل أي سؤال عن بياناتك...',
        'ai.quickPrompts': 'أسئلة سريعة',
        'ai.analyzing': 'جار التحليل...',
    },
    en: {
        // Header
        'header.dashboard': 'Dashboard',
        'header.pos': 'POS',
        'header.categories': 'Categories',
        'header.items': 'Items',
        'header.tables': 'Tables',
        'header.kitchen': 'Kitchen',
        'header.askAi': 'Ask AI',

        // Common
        'common.add': 'Add',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.search': 'Search',
        'common.active': 'Active',
        'common.inactive': 'Inactive',
        'common.yes': 'Yes',
        'common.no': 'No',

        // Categories
        'categories.title': 'Manage Categories',
        'categories.addNew': 'Add New Category',
        'categories.nameAr': 'Name (Arabic)',
        'categories.nameEn': 'Name (English)',
        'categories.total': 'Total Categories',

        // Items
        'items.title': 'Manage Items',
        'items.addNew': 'Add New Item',
        'items.price': 'Price',
        'items.sku': 'SKU',
        'items.category': 'Category',

        // AI
        'ai.title': 'RunBrain - AI Assistant',
        'ai.placeholder': 'Ask any question about your data...',
        'ai.quickPrompts': 'Quick Prompts',
        'ai.analyzing': 'Analyzing...',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = localStorage.getItem('locale');
        return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    });
    const persistLocaleRef = useRef(true);

    const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', locale);
        if (persistLocaleRef.current) {
            localStorage.setItem('locale', locale);
        }
        persistLocaleRef.current = true;
    }, [locale, direction]);

    const setLocale = (nextLocale: Locale, options?: { persist?: boolean }) => {
        persistLocaleRef.current = options?.persist !== false;
        setLocaleState(nextLocale);
    };

    const toggleLanguage = () => {
        setLocaleState((prev) => {
            persistLocaleRef.current = true;
            return prev === 'ar' ? 'en' : 'ar';
        });
    };

    const t = (key: string): string => {
        return (translations[locale] as Record<string, string>)[key] || key;
    };

    const tr = (ar: string, en: string): string => {
        return locale === 'ar' ? ar : en;
    };

    return (
        <LanguageContext.Provider value={{ locale, direction, toggleLanguage, setLocale, t, tr }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
