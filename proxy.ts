import { NextRequest, NextResponse } from 'next/server'

// Rotas públicas que não requerem autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/landing',
  '/menu',
  '/pagamento',
  '/pagamento/sucesso',
  '/pagamento/cancelado',
  '/pedido',
  '/super-admin',
  '/demo',
  '/ia-demo',
  '/tracking',
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Permitir rotas públicas sem token
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar token para rotas protegidas
  const token = request.cookies.get('token')?.value || null

  if (!token) {
    // Redirecionar para login se não houver token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continuar para a rota protegida
  return NextResponse.next()
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Exclui arquivos estáticos, APIs e assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|demo-assets|.*\\..*).*)',
  ],
}