// src/lib/server/dev.ts
import fs from 'node:fs';
import util from 'node:util';

/**
 * Ghi data object ra file log (ghi đè nội dung cũ).
 * Hoàn hảo cho việc debug data object lớn mà không bị cắt.
 * @param filename Tên file log (VD: 'debug_api_data.log'). File sẽ được tạo ở thư mục gốc.
 * @param data Object cần ghi
 */
export function logToFile(filename: string, data: any): void {
    // Chỉ chạy trong môi trường Node.js (Server side)
    if (typeof window !== 'undefined') return; 
    
    try {
        // Sử dụng util.inspect với depth: null để in ra toàn bộ object lồng nhau
        const logContent = util.inspect(data, {
            depth: null, 
            maxArrayLength: null,
            colors: false
        });

        const fullLog = `--- LOG TIME: ${new Date().toISOString()} ---\n\n` + logContent;

        // Ghi đè (overwrite) vào file (fs.writeFileSync)
        fs.writeFileSync(filename, fullLog);
        
        console.log(`[DEBUG] Đã ghi đè data vào ${filename}`);
    } catch (e) {
        console.error('LỖI KHI GHI FILE LOG:', e);
    }
}
