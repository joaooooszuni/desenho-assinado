// script.js (Versão com Servidor e Google OAuth)

import { numeroValido } from "../lib/desenho.js"; // Ou mantenha o import conforme a localização da lib

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  // Verificar se o utilizador fez login com o Google
  if (!window.userGoogleToken) {
    mensagem.textContent = "Por favor, faça login com a sua conta Google primeiro.";
    mensagem.style.color = "red";
    return;
  }

  if (!numeroValido(numero)) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    mensagem.style.color = "red";
    return;
  }

  try {
    mensagem.textContent = "A gerar desenho no servidor...";
    mensagem.style.color = "blue";

    // Enviar o número e o token do Google para a Cloudflare Function (/api)
    const resposta = await fetch('/api/desenho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + window.userGoogleToken
      },
      body: JSON.stringify({ numero: numero })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.error || "Erro ao processar no servidor.");
    }

    // Exibir o desenho retornado pelo servidor
    svgAtual = resultado.svg;
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
    mensagem.textContent = "Desenho gerado e assinado com sucesso pelo servidor!";
    mensagem.style.color = "green";

  } catch (erro) {
    mensagem.textContent = "Erro: " + erro.message;
    mensagem.style.color = "red";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "desenho-assinado.svg";
  link.click();
  URL.revokeObjectURL(url);
});