
import { TemplateID } from '../types';

export interface TemplateStyle {
    header: string;
    bullet: string;
    body: string;
    accentBgLight: string;
    accentBorder: string;
    accentText: string;
    accentTextHover: string;
}

export const templateStyles: Record<TemplateID, TemplateStyle> = {
    startup: {
        header: 'text-amo-dark dark:text-gray-100 font-sans',
        bullet: 'text-amo-orange',
        body: 'text-gray-700 dark:text-gray-300 font-sans',
        accentBgLight: 'bg-orange-100 dark:bg-orange-900/50',
        accentBorder: 'border-amo-orange',
        accentText: 'text-amo-orange',
        accentTextHover: 'hover:text-orange-700 dark:hover:text-orange-400',
    },
    corporate: {
        header: 'text-gray-900 dark:text-gray-50 font-serif',
        bullet: 'text-amo-blue',
        body: 'text-gray-600 dark:text-gray-400 font-sans',
        accentBgLight: 'bg-blue-100 dark:bg-blue-900/50',
        accentBorder: 'border-amo-blue',
        accentText: 'text-amo-blue',
        accentTextHover: 'hover:text-blue-700 dark:hover:text-blue-400',
    },
    creative: {
        header: 'text-gray-800 dark:text-gray-200 font-poppins',
        bullet: 'text-amo-violet',
        body: 'text-gray-600 dark:text-gray-400 font-sans',
        accentBgLight: 'bg-violet-100 dark:bg-violet-900/50',
        accentBorder: 'border-amo-violet',
        accentText: 'text-amo-violet',
        accentTextHover: 'hover:text-violet-700 dark:hover:text-violet-400',
    }
};