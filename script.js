/* ========================================================================
   航旅智省 — interactive demos & micro-interactions
   ======================================================================== */

(() => {
  'use strict';

  /* ---------- Tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach((tabGroup) => {
    const buttons = tabGroup.parentElement.querySelectorAll('.tab-btn');
    const panels = tabGroup.querySelectorAll('.tab-panel');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.target);
        if (target) target.classList.add('active');
      });
    });
  });

  /* ---------- Toast helper ---------- */
  function ensureToastStack() {
    let s = document.querySelector('.toast-stack');
    if (!s) { s = document.createElement('div'); s.className = 'toast-stack'; document.body.appendChild(s); }
    return s;
  }
  window.toast = function(msg) {
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  };

  /* ---------- Number count-up animation ---------- */
  function countUp(el, target, opts = {}) {
    const dur = opts.duration || 1400;
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    const fmt = opts.format || ((v) => Math.round(v).toLocaleString());
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const v = target * eased;
      el.textContent = isFloat ? v.toFixed(1) : fmt(v);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : fmt(target);
    }
    requestAnimationFrame(step);
  }

  // Trigger count-up for elements with data-count
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const target = parseFloat(entry.target.dataset.count);
        const fmt = entry.target.dataset.fmt;
        const opts = {};
        if (fmt === 'comma') opts.format = (v) => Math.round(v).toLocaleString();
        countUp(entry.target, target, opts);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));

  /* ---------- Hero deal rotator (index page) ---------- */
  const rotator = document.querySelector('[data-rotator]');
  if (rotator) {
    const items = [
      { route: '上海 → 东京',    desc: '¥1999 · 较30天均价低 29% · 含税', tag: '真特价' },
      { route: '北京 → 首尔',    desc: '¥1280 · 直飞往返 · 周末窗口',     tag: '常规低价' },
      { route: '广州 → 曼谷',    desc: '¥1450 · 6 天 5 晚 · 免签',         tag: '机会' },
      { route: '杭州 → 新加坡',  desc: '¥1980 · 直飞 · 含 23kg 行李',     tag: '真特价' },
      { route: '深圳 → 大阪',    desc: '¥1620 · 错峰返程 · 加托运 +¥80',  tag: '常规低价' },
    ];
    let idx = 0;
    function render() {
      const it = items[idx];
      rotator.innerHTML = `
        <div style="opacity:0;transform:translateY(8px);animation:rot-in .5s ease forwards;">
          <span class="price">${it.route}</span><br/>
          <span style="font-size:18px; font-style:normal; color:#fde4d3;">“${it.desc}”</span>
        </div>`;
      idx = (idx + 1) % items.length;
    }
    render();
    setInterval(render, 3200);
    if (!document.getElementById('rot-keyframe')) {
      const s = document.createElement('style');
      s.id = 'rot-keyframe';
      s.textContent = '@keyframes rot-in { to { opacity: 1; transform: translateY(0); } }';
      document.head.appendChild(s);
    }
  }

  /* ---------- Leaflet World Map (index page) ---------- */
  const mapContainer = document.getElementById('world-map');
  if (mapContainer && window.L) {
    const destinations = [
      { city: '东京', en: 'TOKYO',     latlng: [35.6762, 139.6503], price: 1999, days: '4天3晚', flight: '直飞', region: 'asia',   hot: true,
        desc: '低于近30天均价 29% · 含税', visa: '免签 15 天' },
      { city: '首尔', en: 'SEOUL',     latlng: [37.5665, 126.9780], price: 1280, days: '3天2晚', flight: '直飞', region: 'asia',   hot: true,
        desc: '春樱季捡漏 · 周末出发',  visa: '电子签' },
      { city: '曼谷', en: 'BANGKOK',   latlng: [13.7563, 100.5018], price: 1590, days: '5天4晚', flight: '中转', region: 'asia',
        desc: '免签 + 通宵航班便宜',     visa: '免签 30 天' },
      { city: '新加坡', en: 'SINGAPORE', latlng: [1.3521, 103.8198],  price: 1980, days: '4天3晚', flight: '直飞', region: 'asia',
        desc: '直飞 + 含 23kg 托运',     visa: '免签 30 天' },
      { city: '大阪', en: 'OSAKA',     latlng: [34.6937, 135.5023], price: 1620, days: '5天4晚', flight: '直飞', region: 'asia',
        desc: '错峰返程 · 加价含托运',   visa: '免签 15 天' },
      { city: '吉隆坡', en: 'KUALA LUMPUR', latlng: [3.1390, 101.6869], price: 1490, days: '5天4晚', flight: '直飞', region: 'asia',
        desc: '亚航大促 · 行李另购',     visa: '免签 30 天' },
      { city: '迪拜', en: 'DUBAI',     latlng: [25.2048, 55.2708],  price: 1960, days: '6天5晚', flight: '中转', region: 'mideast',
        desc: '阿航中转价 · 限时',       visa: '电子签' },
      { city: '伊斯坦布尔', en: 'ISTANBUL', latlng: [41.0082, 28.9784], price: 1990, days: '7天6晚', flight: '中转', region: 'eu',
        desc: '土航深度联程',           visa: '电子签' },
      { city: '伦敦', en: 'LONDON',    latlng: [51.5074, -0.1278],  price: 1990, days: '6天5晚', flight: '中转', region: 'eu',
        desc: '会员日叠加 · 性价比高',   visa: '电子签' },
      { city: '巴黎', en: 'PARIS',     latlng: [48.8566, 2.3522],   price: 1880, days: '6天5晚', flight: '中转', region: 'eu',     hot: true,
        desc: '5月错峰 · 含一件托运',    visa: '电子签' },
      { city: '纽约', en: 'NEW YORK',  latlng: [40.7128, -74.0060], price: 1890, days: '5天4晚', flight: '中转', region: 'us',
        desc: '深度中转 · 红眼出发',     visa: '需签证' },
      { city: '洛杉矶', en: 'LOS ANGELES', latlng: [34.0522, -118.2437], price: 1850, days: '6天5晚', flight: '直飞', region: 'us',
        desc: '南航直飞 · 限时',        visa: '需签证' },
      { city: '悉尼', en: 'SYDNEY',    latlng: [-33.8688, 151.2093], price: 1990, days: '6天5晚', flight: '直飞', region: 'oceania',
        desc: '澳航返程价低',           visa: '电子签' },
    ];

    const map = L.map('world-map', {
      center: [22, 100], zoom: 2.4, minZoom: 2, maxZoom: 6,
      worldCopyJump: true, zoomControl: true, attributionControl: true,
      scrollWheelZoom: false,
    });

    // Carto dark matter tiles (subtle, editorial)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

    function refreshLeafletSize() {
      if (!map || typeof map.invalidateSize !== 'function') return;
      requestAnimationFrame(() => map.invalidateSize(true));
      setTimeout(() => map.invalidateSize(true), 80);
      setTimeout(() => map.invalidateSize(true), 260);
    }
    refreshLeafletSize();
    window.addEventListener('load', refreshLeafletSize);
    window.addEventListener('resize', refreshLeafletSize);

    // re-enable scroll zoom on click
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    let allMarkers = [];
    let activePin = null;
    const detailEl = document.getElementById('map-detail');
    const originInput = document.getElementById('map-origin');
    const budgetSelect = document.getElementById('map-budget');
    const refreshMapBtn = document.getElementById('map-refresh');

    function getOrigin() {
      return (originInput && originInput.value.trim()) || '上海 · SHA/PVG';
    }

    function originOffset() {
      const origin = getOrigin();
      if (/北京|PEK|PKX/i.test(origin)) return -80;
      if (/广州|CAN|深圳|SZX/i.test(origin)) return 120;
      if (/成都|CTU|TFU|重庆|CKG/i.test(origin)) return 180;
      if (/杭州|HGH|南京|NKG/i.test(origin)) return -40;
      return 0;
    }

    function adjustedPrice(d) {
      return Math.max(499, Math.round((d.price + originOffset()) / 10) * 10);
    }

    function pinHTML(d) {
      return `<div class="price-pin ${d.hot ? 'hot' : ''}" data-region="${d.region}"><span class="city">${d.city}</span> ¥${adjustedPrice(d)}</div>`;
    }

    function applyMapFilters() {
      const activeRegion = document.querySelector('[data-region-filter].active')?.dataset.regionFilter || 'all';
      const budget = budgetSelect ? parseInt(budgetSelect.value, 10) : Infinity;
      allMarkers.forEach((m) => {
        const d = m._destData;
        m.setIcon(L.divIcon({ className: '', html: pinHTML(d), iconSize: null, iconAnchor: [40, 28] }));
        const matchesRegion = activeRegion === 'all' || d.region === activeRegion;
        const matchesBudget = adjustedPrice(d) <= budget;
        if (matchesRegion && matchesBudget) m.addTo(map);
        else map.removeLayer(m);
      });
      if (detailEl) {
        const visible = allMarkers.find((m) => map.hasLayer(m));
        if (visible) renderDetail(visible._destData);
        else detailEl.innerHTML = '<div class="muted">当前出发地与预算下暂无匹配目的地。</div>';
      }
      refreshLeafletSize();
    }

    function renderDetail(d) {
      if (!detailEl) return;
      detailEl.innerHTML = `
        <div>
          <div class="city-name">${d.city}</div>
          <div class="city-en">${d.en} · ${d.flight} · 从 ${getOrigin()} 出发</div>
        </div>
        <div>
          <div class="price-big">¥${adjustedPrice(d)}<small>起 / 含税</small></div>
        </div>
        <div class="info-grid">
          <div><b>${d.days}</b> 推荐时长</div>
          <div><b>${getOrigin()}</b> 出发地</div>
          <div><b>${d.visa}</b> 签证</div>
          <div>${d.desc}</div>
        </div>
        <div>
          <a href="deal-detail.html" class="btn btn-primary btn-sm">查看详情 →</a>
        </div>`;
    }

    function buildPin(d) {
      const html = pinHTML(d);
      const icon = L.divIcon({
        className: '',
        html,
        iconSize: null,
        iconAnchor: [40, 28],
      });
      const marker = L.marker(d.latlng, { icon }).addTo(map);
      marker.on('click', () => {
        if (activePin) activePin.classList.remove('active');
        const el = marker.getElement().querySelector('.price-pin');
        el.classList.add('active');
        activePin = el;
        renderDetail(d);
        map.flyTo(d.latlng, Math.max(map.getZoom(), 4), { duration: 0.6 });
      });
      marker._destData = d;
      return marker;
    }

    allMarkers = destinations.map(buildPin);
    if (destinations.length) renderDetail(destinations[0]);
    applyMapFilters();
    refreshLeafletSize();

    // Filter pills
    document.querySelectorAll('[data-region-filter]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-region-filter]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        applyMapFilters();
      });
    });
    if (refreshMapBtn) {
      refreshMapBtn.addEventListener('click', () => {
        applyMapFilters();
        window.toast(`已按 ${getOrigin()} 刷新预算地图`);
      });
    }
  }

  /* ---------- NLP search demo ---------- */
  const nlpForm = document.getElementById('nlp-form');
  if (nlpForm) {
    const out = document.getElementById('nlp-output');
    const btn = nlpForm.querySelector('button');
    btn.addEventListener('click', () => parseNLP(nlpForm.querySelector('textarea').value));

    function parseNLP(text) {
      out.innerHTML = '<span class="muted">解析中…</span>';

      // Naive but believable extraction
      const t = text;
      const tags = [];
      const monthMatch = t.match(/(下个月|下月|这个月|本月|五一|十一|国庆|春节|寒假|暑假)/);
      if (monthMatch) tags.push({ label: '时间窗口', value: monthMatch[1], hi: false });
      const dayMatch = t.match(/(\d+)\s*天\s*(\d+)\s*晚/);
      if (dayMatch) tags.push({ label: '行程时长', value: `${dayMatch[1]}天${dayMatch[2]}晚`, hi: false });
      const budgetMatch = t.match(/(\d+(?:\.\d+)?)\s*(元|块|k|K)/) || t.match(/预算\s*(\d+)/);
      if (budgetMatch) tags.push({ label: '预算', value: '¥' + budgetMatch[1], hi: true });
      const peopleMatch = t.match(/(情侣|家庭|亲子|朋友|一个人|独自|蜜月)/);
      if (peopleMatch) tags.push({ label: '出行场景', value: peopleMatch[1], hi: false });
      const cityMatch = t.match(/(北京|上海|广州|深圳|杭州|成都|南京|武汉|西安|重庆)/);
      if (cityMatch) tags.push({ label: '出发地', value: cityMatch[1], hi: false });
      const cheapMatch = /便宜|划算|省钱|低价/.test(t);
      if (cheapMatch) tags.push({ label: '偏好', value: '低价优先', hi: true });
      const directMatch = /直飞/.test(t);
      if (directMatch) tags.push({ label: '航线偏好', value: '直飞', hi: false });
      const visaMatch = /免签|落地签/.test(t);
      if (visaMatch) tags.push({ label: '签证偏好', value: '免签优先', hi: false });

      // Mock recommendations based on parsed signals
      const allRecs = [
        { city: '清迈',   en: 'CHIANG MAI', price: 1880, days: '5天4晚', flight: '中转 1 站', verdict: '现在买。低于近30天均价 22%。' },
        { city: '岘港',   en: 'DA NANG',    price: 1580, days: '4天3晚', flight: '直飞', verdict: '小幅下降，可继续观察 1-2 天。' },
        { city: '巴厘岛', en: 'BALI',       price: 2680, days: '5天4晚', flight: '中转 1 站', verdict: '价格稳定，免签可下单。' },
        { city: '济州岛', en: 'JEJU',       price: 1190, days: '4天3晚', flight: '直飞', verdict: '周末出发 + 落地签，强烈推荐。' },
        { city: '马尼拉', en: 'MANILA',     price: 1390, days: '5天4晚', flight: '直飞', verdict: '红眼航班便宜约 ¥200。' },
        { city: '布吉',   en: 'PHUKET',     price: 1990, days: '6天5晚', flight: '中转 1 站', verdict: '免签 + 含托运，全成本最优。' },
      ];
      // Filter under budget if found
      let recs = allRecs.slice();
      if (budgetMatch) {
        const budget = parseFloat(budgetMatch[1]);
        recs = recs.filter((r) => r.price <= budget * 1.05).slice(0, 3);
        if (recs.length < 3) recs = allRecs.slice(0, 3);
      } else {
        recs = recs.slice(0, 3);
      }

      // Render extracted tags + recs (animated)
      setTimeout(() => {
        let html = '<div class="muted tiny" style="margin-bottom:10px;">已识别条件</div><div>';
        if (tags.length === 0) {
          html += '<span class="muted">未识别到明确条件，使用默认偏好搜索…</span>';
        } else {
          tags.forEach((tg, i) => {
            html += `<span class="nlp-tag ${tg.hi ? 'highlight' : ''}" style="animation-delay:${i*60}ms;">
              <span class="label">${tg.label}</span> ${tg.value}
            </span>`;
          });
        }
        html += '</div>';

        html += '<div class="muted tiny" style="margin-top:14px;margin-bottom:8px;">推荐目的地（按"现在买"决策力排序）</div>';
        html += '<div class="nlp-result-grid">';
        recs.forEach((r, i) => {
          html += `
            <div class="nlp-result-card" style="animation-delay:${300 + i * 100}ms;">
              <div class="city">${r.city} <small>${r.en}</small></div>
              <div class="price-tag">¥${r.price} 起</div>
              <div class="meta">
                <span>${r.days}</span><span>${r.flight}</span>
              </div>
              <div class="verdict">"${r.verdict}"</div>
            </div>`;
        });
        html += '</div>';

        out.innerHTML = html;
      }, 600);
    }
  }

  /* ---------- Price History Chart (deal detail) ---------- */
  const chart = document.getElementById('price-chart');
  if (chart) {
    // Mock 30-day price history
    const days = 30;
    const data = [];
    let price = 2620;
    for (let i = 0; i < days; i++) {
      // Random walk + a dip around current
      const t = i / (days - 1);
      const trend = -380 * Math.pow(t, 2) + 220 * Math.sin(t * 6); // downward drift + wave
      const noise = (Math.random() - 0.5) * 110;
      price = Math.max(1850, Math.min(2950, 2620 + trend + noise));
      // Force last point to 1999 (current)
      if (i === days - 1) price = 1999;
      data.push(Math.round(price));
    }
    const minV = Math.min(...data), maxV = Math.max(...data);
    const lowIdx = data.indexOf(minV), highIdx = data.indexOf(maxV);

    const W = chart.clientWidth || 700, H = 220;
    const pad = { l: 40, r: 22, t: 18, b: 28 };
    const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
    const xAt = (i) => pad.l + (i / (days - 1)) * innerW;
    const yAt = (v) => pad.t + (1 - (v - (minV - 80)) / ((maxV + 80) - (minV - 80))) * innerH;

    let pathD = `M ${xAt(0)} ${yAt(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      const x0 = xAt(i - 1), y0 = yAt(data[i - 1]);
      const x1 = xAt(i),     y1 = yAt(data[i]);
      const cx = (x0 + x1) / 2;
      pathD += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    const areaD = pathD + ` L ${xAt(data.length - 1)} ${pad.t + innerH} L ${xAt(0)} ${pad.t + innerH} Z`;

    // Y-axis grid
    const ticks = [minV, Math.round((minV + maxV) / 2), maxV];
    let gridSVG = '';
    ticks.forEach((tv) => {
      const y = yAt(tv);
      gridSVG += `<line class="chart-grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/>`;
      gridSVG += `<text class="chart-axis-text" x="${pad.l - 8}" y="${y + 3}" text-anchor="end">¥${tv}</text>`;
    });

    // X-axis labels (just a few)
    let xLabels = '';
    [0, Math.floor(days / 2), days - 1].forEach((i) => {
      const lbl = i === days - 1 ? '今日' : `D-${days - 1 - i}`;
      xLabels += `<text class="chart-axis-text" x="${xAt(i)}" y="${H - 8}" text-anchor="middle">${lbl}</text>`;
    });

    chart.innerHTML = `
      <defs>
        <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#0d1b2a" stop-opacity=".18"/>
          <stop offset="100%" stop-color="#0d1b2a" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridSVG}
      <path class="chart-area" d="${areaD}"/>
      <path class="chart-line" d="${pathD}" stroke-dasharray="2000" stroke-dashoffset="2000">
        <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="1.4s" fill="freeze"/>
      </path>
      <circle class="chart-marker-low"     cx="${xAt(lowIdx)}"  cy="${yAt(minV)}" r="5"/>
      <text class="chart-label" fill="#2c7a52" x="${xAt(lowIdx)}" y="${yAt(minV) - 12}" text-anchor="middle">低点 ¥${minV}</text>
      <circle class="chart-marker-high"    cx="${xAt(highIdx)}" cy="${yAt(maxV)}" r="5"/>
      <text class="chart-label" fill="#b94860" x="${xAt(highIdx)}" y="${yAt(maxV) - 12}" text-anchor="middle">高点 ¥${maxV}</text>
      <circle class="chart-marker-current" cx="${xAt(days - 1)}" cy="${yAt(1999)}" r="7">
        <animate attributeName="r" values="7;10;7" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <text class="chart-label" fill="#e8593c" x="${xAt(days - 1)}" y="${yAt(1999) - 14}" text-anchor="end">现价 ¥1999</text>
      ${xLabels}
    `;
  }

  /* ---------- Countdown timer (deal detail) ---------- */
  const cd = document.getElementById('countdown');
  if (cd) {
    const targetTs = Date.now() + (17 * 3600 + 23 * 60) * 1000;
    function tick() {
      const diff = Math.max(0, targetTs - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      cd.querySelector('b').textContent = `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Subscribe alert preview ---------- */
  const previewBtn = document.getElementById('preview-alert');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      const wrap = document.getElementById('alert-preview-wrap');
      wrap.style.opacity = '0';
      wrap.style.transform = 'translateY(8px)';
      setTimeout(() => {
        wrap.style.transition = 'opacity .35s ease, transform .35s ease';
        wrap.style.opacity = '1';
        wrap.style.transform = 'translateY(0)';
      }, 50);
      window.toast('已生成最新订阅推送预览');
    });
  }

  /* ---------- Subscribe wizard ---------- */
  const wizard = document.getElementById('sub-wizard');
  if (wizard) {
    const steps = wizard.querySelectorAll('[data-step]');
    const stepIndicators = wizard.querySelectorAll('.wizard-step');
    let current = 0;
    function show(i) {
      current = i;
      steps.forEach((s, idx) => s.style.display = idx === i ? 'block' : 'none');
      stepIndicators.forEach((s, idx) => {
        s.classList.toggle('active', idx === i);
        s.classList.toggle('done', idx < i);
      });
    }
    show(0);
    wizard.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => {
      if (current < steps.length - 1) show(current + 1);
      else { window.toast('订阅已创建。我们会在符合条件时第一时间推送。'); show(0); }
    }));
    wizard.querySelectorAll('[data-prev]').forEach((b) => b.addEventListener('click', () => {
      if (current > 0) show(current - 1);
    }));
  }

  /* ---------- Deal radar choice interaction ---------- */
  document.querySelectorAll('[data-deal-card]').forEach((card) => {
    const openActions = () => {
      document.querySelectorAll('[data-deal-card]').forEach((c) => {
        c.classList.remove('active');
        const a = c.querySelector('.deal-inline-actions');
        if (a) a.hidden = true;
      });
      card.classList.add('active');
      const actions = card.querySelector('.deal-inline-actions');
      if (actions) actions.hidden = false;
    };
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      openActions();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openActions(); }
    });
  });
  document.querySelectorAll('[data-buy-deal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      location.href = 'deal-detail.html';
    });
  });
  document.querySelectorAll('[data-save-deal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('[data-deal-card]');
      const title = card?.dataset.saveTitle || '该特价';
      window.toast(`已加入收藏：${title}`);
    });
  });

  /* ---------- Search: show results only after submit ---------- */
  function resetSearchPanel(panel) {
    const input = panel.querySelector('.search-input-view');
    const result = panel.querySelector('.search-result-view');
    if (input && result) {
      input.hidden = false;
      result.hidden = true;
      input.classList.remove('hidden');
      result.classList.remove('active');
    }
  }
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.target);
      if (panel) resetSearchPanel(panel);
    });
  });
  document.querySelectorAll('[data-search-submit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.tab-panel');
      if (!panel) return;
      const input = panel.querySelector('.search-input-view');
      const result = panel.querySelector('.search-result-view');
      if (input && result) {
        input.hidden = true;
        result.hidden = false;
        result.classList.add('active');
      }
    });
  });
  document.querySelectorAll('[data-back-input]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.tab-panel');
      if (panel) resetSearchPanel(panel);
    });
  });

  /* ---------- Generic CTA toasts ---------- */
  document.querySelectorAll('[data-toast]').forEach((b) => {
    b.addEventListener('click', () => window.toast(b.dataset.toast));
  });

  /* ---------- Reveal on scroll ---------- */
  const reveal = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; }});
  }, { threshold: .08 });
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    el.style.opacity = 0; el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    reveal.observe(el);
  });

})();
