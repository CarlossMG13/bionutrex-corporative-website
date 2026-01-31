import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  User,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Settings,
  Key,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
  avatar?: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Dr. Angela Santos",
    email: "angela@bionutrex.com",
    role: "super_admin",
    status: "active",
    avatar: "/api/placeholder/40/40",
    lastLogin: "2024-01-30T14:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    permissions: ["all"],
  },
  {
    id: "2",
    name: "Dr. Carlos Rodriguez",
    email: "carlos@bionutrex.com",
    role: "admin",
    status: "active",
    avatar: "/api/placeholder/40/40",
    lastLogin: "2024-01-29T09:15:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    permissions: ["content_edit", "user_view", "media_manage"],
  },
  {
    id: "3",
    name: "María González",
    email: "maria@bionutrex.com",
    role: "editor",
    status: "active",
    lastLogin: "2024-01-30T11:20:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    permissions: ["content_edit", "media_view"],
  },
  {
    id: "4",
    name: "Pedro Martinez",
    email: "pedro@bionutrex.com",
    role: "viewer",
    status: "pending",
    lastLogin: "2024-01-30T11:20:00Z",
    createdAt: "2024-01-28T00:00:00Z",
    permissions: ["content_view"],
  },
];

const roleConfig = {
  super_admin: {
    label: "Super Admin",
    color: "bg-red-100 text-red-800",
    description: "Acceso total al sistema",
  },
  admin: {
    label: "Administrador",
    color: "bg-purple-100 text-purple-800",
    description: "Gestión de contenido y usuarios",
  },
  editor: {
    label: "Editor",
    color: "bg-blue-100 text-blue-800",
    description: "Edición de contenido",
  },
  viewer: {
    label: "Visualizador",
    color: "bg-gray-100 text-gray-800",
    description: "Solo lectura",
  },
};

