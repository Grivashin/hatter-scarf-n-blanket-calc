(function() {
  "use strict";

  // DOM refs
  const $ = id => document.getElementById(id);
  const densitySt = $('densityStitches');
  const densityRow = $('densityRows');
  const repSt = $('repStitch');
  const repRow = $('repRow');
  const symStart = $('symStart');
  const symEnd = $('symEnd');
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
  const resSize = $('resSize');
  const resSizeSub = $('resSizeSub');

  const edgesGroup = $('edgesGroup');

  // State
  let currentLang = 'ru';
  let currentUnits = 'metric';
  let currentTheme = 'light';
  let currentTool = 'knit';
  let currentDir = 'classic';

  // ---------- Helpers ----------
  function getVal(el) { return parseFloat(el.value) || 0; }
  function getInt(el) { return parseInt(el.value) || 0; }

  function toDisplayCm(val) { return currentUnits === 'metric' ? val : val / 2.54; }
  function fromDisplayCm(val) { return currentUnits === 'metric' ? val : val * 2.54; }

  // Функция склонения для русского языка
  function getRussianPlural(n, one, two, five) {
    n = Math.abs(n);
    if (n % 10 === 1 && n % 100 !== 11) return one;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return two;
    return five;
  }

  // ---------- Управление видимостью полей симметрии ----------
  function updateSymmetryVisibility() {
    const isKnit = currentTool === 'knit';
    const e = parseInt(edges.value);
    const isCircular = (isKnit && e === 0);
    const startGroup = document.getElementById('symStartGroup');
    const endGroup = document.getElementById('symEndGroup');
    if (startGroup) startGroup.style.display = isCircular ? 'none' : 'flex';
    if (endGroup) endGroup.style.display = isCircular ? 'none' : 'flex';
  }

  // ---------- Динамическое обновление манифеста ----------
  function updateManifest() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;
    const manifestData = {
      name: t.manifestName,
      short_name: t.manifestShortName,
      description: 'Crochet and Knit Scarf Calculator',
      start_url: '/',
      display: 'standalone',
      theme_color: '#f6f0ea',
      background_color: '#f6f0ea',
      icons: [
        { src: 'images/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'images/icon.png', sizes: '512x512', type: 'image/png' }
      ]
    };
    const manifestJSON = JSON.stringify(manifestData);
    const base64 = btoa(unescape(encodeURIComponent(manifestJSON)));
    const manifestURI = 'data:application/json;base64,' + base64;
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      link.href = manifestURI;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'manifest';
      newLink.href = manifestURI;
      document.head.appendChild(newLink);
    }
  }

  // ---------- Основной расчёт ----------
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

    const e = currentTool === 'knit' ? parseInt(edges.value) : 0;
    const isCircular = (currentTool === 'knit' && e === 0);

    // Для кругового вязания симметрия начала и конца не используется
    let sStart = 0, sEnd = 0;
    if (!isCircular) {
      sStart = getInt(symStart);
      sEnd = getInt(symEnd);
    }
    const sSt = sStart + sEnd;
    const sRo = getInt(symRow);

    let wCm = fromDisplayCm(wCmVal);
    let lCm = fromDisplayCm(lCmVal);
    let wRep = wRepVal;
    let lRep = lRepVal;

    // Синхронизация ширины (приоритет у раппортов)
    const eUsed = isCircular ? 0 : e;
    if (wRep > 0 && rSt > 0) {
      const totalSt = wRep * rSt + sSt + eUsed;
      const wCmCalc = (totalSt / dSt) * 10;
      widthCm.value = toDisplayCm(wCmCalc).toFixed(2);
      wCm = wCmCalc;
    } else if (wCmVal > 0 && rSt > 0) {
      const base = (wCmVal / 10) * dSt - sSt - eUsed;
      if (base > 0) {
        const n = Math.round(base / rSt);
        wRep = Math.max(1, n);
        widthRep.value = wRep;
        const totalSt = wRep * rSt + sSt + eUsed;
        const wCmCalc = (totalSt / dSt) * 10;
        widthCm.value = toDisplayCm(wCmCalc).toFixed(2);
        wCm = wCmCalc;
      } else {
        wRep = 1;
        widthRep.value = 1;
        const totalSt = wRep * rSt + sSt + eUsed;
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
    } else if (lCmVal > 0 && rRo > 0) {
      const base = (lCmVal / 10) * dRo - sRo;
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
    let castOnReps;

    if (currentDir === 'classic') {
      let wRepForCast = wRep;
      if (isCircular) {
        wRepForCast = wRep * 2;
        castOnTotal = wRepForCast * rSt + sSt;
        castOnReps = wRepForCast;
      } else {
        castOnTotal = wRep * rSt + sSt + e;
        castOnReps = wRep;
      }
      castOnCm = (castOnTotal / dSt) * 10;
      rowsTotal = lRep * rRo + sRo;
      rowsCm = (rowsTotal / dRo) * 10;
    } else {
      let lRepForCast = lRep;
      if (isCircular) {
        lRepForCast = lRep * 2;
        castOnTotal = lRepForCast * rSt + sSt;
        castOnReps = lRepForCast;
      } else {
        castOnTotal = lRep * rSt + sSt + e;
        castOnReps = lRep;
      }
      castOnCm = (castOnTotal / dSt) * 10;
      rowsTotal = wRep * rRo + sRo;
      rowsCm = (rowsTotal / dRo) * 10;
    }

    const isKnit = currentTool === 'knit';
    const isRuText = currentLang === 'ru';
    const repLabel = isRuText ? 'рапп.' : 'rep.';
    const lengthUnit = currentUnits === 'metric' ? (isRuText ? 'см' : 'cm') : 'in';
    const symText = isRuText ? 'сим.' : 'sym';
    const edgeText = isRuText ? 'кром.' : 'edge';

    // ---------- Формирование склоняемых подписей ----------
    let stLabel, rowLabel;
    if (isRuText) {
      // Русский: склоняем
      stLabel = isKnit 
        ? getRussianPlural(castOnTotal, 'петля', 'петли', 'петель')
        : getRussianPlural(castOnTotal, 'столбик', 'столбика', 'столбиков');
      rowLabel = getRussianPlural(rowsTotal, 'ряд', 'ряда', 'рядов');
    } else {
      // Английский: всегда sts и rows
      stLabel = 'sts';
      rowLabel = 'rows';
    }

    // Отображение наборного края
    resCastOn.textContent = `${castOnTotal} ${stLabel}`;
    let subText = '';
    if (isCircular) {
      subText = `${castOnReps} ${repLabel} + ${symText} ${sSt} (для кругового вязания)`;
    } else {
      subText = `${castOnReps} ${repLabel} + ${symText} (нач. ${sStart} + кон. ${sEnd}) + ${edgeText} ${e}`;
    }
    resCastOnSub.textContent = subText;

    const desiredCastOnCm = currentDir === 'classic' ? wCm : lCm;
    const diffCast = castOnCm - desiredCastOnCm;
    let devCastText = `→ ${toDisplayCm(castOnCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffCast) < 0.01) devCastText += ` (${isRuText ? 'точно' : 'exact'})`;
    else if (diffCast > 0) devCastText += ` (${isRuText ? 'на' : '+'} ${toDisplayCm(diffCast).toFixed(1)} ${lengthUnit} ${isRuText ? 'больше' : 'more'})`;
    else devCastText += ` (${isRuText ? 'на' : ''} ${toDisplayCm(Math.abs(diffCast)).toFixed(1)} ${lengthUnit} ${isRuText ? 'меньше' : 'less'})`;
    resCastOnDev.textContent = devCastText;

    // Ряды
    resRows.textContent = `${rowsTotal} ${rowLabel}`;
    const rowsReps = Math.floor((rowsTotal - sRo) / rRo);
    resRowsSub.textContent = `${rowsReps} ${repLabel} + ${symText} ${sRo}`;

    const desiredRowsCm = currentDir === 'classic' ? lCm : wCm;
    const diffRow = rowsCm - desiredRowsCm;
    let devRowText = `→ ${toDisplayCm(rowsCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffRow) < 0.01) devRowText += ` (${isRuText ? 'точно' : 'exact'})`;
    else if (diffRow > 0) devRowText += ` (${isRuText ? 'на' : '+'} ${toDisplayCm(diffRow).toFixed(1)} ${lengthUnit} ${isRuText ? 'больше' : 'more'})`;
    else devRowText += ` (${isRuText ? 'на' : ''} ${toDisplayCm(Math.abs(diffRow)).toFixed(1)} ${lengthUnit} ${isRuText ? 'меньше' : 'less'})`;
    resRowsDev.textContent = devRowText;

    // Размер
    const sizeWidth = toDisplayCm(wCm);
    const sizeLength = toDisplayCm(lCm);
    const sizeUnit = currentUnits === 'metric' ? (isRuText ? 'см' : 'cm') : 'in';
    resSize.textContent = `${sizeWidth.toFixed(1)} × ${sizeLength.toFixed(1)} ${sizeUnit}`;
  }

  // ---------- Переводы (не изменяются) ----------
  const translations = {
    ru: {
      manifestName: 'Хаттер: Дизайнер шарфов и пледов',
      manifestShortName: 'Хаттер',
      pwaAndroid: 'Откройте меню браузера и выберите «Добавить на экран домой» или «Установить приложение».',
      pwaTitle: 'Установите «Хаттер»',
      pwaDesc: 'Добавьте на главный экран для быстрого доступа без браузера.',
      pwaBtn: 'Установить',
      pwaIOS: 'Нажмите <strong>«Поделиться»</strong> <span style="font-size:1.2em;">⎋</span> и выберите <strong>«На экран «Домой»</strong>.',
      printBtn: 'Печать',
      pdfBtn: 'Сохранить как PDF',
      logo: 'Хаттер',
      logoSub: 'Дизайнер шарфов и пледов',
      resultTitle: 'Результаты',
      dimTitle: 'Размеры и направление',
      rapportTitle: 'Раппорт и симметрия',
      densityTitle: 'Плотность (после ВТО)',
      toolLabel: 'Способ вязания',
      donate: 'Поддержать',
      calculateBtn: 'Рассчитать',
      unitMetric: 'см',
      unitImperial: 'дюймы',
      warningKnit: 'Образец должен быть не менее 12×12 см (5×5 дюймов) после ВТО. Плотность измеряйте строго в центре образца, на участке 10×10 см (4×4 дюйма), не включая кромочные и края.',
      warningCrochet: 'Образец должен быть не менее 12×12 см (5×5 дюймов) после ВТО. Плотность измеряйте строго в центре образца, на участке 10×10 см (4×4 дюйма), не включая петли подъёма.',
      toolKnit: 'Спицы',
      toolCrochet: 'Крючок',
      lblRepSt: 'Раппорт (петли)',
      lblRepRow: 'Раппорт (ряды)',
      lblSymStart: 'Симметрия (начало ряда)',
      lblSymEnd: 'Симметрия (конец ряда)',
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
      resLabelCastOnKnit: 'Количество петель для набора',
      resLabelCastOnCrochet: 'Количество воздушных петель для набора',
      resLabelRows: 'Количество рядов',
      resLabelSize: 'Размер',
      resSizeSub: 'Ширина × Длина',
    },
    us: {
      manifestName: 'The Hatter: Scarf & Blanket Designer',
      manifestShortName: 'Hatter Scarf',
      pwaAndroid: 'Open browser menu and select «Add to Home Screen» or «Install App».',
      pwaTitle: 'Install "The Hatter"',
      pwaDesc: 'Add to Home Screen for quick access without browser.',
      pwaBtn: 'Install',
      pwaIOS: 'Tap <strong>«Share»</strong> <span style="font-size:1.2em;">⎋</span> and select <strong>«Add to Home Screen»</strong>.',
      printBtn: 'Print',
      pdfBtn: 'Save as PDF',
      logo: 'The Hatter',
      logoSub: 'Scarf & Blanket Designer',
      resultTitle: 'Results',
      dimTitle: 'Size & direction',
      rapportTitle: 'Pattern repeat & symmetry',
      densityTitle: 'Gauge (after blocking)',
      toolLabel: 'Method',
      donate: 'Support',
      calculateBtn: 'Calculate',
      unitMetric: 'cm',
      unitImperial: 'in',
      warningKnit: 'Swatch must be at least 5×5 in (12×12 cm) after blocking. Measure gauge strictly in the center of the swatch, on a 4×4 in (10×10 cm) area, excluding edge stitches and borders.',
      warningCrochet: 'Swatch must be at least 5×5 in (12×12 cm) after blocking. Measure gauge strictly in the center of the swatch, on a 4×4 in (10×10 cm) area, excluding turning chains.',
      toolKnit: 'Knitting',
      toolCrochet: 'Crochet',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymStart: 'Symmetry (beginning of row)',
      lblSymEnd: 'Symmetry (end of row)',
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
      resLabelCastOnKnit: 'Cast on stitches',
      resLabelCastOnCrochet: 'Foundation chain stitches',
      resLabelRows: 'Number of rows',
      resLabelSize: 'Size',
      resSizeSub: 'Width × Length',
    },
    uk: {
      manifestName: 'The Hatter: Scarf & Blanket Designer',
      manifestShortName: 'Hatter Scarf',
      pwaAndroid: 'Open browser menu and select «Add to Home Screen» or «Install App».',
      pwaTitle: 'Install "The Hatter"',
      pwaDesc: 'Add to Home Screen for quick access without browser.',
      pwaBtn: 'Install',
      pwaIOS: 'Tap <strong>«Share»</strong> <span style="font-size:1.2em;">⎋</span> and select <strong>«Add to Home Screen»</strong>.',
      printBtn: 'Print',
      pdfBtn: 'Save as PDF',
      logo: 'The Hatter',
      logoSub: 'Scarf & Blanket Designer',
      resultTitle: 'Results',
      dimTitle: 'Size & direction',
      rapportTitle: 'Pattern repeat & symmetry',
      densityTitle: 'Tension (after blocking)',
      toolLabel: 'Method',
      donate: 'Support',
      calculateBtn: 'Calculate',
      unitMetric: 'cm',
      unitImperial: 'in',
      warningKnit: 'Tension square must be at least 5×5 in (12×12 cm) after blocking. Measure tension strictly in the centre of the square, on a 4×4 in (10×10 cm) area, excluding edge stitches and borders.',
      warningCrochet: 'Tension square must be at least 5×5 in (12×12 cm) after blocking. Measure tension strictly in the centre of the square, on a 4×4 in (10×10 cm) area, excluding turning chains.',
      toolKnit: 'Knitting',
      toolCrochet: 'Crochet',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymStart: 'Symmetry (beginning of row)',
      lblSymEnd: 'Symmetry (end of row)',
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
      resLabelCastOnKnit: 'Cast on stitches',
      resLabelCastOnCrochet: 'Foundation chain stitches',
      resLabelRows: 'Number of rows',
      resLabelSize: 'Size',
      resSizeSub: 'Width × Length',
    }
  };

  // ---------- Остальные функции (без изменений) ----------
  function updateDensityLabels() {
    const isRu = currentLang === 'ru';
    const isMetric = currentUnits === 'metric';
    const isKnit = currentTool === 'knit';
    
    const number = isMetric ? '10' : '4';
    const unit = isMetric ? (isRu ? 'см' : 'cm') : (isRu ? 'дюймах' : 'in');
    
    const stWord = isKnit ? (isRu ? 'петель' : 'sts') : (isRu ? 'столбиков' : 'sts');
    
    const stitchLabel = isRu ? `${stWord} в ${number} ${unit}` : `Sts per ${number} ${unit}`;
    const rowLabel = isRu ? `Рядов в ${number} ${unit}` : `Rows per ${number} ${unit}`;

    document.getElementById('lblStitch').textContent = stitchLabel;
    document.getElementById('lblRow').textContent = rowLabel;
  }

  function updateUnitToggleLabels() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;
    const metricSpan = document.querySelector('#unitToggle .unit-opt[data-unit="metric"]');
    const imperialSpan = document.querySelector('#unitToggle .unit-opt[data-unit="imperial"]');
    if (metricSpan) metricSpan.textContent = t.unitMetric;
    if (imperialSpan) imperialSpan.textContent = t.unitImperial;
  }

  function updateUnitSymbols() {
    const isMetric = currentUnits === 'metric';
    const isRu = currentLang === 'ru';
    let lengthSym;
    if (isMetric) {
      lengthSym = isRu ? 'см' : 'cm';
    } else {
      lengthSym = isRu ? 'дюймы' : 'in';
    }
    document.querySelectorAll('.unit').forEach(el => {
      el.textContent = lengthSym;
    });
    updateDensityLabels();
    updateUnitToggleLabels();
  }

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
    document.getElementById('lblSymStart').textContent = t.lblSymStart;
    document.getElementById('lblSymEnd').textContent = t.lblSymEnd;
    document.getElementById('lblSymRow').textContent = t.lblSymRow;
    document.getElementById('lblEdges').textContent = t.lblEdges;
    document.getElementById('edgeDesc').textContent = t.edgeDesc;
    document.getElementById('lblDir').textContent = t.lblDir;
    document.getElementById('dirClassic').textContent = t.dirClassic;
    document.getElementById('dirCross').textContent = t.dirCross;
    document.getElementById('lblWidth').textContent = t.lblWidth;
    document.getElementById('lblWidthRep').textContent = t.lblWidthRep;
    document.getElementById('lblLength').textContent = t.lblLength;
    document.getElementById('lblLengthRep').textContent = t.lblLengthRep;
    document.getElementById('printBtnText').textContent = t.printBtn;
    document.getElementById('pdfBtnText').textContent = t.pdfBtn;
    document.getElementById('pwaTitle').textContent = t.pwaTitle;
    document.getElementById('pwaDesc').textContent = t.pwaDesc;
    document.getElementById('pwaBtnText').textContent = t.pwaBtn;
    document.getElementById('resLabelSize').textContent = t.resLabelSize;
    document.getElementById('resSizeSub').textContent = t.resSizeSub;
    if (window.isIOS) {
      document.getElementById('ios-instructions').innerHTML = t.pwaIOS;
    } else {
      document.getElementById('ios-instructions').innerHTML = t.pwaAndroid;
    }
    
    document.title = (lang === 'ru' ? 'Хаттер — Калькулятор шарфов' : 'The Hatter — Scarf Calculator');

    updateToolSpecificUI();
    updateWarningText();
    updateUnitSymbols();
    updateManifest();
  }

  function updateToolSpecificUI() {
    const isKnit = currentTool === 'knit';
    const isRu = currentLang === 'ru';
    const lang = currentLang;
    const t = translations[lang] || translations.ru;

    if (edgesGroup) {
      edgesGroup.classList.toggle('hidden', !isKnit);
    }

    const stWord = isKnit ? (isRu ? 'петли' : 'sts') : (isRu ? 'столбики' : 'sts');
    const lblRepSt = document.getElementById('lblRepSt');
    if (lblRepSt) lblRepSt.textContent = isRu ? `Раппорт (${stWord})` : `Repeat (${stWord})`;

    const castOnLabel = isKnit ? t.resLabelCastOnKnit : t.resLabelCastOnCrochet;
    document.getElementById('resLabelCastOn').textContent = castOnLabel;
    document.getElementById('resLabelRows').textContent = t.resLabelRows;

    updateSymmetryVisibility();
  }

  function updateWarningText() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;
    const key = currentTool === 'knit' ? 'warningKnit' : 'warningCrochet';
    const warningEl = document.getElementById('warningText');
    if (warningEl) warningEl.textContent = t[key];
  }

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

    widthRep.value = '';
    lengthRep.value = '';

    updateUnitSymbols();
  }

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

  function setupToggles() {
    document.querySelectorAll('#toolToggle .toggle-option').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#toolToggle .toggle-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentTool = this.dataset.tool;
        updateToolSpecificUI();
        updateWarningText();
        updateUnitSymbols();
        updateSymmetryVisibility();
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

  function setupInputs() {
    edges.addEventListener('change', function() {
      updateSymmetryVisibility();
    });
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
  document.getElementById('print-btn').addEventListener('click', function() { window.print(); });
  document.getElementById('save-pdf-btn').addEventListener('click', function() { window.print(); });

  currentUnits = 'metric';
  document.querySelector('#unitToggle .unit-opt[data-unit="metric"]').classList.add('active');
  updateUnitSymbols();

  currentLang = 'ru';
  document.getElementById('langSelect').value = 'ru';
  updateLanguage();

  updateToolSpecificUI();
  updateWarningText();
  updateUnitSymbols();
  updateSymmetryVisibility();

  document.getElementById('donateBoosty').href = 'https://boosty.to/annafengari/posts/7731692a-b7c1-4855-83fb-3de72975cfc8';

  console.log('🧶 The Hatter: Scarf Studio loaded (fixed Russian declension)');

  // ---------- PWA ----------
  const pwaBanner = document.getElementById('pwa-install-banner');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const pwaCloseBtn = document.getElementById('pwa-close-btn');

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!isStandalone) {
    pwaBanner.style.display = 'block';
    pwaInstallBtn.style.display = 'none';
    document.getElementById('ios-instructions').style.display = 'block';
  }

  pwaCloseBtn.addEventListener('click', () => {
    pwaBanner.style.display = 'none';
    localStorage.setItem('pwaBannerClosed', 'true');
  });

  if (localStorage.getItem('pwaBannerClosed') === 'true') {
    pwaBanner.style.display = 'none';
  }
})();
