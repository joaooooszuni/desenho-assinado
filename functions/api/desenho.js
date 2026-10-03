import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 1. Verificar o cabeçalho de autorização
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Utilizador não autenticado ou token em falta." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Validar o token JWT junto da Google de forma segura no servidor
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const googleData = await googleResponse.json();

    if (!googleResponse.ok || !googleData.email) {
      return new Response(JSON.stringify({ error: "Token do Google inválido ou expirado." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Opcional: Verificar se o Client ID coincide com o configurado no Cloudflare
    if (env.GOOGLE_CLIENT_ID && googleData.aud !== env.GOOGLE_CLIENT_ID) {
      return new Response(JSON.stringify({ error: "Client ID inválido." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extrair o e-mail verificado pelo Google
    const emailUtilizador = googleData.email;

    // 3. Ler os dados enviados pelo corpo do pedido (o número)
    const body = await request.json();
    const numero = Number(body.numero);

    if (!numeroValido(numero)) {
      return new Response(JSON.stringify({ error: "Número inválido. Deve ser entre 1 e 100." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Gerar o desenho no servidor usando o e-mail verificado do Google
    const svgGerado = gerarDesenho(numero, emailUtilizador);

    // 5. Retornar o SVG com sucesso para o frontend
    return new Response(JSON.stringify({ 
      success: true, 
      svg: svgGerado,
      email: emailUtilizador 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno no servidor: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}