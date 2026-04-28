import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'vm/**',
    renderMode: RenderMode.Client  // Render hoàn toàn ở client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];