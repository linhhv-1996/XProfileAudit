// File: src/lib/server/firebase.ts
import admin from 'firebase-admin';
import { FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_PROJECT_ID } from '$env/static/private';

// Khởi tạo Admin SDK (Chỉ chạy trên Server)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDB = admin.firestore();
