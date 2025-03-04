import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化选项，可选
 * @returns 格式化后的日期字符串
 */
export function formatDate(
	date: Date | string,
	format: 'full' | 'date' | 'time' = 'full',
): string {
	const d = new Date(date);

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	};

	if (format === 'date') {
		delete options.hour;
		delete options.minute;
	} else if (format === 'time') {
		delete options.year;
		delete options.month;
		delete options.day;
	}

	return new Intl.DateTimeFormat('zh-CN', options).format(d);
}
