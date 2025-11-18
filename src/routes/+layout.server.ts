import type { LayoutServerLoad } from './$types';
import { getUserProfile } from '$lib/server/users';

export const load: LayoutServerLoad = async ({ locals }) => {
  let userProfile = null;

  if (locals.user) {
    const dbUser = await getUserProfile(locals.user.uid);
    userProfile = { ...locals.user, ...dbUser };
  }

  return {
    user: userProfile
  };
};
