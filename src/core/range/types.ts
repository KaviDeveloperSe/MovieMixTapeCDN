export interface ParsedRange {
    start?: number;
    end?: number;
    suffixLength?: number;
    type: 'exact' | 'open' | 'suffix';
}