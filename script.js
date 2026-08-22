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
  const lblEdges = $('lblEdges');
  const edgeDesc = $('edgeDesc');

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

  // ---------- Основной расчёт ----------
  function calculate() {
    const dSt = getVal(densitySt);
    const dRo = getVal(densityRow);
    if (dSt <= 0 || dRo <= 0) {
      alert('Пожалуйста, введите плотность (петли и ряды на 10 см).');
      return;
    }

    const rSt = getInt(repSt);
    const rRo = getInt(repRow);
    const sSt = getInt(symSt);
    const sRo = getInt(symRow);
    const e = currentTool === 'knit' ? parseInt(edges.value) : 0; // для крючка кромочных нет

    let wCm = fromDisplayCm(getVal(widthCm));
    let lCm = fromDisplayCm(getVal(lengthCm));
    let wRep = getInt(widthRep);
    let lRep = getInt(lengthRep);

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

    // Отображение результатов
    const isRu = currentLang === 'ru';
    const isKnit = currentTool === 'knit';
    const stLabel = isKnit ? (isRu ? 'петель' : 'sts') : (isRu ? 'столбиков' : 'sts');
    const rowLabel = isRu ? 'рядов' : 'rows';
    const repLabel = isRu ? 'рапп.' : 'rep.';
    const lengthUnit = currentUnits === 'metric' ? (isRu ? 'см' : 'cm') : 'in';

    const castOnReps = Math.floor((castOnTotal - sSt - e) / rSt);
    const symText = isRu ? 'сим.' : 'sym';
    const edgeText = isRu ? 'кром.' : 'edge';
    resCastOn.textContent = `${castOnTotal} ${stLabel}`;
    resCastOnSub.textContent = isKnit ? 
      `${castOnReps} ${repLabel} + ${symText} ${sSt} + ${edgeText} ${e}` :
      `${castOnReps} ${repLabel} + ${symText} ${sSt}`;

    const desiredCastOnCm = currentDir === 'classic' ? wCm : lCm;
    const diffCast = castOnCm - desiredCastOnCm;
    let devCastText = `→ ${toDisplayCm(castOnCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffCast) < 0.01) devCastText += ` (${isRu ? 'точно' : 'exact'})`;
    else if (diffCast > 0) devCastText += ` (${isRu ? 'на' : '+'} ${toDisplayCm(diffCast).toFixed(1)} ${lengthUnit} ${isRu ? 'больше' : 'more'})`;
    else devCastText += ` (${isRu ? 'на' : ''} ${toDisplayCm(Math.abs(diffCast)).toFixed(1)} ${lengthUnit} ${isRu ? 'меньше' : 'less'})`;
    resCastOnDev.textContent = devCastText;

    const rowsReps = Math.floor((rowsTotal - sRo) / rRo);
    resRows.textContent = `${rowsTotal} ${rowLabel}`;
    resRowsSub.textContent = `${rowsReps} ${repLabel} + ${symText} ${sRo}`;

    const desiredRowsCm = currentDir === 'classic' ? lCm : wCm;
    const diffRow = rowsCm - desiredRowsCm;
    let devRowText = `→ ${toDisplayCm(rowsCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffRow) < 0.01) devRowText += ` (${isRu ? 'точно' : 'exact'})`;
    else if (diffRow > 0) devRowText += ` (${isRu ? 'на' : '+'} ${toDisplayCm(diffRow).toFixed(1)} ${lengthUnit} ${isRu ? 'больше' : 'more'})`;
    else devRowText += ` (${isRu ? 'на' : ''} ${toDisplayCm(Math.abs(diffRow)).toFixed(1)} ${lengthUnit} ${isRu ? 'меньше' : 'less'})`;
    resRowsDev.textContent = devRowText;
  }

  // ---------- Переводы ----------
  const translations = {
    ru: {
      donate: 'Поддержать',
      warningKnit: 'Образец должен быть не менее 12×12 см (5×5 in) после ВТО. Плотность измеряйте строго в центре образца, на участке 10×10 см (4×4 in), не включая кромочные и края.',
      warningCrochet: 'Образец должен быть не менее 12×12 см (5×5 in) после ВТО. Плотность измеряйте строго в центре образца, на участке 10×10 см (4×4 in), не включая петли подъёма.',
      toolKnit: 'Спицы',
      toolCrochet: 'Крючок',
      lblStitch: 'Петель в 10 см',
      lblRow: 'Рядов в 10 см',
      lblRepSt: 'Раппорт (петли)',
      lblRepRow: 'Раппорт (ряды)',
      lblSymSt: 'Симметрия (петли)',
      symDesc: '* общая для начала и конца',
      lblSymRow: 'Симметрия (ряды)',
      lblEdges: 'Кромочные (к наборному краю)',
      edgeDesc: 'не входят в раппорт',
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
      donate: 'Support',
      warningKnit: 'Swatch must be at least 5×5 in (12×12 cm) after blocking. Measure gauge strictly in the center of the swatch, on a 4×4 in (10×10 cm) area, excluding edge stitches and borders.',
      warningCrochet: 'Swatch must be at least 5×5 in (12×12 cm) after blocking. Measure gauge strictly in the center of the swatch, on a 4×4 in (10×10 cm) area, excluding turning chains.',
      toolKnit: 'Knit',
      toolCrochet: 'Crochet',
      lblStitch: 'Sts per 4 in',
      lblRow: 'Rows per 4 in',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymSt: 'Symmetry (sts)',
      symDesc: '* total for beginning and end',
      lblSymRow: 'Symmetry (rows)',
      lblEdges: 'Edge stitches (to cast-on)',
      edgeDesc: 'not part of repeat',
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
      donate: 'Support',
      warningKnit: 'Tension square must be at least 5×5 in (12×12 cm) after blocking. Measure tension strictly in the centre of the square, on a 4×4 in (10×10 cm) area, excluding edge stitches and borders.',
      warningCrochet: 'Tension square must be at least 5×5 in (12×12 cm) after blocking. Measure tension strictly in the centre of the square, on a 4×4 in (10×10 cm) area, excluding turning chains.',
      toolKnit: 'Knit',
      toolCrochet: 'Crochet',
      lblStitch: 'Sts per 4 in',
      lblRow: 'Rows per 4 in',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymSt: 'Symmetry (sts)',
      symDesc: '* total for beginning and end',
      lblSymRow: 'Symmetry (rows)',
      lblEdges: 'Edge stitches (to cast-on)',
      edgeDesc: 'not part of repeat',
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

  // ---------- Обновление UI в зависимости от языка и инструмента ----------
  function updateLanguage() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;

    document.querySelector('.logo-text').textContent = (lang === 'ru' ? 'Хаттер' : 'The Hatter');
    document.querySelector('.logo-sub').textContent = (lang === 'ru' ? 'Дизайнер шарфов' : 'Scarf Studio');
    document.getElementById('donateText').textContent = t.donate;
    document.getElementById('toolKnit').textContent = t.toolKnit;
    document.getElementById('toolCrochet').textContent = t.toolCrochet;
    document.getElementById('lblStitch').textContent = t.lblStitch;
    document.getElementById('lblRow').textContent = t.lblRow;
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
    updateUnitSymbols();
  }

  function updateToolSpecificUI() {
    const isKnit = currentTool === 'knit';
    const isRu = currentLang === 'ru';

    // Показываем/скрываем поле "Кромочные"
    edgesGroup.classList.toggle('hidden', !isKnit);

    // Меняем подписи "петли" ↔ "столбики"
    const stWord = isKnit ? (isRu ? 'петли' : 'sts') : (isRu ? 'столбики' : 'sts');
    document.getElementById('lblRepSt').textContent = isRu ? `Раппорт (${stWord})` : `Repeat (${stWord})`;
    document.getElementById('lblSymSt').textContent = isRu ? `Симметрия (${stWord})` : `Symmetry (${stWord})`;

    // Обновляем предупреждение
    updateWarningText();
  }

  function updateWarningText() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;
    const key = currentTool === 'knit' ? 'warningKnit' : 'warningCrochet';
    document.getElementById('warningText').textContent = t[key];
  }

  function updateUnitSymbols() {
    const isMetric = currentUnits === 'metric';
    const lengthSym = isMetric ? 'см' : 'in';
    document.querySelectorAll('.unit').forEach(el => {
      if (el.dataset.unit === 'length') el.textContent = lengthSym;
    });
  }

  // ---------- Переключение единиц ----------
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

  // ---------- Init ----------
  initTheme();
  setupToggles();

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

  // Ссылка на Boosty
  document.getElementById('donateBoosty').href = 'https://boosty.to/annafengari';

  console.log('🧶 The Hatter: Scarf Studio loaded (final version)');
})();
