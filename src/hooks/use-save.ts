import { useState } from 'react';

import { dialog } from '@/components/dialog';
import type { ContentKey, ContentMap } from '@/content/types';
import { backend, errorMessage } from '@/services/backend';

/** Salvataggio dei contenuti con stato di attesa e messaggio d'errore. */
export function useSaveContent() {
  const [saving, setSaving] = useState(false);
  const save = async <K extends ContentKey>(key: K, data: ContentMap[K]) => {
    setSaving(true);
    try {
      await backend.saveContent(key, data);
      return true;
    } catch (e) {
      dialog.alert('Salvataggio non riuscito', errorMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  };
  return { saving, save };
}
