const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/B4GDPAJG8E';
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const safe = fn => { try { fn(); } catch (e) { console.error(e); } };
  const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // ticket: жалоба -> что делаем -> цена
  safe(() => {
    const data = [
      ['Ноутбук тормозит и шумит', 'Чистка от пыли и замена термопасты', 'от 1 500 ₽'],
      ['Телевизор не находит приложения', 'Настройка Smart TV и приставки', 'от 1 000 ₽'],
      ['Интернет есть, Wi-Fi не ловит', 'Настройка роутера и VPN', 'от 1 500 ₽'],
      ['Компьютер завис на загрузке Windows', 'Установка Windows и программ', 'от 1 000 ₽']
    ];
    const c = $('#tComplaint'), f = $('#tFix'), p = $('#tPrice'), dots = $$('#tDots i'), stamp = $('#stamp'), no = $('#tNo');
    let i = 0;
    const show = () => {
      const d = data[i];
      c.textContent = d[0]; f.textContent = d[1]; p.textContent = d[2];
      dots.forEach((x, k) => x.classList.toggle('on', k === i));
      no.textContent = '№ ' + String(412 + i).padStart(4, '0');
      stamp.classList.add('pop'); setTimeout(() => stamp.classList.remove('pop'), 500);
    };
    if (reduce) return;
    setInterval(() => {
      if (document.hidden) return;
      const dd = [c, f];
      dd.forEach(e => e.classList.add('swap'));
      setTimeout(() => { i = (i + 1) % data.length; show(); dd.forEach(e => e.classList.remove('swap')); }, 350);
    }, 4200);
    // лёгкий наклон за курсором
    const t = $('#ticket');
    if (matchMedia('(pointer:fine)').matches) {
      addEventListener('pointermove', e => {
        const x = (e.clientX / innerWidth - .5), yy = (e.clientY / innerHeight - .5);
        t.style.transform = `rotate(${1.6 + x * 3}deg) translate(${x * 8}px,${yy * 8}px)`;
      }, { passive: true });
    }
  });

  // scene: день мастера
  safe(() => {
    const sec = $('#day'), route = $('#route'), van = $('#van');
    if (!sec || !route) return;
    const L = route.getTotalLength();
    route.style.strokeDasharray = L;
    const steps = [
      ['10:05', 'Заявка', 'Вы оставили заявку или написали. Мастер уточняет, что случилось, и называет ориентир по цене.'],
      ['10:25', 'Выезд', 'Мастер выезжает к вам по городу. Выезд бесплатный, если продолжаем работу, иначе 500–1 000 ₽: скажем заранее.'],
      ['12:00', 'На месте', 'Смотрим технику при вас и называем итоговую цену до начала работ. Не подошло — не начинаем.'],
      ['13:00', 'Готово', 'Техника работает. Оплата сразу после результата, прямо на месте.']
    ];
    const T = $('#clockT'), Lb = $('#clockL'), X = $('#dayTxt'), dots = $$('#dayDots li');
    let cur = -1;
    const setStep = k => {
      if (k === cur) return; cur = k;
      T.textContent = steps[k][0]; Lb.textContent = steps[k][1]; X.textContent = steps[k][2];
      dots.forEach((d, n) => d.classList.toggle('on', n === k));
    };
    let tick = false;
    const update = () => {
      tick = false;
      const r = sec.getBoundingClientRect();
      const total = sec.offsetHeight - innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / total));
      const dist = p * L;
      route.style.strokeDashoffset = L - dist;
      const pt = route.getPointAtLength(dist);
      van.setAttribute('transform', `translate(${pt.x},${pt.y})`);
      setStep(Math.min(3, Math.floor(p * 4 - 0.0001 + (p >= 1 ? 0 : 0))));
      // минуты бегут внутри шага
      const mins = Math.round(5 + p * 175);
      if (cur < 3) T.textContent = String(10 + Math.floor((mins + 0) / 60)).padStart(2, '0') + ':' + String((mins) % 60 + 0).padStart(2, '0');
    };
    const on = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    update();
  });

  // calc
  safe(() => {
    const chips = $$('#pick .chip'), list = $('#rList'), visit = $('#rVisit'), total = $('#rTotal'), go = $('#rGo'), note = $('#rNote');
    let shown = 0, raf;
    const tween = to => {
      cancelAnimationFrame(raf);
      const from = shown, t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / (reduce ? 1 : 450));
        shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
        total.textContent = rub(shown);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const render = () => {
      const on = chips.filter(c => c.getAttribute('aria-pressed') === 'true');
      list.textContent = '';
      if (!on.length) {
        const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Пока ничего не выбрано'; list.append(li);
        visit.textContent = '—';
      } else {
        on.forEach(c => {
          const li = document.createElement('li');
          const a = document.createElement('span'), b = document.createElement('b');
          a.textContent = c.dataset.n; b.textContent = (c.dataset.extra ? 'от ' : 'от ') + rub(+c.dataset.p).replace(' ₽', ' ₽') + (c.dataset.extra ? ' + детали' : '');
          li.append(a, b); list.append(li);
        });
        visit.textContent = 'бесплатно';
      }
      const sum = on.reduce((s, c) => s + +c.dataset.p, 0);
      tween(sum);
      note.textContent = on.some(c => c.dataset.extra)
        ? 'Комплектующие (SSD, память) оплачиваются отдельно, цену назовём до покупки. Выезд бесплатный, если продолжаем работу.'
        : 'Выезд бесплатный, если мы продолжаем работу. Если после осмотра работу не начинаем — выезд 500–1 000 ₽ по ситуации.';
      go.dataset.sel = on.map(c => c.dataset.n).join('; ');
    };
    chips.forEach(c => { c.setAttribute('aria-pressed', 'false'); c.addEventListener('click', () => { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); render(); }); });
    go.addEventListener('click', () => {
      const t = go.dataset.sel, f = $('#leadForm textarea');
      if (t && f && !f.value) f.value = 'Нужно: ' + t;
    });
    render();
  });

  // devices tabs
  safe(() => {
    const D = [
      { t: 'Тормозит, шумит, не включается', p: 'от 1 000 ₽', n: 'Диагностика и мелкий ремонт — от 1 000 ₽. Чистка с заменой термопасты — от 1 500 ₽. Апгрейд — от 2 000 ₽ плюс комплектующие.', l: ['Диагностика на месте и мелкий ремонт', 'Чистка ноутбука и замена термопасты', 'Установка Windows и базовых программ', 'Апгрейд: SSD и оперативная память', 'Комплексная настройка компьютера или ноутбука'] },
      { t: 'Нет приложений, не работает приставка', p: 'от 1 000 ₽', n: 'Настройка телевизора, приставки и Smart TV — от 1 000 ₽.', l: ['Настройка Smart TV и подключение к интернету', 'Настройка приставок и приложений', 'Подключение и настройка каналов', 'Объясним, как пользоваться, чтобы не звонить снова'] },
      { t: 'Wi-Fi не ловит, интернет пропадает', p: 'от 1 500 ₽', n: 'Настройка роутера и VPN — от 1 500 ₽.', l: ['Настройка и замена роутера', 'Wi-Fi по всей квартире или офису', 'Настройка VPN', 'Подключение техники к сети'] },
      { t: 'Принтер не печатает, телефон глючит', p: 'от 1 000 ₽', n: 'Диагностика и мелкий ремонт — от 1 000 ₽. Точную цену назовём после осмотра.', l: ['Диагностика принтера и подключение к компьютеру', 'Настройка печати по Wi-Fi', 'Диагностика смартфона и мелкий ремонт', 'Настройка телефона и переезд данных'] }
    ];
    const items = $$('.tabs [data-pill-item]'), title = $('#pTitle'), ul = $('#pList'), price = $('#pPrice'), note = $('#pNote');
    const paint = k => {
      const d = D[k];
      title.textContent = d.t; price.textContent = d.p; note.textContent = d.n; ul.textContent = '';
      d.l.forEach((s, i) => { const li = document.createElement('li'); li.textContent = s; li.style.animationDelay = (i * 60) + 'ms'; ul.append(li); });
    };
    items.forEach((b, k) => b.addEventListener('click', () => { items.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); }); b.classList.add('is-active'); b.setAttribute('aria-selected', 'true'); paint(k); }));
    items[0].setAttribute('aria-selected', 'true');
    paint(0);
  });

  // phone mask
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // form -> Worker -> Telegram
  const form = $('#leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone || payload.phone.replace(/\D/g, '').length < 11) {
      btn.textContent = 'Укажите имя и телефон'; setTimeout(() => { btn.textContent = orig; }, 2500); return;
    }
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена, скоро перезвоним'; form.reset();
    } catch (err) { console.error(err); btn.textContent = 'Ошибка, попробуйте ещё раз'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500); }
  });
})();
