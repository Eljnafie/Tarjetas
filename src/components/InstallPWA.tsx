import React, { useState, useEffect } from 'react';
import { Download, X, Copy, ExternalLink } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = async () => {
    if (promptInstall && !isIframe) {
      promptInstall.prompt();
    } else {
      setShowPrompt(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Optional: show a toast here, but simple alert might work or just visual feedback.
  };

  return (
    <>
      <button
        onClick={onClick}
        className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
        title="Instalar App"
      >
        <Download size={16} />
        <span className="hidden sm:block">Instalar App</span>
      </button>

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 relative animate-in slide-in-from-bottom-4">
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">Instalar Aplicación</h3>
            
            {isIframe ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Estás viendo la aplicación dentro de una vista previa. Para instalarla en tu dispositivo móvil:
                </p>
                <ol className="list-decimal pl-5 text-sm space-y-3 text-gray-700">
                  <li>Abre la aplicación en una pestaña nueva o en tu móvil.</li>
                  <li>Usa la opción <strong>"Añadir a la pantalla de inicio"</strong> en tu navegador.</li>
                </ol>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm"
                  >
                    <Copy size={16} /> Copiar link
                  </button>
                  <a 
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm"
                  >
                    <ExternalLink size={16} /> Abrir
                  </a>
                </div>
              </div>
            ) : isIOS ? (
              <div>
                <p className="text-gray-600 mb-4 text-sm">
                  Para instalar esta app en tu iPhone o iPad:
                </p>
                <ol className="list-decimal pl-5 text-sm space-y-3 mb-6 text-gray-700">
                  <li>Asegúrate de estar usando el navegador <strong>Safari</strong>.</li>
                  <li>Toca el botón de Compartir <span className="inline-block border border-gray-300 rounded px-1 align-middle text-blue-500">↑</span> en la barra inferior.</li>
                  <li>Busca y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</li>
                </ol>
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4 text-sm">
                  Para instalar en Android / Chrome:
                </p>
                <ol className="list-decimal pl-5 text-sm space-y-3 mb-6 text-gray-700">
                  <li>Toca el menú de opciones (tres puntos) en la esquina superior derecha.</li>
                  <li>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.</li>
                </ol>
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
