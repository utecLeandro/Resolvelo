import api from "./api";
import type { RespuestaPublicaciones, Publicacion } from "./api";

export interface UsuarioAdminListItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "USUARIO" | "MODERADOR" | "ADMINISTRADOR" | "SUPER_ADMIN";
  activo: boolean;
  estadoVerificacion: string;
  fechaCreacion: string;
}

export interface RespuestaUsuariosAdmin {
  usuarios: UsuarioAdminListItem[];
  paginacion: {
    paginaActual: number;
    totalPaginas: number;
    totalElementos: number;
    elementosPorPagina: number;
  };
}

export const adminService = {
  async listarUsuarios(
    params: {
      pagina?: number;
      limite?: number;
      busqueda?: string;
      rol?: string;
      activo?: boolean;
    } = {},
  ): Promise<RespuestaUsuariosAdmin> {
    const searchParams = new URLSearchParams();
    if (params.pagina) searchParams.append("pagina", String(params.pagina));
    if (params.limite) searchParams.append("limite", String(params.limite));
    if (params.busqueda) searchParams.append("busqueda", params.busqueda);
    if (params.rol) searchParams.append("rol", params.rol);
    if (typeof params.activo === "boolean")
      searchParams.append("activo", params.activo ? "true" : "false");

    const qs = searchParams.toString();
    const endpoint = qs ? `/admin/usuarios?${qs}` : "/admin/usuarios";
    const response = await api.get(endpoint);
    // Validar explícitamente status
    if (response.status !== 200) {
      const mensaje =
        (response.data && (response.data.message || response.data.error)) ||
        "Error al listar usuarios";
      const err: any = new Error(mensaje);
      err.response = response;
      throw err;
    }
    return response.data;
  },

  async cambiarEstadoUsuario(
    id: string,
    activo: boolean,
    motivo?: string,
  ): Promise<{ message: string; usuario: UsuarioAdminListItem }> {
    const response = await api.patch(`/admin/usuarios/${id}/estado`, {
      activo,
      motivo,
    });
    if (response.status !== 200) {
      const mensaje =
        (response.data && (response.data.message || response.data.error)) ||
        "Error al cambiar estado del usuario";
      const err: any = new Error(mensaje);
      err.response = response;
      throw err;
    }
    return response.data;
  },

  async verificarUsuario(
    id: string,
    motivo?: string,
  ): Promise<{ message: string; usuario: UsuarioAdminListItem }> {
    const response = await api.patch(`/admin/usuarios/${id}/verificar`, {
      motivo,
    });
    if (response.status !== 200) {
      const mensaje =
        (response.data && (response.data.message || response.data.error)) ||
        "Error al verificar usuario";
      const err: any = new Error(mensaje);
      err.response = response;
      throw err;
    }
    return response.data;
  },

  // ===================== PUBLICACIONES (MODERACIÓN) =====================
  async listarPublicacionesAdmin(
    params: {
      estadoModeracion?: string;
      incluirTodosEstadosModeracion?: boolean;
      pagina?: number;
      limite?: number;
      busqueda?: string;
      categoria?: string;
      ordenarPor?: string;
      direccionOrden?: "asc" | "desc";
    } = {},
  ): Promise<RespuestaPublicaciones> {
    const searchParams = new URLSearchParams();
    if (params.estadoModeracion)
      searchParams.append("estadoModeracion", params.estadoModeracion);
    if (params.incluirTodosEstadosModeracion)
      searchParams.append("incluirTodosEstadosModeracion", "true");
    if (params.pagina) searchParams.append("pagina", String(params.pagina));
    if (params.limite) searchParams.append("limite", String(params.limite));
    if (params.busqueda) searchParams.append("busqueda", params.busqueda);
    if (params.categoria) searchParams.append("categoria", params.categoria);
    if (params.ordenarPor) searchParams.append("ordenarPor", params.ordenarPor);
    if (params.direccionOrden)
      searchParams.append("direccionOrden", params.direccionOrden);

    const qs = searchParams.toString();
    const endpoint = qs ? `/admin/publicaciones?${qs}` : "/admin/publicaciones";
    const response = await api.get(endpoint);
    if (response.status !== 200) {
      const mensaje =
        (response.data && (response.data.message || response.data.error)) ||
        "Error al listar publicaciones";
      const err: any = new Error(mensaje);
      err.response = response;
      throw err;
    }
    return response.data;
  },

  async aprobarPublicacion(
    id: string,
    comentario?: string,
  ): Promise<{ message: string; publicacion: Publicacion }> {
    const response = await api.patch(`/admin/publicaciones/${id}/aprobar`, {
      comentario,
    });
    if (response.status !== 200) {
      const mensaje =
        (response.data && (response.data.message || response.data.error)) ||
        "Error al aprobar publicación";
      const err: any = new Error(mensaje);
      err.response = response;
      throw err;
    }
    return response.data;
  },

  async rechazarPublicacion(
    id: string,
    motivo?: string,
    comentario?: string,
  ): Promise<{ message: string; publicacion: Publicacion }> {
    const response = await api.patch(`/admin/publicaciones/${id}/rechazar`, {
      motivo,
      comentario,
    });
    if (response.status !== 200) {
      const mensaje =
        (response.data && (response.data.message || response.data.error)) ||
        "Error al rechazar publicación";
      const err: any = new Error(mensaje);
      err.response = response;
      throw err;
    }
    return response.data;
  },
};

export default adminService;
