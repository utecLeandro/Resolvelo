import axios from 'axios'

async function run() {
  const base = 'http://127.0.0.1:3006/api'

  const health = await axios.get(`${base}/health`).then(r => r.data)
  console.log('Health:', health)

  const login = await axios
    .post(`${base}/auth/login`, {
      email: 'maria@test.com',
      password: 'MariaTest2024!',
    })
    .then(r => r.data)

  console.log('Login OK. User:', login?.user)
  const token = login?.access_token ?? login?.token
  if (!token) throw new Error('Token no recibido')

  const api = axios.create({
    baseURL: base,
    headers: { Authorization: `Bearer ${token}` },
  })

  const publicaciones = await api.get('/publicaciones').then(r => r.data)
  const guitarra = publicaciones?.publicaciones?.find((p: any) => p.titulo?.includes('Guitarra')) ?? publicaciones?.publicaciones?.[0]
  if (!guitarra) throw new Error('No hay publicaciones disponibles')
  console.log('Usando publicacion:', guitarra.id, guitarra.titulo)

  const usuarioId = login?.user?.id
  const propietarioId = guitarra.propietarioId
  const publicacionId = guitarra.id

  const start = new Date()
  const offsetDays = 10 + Math.floor(Math.random() * 10)
  start.setDate(start.getDate() + offsetDays)
  const end = new Date(start)
  end.setDate(end.getDate() + 2)

  const dias = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const precioPorDia = guitarra.precioPorDia ?? 25
  const precioTotal = precioPorDia * dias
  const comision = +(precioTotal * 0.1).toFixed(2)

  const crearReservaBody = {
    usuarioId,
    publicacionId,
    propietarioId,
    fechaInicio: start.toISOString(),
    fechaFin: end.toISOString(),
    precioTotal,
    comisionPlataforma: comision,
    tipoEntrega: 'RETIRO',
    telefonoContacto: '+59899123456',
    notasUsuario: 'Reserva de prueba automática'
  }

  const crearReservaResp = await api
    .post('/usuarios/reservas/crear', crearReservaBody)
    .then(r => r.data)

  console.log('Reserva creada:', crearReservaResp)
  const reservaId = crearReservaResp?.data?.id ?? crearReservaResp?.reserva?.id
  if (!reservaId) throw new Error('Reserva ID no recuperado')

  const loginProp = await axios
    .post(`${base}/auth/login`, {
      email: 'juan@test.com',
      password: 'JuanTest2024!',
    })
    .then(r => r.data)
  const tokenProp = loginProp?.access_token ?? loginProp?.token
  if (!tokenProp) throw new Error('Token propietario no recibido')
  const apiProp = axios.create({ baseURL: base, headers: { Authorization: `Bearer ${tokenProp}` } })
  const aceptar = await apiProp.patch(`/usuarios/reservas/${reservaId}/aceptar`).then(r => r.data)
  console.log('Reserva aceptada por propietario:', aceptar)

  const pagoResp = await api
    .post('/transacciones/procesar-pago', { reservaId, descripcion: `Pago por reserva ${reservaId}` })
    .then(r => r.data)
  console.log('Pago procesado:', pagoResp)
}

run().catch(err => {
  console.error('E2E flow failed:', err?.response?.data ?? err)
  process.exit(1)
})