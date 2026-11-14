/** The figure review screen shows in development and on Firebase Hosting preview channels only. */
export function reviewEnabled(): boolean {
  // Preview channel hosts look like <site>--<channel>-<hash>.web.app
  return import.meta.env.DEV || window.location.hostname.includes('--')
}
