/* ==========================================================================
   DONA BELEZA ESTÉTICA — scripts do site
   ========================================================================== */

/* ▼▼▼ EDITE AQUI ▼▼▼
   Número do WhatsApp só com dígitos: 55 + DDD + número. Ex.: "5511987654321" */
const WHATSAPP_NUMERO = "5511996035868"; /* +55 11 99603-5868 */
const WHATSAPP_MENSAGEM = "Olá! Vim pelo site da Dona Beleza e gostaria de agendar uma avaliação.";
/* RESULTADOS (seção "Resultados reais, com naturalidade")
   Cada caso usa 3 fotos em imagens/resultados/:
     <arquivo>-antes.jpg · <arquivo>-depois.jpg · <arquivo>-antes-depois.jpg (tela cheia)
   Para trocar um caso, basta mudar o "arquivo" (e o título/descrição).
   - titulo ........ nome do tratamento (aparece em Playfair abaixo da foto)
   - descricao ..... uma linha sobre o caso
   - regiao ........ usado no texto alternativo (acessibilidade)
   - enquadramento . qual parte da foto aparece no card ("horizontal vertical"), igual no antes e no depois
   - largo ......... true = card ocupa 2 colunas no computador (bom para fotos bem horizontais, como lábios)
   Casos guardados na pasta e não exibidos: labios-frontal, rosto-perfil, labios-perfil (só "antes"). */
const CASOS_RESULTADOS = [
  { arquivo: "labios",          titulo: "Lábios",           descricao: "Preenchimento labial para mais contorno, volume equilibrado e hidratação, sem perder a naturalidade da boca.", regiao: "lábios em close, vista frontal",         enquadramento: "50% 50%", largo: true },
  { arquivo: "abdomen",         titulo: "Abdômen",          descricao: "Protocolo corporal para redução de medidas e melhora da firmeza na região do abdômen.", regiao: "abdômen, vista frontal",                 enquadramento: "50% 50%" },
  { arquivo: "contorno-facial", titulo: "Contorno facial",  descricao: "Tratamento para flacidez do rosto, com melhora do contorno da mandíbula e do pescoço.", regiao: "rosto de perfil, mandíbula e pescoço",   enquadramento: "50% 72%" },
  { arquivo: "braco",           titulo: "Braços",           descricao: "Tratamento para flacidez na parte de trás dos braços, deixando a pele mais firme e uniforme.", regiao: "parte de trás do braço, vista lateral",  enquadramento: "50% 50%" },
  { arquivo: "costas",          titulo: "Costas e flancos", descricao: "Protocolo corporal para costas e flancos, com redução de medidas e melhora do contorno.", regiao: "costas e flancos, vista de trás",        enquadramento: "50% 50%" }
];
/* ▲▲▲ EDITE AQUI ▲▲▲ */

