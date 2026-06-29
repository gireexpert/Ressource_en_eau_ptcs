const FALLBACK={
POINTS:"https://five.epicollect.net/api/export/entries/etat-des-lieux-pe-ptcs?form_ref=9365afaa5ef642ffb8ed24b8b51bf93a_5db097aea78d5",
PLUVIO_ST:"https://five.epicollect.net/api/export/entries/suivi-pluviometrique-koulikoro-ptcs?form_ref=b08ac6bb9fcc46229ca70b7442315ff9_6a047a461c0c4",
PLUVIO_OBS:"https://five.epicollect.net/api/export/entries/suivi-pluviometrique-koulikoro-ptcs?form_ref=b08ac6bb9fcc46229ca70b7442315ff9_6a05a7178bf71",
PIEZO_REF:"https://five.epicollect.net/api/export/entries/suivi-piezo-koulikoro-ptcs?form_ref=6144ed6ab3d646baa82de06e13b4f051_6a047a461c0c4",
PIEZO_OBS:"https://five.epicollect.net/api/export/entries/suivi-piezo-koulikoro-ptcs?form_ref=6144ed6ab3d646baa82de06e13b4f051_6a05a7178bf71",
LIMNI_ST:"https://five.epicollect.net/api/export/entries/suivi-limnimetrique-ce-koulikoro?form_ref=bd5f4213890945cfb0d4976cd8768332_6a047a461c0c4",
LIMNI_OBS:"https://five.epicollect.net/api/export/entries/suivi-limnimetrique-ce-koulikoro?form_ref=bd5f4213890945cfb0d4976cd8768332_6a05a7178bf71"
};
export const EPICOLLECT_SOURCES={
pluviometrie:{stations:process.env.EPICOLLECT_PLUVIO_STATIONS||FALLBACK.PLUVIO_ST,releves:process.env.EPICOLLECT_PLUVIO_RELEVES||FALLBACK.PLUVIO_OBS},
piezometrie:{referentiel:process.env.EPICOLLECT_PIEZO_REFERENTIEL||FALLBACK.PIEZO_REF,mesures:process.env.EPICOLLECT_PIEZO_MESURES||FALLBACK.PIEZO_OBS},
limnimetrie:{stations:process.env.EPICOLLECT_LIMNI_STATIONS||FALLBACK.LIMNI_ST,lectures:process.env.EPICOLLECT_LIMNI_LECTURES||FALLBACK.LIMNI_OBS},
pointsEau:{inventaire:process.env.EPICOLLECT_POINTS_EAU_REF||FALLBACK.POINTS}};