const statusConfig = {
  active: {
    label: "Activo",
    color: "bg-green-100 text-green-800",
    icon: UserCheck,
  },
  inactive: {
    label: "Inactivo",
    color: "bg-red-100 text-red-800",
    icon: UserX,
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: User,
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "todos" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "todos" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    return date.toLocaleDateString();
  };

  const handleStatusChange = (userId: string, newStatus: User["status"]) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user,
      ),
    );
  };

  const handleRoleChange = (userId: string, newRole: User["role"]) => {
    const permissionsByRole = {
      super_admin: ["all"],
      admin: ["content_edit", "user_view", "media_manage"],
      editor: ["content_edit", "media_view"],
      viewer: ["content_view"],
    };

    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              role: newRole,
              permissions: permissionsByRole[newRole],
            }
          : user,
      ),
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>{" "}
              <p className="text-2xl font-bold text-gray-900">
                {users.length}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 bg-green-100 rounded-lg">
              {" "}
              <UserCheck className="w-5 h-5 text-green-600" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm text-gray-600">Usuarios Activos</p>{" "}
              <p className="text-2xl font-bold text-gray-900">
                {" "}
                {users.filter((u) => u.status === "active").length}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 bg-purple-100 rounded-lg">
              {" "}
              <Shield className="w-5 h-5 text-purple-600" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm text-gray-600">Administradores</p>{" "}
              <p className="text-2xl font-bold text-gray-900">
                {" "}
                {
                  users.filter(
                    (u) => u.role === "admin" || u.role === "super_admin",
                  ).length
                }{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 bg-yellow-100 rounded-lg">
              {" "}
              <UserX className="w-5 h-5 text-yellow-600" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm text-gray-600">Pendientes</p>{" "}
              <p className="text-2xl font-bold text-gray-900">
                {" "}
                {users.filter((u) => u.status === "pending").length}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Search and Filters */}{" "}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {" "}
        <div className="flex flex-col sm:flex-row gap-4">
          {" "}
          <div className="flex-1 relative">
            {" "}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />{" "}
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            />{" "}
          </div>{" "}
          <div className="flex gap-2">
            {" "}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            >
              {" "}
              <option value="todos">Todos los roles</option>{" "}
              <option value="super_admin">Super Admin</option>{" "}
              <option value="admin">Admin</option>{" "}
              <option value="editor">Editor</option>{" "}
              <option value="viewer">Viewer</option>{" "}
            </select>{" "}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            >
              {" "}
              <option value="todos">Todos los estados</option>{" "}
              <option value="active">Activo</option>{" "}
              <option value="inactive">Inactivo</option>{" "}
              <option value="pending">Pendiente</option>{" "}
            </select>{" "}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              {" "}
              <Filter className="w-4 h-4" /> Filtros{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Users List */}{" "}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="w-full">
            {" "}
            <thead className="bg-gray-50 border-b">
              {" "}
              <tr>
                {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  Usuario{" "}
                </th>{" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  Rol{" "}
                </th>{" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  Estado{" "}
                </th>{" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  Último Acceso{" "}
                </th>{" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  Fecha Registro{" "}
                </th>{" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  Acciones{" "}
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="bg-white divide-y divide-gray-200">
              {" "}
              {filteredUsers.map((user) => {
                const StatusIcon = statusConfig[user.status].icon;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                          {" "}
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#0d40a5] flex items-center justify-center text-white font-semibold">
                              {" "}
                              {user.name.charAt(0).toUpperCase()}{" "}
                            </div>
                          )}{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>{" "}
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            {" "}
                            <Mail className="w-3 h-3" /> {user.email}{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {" "}
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as User["role"],
                          )
                        }
                        className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-[#0d40a5] ${roleConfig[user.role].color}`}
                      >
                        {" "}
                        <option value="super_admin">Super Admin</option>{" "}
                        <option value="admin">Admin</option>{" "}
                        <option value="editor">Editor</option>{" "}
                        <option value="viewer">Viewer</option>{" "}
                      </select>{" "}
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <StatusIcon className="w-4 h-4" />{" "}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusConfig[user.status].color}`}
                        >
                          {" "}
                          {statusConfig[user.status].label}{" "}
                        </span>{" "}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {" "}
                      <div className="flex items-center gap-1">
                        {" "}
                        <Calendar className="w-3 h-3" />{" "}
                        {user.lastLogin
                          ? formatLastLogin(user.lastLogin)
                          : "Nunca"}{" "}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {" "}
                      {new Date(user.createdAt).toLocaleDateString()}{" "}
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {" "}
                      <div className="flex gap-1">
                        {" "}
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          {" "}
                          <Eye className="w-4 h-4" />{" "}
                        </button>{" "}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar usuario"
                        >
                          {" "}
                          <Edit className="w-4 h-4" />{" "}
                        </button>{" "}
                        <button
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Gestionar permisos"
                        >
                          {" "}
                          <Key className="w-4 h-4" />{" "}
                        </button>{" "}
                        <button
                          className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Configuración"
                        >
                          {" "}
                          <Settings className="w-4 h-4" />{" "}
                        </button>{" "}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar usuario"
                        >
                          {" "}
                          <Trash2 className="w-4 h-4" />{" "}
                        </button>{" "}
                      </div>{" "}
                    </td>{" "}
                  </tr>
                );
              })}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
      {/* Empty State */}{" "}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          {" "}
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />{" "}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {" "}
            No se encontraron usuarios{" "}
          </h3>{" "}
          <p className="text-gray-600 mb-4">
            {" "}
            Intenta ajustar los filtros o crea un nuevo usuario{" "}
          </p>{" "}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
          >
            {" "}
            <Plus className="w-4 h-4" /> Crear Usuario{" "}
          </button>{" "}
        </div>
      )}{" "}
      {/* Add User Modal */}{" "}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {" "}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {" "}
            <div className="p-6">
              {" "}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {" "}
                Nuevo Usuario{" "}
              </h2>{" "}
              <form className="space-y-4">
                {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Nombre Completo{" "}
                    </label>{" "}
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                      placeholder="Dr. Juan Pérez"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Correo Electrónico{" "}
                    </label>{" "}
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                      placeholder="juan@bionutrex.com"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Rol{" "}
                    </label>{" "}
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]">
                      {" "}
                      <option value="viewer">Visualizador</option>{" "}
                      <option value="editor">Editor</option>{" "}
                      <option value="admin">Administrador</option>{" "}
                      <option value="super_admin">Super Admin</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Estado{" "}
                    </label>{" "}
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]">
                      {" "}
                      <option value="pending">Pendiente</option>{" "}
                      <option value="active">Activo</option>{" "}
                      <option value="inactive">Inactivo</option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {" "}
                    Contraseña Temporal{" "}
                  </label>{" "}
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                    placeholder="Se enviará por correo si se deja vacío"
                  />{" "}
                </div>{" "}
              </form>{" "}
              <div className="flex justify-end gap-3 mt-6">
                {" "}
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {" "}
                  Cancelar{" "}
                </button>{" "}
                <button className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
                  {" "}
                  Crear Usuario{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Edit User Modal */}{" "}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {" "}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {" "}
            <div className="p-6">
              {" "}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {" "}
                Editar Usuario: {editingUser.name}{" "}
              </h2>{" "}
              <form className="space-y-4">
                {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Nombre Completo{" "}
                    </label>{" "}
                    <input
                      type="text"
                      defaultValue={editingUser.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Correo Electrónico{" "}
                    </label>{" "}
                    <input
                      type="email"
                      defaultValue={editingUser.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Rol{" "}
                    </label>{" "}
                    <select
                      defaultValue={editingUser.role}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                    >
                      {" "}
                      <option value="viewer">Visualizador</option>{" "}
                      <option value="editor">Editor</option>{" "}
                      <option value="admin">Administrador</option>{" "}
                      <option value="super_admin">Super Admin</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {" "}
                      Estado{" "}
                    </label>{" "}
                    <select
                      defaultValue={editingUser.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                    >
                      {" "}
                      <option value="pending">Pendiente</option>{" "}
                      <option value="active">Activo</option>{" "}
                      <option value="inactive">Inactivo</option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {" "}
                    Permisos{" "}
                  </label>{" "}
                  <div className="space-y-2">
                    {" "}
                    {[
                      "content_view",
                      "content_edit",
                      "media_view",
                      "media_manage",
                      "user_view",
                      "user_edit",
                    ].map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-2"
                      >
                        {" "}
                        <input
                          type="checkbox"
                          defaultChecked={editingUser.permissions.includes(
                            permission,
                          )}
                          className="rounded border-gray-300 text-[#0d40a5] focus:ring-[#0d40a5]"
                        />{" "}
                        <span className="text-sm text-gray-700 capitalize">
                          {" "}
                          {permission.replace("_", " ")}{" "}
                        </span>{" "}
                      </label>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
              </form>{" "}
              <div className="flex justify-end gap-3 mt-6">
                {" "}
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {" "}
                  Cancelar{" "}
                </button>{" "}
                <button className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
                  {" "}
                  Guardar Cambios{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
