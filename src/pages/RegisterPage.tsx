import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { salonService } from '../services/api';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    salonId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salons, setSalons] = useState<any[]>([]);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load available salons
    const loadSalons = async () => {
      try {
        const salonData = await salonService.getSalons();
        setSalons(salonData);
      } catch (err) {
        console.error('Error loading salons:', err);
      }
    };
    loadSalons();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        salonId: formData.salonId
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">DataSalon</h1>
          <h2 className="text-3xl font-bold text-white">Crear Cuenta</h2>
          <p className="mt-2 text-gray-400">
            Únete a nuestra comunidad de salones
          </p>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                    placeholder="Juan"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono (Opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="salonId" className="block text-sm font-medium text-gray-300 mb-2">
                Seleccionar Salón
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="salonId"
                  name="salonId"
                  required
                  value={formData.salonId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors appearance-none"
                >
                  <option value="">Selecciona un salón</option>
                  {salons.map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                Acepto los{' '}
                <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  términos y condiciones
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
