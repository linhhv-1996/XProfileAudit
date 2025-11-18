// File: src/routes/api/auth/logout/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  // Xóa cookie
  cookies.delete('session', { path: '/' });
  return json({ status: 'success' });
};
