import { adminDB } from '$lib/server/firebase';

// Hàm lấy User Profile từ DB
export async function getUserProfile(uid: string) {
  const doc = await adminDB.collection('users').doc(uid).get();
  if (doc.exists) {
    return doc.data();
  }
  return null;
}

// Hàm tạo/update User khi login
export async function syncUser(user: any) {
  const userRef = adminDB.collection('users').doc(user.uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    await userRef.set({
      uid: user.uid,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      picture: user.picture,
      isPro: false,
      createdAt: new Date().toISOString()
    });
  } else {
    await userRef.update({
      email: user.email,
      picture: user.picture,
      lastLogin: new Date().toISOString()
    });
  }
}
