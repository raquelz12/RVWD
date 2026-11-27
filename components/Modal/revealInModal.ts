interface RevealOptions {
  /** Animación suave */
  smooth?: boolean;
  /** 'nearest': lo justo para que se vea (por defecto). 'start': lo deja arriba de la zona visible,
      para dejar el máximo sitio a lo que hay debajo (p. ej. los resultados de un buscador) */
  align?: 'nearest' | 'start';
  /** Que el campo con el foco siga a la vista. Safari, con cada tecla, vuelve a desplazar el panel
      hasta el campo en el que se escribe: si se ha quedado fuera, deshace el desplazamiento */
  keepFocused?: boolean;
}

/* Desplaza solo el contenido del modal para que se vea el elemento.
   No se usa scrollIntoView porque mueve también la página, aunque esté bloqueada:
   en Safari de iPhone, con el teclado abierto, sube la vista por encima de la barra de direcciones */
export function revealInModal(element: HTMLElement, { smooth = false, align = 'nearest', keepFocused = false }: RevealOptions = {}) {
  const panel = element.closest<HTMLElement>('.modal-content');
  if (!panel) return;

  const margin = 16;
  const el = element.getBoundingClientRect();
  const box = panel.getBoundingClientRect();

  // En móvil el panel puede seguir por detrás del teclado (Android): esa parte no se ve.
  // Se resta lo que tapa el teclado (--keyboard-inset, lo pone Modal.tsx en el fondo del modal).
  // No se mezcla con visualViewport: Safari da las posiciones respecto a la zona visible y
  // visualViewport.offsetTop respecto a la página, y la cuenta sale mal
  const overlay = panel.closest<HTMLElement>('.modal-overlay');
  const keyboardInset = overlay ? parseFloat(overlay.style.getPropertyValue('--keyboard-inset')) || 0 : 0;
  const visibleTop = box.top;
  const visibleBottom = box.bottom - keyboardInset;

  let delta: number;
  if (align === 'start') {
    delta = el.top - visibleTop - margin;
  } else {
    // Con keepFocused se enseña a la vez el elemento y el campo con el foco
    const active = document.activeElement;
    const focused = keepFocused && active instanceof HTMLElement && active !== element
      && active.matches('input, textarea') && panel.contains(active)
      ? active.getBoundingClientRect()
      : null;
    const top = focused ? Math.min(el.top, focused.top) : el.top;
    const bottom = focused ? Math.max(el.bottom, focused.bottom) : el.bottom;

    if (bottom - top > visibleBottom - visibleTop - 2 * margin) {
      // No cabe todo: arriba lo que manda (el campo con el foco o, si no, el principio del elemento)
      delta = (focused ? focused.top : el.top) - visibleTop - margin;
    } else if (bottom > visibleBottom - margin) {
      // Se sale por abajo: se baja lo justo
      delta = bottom - visibleBottom + margin;
    } else if (top < visibleTop + margin) {
      // Se sale por arriba: se sube lo justo
      delta = top - visibleTop - margin;
    } else {
      delta = 0;
    }
  }

  if (delta !== 0) panel.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
}
