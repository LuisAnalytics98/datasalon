// Mock salon service for development
export const mockSalonService = {
  async getSalons() {
    // Return mock data for development
    return [
      {
        id: '1',
        name: 'Salón Bella Vista',
        address: 'San José, Costa Rica',
        phone: '+506 2222-2222',
        email: 'info@bellavista.com',
        description: 'Salón de belleza especializado en cortes modernos',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: '2',
        name: 'Estilo & Elegancia',
        address: 'Cartago, Costa Rica',
        phone: '+506 3333-3333',
        email: 'contacto@estiloelegancia.com',
        description: 'Salón premium con servicios de alta calidad',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: '3',
        name: 'Hair Studio Pro',
        address: 'Alajuela, Costa Rica',
        phone: '+506 4444-4444',
        email: 'info@hairstudiopro.com',
        description: 'Estudio profesional de cabello y belleza',
        isActive: true,
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      }
    ];
  },

  async getSalonById(id: string) {
    const salons = await this.getSalons();
    return salons.find(salon => salon.id === id);
  },

  async getSalonServices(salonId: string) {
    // Return mock services for the salon
    return [
      {
        id: '1',
        name: 'Corte de Cabello',
        description: 'Corte moderno y estilizado',
        duration: 60,
        price: 15000,
        category: 'Cabello'
      },
      {
        id: '2',
        name: 'Tinte',
        description: 'Coloración profesional',
        duration: 120,
        price: 25000,
        category: 'Cabello'
      },
      {
        id: '3',
        name: 'Manicure',
        description: 'Cuidado completo de uñas',
        duration: 45,
        price: 8000,
        category: 'Uñas'
      }
    ];
  },

  async getSalonEmployees(salonId: string) {
    // Return mock employees for the salon
    return [
      {
        id: '1',
        firstName: 'María',
        lastName: 'González',
        email: 'maria@salon.com',
        phone: '+506 8888-8888',
        services: ['1', '2'],
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '15:00' }
        }
      },
      {
        id: '2',
        firstName: 'Ana',
        lastName: 'Rodríguez',
        email: 'ana@salon.com',
        phone: '+506 9999-9999',
        services: ['1', '3'],
        workingHours: {
          monday: { start: '10:00', end: '18:00' },
          tuesday: { start: '10:00', end: '18:00' },
          wednesday: { start: '10:00', end: '18:00' },
          thursday: { start: '10:00', end: '18:00' },
          friday: { start: '10:00', end: '18:00' },
          saturday: { start: '10:00', end: '16:00' }
        }
      }
    ];
  }
};

export default mockSalonService;
