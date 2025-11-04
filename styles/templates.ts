
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
        header: 'text-sunai-dark dark:text-gray-100 font-sans',
        bullet: 'text-sunai-orange',
        body: 'text-gray-700 dark:text-gray-300 font-sans',
        accentBgLight: 'bg-orange-100 dark:bg-orange-900/50',
        accentBorder: 'border-sunai-orange',
        accentText: 'text-sunai-orange',
        accentTextHover: 'hover:text-orange-700 dark:hover:text-orange-400',
    },
    corporate: {
        header: 'text-gray-900 dark:text-gray-50 font-serif',
        bullet: 'text-sunai-blue',
        body: 'text-gray-600 dark:text-gray-400 font-sans',
        accentBgLight: 'bg-blue-100 dark:bg-blue-900/50',
        accentBorder: 'border-sunai-blue',
        accentText: 'text-sunai-blue',
        accentTextHover: 'hover:text-blue-700 dark:hover:text-blue-400',
    },
    creative: {
        header: 'text-gray-800 dark:text-gray-200 font-poppins',
        bullet: 'text-sunai-violet',
        body: 'text-gray-600 dark:text-gray-400 font-sans',
        accentBgLight: 'bg-violet-100 dark:bg-violet-900/50',
        accentBorder: 'border-sunai-violet',
        accentText: 'text-sunai-violet',
        accentTextHover: 'hover:text-violet-700 dark:hover:text-violet-400',
    }
};