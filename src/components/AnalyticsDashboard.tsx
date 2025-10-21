import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { analyticsService, AnalyticsData } from '../services/analyticsService';
import { useToast } from '../hooks/use-toast';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Award,
  Target,
  RefreshCw
} from 'lucide-react';

interface AnalyticsDashboardProps {
  salonId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ salonId }) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [salonId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = getStartDate(dateRange);
      const data = await analyticsService.getAnalytics(salonId, startDate);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
  };

  const formatCurrency = (amount: number) => {
    return `₡${amount.toLocaleString('es-CR')}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas del Salón</h2>
          <p className="text-gray-600">Análisis de rendimiento y estadísticas</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos generados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              De 5 estrellas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Clientes atendidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Citas por Estado</CardTitle>
                <CardDescription>Distribución de citas según su estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.appointments.byStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'pending' ? 'bg-yellow-500' :
                          item.status === 'confirmed' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">{item.status}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle>Servicios Más Populares</CardTitle>
                <CardDescription>Servicios con más citas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.appointments.byService.slice(0, 5).map((item) => (
                    <div key={item.serviceName} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.serviceName}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{item.count} citas</div>
                        <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Método de Pago</CardTitle>
                <CardDescription>Distribución de ingresos según método de pago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.revenue.byPaymentMethod.map((item) => (
                    <div key={item.method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.method === 'cash' ? 'bg-green-500' :
                          item.method === 'transfer' ? 'bg-blue-500' :
                          item.method === 'stripe' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-gray-500">{item.count} pagos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
                <CardDescription>Evolución de ingresos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.revenue.monthly.slice(-6).map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.month}</span>
                      <span className="text-sm font-bold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calificaciones</CardTitle>
                <CardDescription>Distribución de estrellas en las reseñas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.reviews.ratingDistribution.map((item) => (
                    <div key={item.rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${(item.count / Math.max(...analytics.reviews.ratingDistribution.map(r => r.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferencias Más Mencionadas</CardTitle>
                <CardDescription>Lo que más les gusta a los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.reviews.topPreferences.slice(0, 8).map((item) => (
                    <div key={item.preference} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{item.preference}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Employees */}
            <Card>
              <CardHeader>
                <CardTitle>Empleados con Mejor Rendimiento</CardTitle>
                <CardDescription>Empleados con más citas y mejores calificaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.performance.topEmployees.slice(0, 5).map((item) => (
                    <div key={item.employeeName} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{item.employeeName}</div>
                        <div className="text-xs text-gray-500">{item.bookings} citas</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(item.revenue)}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
                <CardDescription>Indicadores clave de rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Retención de Clientes</span>
                    </div>
                    <span className="text-sm font-bold">{formatPercentage(analytics.performance.clientRetention)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Valor Promedio por Cita</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(analytics.performance.averageAppointmentValue)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Calificación Promedio</span>
                    </div>
                    <span className="text-sm font-bold">{analytics.reviews.averageRating}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
