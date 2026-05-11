import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { Child } from '../types';
import { updateChild, deleteChildRecord } from '../services/db';
import { compressImage } from '../utils/imageUtils';

export const EditChildModal: React.FC<{ child: Child; onClose: () => void }> = ({ child, onClose }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialDate = new Date(child.expirationDate);
  const tzOffset = initialDate.getTimezoneOffset() * 60000;
  const isoDate = new Date(child.expirationDate - tzOffset).toISOString().split('T')[0];

  const [name, setName] = useState(child.name);
  const [expirationDate, setExpirationDate] = useState(isoDate);
  const [notes, setNotes] = useState(child.notes || '');
  const [photoUrl, setPhotoUrl] = useState(child.photoUrl || '');
  const [isLost, setIsLost] = useState(child.isLost || false);
  const [loading, setLoading] = useState(false);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const base64Url = await compressImage(file);
      setPhotoUrl(base64Url);
    } catch (err) {
      console.error('Error compressing image', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const expDate = new Date(expirationDate);
    expDate.setMinutes(expDate.getMinutes() + expDate.getTimezoneOffset());
    
    try {
      await updateChild(child.id, {
        name,
        expirationDate: expDate.getTime(),
        notes,
        photoUrl,
        isLost
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteChildRecord(child.id);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{t('edit_kid')}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')} *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('expiration_date')} *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto o Avatar</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-400" size={24} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors w-full justify-center"
                >
                  <Upload size={16} />
                  Subir Foto local
                </button>
              </div>
            </div>
            <div className="mt-2">
              <input
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="O pega una URL (https://...)"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24 resize-none"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <input
              type="checkbox"
              id="isLostCheckbox"
              className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500"
              checked={isLost}
              onChange={e => setIsLost(e.target.checked)}
            />
            <label htmlFor="isLostCheckbox" className="text-sm font-medium text-red-800 cursor-pointer">
              He perdido la tarjeta
            </label>
          </div>
          
          <div className="pt-4 border-t border-gray-100 mt-6 overflow-hidden">
            {isConfirmingDelete ? (
              <div className="flex flex-col items-center p-3 bg-red-50 rounded-xl rounded-b-none border-b border-red-100">
                <p className="text-sm font-medium text-red-800 mb-3">¿Seguro que quieres eliminar a {child.name}?</p>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent shadow-sm hover:border-red-100"
                  title={t('delete')}
                >
                  <Trash2 size={20} />
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loading ? t('saving') : t('save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
