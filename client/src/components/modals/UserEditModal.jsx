import React, { useState, useEffect } from 'react';
import { X, User, Building, Save, Loader2 } from 'lucide-react';

const UserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    experiencia: '',
    descripcion: '',
    ubicacion: '',
    numero_empresa: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        experiencia: user.experiencia || '',
        descripcion: user.descripcion || '',
        ubicacion: user.ubicacion || '',
        numero_empresa: user.numero_empresa || ''
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (user?.tipo === 'empresa' && !formData.numero_empresa.trim()) {
      newErrors.numero_empresa = 'El número de empresa es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setErrors({ submit: 'Error al guardar los cambios. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {user.tipo === 'empleado' ? (
              <User className="w-6 h-6 text-blue-600" />
            ) : (
              <Building className="w-6 h-6 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              Editar {user.tipo === 'empleado' ? 'Empleado' : 'Empresa'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Información Básica
              </h3>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Información Adicional
              </h3>

              {user.tipo === 'empleado' && (
                <div>
                  <label htmlFor="experiencia" className="block text-sm font-medium text-gray-700 mb-1">
                    Experiencia
                  </label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    rows={3}
                    value={formData.experiencia}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              )}

              {user.tipo === 'empresa' && (
                <>
                  <div>
                    <label htmlFor="numero_empresa" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Empresa *
                    </label>
                    <input
                      type="text"
                      id="numero_empresa"
                      name="numero_empresa"
                      value={formData.numero_empresa}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.numero_empresa ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.numero_empresa && (
                      <p className="mt-1 text-sm text-red-600">{errors.numero_empresa}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      id="ubicacion"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción opcional..."
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;