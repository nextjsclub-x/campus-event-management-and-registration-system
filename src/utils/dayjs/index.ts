/* eslint-disable no-unused-vars */
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// 使用插件
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// 扩展 Dayjs 接口
declare module 'dayjs' {
  interface DayjsExtended extends Dayjs {
    isSameOrBefore(date: Dayjs, unit?: dayjs.OpUnitType): boolean;
    isSameOrAfter(date: Dayjs, unit?: dayjs.OpUnitType): boolean;
  }
}

export class EnhancedDate {
  private date: dayjs.Dayjs;

  constructor(date?: string | Date | number | Dayjs) {
    this.date = dayjs(date);
  }

  static getCurrentDate(): EnhancedDate {
    return new EnhancedDate();
  }

  formatToYYYYMMDD(): string {
    return this.date.format('YYYY-MM-DD');
  }

  formatToYYYYMMDDHHmmss(): string {
    return this.date.format('YYYY-MM-DD HH:mm:ss');
  }

  addDays(days: number): EnhancedDate {
    return new EnhancedDate(this.date.add(days, 'day'));
  }

  subtractDays(days: number): EnhancedDate {
    return new EnhancedDate(this.date.subtract(days, 'day'));
  }

  addMonths(months: number): EnhancedDate {
    return new EnhancedDate(this.date.add(months, 'month'));
  }

  subtractMonths(months: number): EnhancedDate {
    return new EnhancedDate(this.date.subtract(months, 'month'));
  }

  isBefore(other: EnhancedDate): boolean {
    return this.date.isBefore(other.date);
  }

  isAfter(other: EnhancedDate): boolean {
    return this.date.isAfter(other.date);
  }

  isSameOrBefore(other: EnhancedDate): boolean {
    return (this.date as any).isSameOrBefore(other.date);
  }

  isSameOrAfter(other: EnhancedDate): boolean {
    return (this.date as any).isSameOrAfter(other.date);
  }

  differenceInDays(other: EnhancedDate): number {
    return this.date.diff(other.date, 'day');
  }

  differenceInMonths(other: EnhancedDate): number {
    return this.date.diff(other.date, 'month');
  }

  toStartOfDay(): EnhancedDate {
    return new EnhancedDate(this.date.startOf('day'));
  }

  toEndOfDay(): EnhancedDate {
    return new EnhancedDate(this.date.endOf('day'));
  }

  toStartOfMonth(): EnhancedDate {
    return new EnhancedDate(this.date.startOf('month'));
  }

  toEndOfMonth(): EnhancedDate {
    return new EnhancedDate(this.date.endOf('month'));
  }

  toDate(): Date {
    return this.date.toDate();
  }

  toString(): string {
    return this.date.toString();
  }
}

// 导出一个创建 EnhancedDate 实例的工厂函数
export function createEnhancedDate(date?: string | Date | number | Dayjs): EnhancedDate {
  return new EnhancedDate(date);
}

// 导出获取当前日期的静态方法
export const { getCurrentDate } = EnhancedDate;
