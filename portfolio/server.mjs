/* Preview the production build exactly as built. Run `npm run build` first. */
import { serve } from './serve.mjs';

await serve({ dir: 'dist', port: 4173, label: 'Production preview' });
