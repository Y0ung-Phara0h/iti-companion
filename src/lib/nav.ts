import { router, type Href } from 'expo-router';

export function goSite(): void {
  router.push('/site' as Href);
}

export function goSettings(): void {
  router.push('/settings' as Href);
}
