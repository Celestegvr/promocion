/* Página de promoción · Plataforma Cafetalera
   Navegación, animaciones, pasos, calculadora, planes en C$/US$ y formulario. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const TASA = 36.6243; // C$ por US$1, tasa de referencia del prototipo
  const fmt = (n, dec = 0) => n.toLocaleString("es-NI", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  /* ---------- Navegación ---------- */
  const nav = $("#nav"), menu = $("#navMenu"), links = $("#navLinks");
  const alDesplazar = () => nav.classList.toggle("solida", scrollY > 40);
  addEventListener("scroll", alDesplazar, { passive: true });
  alDesplazar();
  menu.addEventListener("click", () => {
    const abierto = links.classList.toggle("abierto");
    menu.setAttribute("aria-expanded", abierto);
  });
  links.addEventListener("click", e => {
    if (e.target.closest("a")) { links.classList.remove("abierto"); menu.setAttribute("aria-expanded", "false"); }
  });

  // Resalta la sección actual en el menú
  const secciones = $$(".nav-links a[href^='#']:not(.btn)").map(a => [a, $(a.getAttribute("href"))]).filter(([, s]) => s);
  const obsNav = new IntersectionObserver(ents => {
    ents.forEach(en => {
      if (!en.isIntersecting) return;
      secciones.forEach(([a, s]) => a.classList.toggle("actual", s === en.target));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secciones.forEach(([, s]) => obsNav.observe(s));

  /* ---------- Aparición y contadores ---------- */
  const obsRevela = new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visto"); obsRevela.unobserve(en.target); } });
  }, { threshold: .15 });
  $$(".revela").forEach(el => obsRevela.observe(el));

  const contar = el => {
    const fin = Number(el.dataset.contar), pre = el.dataset.pre || "", t0 = performance.now(), dur = 1400;
    const paso = t => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(fin * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + v;
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  const obsCifras = new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting) { $$("[data-contar]", en.target).forEach(contar); obsCifras.unobserve(en.target); } });
  }, { threshold: .4 });
  obsCifras.observe($(".cifras"));

  /* ---------- Cómo funciona ---------- */
  const PASOS = [
    { img: "img/app-inicio.png", alt: "Pantalla de inicio de la app de campo", titulo: "El acopiador registra la entrega",
      texto: "Elige al socio, el tipo de café, el peso y los sacos. La app descuenta la tara sola y funciona aunque no haya señal.",
      antes: "Talonario y lapicero", ahora: "Registro digital con fecha, hora y acopiador" },
    { img: "img/app-humedad.jpg", alt: "Paso de humedad en la app con el grano oro calculado", titulo: "Humedad y calidad, con la misma regla",
      texto: "Al anotar la humedad, la app muestra si el café está seco o húmedo y calcula el grano oro en el momento.",
      antes: "Calculadora y criterio de cada quien", ahora: "Cálculo automático e igual en todos los centros" },
    { img: "img/app-recibo.jpg", alt: "Recibo de acopio digital", titulo: "Recibo para el socio y copia en la oficina",
      texto: "El socio recibe su comprobante impreso o por WhatsApp. Cuando hay señal, la entrega sube sola al servidor central.",
      antes: "Recibos que se pierden o se mojan", ahora: "Recibo con número único y respaldo en la nube" },
    { img: "img/panel-resumen.png", alt: "Panel administrativo de la cooperativa", titulo: "La administración liquida en minutos",
      texto: "El panel suma las entregas de cada socio, aplica el precio de la temporada, descuenta anticipos y genera la hoja de pago en córdobas.",
      antes: "Hasta 15 días para consolidar libretas", ahora: "Liquidación lista el mismo día", ancha: true },
  ];
  const caja = $(".pasos"), botones = $$(".paso"), img = $("#pasoImg"), pantalla = $("#pasoPantalla"), texto = $("#pasoTexto");
  PASOS.forEach(p => { const i = new Image(); i.src = p.img; }); // precarga
  let actual = 0, timer = null;
  const mostrar = n => {
    actual = n;
    const p = PASOS[n];
    botones.forEach((b, i) => {
      b.classList.toggle("activo", i === n);
      b.setAttribute("aria-selected", i === n);
      // reinicia la barra de progreso
      if (i === n) { b.classList.remove("activo"); void b.offsetWidth; b.classList.add("activo"); }
    });
    pantalla.classList.toggle("ancha", !!p.ancha);
    img.src = p.img; img.alt = p.alt;
    texto.innerHTML = `<h3>${p.titulo}</h3><p>${p.texto}</p><span class="antes">${p.antes}</span><span class="ahora">${p.ahora}</span>`;
    [pantalla, texto].forEach(el => { el.classList.remove("cambia"); void el.offsetWidth; el.classList.add("cambia"); });
  };
  const programar = () => { clearInterval(timer); timer = setInterval(() => { if (!caja.classList.contains("pausa")) mostrar((actual + 1) % PASOS.length); }, 6000); };
  botones.forEach((b, i) => b.addEventListener("click", () => { mostrar(i); programar(); }));
  caja.addEventListener("mouseenter", () => caja.classList.add("pausa"));
  caja.addEventListener("mouseleave", () => caja.classList.remove("pausa"));
  mostrar(0); programar();

  /* ---------- Calculadora ---------- */
  const FACTOR = 0.80, BASE = 12; // valores de referencia del prototipo
  const cPeso = $("#cPeso"), cHum = $("#cHum"), cPrecio = $("#cPrecio");
  const calcular = () => {
    const peso = Number(cPeso.value), h = Number(cHum.value), precio = Math.max(0, Number(cPrecio.value) || 0);
    const ajuste = h > BASE ? (100 - h) / (100 - BASE) : 1;
    const oro = peso * ajuste * FACTOR, monto = oro * precio;
    $("#oPeso").textContent = fmt(peso, 1) + " qq";
    $("#oHum").textContent = fmt(h, 1) + " %";
    $("#rAjuste").textContent = h > BASE ? "−" + fmt((1 - ajuste) * 100, 2) + " %" : "Sin descuento";
    $("#rOro").textContent = fmt(oro, 2) + " qq";
    $("#rMonto").textContent = "C$" + fmt(monto, 2);
    $("#rFormula").textContent = `${fmt(peso, 1)} qq × ${h > BASE ? `(100 − ${fmt(h, 1)}) ÷ (100 − ${BASE})` : "1"} × ${FACTOR.toFixed(2)} × C$${fmt(precio)}`;
  };
  [cPeso, cHum, cPrecio].forEach(el => el.addEventListener("input", calcular));
  calcular();

  /* ---------- Planes en C$ o US$ ---------- */
  const pintarPrecios = moneda => {
    $$("[data-usd]").forEach(b => {
      const usd = Number(b.dataset.usd);
      b.textContent = moneda === "NIO" ? "C$" + fmt(Math.round(usd * TASA / 10) * 10) : "US$" + fmt(usd);
    });
    $$(".moneda button").forEach(b => { const on = b.dataset.moneda === moneda; b.classList.toggle("activo", on); b.setAttribute("aria-pressed", on); });
    $("#notaMoneda").textContent = moneda === "NIO"
      ? `Montos aproximados en córdobas a la tasa de referencia C$${TASA} por US$1. Precios propuestos con fines académicos.`
      : "Precios propuestos con fines académicos y de planificación.";
  };
  $$(".moneda button").forEach(b => b.addEventListener("click", () => pintarPrecios(b.dataset.moneda)));
  pintarPrecios("NIO");

  // Los botones de cada plan preseleccionan el plan en el formulario
  $$("[data-plan]").forEach(a => a.addEventListener("click", () => { $("#selPlan").value = a.dataset.plan; }));

  /* ---------- Formulario de demostración ---------- */
  const form = $("#formDemo"), msg = $("#formMsg");
  const telValido = t => /^[2578]\d{7}$/.test(t.replace(/[\s-]/g, "").replace(/^\+?505/, ""));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const errores = [];
    form.querySelectorAll("input").forEach(i => i.classList.remove("error"));
    if (d.nombre.trim().length < 3) { errores.push("tu nombre"); form.nombre.classList.add("error"); }
    if (d.coop.trim().length < 3) { errores.push("la cooperativa"); form.coop.classList.add("error"); }
    if (!telValido(d.tel)) { errores.push("un teléfono de Nicaragua de 8 dígitos"); form.tel.classList.add("error"); }
    if (errores.length) {
      msg.className = "form-msg mal";
      msg.textContent = "Revisa " + errores.join(", ") + ".";
      return;
    }
    msg.className = "form-msg ok";
    msg.textContent = `Gracias, ${d.nombre.trim().split(" ")[0]}. Te contactaremos para agendar la demostración del ${d.plan} para ${d.coop.trim()}.`;
    form.reset();
  });
})();
