(function() {
  "use strict";

  // DOM refs
  const $ = id => document.getElementById(id);
  const densitySt = $('densityStitches');
  const densityRow = $('densityRows');
  const repSt = $('repStitch');
  const repRow = $('repRow');
  const symSt = $('symStitch');
  const symRow = $('symRow');
  const edges = $('edges');
  const widthCm = $('widthCm');
  const lengthCm = $('lengthCm');
  const widthRep = $('widthRep');
  const lengthRep = $('lengthRep');

  const resCastOn = $('resCastOn');
  const resCastOnSub = $('resCastOnSub');
  const resCastOnDev = $('resCastOnDev');
  const resRows = $('resRows');
  const resRowsSub = $('resRowsSub');
  const resRowsDev = $('resRowsDev');

  const edgesGroup = $('edgesGroup');

  // State
  let currentLang = 'ru';
  let currentUnits = 'metric';
  let currentTheme = 'light';
  let currentTool = 'knit';
  let currentDir = 'classic';

  // Helpers
  function getVal(el) { return parseFloat(el.value) || 0; }
  function getInt(el) { return parseInt(el.value) || 0; }

  function toDisplayCm(val) { return currentUnits === 'metric' ? val : val / 2.54; }
  function fromDisplayCm(val) { return currentUnits === 'metric' ? val : val * 2.54; }

  // ---------- Основной расчёт (только по кнопке) ----------
  function calculate() {
    const isRu = currentLang === 'ru';

    const dSt = getVal(densitySt);
    const dRo = getVal(densityRow);
    if (dSt <= 0 || dRo <= 0) {
      alert(isRu ? 'Пожалуйста, введите плотность (петли и ряды на 10 см).' : 'Please enter gauge.');
      return;
    }

    const rSt = getInt(repSt);
    const rRo = getInt(repRow);
    if (rSt <= 0 || rRo <= 0) {
      alert(isRu ? 'Пожалуйста, введите раппорт (петли и ряды).' : 'Please enter pattern repeat.');
      return;
    }

    const wCmVal = getVal(widthCm);
    const lCmVal = getVal(lengthCm);
    const wRepVal = getInt(widthRep);
    const lRepVal = getInt(lengthRep);
    if (wCmVal <= 0 && lCmVal <= 0 && wRepVal <= 0 && lRepVal <= 0) {
      alert(isRu ? 'Укажите хотя бы один размер (ширину или длину).' : 'Enter at least one dimension.');
      return;
    }

    const sSt = getInt(symSt);
    const sRo = getInt(symRow);
    const e = currentTool === 'knit' ? parseInt(edges.value) : 0;

    let wCm = fromDisplayCm(wCmVal);
    let lCm = fromDisplayCm(lCmVal);
    let wRep = wRepVal;
    let lRep = lRepVal;

    // Синхронизация ширины
    if (wRep > 0 && rSt > 0) {
      const totalSt = wRep * rSt + sSt + e;
      const wCmCalc = (totalSt / dSt) * 10;
      widthCm.value = toDisplayCm(wCmCalc).toFixed(2);
      wCm = wCmCalc;
    } else if (wCm > 0 && rSt > 0) {
      const base = (wCm / 10) * dSt - sSt - e;
      if (base > 0) {
        const n = Math.round(base / rSt);
        wRep = Math.max(1, n);
        widthRep.value = wRep;
        const totalSt = wRep * rSt + sSt + e;
        const wCmCalc = (totalSt / dSt) * 10;
        widthCm.value = toDisplayCm(wCmCalc).toFixed(2);
        wCm = wCmCalc;
      } else {
        wRep = 1;
        widthRep.value = 1;
        const totalSt = wRep * rSt + sSt + e;
        const wCmCalc = (totalSt / dSt) * 10;
        widthCm.value = toDisplayCm(wCmCalc).toFixed(2);
        wCm = wCmCalc;
      }
    }

    // Синхронизация длины
    if (lRep > 0 && rRo > 0) {
      const totalRo = lRep * rRo + sRo;
      const lCmCalc = (totalRo / dRo) * 10;
      lengthCm.value = toDisplayCm(lCmCalc).toFixed(2);
      lCm = lCmCalc;
    } else if (lCm > 0 && rRo > 0) {
      const base = (lCm / 10) * dRo - sRo;
      if (base > 0) {
        const m = Math.round(base / rRo);
        lRep = Math.max(1, m);
        lengthRep.value = lRep;
        const totalRo = lRep * rRo + sRo;
        const lCmCalc = (totalRo / dRo) * 10;
        lengthCm.value = toDisplayCm(lCmCalc).toFixed(2);
        lCm = lCmCalc;
      } else {
        lRep = 1;
        lengthRep.value = 1;
        const totalRo = lRep * rRo + sRo;
        const lCmCalc = (totalRo / dRo) * 10;
        lengthCm.value = toDisplayCm(lCmCalc).toFixed(2);
        lCm = lCmCalc;
      }
    }

    // Наборный край и ряды
    let castOnTotal, rowsTotal;
    let castOnCm, rowsCm;

    if (currentDir === 'classic') {
      castOnTotal = wRep * rSt + sSt + e;
      castOnCm = (castOnTotal / dSt) * 10;
      rowsTotal = lRep * rRo + sRo;
      rowsCm = (rowsTotal / dRo) * 10;
    } else {
      castOnTotal = lRep * rSt + sSt + e;
      castOnCm = (castOnTotal / dSt) * 10;
      rowsTotal = wRep * rRo + sRo;
      rowsCm = (rowsTotal / dRo) * 10;
    }

    const isKnit = currentTool === 'knit';
    const isRuText = currentLang === 'ru';
    const stLabel = isKnit ? (isRuText ? 'петель' : 'sts') : (isRuText ? 'столбиков' : 'sts');
    const rowLabel = isRuText ? 'рядов' : 'rows';
    const repLabel = isRuText ? 'рапп.' : 'rep.';
    const lengthUnit = currentUnits === 'metric' ? (isRuText ? 'см' : 'cm') : 'in';

    const castOnReps = Math.floor((castOnTotal - sSt - e) / rSt);
    const symText = isRuText ? 'сим.' : 'sym';
    const edgeText = isRuText ? 'кром.' : 'edge';
    resCastOn.textContent = `${castOnTotal} ${stLabel}`;
    resCastOnSub.textContent = isKnit ? 
      `${castOnReps} ${repLabel} + ${symText} ${sSt} + ${edgeText} ${e}` :
      `${castOnReps} ${repLabel} + ${symText} ${sSt}`;

    const desiredCastOnCm = currentDir === 'classic' ? wCm : lCm;
    const diffCast = castOnCm - desiredCastOnCm;
    let devCastText = `→ ${toDisplayCm(castOnCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffCast) < 0.01) devCastText += ` (${isRuText ? 'точно' : 'exact'})`;
    else if (diffCast > 0) devCastText += ` (${isRuText ? 'на' : '+'} ${toDisplayCm(diffCast).toFixed(1)} ${lengthUnit} ${isRuText ? 'больше' : 'more'})`;
    else devCastText += ` (${isRuText ? 'на' : ''} ${toDisplayCm(Math.abs(diffCast)).toFixed(1)} ${lengthUnit} ${isRuText ? 'меньше' : 'less'})`;
    resCastOnDev.textContent = devCastText;

    const rowsReps = Math.floor((rowsTotal - sRo) / rRo);
    resRows.textContent = `${rowsTotal} ${rowLabel}`;
    resRowsSub.textContent = `${rowsReps} ${repLabel} + ${symText} ${sRo}`;

    const desiredRowsCm = currentDir === 'classic' ? lCm : wCm;
    const diffRow = rowsCm - desiredRowsCm;
    let devRowText = `→ ${toDisplayCm(rowsCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffRow) < 0.01) devRowText += ` (${isRuText ? 'точно' : 'exact'})`;
    else if (diffRow > 0) devRowText += ` (${isRuText ? 'на' : '+'} ${toDisplayCm(diffRow).toFixed(1)} ${lengthUnit} ${isRuText ? 'больше' : 'more'})`;
    else devRowText += ` (${isRuText ? 'на' : ''} ${toDisplayCm(Math.abs(diffRow)).toFixed(1)} ${lengthUnit} ${isRuText ? 'меньше' : 'less'})`;
    resRowsDev.textContent = devRowText;
  }

  // ---------- Переводы ----------
  const translations = {
    ru: {
      logo: 'Хаттер',
      logoSub: 'Дизайнер шарфов и пледов',
      resLabelCastOnKnit: 'Наборный край',
      resLabelCastOnCrochet: 'Наборный ряд',
      resultTitle: 'Результаты',
      dimTitle: 'Размеры и направление',
      rapportTitle: 'Раппорт и симметрия',
      densityTitle: 'Плотность (после ВТО)',
      toolLabel: 'Способ вязания',
      donate: 'Поддержать',
      calculateBtn: 'Рассчитать',
      warningKnit: 'Образец должен быть не менее 12×12 см (5×5 in) после ВТО. Плотность измеряйте строго в центре образца, на участке 10×10 см (4×4 in), не включая кромочные и края.',
      warningCrochet: 'Образец должен быть не менее 12×12 см (5×5 in) после ВТО. Плотность измеряйте строго в центре образца, на участке 10×10 см (4×4 in), не включая петли подъёма.',
      toolKnit: 'Спицы',
      toolCrochet: 'Крючок',
      lblRepSt: 'Раппорт (петли)',
      lblRepRow: 'Раппорт (ряды)',
      lblSymSt: 'Симметрия (петли)',
      symDesc: '* общая для начала и конца',
      lblSymRow: 'Симметрия (ряды)',
      lblEdges: 'Кромочные',
      edgeDesc: '0 — круговое, 2 — поворотные ряды',
      lblDir: 'Направление вязания',
      dirClassic: 'Классическое (ширина → набор)',
      dirCross: 'Поперечное (длина → набор)',
      lblWidth: 'Ширина',
      lblWidthRep: 'Ширина (в раппортах)',
      lblLength: 'Длина',
      lblLengthRep: 'Длина (в раппортах)',
      resLabelCastOn: 'Наборный край',
      resLabelRows: 'Ряды',
    },
    us: {
      logo: 'The Hatter',
      logoSub: 'Scarf & Blanket Designer',
      resLabelCastOnKnit: 'Cast on',
      resLabelCastOnCrochet: 'Foundation Chain',
      resultTitle: 'Results',
      dimTitle: 'Size & direction',
      lblEdges: 'Edge stitches',
      edgeDesc: '0 — circular, 2 — flat knitting',
      rapportTitle: 'Pattern repeat & symmetry',
      densityTitle: 'Gauge (after blocking)',
      toolLabel: 'Method',
      donate: 'Support',
      calculateBtn: 'Calculate',
      warningKnit: 'Swatch must be at least 5×5 in (12×12 cm) after blocking. Measure gauge strictly in the center of the swatch, on a 4×4 in (10×10 cm) area, excluding edge stitches and borders.',
      warningCrochet: 'Swatch must be at least 5×5 in (12×12 cm) after blocking. Measure gauge strictly in the center of the swatch, on a 4×4 in (10×10 cm) area, excluding turning chains.',
      toolKnit: 'Knitting',
      toolCrochet: 'Crochet',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymSt: 'Symmetry (sts)',
      symDesc: '* total for beginning and end',
      lblSymRow: 'Symmetry (rows)',
      lblEdges: 'Edge stitches',
      edgeDesc: '0 — circular, 2 — flat knitting',
      lblDir: 'Knitting direction',
      dirClassic: 'Classic (width → cast on)',
      dirCross: 'Crosswise (length → cast on)',
      lblWidth: 'Width',
      lblWidthRep: 'Width (in repeats)',
      lblLength: 'Length',
      lblLengthRep: 'Length (in repeats)',
      resLabelCastOn: 'Cast on',
      resLabelRows: 'Rows',
    },
    uk: {
      logo: 'The Hatter',
      logoSub: 'Scarf & Blanket Designer',
      resLabelCastOnKnit: 'Cast on',
      resLabelCastOnCrochet: 'Foundation Chain',
      resultTitle: 'Results',
      dimTitle: 'Size & direction',
      lblEdges: 'Edge stitches',
      edgeDesc: '0 — circular, 2 — flat knitting',
      rapportTitle: 'Pattern repeat & symmetry',
      densityTitle: 'Tension (after blocking)',
      toolLabel: 'Method',
      donate: 'Support',
      calculateBtn: 'Calculate',
      warningKnit: 'Tension square must be at least 5×5 in (12×12 cm) after blocking. Measure tension strictly in the centre of the square, on a 4×4 in (10×10 cm) area, excluding edge stitches and borders.',
      warningCrochet: 'Tension square must be at least 5×5 in (12×12 cm) after blocking. Measure tension strictly in the centre of the square, on a 4×4 in (10×10 cm) area, excluding turning chains.',
      toolKnit: 'Knitting',
      toolCrochet: 'Crochet',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymSt: 'Symmetry (sts)',
      symDesc: '* total for beginning and end',
      lblSymRow: 'Symmetry (rows)',
      lblEdges: 'Edge stitches',
      edgeDesc: '0 — circular, 2 — flat knitting',
      lblDir: 'Knitting direction',
      dirClassic: 'Classic (width → cast on)',
      dirCross: 'Crosswise (length → cast on)',
      lblWidth: 'Width',
      lblWidthRep: 'Width (in repeats)',
      lblLength: 'Length',
      lblLengthRep: 'Length (in repeats)',
      resLabelCastOn: 'Cast on',
      resLabelRows: 'Rows',
    }
  };

  // ---------- Обновление подписей полей плотности в зависимости от единиц ----------
  function updateDensityLabels() {
  const isRu = currentLang === 'ru';
  const isMetric = currentUnits === 'metric';
  const isKnit = currentTool === 'knit';
  
  const number = isMetric ? '10' : '4';
  const unit = isMetric ? (isRu ? 'см' : 'cm') : (isRu ? 'дюймах' : 'in');
  
  // Выбираем слово "петель" или "столбиков" для русского
  const stWord = isKnit ? (isRu ? 'петель' : 'sts') : (isRu ? 'столбиков' : 'sts');
  
  const stitchLabel = isRu ? `${stWord} в ${number} ${unit}` : `Sts per ${number} ${unit}`;
  const rowLabel = isRu ? `Рядов в ${number} ${unit}` : `Rows per ${number} ${unit}`;

  document.getElementById('lblStitch').textContent = stitchLabel;
  document.getElementById('lblRow').textContent = rowLabel;
}

  // ---------- Обновление всего UI ----------
  function updateLanguage() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;

    document.querySelector('.logo-text').textContent = t.logo;
    document.querySelector('.logo-sub').textContent = t.logoSub;
    document.getElementById('donateText').textContent = t.donate;
    document.getElementById('densityTitle').textContent = t.densityTitle;
    document.getElementById('toolLabel').textContent = t.toolLabel;
    document.getElementById('rapportTitle').textContent = t.rapportTitle;
    document.getElementById('dimTitle').textContent = t.dimTitle;
    document.getElementById('resultTitle').textContent = t.resultTitle;
    document.getElementById('calculateBtnText').textContent = t.calculateBtn;
    document.getElementById('toolKnit').textContent = t.toolKnit;
    document.getElementById('toolCrochet').textContent = t.toolCrochet;
    document.getElementById('lblRepRow').textContent = t.lblRepRow;
    document.getElementById('lblSymRow').textContent = t.lblSymRow;
    document.getElementById('symDesc').textContent = t.symDesc;
    document.getElementById('lblEdges').textContent = t.lblEdges;
    document.getElementById('edgeDesc').textContent = t.edgeDesc;
    document.getElementById('lblDir').textContent = t.lblDir;
    document.getElementById('dirClassic').textContent = t.dirClassic;
    document.getElementById('dirCross').textContent = t.dirCross;
    document.getElementById('lblWidth').textContent = t.lblWidth;
    document.getElementById('lblWidthRep').textContent = t.lblWidthRep;
    document.getElementById('lblLength').textContent = t.lblLength;
    document.getElementById('lblLengthRep').textContent = t.lblLengthRep;
    document.getElementById('resLabelCastOn').textContent = t.resLabelCastOn;
    document.getElementById('resLabelRows').textContent = t.resLabelRows;

    document.title = (lang === 'ru' ? 'Хаттер — Калькулятор шарфов' : 'The Hatter — Scarf Calculator');

    updateToolSpecificUI();
    updateWarningText();
    updateDensityLabels();
    updateUnitSymbols();
  }

  function updateToolSpecificUI() {
    const isKnit = currentTool === 'knit';
    const isRu = currentLang === 'ru';

    if (edgesGroup) {
    edgesGroup.classList.toggle('hidden', !isKnit);
  }

    const stWord = isKnit ? (isRu ? 'петли' : 'sts') : (isRu ? 'столбики' : 'sts');
    const lblRepSt = document.getElementById('lblRepSt');
    const lblSymSt = document.getElementById('lblSymSt');
    if (lblRepSt) lblRepSt.textContent = isRu ? `Раппорт (${stWord})` : `Repeat (${stWord})`;
    if (lblSymSt) lblSymSt.textContent = isRu ? `Симметрия (${stWord})` : `Symmetry (${stWord})`;

    // Обновление подписи "Наборный ряд" / "Cast on" / "Foundation Chain"
    const castOnLabel = isRu ? 'Наборный ряд' : (isKnit ? 'Cast on' : 'Foundation Chain');
    document.getElementById('resLabelCastOn').textContent = castOnLabel;
  }

  function updateWarningText() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;
    const key = currentTool === 'knit' ? 'warningKnit' : 'warningCrochet';
    const warningEl = document.getElementById('warningText');
    if (warningEl) warningEl.textContent = t[key];
  }

  function updateUnitSymbols() {
  const isMetric = currentUnits === 'metric';
  const isRu = currentLang === 'ru';
  let lengthSym;
  if (isMetric) {
    lengthSym = isRu ? 'см' : 'cm';
  } else {
    lengthSym = 'in'; // для имперской системы оставляем 'in' для всех языков
  }
  document.querySelectorAll('.unit').forEach(el => {
    if (el.dataset.unit === 'length') el.textContent = lengthSym;
  });
}

  // ---------- Переключение единиц (без вызова calculate) ----------
  function toggleUnits(newUnits) {
    if (newUnits === currentUnits) return;
    const fromMetric = currentUnits === 'metric';
    const toMetric = newUnits === 'metric';

    function convertField(el, convFn) {
      if (el) {
        const val = parseFloat(el.value);
        if (!isNaN(val)) {
          el.value = convFn(val).toFixed(el.step && el.step.includes('.') ? 2 : 0);
        }
      }
    }

    if (fromMetric !== toMetric) {
      convertField(widthCm, v => fromMetric ? v / 2.54 : v * 2.54);
      convertField(lengthCm, v => fromMetric ? v / 2.54 : v * 2.54);
    }

    currentUnits = newUnits;
    document.querySelectorAll('#unitToggle .unit-opt').forEach(el => {
      el.classList.toggle('active', el.dataset.unit === newUnits);
    });
    updateUnitSymbols();
    updateDensityLabels(); // обновляем подписи плотности
    // НЕ вызываем calculate()
  }

  // ---------- Тема ----------
  function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', newTheme === 'dark' ? '#1a1a1a' : '#f6f0ea');
  }

  function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.body.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#f6f0ea');
  }

  // ---------- Инициализация переключателей ----------
  function setupToggles() {
    document.querySelectorAll('#toolToggle .toggle-option').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#toolToggle .toggle-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentTool = this.dataset.tool;
        updateToolSpecificUI();
        updateWarningText();
        updateDensityLabels();
      });
    });
    document.querySelectorAll('#directionToggle .toggle-option').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#directionToggle .toggle-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentDir = this.dataset.dir;
      });
    });
  }

  // ---------- Настройка полей (без автоматического calculate) ----------
  function setupInputs() {
    // Никаких слушателей, которые вызывают calculate
  }

  // ---------- Init ----------
  initTheme();
  setupToggles();
  setupInputs();

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('langSelect').addEventListener('change', function(e) {
    const newLang = e.target.value;
    if (newLang !== currentLang) {
      currentLang = newLang;
      updateLanguage();
    }
  });

  document.querySelectorAll('#unitToggle .unit-opt').forEach(el => {
    el.addEventListener('click', function() {
      toggleUnits(this.dataset.unit);
    });
  });

  document.getElementById('calculateBtn').addEventListener('click', calculate);

  // Начальные единицы и язык
  currentUnits = 'metric';
  document.querySelector('#unitToggle .unit-opt[data-unit="metric"]').classList.add('active');
  updateUnitSymbols();

  currentLang = 'ru';
  document.getElementById('langSelect').value = 'ru';
  updateLanguage();

  updateToolSpecificUI();
  updateWarningText();
  updateDensityLabels();

  document.getElementById('donateBoosty').href = 'https://boosty.to/annafengari';

  console.log('🧶 The Hatter: Scarf Studio loaded (fixed density labels)');
})();
