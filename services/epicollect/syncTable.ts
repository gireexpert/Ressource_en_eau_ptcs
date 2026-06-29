import { supabaseAdmin } from "@/lib/supabase-admin";
import { fetchEpicollectEntries, extractEntries } from "@/services/epicollect/client";

export async function syncTable(module: string, source: string, url: string, table: string, mapper: (e: any) => any) {
  try {
    const payload = await fetchEpicollectEntries(url);
    const entries = extractEntries(payload);
    const rows = entries.map(mapper).filter((r) => r && r.source_entry_id);

    if (rows.length > 0) {
      const { error } = await supabaseAdmin.from(table).upsert(rows, { onConflict: "source_entry_id" });
      if (error) throw error;
    }

    await supabaseAdmin.from("sync_log").insert({
      module, source, nb_enregistrements: rows.length, statut: "success", message: `Synchronisation ${table} OK`
    });

    return { module, source, table, count: rows.length, status: "success" };
  } catch (error: any) {
    try {
      await supabaseAdmin.from("sync_log").insert({
        module, source, nb_enregistrements: 0, statut: "error", message: error.message
      });
    } catch (_) {}
    return { module, source, table, count: 0, status: "error", error: error.message };
  }
}
