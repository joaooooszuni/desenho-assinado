import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

// Para garantir o erro 405 caso utilizem métodos diferentes de POST
export async function onRequestGet() {
  return new Response("Método não permitido", { status: 405 });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 1. Validar o Corpo PRIMEIRO (Gera erro 400 se inválido)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Corpo ausente ou JSON inválido." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const numero = Number(body.numero);
    if (body.numero === undefined ||isNaN(numero) || !Number.isInteger(numero) || !numeroValido(numero)) {
      return new Response(JSON.stringify({ error: "Número ausente, não inteiro ou fora do intervalo de 1 a 100." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Validar o Token DEPOIS do corpo (Gera erro 401 se inválido/ausente)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Token ausente ou em falta." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = authHeader.split(" ")[1];

    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const googleData = await googleResponse.json();

    if (!googleResponse.ok || !googleData.email || (googleData.email_verified !== "true" && googleData.email_verified !== true)) {
      return new Response(JSON.stringify({ error: "Token do Google inválido, expirado ou e-mail não verificado." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verificar se o Client ID coincide (deve retornar 401 segundo a tabela)
    if (env.GOOGLE_CLIENT_ID && googleData.aud !== env.GOOGLE_CLIENT_ID) {
      return new Response(JSON.stringify({ error: "Client ID (aud) inválido." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const emailUtilizador = googleData.email;

    // 3. Gerar o desenho e retornar o 200 com o SVG puro e o Content-Type correto
    const svgGerado = gerarDesenho(numero, emailUtilizador);

    return new Response(svgGerado, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno no servidor: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}