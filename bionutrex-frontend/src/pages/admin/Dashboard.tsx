import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Eye,
  Calendar,
  Activity,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend: string;
  trendDirection: "up" | "down";
}

const statsData: StatCard[] = [
  {
    title: "Visitantes Totales",
    value: "12,345",
    icon: Users,
    trend: "+12.5%",
    trendDirection: "up",
  },
  {
    title: "Posts del Blog",
    value: "24",
    icon: FileText,
    trend: "+3",
    trendDirection: "up",
  },
  {
    title: "Páginas Vistas",
    value: "45,678",
    icon: Eye,
    trend: "+8.2%",
    trendDirection: "up",
  },
  {
    title: "Sesiones Activas",
    value: "156",
    icon: Activity,
    trend: "-2.1%",
    trendDirection: "down",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Nuevo post publicado: 'Beneficios de los Omega-3'",
    timestamp: "Hace 2 horas",
  },
  {
    id: 2,
    action: "Sección de metodología actualizada",
    timestamp: "Hace 4 horas",
  },
  {
    id: 3,
    action: "Nueva imagen agregada al slider principal",
    timestamp: "Hace 1 día",
  },
  {
    id: 4,
    action: "Usuario admin 'Dr. Martinez' conectado",
    timestamp: "Hace 2 días",
  },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido al panel de administración de BioNutrex
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {currentTime.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-[#0d40a5]/10 rounded-lg">
                  <Icon className="w-6 h-6 text-[#0d40a5]" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp
                  className={`w-4 h-4 ${
                    stat.trendDirection === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ml-2 ${
                    stat.trendDirection === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.trend}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs mes anterior
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-[#0d40a5]" />
            <h2 className="text-xl font-semibold text-gray-900">
              Actividad Reciente
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-2 h-2 bg-[#0d40a5] rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-[#0d40a5]" />
            <h2 className="text-xl font-semibold text-gray-900">
              Acciones Rápidas
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#0d40a5] hover:bg-[#0d40a5]/5 transition-colors">
              <h3 className="font-medium text-gray-900">Crear Nuevo Post</h3>
              <p className="text-sm text-gray-600 mt-1">
                Agregar un nuevo artículo al blog
              </p>
            </button>
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#0d40a5] hover:bg-[#0d40a5]/5 transition-colors">
              <h3 className="font-medium text-gray-900">Editar Home</h3>
              <p className="text-sm text-gray-600 mt-1">
                Modificar contenido de la página principal
              </p>
            </button>
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#0d40a5] hover:bg-[#0d40a5]/5 transition-colors">
              <h3 className="font-medium text-gray-900">Gestionar Medios</h3>
              <p className="text-sm text-gray-600 mt-1">
                Administrar imágenes y archivos
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}