(function () {
  "use strict";

  /* ---------- Resultados: cards com comparador antes/depois ---------- */
  const PASTA_RESULTADOS = "imagens/resultados/";
  const grade = document.getElementById("resultados-grade");
  const lightbox = document.getElementById("lightbox");

  function abrirLightbox(caso) {
    const img = lightbox.querySelector(".lightbox__img");
    img.src = PASTA_RESULTADOS + caso.arquivo + "-antes-depois.jpg";
    img.alt = "Antes e depois: " + caso.regiao;
    lightbox.querySelector(".lightbox__legenda").textContent = caso.titulo;
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
  }

  function fecharLightbox() {
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
  }

  if (lightbox) {
    lightbox.querySelector(".lightbox__fechar").addEventListener("click", fecharLightbox);
    /* clique fora da foto fecha */
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) fecharLightbox();
    });
  }

  function criarCaso(caso) {
    const base = PASTA_RESULTADOS + caso.arquivo;
    const li = document.createElement("li");
    li.className = "reveal" + (caso.largo ? " caso--largo" : "");
    li.innerHTML =
      '<article class="caso">' +
        '<div class="comparador" style="--pos:50%;--enquadramento:' + caso.enquadramento + '">' +
          '<img class="comparador__img" src="' + base + '-depois.jpg" alt="Depois do tratamento: ' + caso.regiao + '" loading="lazy" draggable="false">' +
          '<div class="comparador__antes"><img class="comparador__img" src="' + base + '-antes.jpg" alt="Antes do tratamento: ' + caso.regiao + '" loading="lazy" draggable="false"></div>' +
          '<span class="comparador__rotulo comparador__rotulo--antes" aria-hidden="true">Antes</span>' +
          '<span class="comparador__rotulo comparador__rotulo--depois" aria-hidden="true">Depois</span>' +
          '<div class="comparador__linha" aria-hidden="true"></div>' +
          '<div class="comparador__botao" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="Arraste para comparar antes e depois: ' + caso.titulo + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</div>' +
          '<button class="comparador__ampliar" type="button" aria-label="Ver antes e depois de ' + caso.titulo + ' em tela cheia"><svg aria-hidden="true"><use href="#i-ampliar"/></svg></button>' +
        '</div>' +
        '<h3 class="caso__titulo">' + caso.titulo + '</h3>' +
        '<p class="caso__descricao">' + caso.descricao + '</p>' +
      '</article>';

    const comparador = li.querySelector(".comparador");
    const botao = li.querySelector(".comparador__botao");
    let pos = 50;

    function definirPosicao(valor) {
      pos = Math.max(0, Math.min(100, valor));
      comparador.style.setProperty("--pos", pos + "%");
      botao.setAttribute("aria-valuenow", String(Math.round(pos)));
      botao.setAttribute("aria-valuetext", Math.round(pos) + "% antes, " + Math.round(100 - pos) + "% depois");
    }

    function posicaoDoPonteiro(e) {
      const r = comparador.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }

    /* Arrastar com mouse ou dedo; um toque/clique sem arrastar abre a tela cheia */
    let ponteiro = null;
    comparador.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.target.closest(".comparador__ampliar")) return;
      ponteiro = { id: e.pointerId, x: e.clientX, y: e.clientY, arrastando: false, noBotao: !!e.target.closest(".comparador__botao") };
      comparador.setPointerCapture(e.pointerId);
    });
    comparador.addEventListener("pointermove", function (e) {
      if (!ponteiro || e.pointerId !== ponteiro.id) return;
      if (!ponteiro.arrastando && Math.abs(e.clientX - ponteiro.x) > 4) {
        ponteiro.arrastando = true;
        comparador.classList.add("arrastando");
      }
      if (ponteiro.arrastando) definirPosicao(posicaoDoPonteiro(e));
    });
    comparador.addEventListener("pointerup", function (e) {
      if (!ponteiro || e.pointerId !== ponteiro.id) return;
      const foiToque = !ponteiro.arrastando && !ponteiro.noBotao;
      ponteiro = null;
      comparador.classList.remove("arrastando");
      if (foiToque) abrirLightbox(caso);
    });
    comparador.addEventListener("pointercancel", function () {
      ponteiro = null;
      comparador.classList.remove("arrastando");
    });

    /* Teclado: setas, Home e End no botão do meio */
    botao.addEventListener("keydown", function (e) {
      const passos = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
      if (e.key in passos) definirPosicao(pos + passos[e.key]);
      else if (e.key === "Home") definirPosicao(0);
      else if (e.key === "End") definirPosicao(100);
      else return;
      e.preventDefault();
    });

    li.querySelector(".comparador__ampliar").addEventListener("click", function () { abrirLightbox(caso); });
    definirPosicao(50);
    return li;
  }

  if (grade) {
    CASOS_RESULTADOS.forEach(function (caso) { grade.appendChild(criarCaso(caso)); });
  }

  /* WhatsApp: todo link com o atributo data-whatsapp abre a conversa */
  const numeroValido = /^\d{12,13}$/.test(WHATSAPP_NUMERO);
  if (numeroValido) {
    const url = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(WHATSAPP_MENSAGEM);
    document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
    });
  } else {
    console.warn("Dona Beleza: configure WHATSAPP_NUMERO em js/main.js. Até lá, os botões levam à seção de contato.");
  }

  /* Menu hambúrguer */
  const menu = document.getElementById("menu");
  const botaoMenu = menu.querySelector(".menu__hamburguer");

  function fecharMenu() {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  }

  botaoMenu.addEventListener("click", function () {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  menu.querySelectorAll(".menu__nav a").forEach(function (link) {
    link.addEventListener("click", fecharMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharMenu();
  });
  document.addEventListener("click", function (e) {
    if (!menu.contains(e.target)) fecharMenu();
  });

  /* Elementos aparecem com fade + leve subida ao rolar */
  const revelar = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revelar.forEach(function (el) {
      /* pequeno atraso em cascata para itens irmãos de uma grade */
      if (el.tagName === "LI") {
        const indice = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = (indice * 0.08) + "s";
      }
      observador.observe(el);
    });
  } else {
    revelar.forEach(function (el) { el.classList.add("visivel"); });
  }

  /* Ano atual no rodapé */
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
