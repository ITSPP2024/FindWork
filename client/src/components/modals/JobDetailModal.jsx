import React from 'react';
import { X, Building2, MapPin, Clock, DollarSign, Calendar, Users, Star, Briefcase, FileText } from 'lucide-react';

const JobDetailModal = ({ isOpen, onClose, vacante, onApply }) => {
  if (!isOpen || !vacante) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'A negociar';
    return `$${salary.toLocaleString()} MXN`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {vacante.Tipo_Puesto}
            </h2>
            <div className="flex items-center text-gray-600">
              <Building2 className="w-5 h-5 mr-2" />
              <span className="font-medium">{vacante.Nombre_Empresa}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Ubicación</span>
              </div>
              <p className="text-gray-900 font-semibold">{vacante.Ubicacion || 'No especificada'}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Salario</span>
              </div>
              <p className="text-gray-900 font-semibold">{formatSalary(vacante.Salario)}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Horario</span>
              </div>
              <p className="text-gray-900 font-semibold">{vacante.Horario || 'No especificado'}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Publicado</span>
              </div>
              <p className="text-gray-900 font-semibold">{formatDate(vacante.fecha_publicacion)}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Descripción del Puesto
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {vacante.Descripcion || 'Únete a nuestro equipo y desarrolla tu carrera profesional en un ambiente dinámico y colaborativo. Buscamos personas talentosas y comprometidas que quieran crecer con nosotros.'}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {vacante.Requisitos && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                    Requisitos
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{vacante.Requisitos}</p>
                  </div>
                </div>
              )}

              {/* Benefits */}
              {vacante.Beneficios && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Beneficios
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">{vacante.Beneficios}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Company Info & Actions */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Información de la Empresa
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Empresa</p>
                    <p className="text-gray-900 font-semibold">{vacante.Nombre_Empresa}</p>
                  </div>
                  {vacante.Sector && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Sector</p>
                      <p className="text-gray-900">{vacante.Sector}</p>
                    </div>
                  )}
                  {vacante.Tamaño_Empresa && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tamaño</p>
                      <p className="text-gray-900">{vacante.Tamaño_Empresa}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Stats */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Estadísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aplicaciones</span>
                    <span className="font-semibold text-gray-900">
                      {vacante.total_aplicaciones || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vistas</span>
                    <span className="font-semibold text-gray-900">
                      {vacante.total_vistas || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="sticky top-4">
                <button
                  onClick={() => onApply(vacante)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Aplicar a este Puesto</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Se abrirá el formulario de aplicación
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;