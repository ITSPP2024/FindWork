import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, FileText, Building } from 'lucide-react';

const UserDetailModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalles del {user.tipo === 'empleado' ? 'Empleado' : 'Empresa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {user.tipo === 'empleado' ? (
                <User className="w-8 h-8 text-blue-600" />
              ) : (
                <Building className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.nombre}</h3>
              <p className="text-sm text-gray-500 capitalize">{user.tipo}</p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Información de Contacto
              </h4>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Teléfono</p>
                  <p className="text-sm text-gray-600">{user.telefono || 'No disponible'}</p>
                </div>
              </div>

              {user.tipo === 'empresa' && user.ubicacion && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación</p>
                    <p className="text-sm text-gray-600">{user.ubicacion}</p>
                  </div>
                </div>
              )}

              {user.tipo === 'empresa' && user.numero_empresa && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Número de Empresa</p>
                    <p className="text-sm text-gray-600">{user.numero_empresa}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Información Adicional
              </h4>

              {user.tipo === 'empleado' && user.experiencia && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Experiencia</p>
                    <p className="text-sm text-gray-600">{user.experiencia}</p>
                  </div>
                </div>
              )}

              {user.tipo === 'empleado' && user.documentos && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Documentos</p>
                    <p className="text-sm text-gray-600">{user.documentos}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                  <p className="text-sm text-gray-600">{formatDate(user.fecha_actualizacion)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {user.descripcion && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                Descripción
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{user.descripcion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;