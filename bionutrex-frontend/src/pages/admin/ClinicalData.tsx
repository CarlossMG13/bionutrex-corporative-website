import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  BarChart3,
  Calendar,
  Users,
  FlaskConical,
  TrendingUp,
} from "lucide-react";

interface ClinicalStudy {
  id: string;
  title: string;
  product: string;
  phase: "Fase I" | "Fase II" | "Fase III" | "Completado";
  status: "En progreso" | "Pausado" | "Completado" | "Planificado";
  participants: number;
  startDate: string;
  endDate?: string;
  investigator: string;
  summary: string;
  results?: string;
  documents: string[];
}

interface ClinicalData {
  id: string;
  studyId: string;
  parameter: string;
  value: number;
  unit: string;
  normalRange: string;
  date: string;
  significance: "normal" | "elevated" | "reduced" | "critical";
}

const mockStudies: ClinicalStudy[] = [
  {
    id: "1",
    title: "Eficacia de Omega-3 en función cardiovascular",
    product: "Omega-3 Premium",
    phase: "Fase III",
    status: "En progreso",
    participants: 250,
    startDate: "2024-01-15",
    investigator: "Dr. María González",
    summary: "Estudio doble ciego para evaluar los efectos del Omega-3 en marcadores cardiovasculares",
    documents: ["protocolo.pdf", "consentimiento.pdf"],
  },
  {
    id: "2",
    title: "Biodisponibilidad de Vitamina D3 Complex",
    product: "Vitamina D3 Complex",
    phase: "Completado",
    status: "Completado",
    participants: 120,
    startDate: "2023-08-01",
    endDate: "2024-02-15",
    investigator: "Dr. Carlos Rodríguez",
    summary: "Estudio farmacocinético de absorción de vitamina D3",
    results: "Incremento del 85% en niveles séricos de 25(OH)D comparado con placebo",
    documents: ["protocolo.pdf", "resultados.pdf", "reporte_final.pdf"],
  },
];

const mockClinicalData: ClinicalData[] = [
  {
    id: "1",
    studyId: "1",
    parameter: "Colesterol LDL",
    value: 95,
    unit: "mg/dL",
    normalRange: "<100",
    date: "2024-01-30",
    significance: "normal",
  },
  {
    id: "2",
    studyId: "1",
    parameter: "Triglicéridos",
    value: 140,
    unit: "mg/dL",
    normalRange: "<150",
    date: "2024-01-30",
    significance: "normal",
  },
  {
    id: "3",
    studyId: "2",
    parameter: "25(OH)D",
    value: 45,
    unit: "ng/mL",
    normalRange: "30-50",
    date: "2024-02-15",
    significance: "normal",
  },
];

export default function ClinicalData() {
  const [studies, setStudies] = useState<ClinicalStudy[]>(mockStudies);
  const [clinicalData, setClinicalData] = useState<ClinicalData[]>(mockClinicalData);
  const [activeTab, setActiveTab] = useState<"studies" | "data">("studies");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const statusColors = {
    "En progreso": "bg-blue-100 text-blue-800",
    "Pausado": "bg-yellow-100 text-yellow-800",
    "Completado": "bg-green-100 text-green-800",
    "Planificado": "bg-gray-100 text-gray-800",
  };

  const phaseColors = {
    "Fase I": "bg-purple-100 text-purple-800",
    "Fase II": "bg-blue-100 text-blue-800",
    "Fase III": "bg-orange-100 text-orange-800",
    "Completado": "bg-green-100 text-green-800",
  };

  const significanceColors = {
    "normal": "bg-green-100 text-green-800",
    "elevated": "bg-orange-100 text-orange-800",
    "reduced": "bg-blue-100 text-blue-800",
    "critical": "bg-red-100 text-red-800",
  };

  const filteredStudies = studies.filter((study) => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "Todos" || study.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (study: ClinicalStudy) => {
    if (study.status === "Completado") return 100;
    if (study.status === "Planificado") return 0;
    
    const start = new Date(study.startDate).getTime();
    const now = new Date().getTime();
    const estimatedDuration = 365 * 24 * 60 * 60 * 1000; // 1 año estimado
    const progress = ((now - start) / estimatedDuration) * 100;
    return Math.min(Math.max(progress, 0), 90); // Máximo 90% si no está completado
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}\n      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Datos Clínicos</h1>
          <p className="text-gray-600 mt-1">
            Gestión de estudios clínicos y datos de investigación
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" />
            Importar Datos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Estudio
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FlaskConical className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estudios Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {studies.filter(s => s.status === "En progreso").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estudios Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {studies.filter(s => s.status === "Completado").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Participantes</p>
              <p className="text-2xl font-bold text-gray-900">
                {studies.reduce((acc, s) => acc + s.participants, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Datos Recolectados</p>
              <p className="text-2xl font-bold text-gray-900">{clinicalData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("studies")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "studies"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FlaskConical className="w-4 h-4 inline mr-2" />
            Estudios Clínicos
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "data"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Datos y Resultados
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar estudios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="En progreso">En progreso</option>
              <option value="Pausado">Pausado</option>
              <option value="Completado">Completado</option>
              <option value="Planificado">Planificado</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Más filtros
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "studies" && (
        <div className="space-y-4">
          {filteredStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {study.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[study.status]}`}>
                      {study.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${phaseColors[study.phase]}`}>
                      {study.phase}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{study.summary}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Producto:</span>
                      <p className="font-medium">{study.product}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Investigador:</span>
                      <p className="font-medium">{study.investigator}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Participantes:</span>
                      <p className="font-medium">{study.participants}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Inicio:</span>
                      <p className="font-medium">
                        {new Date(study.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Progreso del estudio</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(getProgressPercentage(study))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0d40a5] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(study)}%` }}
                      />
                    </div>
                  </div>

                  {/* Results */}
                  {study.results && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">Resultados:</h4>
                      <p className="text-sm text-green-800">{study.results}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Documents */}
              {study.documents.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Documentos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.documents.map((doc, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                      >
                        <FileText className="w-3 h-3" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "data" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parámetro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rango Normal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Significancia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clinicalData.map((data) => (
                  <tr key={data.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.parameter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.value} {data.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.normalRange} {data.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(data.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${significanceColors[data.significance]}`}>
                        {data.significance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeTab === "studies" && filteredStudies.length === 0 && (
        <div className="text-center py-12">
          <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron estudios
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros o crea un nuevo estudio clínico
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
            <Plus className="w-4 h-4" />
            Crear Estudio
          </button>
        </div>
      )}
    </div>
  );
}