import { ParsedRange } from './types';
import { ApplicationError } from '../../utils/errors';

export function validateRangeLimits(range: ParsedRange, maxRangeSize: number): void {
    if (range.type === 'exact') {
        const size = (range.end as number) - (range.start as number) + 1;
        if (size > maxRangeSize) throw new ApplicationError('RANGE_TOO_LARGE', `Requested range size (${size} bytes) exceeds maximum allowed size (${maxRangeSize} bytes).`, 416);
    }

    if (range.type === 'suffix') {
        if ((range.suffixLength as number) > maxRangeSize) throw new ApplicationError('RANGE_TOO_LARGE', `Requested suffix range size (${range.suffixLength} bytes) exceeds maximum allowed size (${maxRangeSize} bytes).`, 416);
    }
}