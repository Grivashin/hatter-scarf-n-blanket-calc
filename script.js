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
  const swatchWeight = $('swatchWeight');
  const swatchWidth = $('swatchWidth');
  const swatchHeight = $('swatchHeight');
  const skeinW = $('skeinWeight');
  const skeinY = $('skeinYardage');
  const skeinP = $('skeinPrice');

  const resCastOn = $('resCastOn');
  const resCastOnSub = $('resCastOnSub');
  const resCastOnDev = $('resCastOnDev');
  const resRows = $('resRows');
  const resRowsSub = $('resRowsSub');
  const resRowsDev = $('resRowsDev');
  const resYarnTotal = $('resYarnTotal');
  const resYarnSkeins = $('resYarnSkeins');
  const resPriceUsed = $('resPriceUsed');
  const resPricePurchase = $('resPricePurchase');

  // State
  let currentLang = 'ru';
  let currentUnits = 'metric';
  let currentTheme = 'light';
  let currentTool = 'knit';
  let currentDir = 'classic';
  let currentReserve = 10;

  // Helpers
  function getVal(el) { return parseFloat(el.value) || 0; }
  function getInt(el) { return parseInt(el.value) || 0; }

  function toDisplayCm(val) { return currentUnits === 'metric' ? val : val / 2.54; }
  function toDisplayG(val) { return currentUnits === 'metric' ? val : val * 0.035274; }
  function toDisplayM(val) { return currentUnits === 'metric' ? val : val * 1.09361; }
  function fromDisplayCm(val) { return currentUnits === 'metric' ? val : val * 2.54; }
  function fromDisplayG(val) { return currentUnits === 'metric' ? val : val / 0.035274; }
  function fromDisplayM(val) { return currentUnits === 'metric' ? val : val / 1.09361; }

  function recalcDimensionsFromReps() {
    const dSt = fromDisplayCm(getVal(densitySt));
    const dRo = fromDisplayCm(getVal(densityRow));
    const rSt = getInt(repSt);
    const rRo = getInt(repRow);
    const sSt = getInt(symSt);
    const sRo = getInt(symRow);
    const e = parseInt(edges.value);

    let wRep = getInt(widthRep);
    if (rSt > 0 && wRep > 0) {
      const totalSt = wRep * rSt + sSt + e;
      const wCm = (totalSt / dSt) * 10;
      widthCm.value = toDisplayCm(wCm).toFixed(2);
    }

    let lRep = getInt(lengthRep);
    if (rRo > 0 && lRep > 0) {
      const totalRo = lRep * rRo + sRo;
      const lCm = (totalRo / dRo) * 10;
      lengthCm.value = toDisplayCm(lCm).toFixed(2);
    }
  }

  function calculate() {
    const active = document.activeElement;
    const repFields = [widthRep, lengthRep, repSt, repRow, symSt, symRow, edges];
    if (repFields.includes(active)) {
      recalcDimensionsFromReps();
    }

    const dSt = fromDisplayCm(getVal(densitySt));
    const dRo = fromDisplayCm(getVal(densityRow));
    const rSt = getInt(repSt);
    const rRo = getInt(repRow);
    const sSt = getInt(symSt);
    const sRo = getInt(symRow);
    const e = parseInt(edges.value);

    let wCm = fromDisplayCm(getVal(widthCm));
    let lCm = fromDisplayCm(getVal(lengthCm));
    let wRep = getInt(widthRep);
    let lRep = getInt(lengthRep);

    if (active === widthRep) {
      wCm = fromDisplayCm(getVal(widthCm));
    } else if (active === widthCm || active === null || !repFields.includes(active)) {
      if (rSt > 0) {
        const base = (wCm / 10) * dSt - sSt - e;
        if (base > 0) {
          const n = Math.round(base / rSt);
          wRep = Math.max(1, n);
          widthRep.value = wRep;
          const totalSt = wRep * rSt + sSt + e;
          wCm = (totalSt / dSt) * 10;
          widthCm.value = toDisplayCm(wCm).toFixed(2);
        } else {
          wRep = 1;
          widthRep.value = 1;
          const totalSt = wRep * rSt + sSt + e;
          wCm = (totalSt / dSt) * 10;
          widthCm.value = toDisplayCm(wCm).toFixed(2);
        }
      }
    }

    if (active === lengthRep) {
      lCm = fromDisplayCm(getVal(lengthCm));
    } else if (active === lengthCm || active === null || !repFields.includes(active)) {
      if (rRo > 0) {
        const base = (lCm / 10) * dRo - sRo;
        if (base > 0) {
          const m = Math.round(base / rRo);
          lRep = Math.max(1, m);
          lengthRep.value = lRep;
          const totalRo = lRep * rRo + sRo;
          lCm = (totalRo / dRo) * 10;
          lengthCm.value = toDisplayCm(lCm).toFixed(2);
        } else {
          lRep = 1;
          lengthRep.value = 1;
          const totalRo = lRep * rRo + sRo;
          lCm = (totalRo / dRo) * 10;
          lengthCm.value = toDisplayCm(lCm).toFixed(2);
        }
      }
    }

    let castOnTotal, rowsTotal;
    let castOnCm, rowsCm;
    let desiredCastOnCm, desiredRowsCm;

    if (currentDir === 'classic') {
      castOnTotal = wRep * rSt + sSt + e;
      castOnCm = (castOnTotal / dSt) * 10;
      desiredCastOnCm = wCm;
      rowsTotal = lRep * rRo + sRo;
      rowsCm = (rowsTotal / dRo) * 10;
      desiredRowsCm = lCm;
    } else {
      castOnTotal = lRep * rSt + sSt + e;
      castOnCm = (castOnTotal / dSt) * 10;
      desiredCastOnCm = lCm;
      rowsTotal = wRep * rRo + sRo;
      rowsCm = (rowsTotal / dRo) * 10;
      desiredRowsCm = wCm;
    }

    // Yarn
    const swWeightMetric = fromDisplayG(getVal(swatchWeight));
    const swWmetric = fromDisplayCm(getVal(swatchWidth));
    const swHmetric = fromDisplayCm(getVal(swatchHeight));
    const skWmetric = fromDisplayG(getVal(skeinW));
    const skYmetric = fromDisplayM(getVal(skeinY));
    const skP = getVal(skeinP);

    let totalWeight = 0, totalYardage = 0, totalCost = 0, skeinsNeeded = 0;
    let usedCost = 0, purchaseCost = 0;
    if (swWeightMetric > 0 && swWmetric > 0 && swHmetric > 0 && skWmetric > 0 && skYmetric > 0) {
      const swatchArea = swWmetric * swHmetric;
      const weightPerCm2 = swWeightMetric / swatchArea;
      const scarfArea = wCm * lCm;
      totalWeight = weightPerCm2 * scarfArea;
      totalYardage = (totalWeight / skWmetric) * skYmetric;
      if (skP > 0) {
        totalCost = (totalYardage / skYmetric) * skP;
        usedCost = totalCost;
      }
      const reserveFactor = 1 + currentReserve / 100;
      const yardageWithReserve = totalYardage * reserveFactor;
      skeinsNeeded = Math.ceil(yardageWithReserve / skYmetric);
      if (skP > 0) {
        purchaseCost = skeinsNeeded * skP;
      }
    }

    // --- Update UI ---
    const isRu = currentLang === 'ru';
    const stLabel = currentTool === 'knit' ? (isRu ? 'петель' : 'sts') : (isRu ? 'столбиков' : 'sts');
    const rowLabel = isRu ? 'рядов' : 'rows';
    const repLabel = isRu ? 'рапп.' : 'rep.';
    const lengthUnit = currentUnits === 'metric' ? (isRu ? 'см' : 'cm') : 'in';
    const weightUnit = currentUnits === 'metric' ? (isRu ? 'г' : 'g') : 'oz';
    const yardUnit = currentUnits === 'metric' ? (isRu ? 'м' : 'm') : 'yd';
    const currency = isRu ? '₽' : '$';

    resCastOn.textContent = `${castOnTotal} ${stLabel}`;
    const castOnReps = Math.floor((castOnTotal - sSt - e) / rSt);
    const symText = isRu ? 'сим.' : 'sym';
    const edgeText = isRu ? 'кром.' : 'edge';
    resCastOnSub.textContent = `${castOnReps} ${repLabel} + ${symText} ${sSt} + ${edgeText} ${e}`;
    const diffCast = castOnCm - desiredCastOnCm;
    let devCastText = `→ ${toDisplayCm(castOnCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffCast) < 0.01) devCastText += ` (${isRu ? 'точно' : 'exact'})`;
    else if (diffCast > 0) devCastText += ` (${isRu ? 'на' : '+'} ${toDisplayCm(diffCast).toFixed(1)} ${lengthUnit} ${isRu ? 'больше' : 'more'})`;
    else devCastText += ` (${isRu ? 'на' : ''} ${toDisplayCm(Math.abs(diffCast)).toFixed(1)} ${lengthUnit} ${isRu ? 'меньше' : 'less'})`;
    resCastOnDev.textContent = devCastText;

    resRows.textContent = `${rowsTotal} ${rowLabel}`;
    const rowsReps = Math.floor((rowsTotal - sRo) / rRo);
    resRowsSub.textContent = `${rowsReps} ${repLabel} + ${symText} ${sRo}`;
    const diffRow = rowsCm - desiredRowsCm;
    let devRowText = `→ ${toDisplayCm(rowsCm).toFixed(1)} ${lengthUnit}`;
    if (Math.abs(diffRow) < 0.01) devRowText += ` (${isRu ? 'точно' : 'exact'})`;
    else if (diffRow > 0) devRowText += ` (${isRu ? 'на' : '+'} ${toDisplayCm(diffRow).toFixed(1)} ${lengthUnit} ${isRu ? 'больше' : 'more'})`;
    else devRowText += ` (${isRu ? 'на' : ''} ${toDisplayCm(Math.abs(diffRow)).toFixed(1)} ${lengthUnit} ${isRu ? 'меньше' : 'less'})`;
    resRowsDev.textContent = devRowText;

    resYarnTotal.textContent = `${toDisplayM(totalYardage).toFixed(1)} ${yardUnit} / ${toDisplayG(totalWeight).toFixed(1)} ${weightUnit}`;
    let skeinText = isRu ? `Потребуется ${skeinsNeeded} мотков` : `${skeinsNeeded} skeins needed`;
    if (skeinsNeeded > 0) {
      const buyText = isRu ? 'купить' : 'buy';
      skeinText += ` (${buyText} ${skeinsNeeded} ${isRu ? 'шт' : 'pcs'})`;
    }
    resYarnSkeins.textContent = skeinText;

    const usedPriceStr = isRu ? `${usedCost.toFixed(0)} ${currency}` : `${(usedCost/100).toFixed(2)} ${currency}`;
    const purchasePriceStr = isRu ? `${purchaseCost.toFixed(0)} ${currency}` : `${(purchaseCost/100).toFixed(2)} ${currency}`;
    resPriceUsed.textContent = `${isRu ? 'Использовано' : 'Used'}: ${usedPriceStr}`;
    resPricePurchase.textContent = `${isRu ? 'К покупке' : 'To buy'} (${currentReserve}% ${isRu ? 'запас' : 'reserve'}): ${purchasePriceStr}`;
  }

  // Translations
  const translations = {
    ru: {
      logo: 'Хаттер',
      logoSub: 'Дизайнер шарфов',
      donate: 'Поддержать',
      densityTitle: 'Плотность (после ВТО)',
      warning: 'Образец не менее 12×12 см (5×5 in), после ВТО. Измеряйте 10×10 см (4×4 in) в центре.',
      densityHint: 'Для точного расчёта пряжи укажите вес образца и его фактические размеры (не только 10×10 см).',
      toolKnit: 'Спицы',
      toolCrochet: 'Крючок',
      lblStitch: 'Петель в 10 см',
      lblRow: 'Рядов в 10 см',
      rapportTitle: 'Раппорт и симметрия',
      lblRepSt: 'Раппорт (петли)',
      lblRepRow: 'Раппорт (ряды)',
      lblSymSt: 'Симметрия (петли) *общая',
      symHint: '*общая',
      symDesc: '* для начала и конца ряда',
      lblSymRow: 'Симметрия (ряды)',
      lblEdges: 'Кромочные (к наборному краю)',
      edgeHint: '(к наборному краю)',
      edgeDesc: 'не входят в раппорт',
      dimTitle: 'Размеры и направление',
      lblDir: 'Направление вязания',
      dirClassic: 'Классическое (ширина → набор)',
      dirCross: 'Поперечное (длина → набор)',
      lblWidth: 'Ширина',
      lblWidthRep: 'Ширина (в раппортах)',
      lblLength: 'Длина',
      lblLengthRep: 'Длина (в раппортах)',
      yarnTitle: 'Калькулятор пряжи',
      lblSwatch: 'Вес образца',
      lblSwatchW: 'Ширина образца',
      lblSwatchH: 'Высота образца',
      lblSkeinW: 'Вес мотка',
      lblSkeinY: 'Метраж мотка',
      lblSkeinP: 'Цена мотка',
      lblReserve: 'Запас пряжи (%)',
      resultTitle: 'Результат расчета',
      resLabelCastOn: 'Наборный край',
      resLabelRows: 'Ряды',
      resLabelYarn: 'Расход пряжи',
      resLabelPrice: 'Цена',
      printBtnText: 'Печать / PDF'
    },
    us: {
      logo: 'The Hatter',
      logoSub: 'Scarf Studio',
      donate: 'Support',
      densityTitle: 'Gauge (after blocking)',
      warning: 'Swatch at least 5×5 in (12×12 cm), after blocking. Measure 4×4 in (10×10 cm) in the center.',
      densityHint: 'For accurate yarn calculation, enter the swatch weight and its actual dimensions (not just 4×4 in).',
      toolKnit: 'Knit',
      toolCrochet: 'Crochet',
      lblStitch: 'Sts per 4 in',
      lblRow: 'Rows per 4 in',
      rapportTitle: 'Pattern repeat & symmetry',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymSt: 'Symmetry (sts) *total',
      symHint: '*total',
      symDesc: '* for beginning and end',
      lblSymRow: 'Symmetry (rows)',
      lblEdges: 'Edge stitches (to cast-on)',
      edgeHint: '(to cast-on)',
      edgeDesc: 'not part of repeat',
      dimTitle: 'Size & direction',
      lblDir: 'Knitting direction',
      dirClassic: 'Classic (width → cast on)',
      dirCross: 'Crosswise (length → cast on)',
      lblWidth: 'Width',
      lblWidthRep: 'Width (in repeats)',
      lblLength: 'Length',
      lblLengthRep: 'Length (in repeats)',
      yarnTitle: 'Yarn calculator',
      lblSwatch: 'Swatch weight',
      lblSwatchW: 'Swatch width',
      lblSwatchH: 'Swatch height',
      lblSkeinW: 'Skein weight',
      lblSkeinY: 'Skein yardage',
      lblSkeinP: 'Skein price',
      lblReserve: 'Yarn reserve (%)',
      resultTitle: 'Results',
      resLabelCastOn: 'Cast on',
      resLabelRows: 'Rows',
      resLabelYarn: 'Yarn usage',
      resLabelPrice: 'Price',
      printBtnText: 'Print / PDF'
    },
    uk: {
      logo: 'The Hatter',
      logoSub: 'Scarf Studio',
      donate: 'Support',
      densityTitle: 'Tension (after blocking)',
      warning: 'Tension square at least 5×5 in (12×12 cm), after blocking. Measure 4×4 in (10×10 cm) in the centre.',
      densityHint: 'For accurate yarn calculation, enter the tension square weight and its actual dimensions (not just 4×4 in).',
      toolKnit: 'Knit',
      toolCrochet: 'Crochet',
      lblStitch: 'Sts per 4 in',
      lblRow: 'Rows per 4 in',
      rapportTitle: 'Pattern repeat & symmetry',
      lblRepSt: 'Repeat (sts)',
      lblRepRow: 'Repeat (rows)',
      lblSymSt: 'Symmetry (sts) *total',
      symHint: '*total',
      symDesc: '* for beginning and end',
      lblSymRow: 'Symmetry (rows)',
      lblEdges: 'Edge stitches (to cast-on)',
      edgeHint: '(to cast-on)',
      edgeDesc: 'not part of repeat',
      dimTitle: 'Size & direction',
      lblDir: 'Knitting direction',
      dirClassic: 'Classic (width → cast on)',
      dirCross: 'Crosswise (length → cast on)',
      lblWidth: 'Width',
      lblWidthRep: 'Width (in repeats)',
      lblLength: 'Length',
      lblLengthRep: 'Length (in repeats)',
      yarnTitle: 'Yarn calculator',
      lblSwatch: 'Swatch weight',
      lblSwatchW: 'Swatch width',
      lblSwatchH: 'Swatch height',
      lblSkeinW: 'Skein weight',
      lblSkeinY: 'Skein yardage',
      lblSkeinP: 'Skein price',
      lblReserve: 'Yarn reserve (%)',
      resultTitle: 'Results',
      resLabelCastOn: 'Cast on',
      resLabelRows: 'Rows',
      resLabelYarn: 'Yarn usage',
      resLabelPrice: 'Price',
      printBtnText: 'Print / PDF'
    }
  };

  function updateLanguage() {
    const lang = currentLang;
    const t = translations[lang] || translations.ru;

    document.querySelector('.logo-text').textContent = t.logo;
    document.querySelector('.logo-sub').textContent = t.logoSub;
    document.getElementById('donateText').textContent = t.donate;
    document.getElementById('densityTitle').textContent = t.densityTitle;
    document.getElementById('warningText').textContent = t.warning;
    document.getElementById('densityHintText').textContent = t.densityHint;
    document.getElementById('toolKnit').textContent = t.toolKnit;
    document.getElementById('toolCrochet').textContent = t.toolCrochet;
    document.getElementById('lblStitch').textContent = t.lblStitch;
    document.getElementById('lblRow').textContent = t.lblRow;
    document.getElementById('rapportTitle').textContent = t.rapportTitle;
    document.getElementById('lblRepSt').textContent = t.lblRepSt;
    document.getElementById('lblRepRow').textContent = t.lblRepRow;
    document.getElementById('lblSymSt').innerHTML = t.lblSymSt + ' <span class="label-hint">' + t.symHint + '</span>';
    document.getElementById('symDesc').textContent = t.symDesc;
    document.getElementById('lblSymRow').textContent = t.lblSymRow;
    document.getElementById('lblEdges').innerHTML = t.lblEdges + ' <span class="label-hint">' + t.edgeHint + '</span>';
    document.getElementById('edgeDesc').textContent = t.edgeDesc;
    document.getElementById('dimTitle').textContent = t.dimTitle;
    document.getElementById('lblDir').textContent = t.lblDir;
    document.getElementById('dirClassic').textContent = t.dirClassic;
    document.getElementById('dirCross').textContent = t.dirCross;
    document.getElementById('lblWidth').textContent = t.lblWidth;
    document.getElementById('lblWidthRep').textContent = t.lblWidthRep;
    document.getElementById('lblLength').textContent = t.lblLength;
    document.getElementById('lblLengthRep').textContent = t.lblLengthRep;
    document.getElementById('yarnTitle').textContent = t.yarnTitle;
    document.getElementById('lblSwatch').textContent = t.lblSwatch;
    document.getElementById('lblSwatchW').textContent = t.lblSwatchW;
    document.getElementById('lblSwatchH').textContent = t.lblSwatchH;
    document.getElementById('lblSkeinW').textContent = t.lblSkeinW;
    document.getElementById('lblSkeinY').textContent = t.lblSkeinY;
    document.getElementById('lblSkeinP').textContent = t.lblSkeinP;
    document.getElementById('lblReserve').textContent = t.lblReserve;
    document.getElementById('resultTitle').textContent = t.resultTitle;
    document.getElementById('resLabelCastOn').textContent = t.resLabelCastOn;
    document.getElementById('resLabelRows').textContent = t.resLabelRows;
    document.getElementById('resLabelYarn').textContent = t.resLabelYarn;
    document.getElementById('resLabelPrice').textContent = t.resLabelPrice;
    document.getElementById('printBtnText').textContent = t.printBtnText;

    document.title = t.logo + ' — ' + t.logoSub;

    updateUnitSymbols();
    calculate();
  }

  function updateUnitSymbols() {
    const isMetric = currentUnits === 'metric';
    const lengthSym = isMetric ? 'см' : 'in';
    const weightSym = isMetric ? 'г' : 'oz';
    const yardSym = isMetric ? 'м' : 'yd';
    const currencySym = currentLang === 'ru' ? '₽' : '$';

    document.querySelectorAll('.unit').forEach(el => {
      if (el.dataset.unit === 'length') el.textContent = lengthSym;
      if (el.dataset.unit === 'weight') el.textContent = weightSym;
      if (el.dataset.unit === 'yard') el.textContent = yardSym;
      if (el.dataset.unit === 'currency') el.textContent = currencySym;
    });
  }

  // ---------- Исправленная функция переключения единиц ----------
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
      // Плотность НЕ пересчитываем — оставляем как есть
      // Конвертируем только размеры (см ⇄ дюймы)
      convertField(widthCm, v => fromMetric ? v / 2.54 : v * 2.54);
      convertField(lengthCm, v => fromMetric ? v / 2.54 : v * 2.54);
      convertField(swatchWidth, v => fromMetric ? v / 2.54 : v * 2.54);
      convertField(swatchHeight, v => fromMetric ? v / 2.54 : v * 2.54);
      // Конвертируем вес и метраж
      convertField(swatchWeight, v => fromMetric ? v * 0.035274 : v / 0.035274);
      convertField(skeinW, v => fromMetric ? v * 0.035274 : v / 0.035274);
      convertField(skeinY, v => fromMetric ? v * 1.09361 : v / 1.09361);
    }

    currentUnits = newUnits;
    document.querySelectorAll('#unitToggle .unit-opt').forEach(el => {
      el.classList.toggle('active', el.dataset.unit === newUnits);
    });
    updateUnitSymbols();
    calculate();
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
        calculate();
      });
    });
    document.querySelectorAll('#directionToggle .toggle-option').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('#directionToggle .toggle-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentDir = this.dataset.dir;
        calculate();
      });
    });
  }

  function setupInputs() {
    const inputs = [densitySt, densityRow, repSt, repRow, symSt, symRow, edges, 
                    widthCm, lengthCm, widthRep, lengthRep, 
                    swatchWeight, swatchWidth, swatchHeight, skeinW, skeinY, skeinP];
    inputs.forEach(inp => {
      inp.addEventListener('input', calculate);
      inp.addEventListener('change', calculate);
    });
  }

  function setupReserve() {
    document.querySelectorAll('.reserve-option').forEach(el => {
      el.addEventListener('click', function() {
        document.querySelectorAll('.reserve-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentReserve = parseInt(this.dataset.reserve, 10);
        calculate();
      });
    });
  }

  // --- Init ---
  initTheme();

  // Set donate link
  document.getElementById('donateBoosty').href = 'https://boosty.to/annafengari';

  setupToggles();
  setupInputs();
  setupReserve();

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('langSelect').addEventListener('change', function(e) {
    const newLang = e.target.value;
    if (newLang !== currentLang) {
      currentLang = newLang;
      updateLanguage();
      calculate();
    }
  });

  document.querySelectorAll('#unitToggle .unit-opt').forEach(el => {
    el.addEventListener('click', function() {
      toggleUnits(this.dataset.unit);
    });
  });

  // Initial units and language
  currentUnits = 'metric';
  document.querySelector('#unitToggle .unit-opt[data-unit="metric"]').classList.add('active');
  updateUnitSymbols();

  currentLang = 'ru';
  document.getElementById('langSelect').value = 'ru';
  updateLanguage();
  calculate();

  window.addEventListener('resize', calculate);
  console.log('🧶 The Hatter: Scarf Studio loaded!');
})();
