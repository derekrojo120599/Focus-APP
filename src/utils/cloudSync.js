import { supabase } from './supabaseClient';
import { loadData, saveData } from './helpers';

let syncTimeout = null;

export async function pullCloudData(userId) {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('payload')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error al traer datos de la nube:", error);
      return null; // PGRST116 is "No rows found"
    }

    if (data && data.payload) {
      // Data exists in cloud, return it
      return data.payload;
    } else {
      // No data in cloud, push local data if it exists
      const localData = loadData();
      if (localData) {
        await pushCloudDataImmediate(userId, localData);
      }
      return localData;
    }
  } catch (err) {
    console.error("Error en pullCloudData:", err);
    return null;
  }
}

export function pushCloudDataDebounced(userId, data) {
  // Guardamos localmente de inmediato (rápido, síncrono)
  saveData(data);

  if (!userId) return;

  // Hacemos debounce pa' no fundir la API de Supabase cada segundo con el cronómetro
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    pushCloudDataImmediate(userId, data);
  }, 5000); // Sincroniza cada 5 segundos de inactividad de cambios (o retrasa la escritura)
}

export async function pushCloudDataImmediate(userId, data) {
  if (!userId) return;
  try {
    await supabase.from('user_data').upsert({
      user_id: userId,
      payload: data
    });
  } catch (err) {
    console.error("Error subiendo datos a Supabase:", err);
  }
}
