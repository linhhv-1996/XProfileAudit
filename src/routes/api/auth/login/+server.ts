import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase';
import { syncUser } from '$lib/server/users';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { idToken } = await request.json();
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    await syncUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    });
    // -----------------------------------

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies.set('session', sessionCookie, {
      path: '/', httpOnly: true, secure: true, sameSite: 'strict', maxAge: expiresIn / 1000,
    });

    return json({ status: 'success' });
  } catch (error) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
};
