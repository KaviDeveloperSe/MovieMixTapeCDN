import { ApplicationError } from '../../utils/errors';
import { ParsedRange } from './types';

export function parseRange(rangeHeader: string | undefined | null): ParsedRange | null {
    if (!rangeHeader) return null;

    const rangeString = rangeHeader.trim();
    if (!rangeString.startsWith('bytes=')) throw new ApplicationError('RANGE_UNSUPPORTED', 'Only bytes range is supported.', 416);

    const byteRangeSet = rangeString.substring(6);
    if (byteRangeSet.includes(',')) throw new ApplicationError('RANGE_NOT_SATISFIABLE', 'Multiple ranges are not supported.', 416);

    const parts = byteRangeSet.split('-');
    if (parts.length !== 2) throw new ApplicationError('RANGE_NOT_SATISFIABLE', 'Invalid range format.', 416);

    const [startStr, endStr] = parts;
    if (startStr === '' && endStr === '') throw new ApplicationError('RANGE_NOT_SATISFIABLE', 'Invalid empty range.', 416);

    if (startStr === '') {
        const suffixLength = parseInt(endStr, 10);
        if (isNaN(suffixLength) || suffixLength <= 0) throw new ApplicationError('RANGE_NOT_SATISFIABLE', 'Invalid suffix length.', 416);
        return { type: 'suffix', suffixLength };
    }

    const start = parseInt(startStr, 10);
    if (isNaN(start) || start < 0) throw new ApplicationError('RANGE_NOT_SATISFIABLE', 'Invalid range start.', 416);

    if (endStr === '') {
        return {
            type: 'open',
            start: start
        };
    }

    const end = parseInt(endStr, 10);
    if (isNaN(end) || end < start) throw new ApplicationError('RANGE_NOT_SATISFIABLE', 'Invalid range end.', 416);

    return { type: 'exact', start, end };
}

export function formatRangeHeader(range: ParsedRange): string {
    if (range.type === 'suffix') return `bytes=-${range.suffixLength}`;
    if (range.type === 'open') return `bytes=${range.start}-`;
    return `bytes=${range.start}-${range.end}`;
}