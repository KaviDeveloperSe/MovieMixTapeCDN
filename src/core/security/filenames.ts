export function sanitizeFilename(filename: string | undefined | null): string {
    if (!filename) return 'download.mp4';
    let safe = filename.replace(/[\x00-\x1f\x80-\x9f]/g, '');
    safe = safe.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
    safe = safe.replace(/[\/\\]/g, '');
    safe = safe.replace(/"/g, "'");
    if (safe.trim() === '') return 'download.mp4';
    return safe.trim();
}