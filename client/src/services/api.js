import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API para aplicaciones
export const applicationsAPI = {
  // Aplicar a una vacante
  applyToJob: async (applicationData) => {
    try {
      const response = await api.post('/empleado/aplicar', applicationData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error aplicando a vacante:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error aplicando a la vacante' 
      };
    }
  },

  // Obtener aplicaciones del empleado
  getEmployeeApplications: async (employeeId) => {
    try {
      const response = await api.get(`/empleado/aplicaciones/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error obteniendo aplicaciones:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error cargando aplicaciones' 
      };
    }
  },

  // Obtener aplicaciones de una empresa
  getCompanyApplications: async (companyId) => {
    try {
      const response = await api.get(`/empresa/aplicaciones/${companyId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error obteniendo aplicaciones de empresa:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error cargando aplicaciones' 
      };
    }
  },

  // Actualizar estado de aplicación (solo empresas)
  updateApplicationStatus: async (applicationId, status, notes = '') => {
    try {
      const response = await api.put(`/empresa/aplicacion/${applicationId}`, {
        estado: status,
        notas_empresa: notes
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error actualizando aplicación:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error actualizando aplicación' 
      };
    }
  }
};

// API para favoritos
export const favoritesAPI = {
  // Obtener favoritos del empleado
  getFavorites: async (employeeId) => {
    try {
      const response = await api.get(`/empleado/favoritos/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error cargando favoritos' 
      };
    }
  },

  // Agregar/quitar favorito
  toggleFavorite: async (vacanteId) => {
    try {
      const response = await api.post('/empleado/favorito/toggle', { puesto_id: vacanteId });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error actualizando favorito:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error actualizando favorito' 
      };
    }
  },

  // Verificar si una vacante es favorita
  checkIsFavorite: async (employeeId, vacanteId) => {
    try {
      const response = await api.get(`/empleado/favorito/${employeeId}/${vacanteId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error verificando favorito:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error verificando favorito',
        data: { isFavorite: false }
      };
    }
  }
};

// API para perfil de empleado
export const profileAPI = {
  // Obtener perfil del empleado
  getProfile: async (employeeId) => {
    try {
      const response = await api.get(`/empleado/perfil/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error cargando perfil' 
      };
    }
  },

  // Actualizar perfil del empleado
  updateProfile: async (employeeId, profileData) => {
    try {
      const response = await api.put(`/empleado/perfil/${employeeId}`, profileData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error actualizando perfil' 
      };
    }
  },

  // Actualizar foto de perfil
  updateProfilePhoto: async (employeeId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('foto', photoFile);
      
      const response = await api.put(`/empleado/foto-perfil/${employeeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error actualizando foto de perfil:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error actualizando foto de perfil' 
      };
    }
  }
};

export default api;