// script.js (Versão com Servidor e Google OAuth)

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

  // Validação simples no frontend
  if (isNaN(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    mensagem.style.color = "red";
    return;
  }

  try {
    mensagem.textContent = "A gerar desenho no servidor...";
    mensagem.style.color = "blue";

    const resposta = await fetch('/api/desenho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + window.userGoogleToken
      },
      body: JSON.stringify({ numero: numero })
    });

    // Se a resposta NÃO for ok (ex: 400 ou 401), o servidor envia JSON com o erro
    if (!resposta.ok) {
      const erroJson = await resposta.json();
      throw new Error(erroJson.error || "Erro ao processar no servidor.");
    }

    // Se for sucesso (200), o servidor devolve o SVG puro em texto
    svgAtual = await resposta.text();
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
    mensagem.textContent = "Desenho gerado e assinado com sucesso pelo servidor!";
    mensagem.style.color = "green";

  } catch (erro) {
    mensagem.textContent = "Erro: " + erro.message;
    mensagem.style.color = "red";
  }
}); // <-- Corrigido aqui (fecho correto do addEventListener)

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "desenho-assinado.svg";
  link.click();
  URL.revokeObjectURL(url);
});