import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      "app_title": "Mas Pins",
      "login_title": "Iniciar Sesión",
      "email": "Email",
      "password": "Contraseña",
      "login_btn": "Entrar",
      "logging_in": "Entrando...",
      "dashboard": "Panel General",
      "kids": "Chicos",
      "settings": "Ajustes",
      "total_kids": "Total de chicos",
      "expiring_soon": "Caducan pronto",
      "expired": "Caducadas",
      "next_renewals": "Próximas renovaciones",
      "add_kid": "Añadir chico",
      "edit_kid": "Editar chico",
      "name": "Nombre",
      "expiration_date": "Fecha de caducidad",
      "notes": "Notas (opcional)",
      "photo_url": "URL de Foto (opcional)",
      "cancel": "Cancelar",
      "save": "Guardar",
      "saving": "Guardando...",
      "delete": "Eliminar",
      "search_placeholder": "Buscar por nombre...",
      "filters": "Filtros",
      "all": "Todos",
      "this_week": "Esta semana",
      "days_left": "Quedan {{days}} días",
      "expired_ago": "Caducó hace {{days}} días",
      "expires_today": "Caduca hoy",
      "quick_renew": "Renovación rápida",
      "renew_30": "+30 días",
      "renew_90": "+90 días",
      "logout": "Cerrar sesión",
      "error": "Error: {{msg}}",
      "no_kids": "No hay chicos registrados."
    }
  },
  ca: {
    translation: {
      "app_title": "Mas Pins",
      "login_title": "Iniciar Sessió",
      "email": "Correu electrònic",
      "password": "Contrasenya",
      "login_btn": "Entrar",
      "logging_in": "Entrant...",
      "dashboard": "Panell General",
      "kids": "Nois",
      "settings": "Ajustos",
      "total_kids": "Total de nois",
      "expiring_soon": "Caduquen aviat",
      "expired": "Caducades",
      "next_renewals": "Properes renovacions",
      "add_kid": "Afegir noi",
      "edit_kid": "Editar noi",
      "name": "Nom",
      "expiration_date": "Data de caducitat",
      "notes": "Notes (opcional)",
      "photo_url": "URL de Foto (opcional)",
      "cancel": "Cancel·lar",
      "save": "Guardar",
      "saving": "Guardant...",
      "delete": "Eliminar",
      "search_placeholder": "Cercar per nom...",
      "filters": "Filtres",
      "all": "Tots",
      "this_week": "Aquesta setmana",
      "days_left": "Queden {{days}} dies",
      "expired_ago": "Va caducar fa {{days}} dies",
      "expires_today": "Caduca avui",
      "quick_renew": "Renovació ràpida",
      "renew_30": "+30 dies",
      "renew_90": "+90 dies",
      "logout": "Tancar sessió",
      "error": "Error: {{msg}}",
      "no_kids": "No hi ha nois registrats."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // default language
    fallbackLng: "es",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
