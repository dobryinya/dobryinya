'use strict';

/*
 * Тренажёр заданий ВПР типа «цена — количество — стоимость / сдача».
 *
 * Файлы ассетов лежат в:
 * /images/erudit/vpr-shop/
 *
 * Цены в PNG не рисуются: они генерируются здесь и выводятся HTML-ценниками.
 */

const CONFIG = {
  counts: [5, 10, 20],
  defaultCount: 10,
  banknotes: [100, 500, 1000],
  maxWrongAttempts: 3,
  storageKey: 'dobrynya-erudit-vpr-shop-stats-v1',

  assets: {
    counter: '/images/erudit/vpr-shop/counter.png'
  },

  feedback: {
    correct: ['Верно! 👍', 'Отлично! ⭐', 'Правильно! 😊', 'Так держать! 💪'],
    retry: 'Проверь вычисления и попробуй ещё раз.',
    secondTry: 'Подумай, какие действия нужно выполнить по условию.',
    reveal: answer => `Правильный ответ: ${answer} рублей.`
  },

  /*
   * forms — формы предмета после числительных:
   * [1, 2–4, 5+].
   *
   * Для kg и pack используется genitive:
   * «три килограмма картофеля», «две пачки печенья».
   */
  products: {
    potato: {
      title: 'Картофель', genitive: 'картофеля', unit: 'kg',
      image: '/images/erudit/vpr-shop/potato.png', price: [50, 150, 5]
    },
    cabbage: {
      title: 'Капуста', genitive: 'капусты', unit: 'kg',
      image: '/images/erudit/vpr-shop/cabbage.png', price: [50, 150, 5]
    },
    onion: {
      title: 'Репчатый лук', genitive: 'репчатого лука', unit: 'kg',
      image: '/images/erudit/vpr-shop/onion.png', price: [50, 150, 5]
    },
    carrot: {
      title: 'Морковь', genitive: 'моркови', unit: 'kg',
      image: '/images/erudit/vpr-shop/carrot.png', price: [50, 150, 5]
    },

    apple: {
      title: 'Яблоки', genitive: 'яблок', unit: 'kg',
      image: '/images/erudit/vpr-shop/apple.png', price: [80, 220, 5]
    },
    mandarin: {
      title: 'Мандарины', genitive: 'мандаринов', unit: 'kg',
      image: '/images/erudit/vpr-shop/mandarin.png', price: [100, 260, 5]
    },
    pear: {
      title: 'Груши', genitive: 'груш', unit: 'kg',
      image: '/images/erudit/vpr-shop/pear.png', price: [90, 240, 5]
    },

    crackers: {
      title: 'Крекеры', genitive: 'крекеров', unit: 'pack',
      image: '/images/erudit/vpr-shop/crackers.png', price: [50, 160, 5]
    },
    marshmallow: {
      title: 'Зефир', genitive: 'зефира', unit: 'pack',
      image: '/images/erudit/vpr-shop/marshmallow.png', price: [70, 190, 5]
    },
    cookies: {
      title: 'Печенье', genitive: 'печенья', unit: 'pack',
      image: '/images/erudit/vpr-shop/cookies.png', price: [60, 190, 5]
    },
    chocolate: {
      title: 'Шоколад', genitive: 'шоколада', unit: 'pack',
      image: '/images/erudit/vpr-shop/chocolate.png', price: [70, 180, 5]
    },

    milk: {
      title: 'Молоко', forms: ['пакет молока', 'пакета молока', 'пакетов молока'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/milk.png', price: [70, 160, 5]
    },
    kefir: {
      title: 'Кефир', forms: ['пакет кефира', 'пакета кефира', 'пакетов кефира'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/kefir.png', price: [70, 170, 5]
    },
    cottageCheese: {
      title: 'Творог', forms: ['пачку творога', 'пачки творога', 'пачек творога'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/cottage-cheese.png', price: [80, 220, 5]
    },
    yogurt: {
      title: 'Йогурт', forms: ['йогурт', 'йогурта', 'йогуртов'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/yogurt.png', price: [60, 150, 5]
    },

    pen: {
      title: 'Ручка', forms: ['ручку', 'ручки', 'ручек'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/pen.png', price: [30, 120, 5]
    },
    pencil: {
      title: 'Карандаш', forms: ['карандаш', 'карандаша', 'карандашей'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/pencil.png', price: [15, 70, 5]
    },
    notebook: {
      title: 'Тетрадь', forms: ['тетрадь', 'тетради', 'тетрадей'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/notebook.png', price: [25, 100, 5]
    },
    ruler: {
      title: 'Линейка', forms: ['линейку', 'линейки', 'линеек'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/ruler.png', price: [20, 80, 5]
    },

    toyCar: {
      title: 'Машинка', forms: ['машинку', 'машинки', 'машинок'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/toy-car.png', price: [40, 120, 5]
    },
    blocks: {
      title: 'Конструктор', forms: ['конструктор', 'конструктора', 'конструкторов'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/blocks.png', price: [60, 180, 5]
    },
    ball: {
      title: 'Мяч', forms: ['мяч', 'мяча', 'мячей'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/ball.png', price: [40, 120, 5]
    },

    hat: {
      title: 'Шапка', forms: ['шапку', 'шапки', 'шапок'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/hat.png', price: [150, 450, 10]
    },
    scarf: {
      title: 'Шарф', forms: ['шарф', 'шарфа', 'шарфов'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/scarf.png', price: [150, 450, 10]
    },
    mittens: {
      title: 'Варежки', forms: ['пару варежек', 'пары варежек', 'пар варежек'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/mittens.png', price: [150, 400, 10]
    },

    rose: {
      title: 'Роза', forms: ['розу', 'розы', 'роз'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/rose.png', price: [80, 220, 5]
    },
    tulip: {
      title: 'Тюльпан', forms: ['тюльпан', 'тюльпана', 'тюльпанов'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/tulip.png', price: [60, 180, 5]
    },
    lily: {
      title: 'Лилия', forms: ['лилию', 'лилии', 'лилий'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/lily.png', price: [90, 240, 5]
    },

    shampoo: {
      title: 'Шампунь', forms: ['шампунь', 'шампуня', 'шампуней'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/shampoo.png', price: [180, 450, 10]
    },
    faceCream: {
      title: 'Крем для лица', forms: ['крем для лица', 'крема для лица', 'кремов для лица'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/face-cream.png', price: [180, 450, 10]
    },
    toothpaste: {
      title: 'Зубная паста', forms: ['зубную пасту', 'зубные пасты', 'зубных паст'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/toothpaste.png', price: [90, 220, 5]
    },
    toothbrush: {
      title: 'Зубная щётка', forms: ['зубную щётку', 'зубные щётки', 'зубных щёток'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/toothbrush.png', price: [80, 200, 5]
    },

    bread: {
      title: 'Хлеб', forms: ['буханку хлеба', 'буханки хлеба', 'буханок хлеба'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/bread.png', price: [45, 100, 5]
    },
    baguette: {
      title: 'Багет', forms: ['багет', 'багета', 'багетов'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/baguette.png', price: [50, 120, 5]
    },
    bun: {
      title: 'Булочка', forms: ['булочку', 'булочки', 'булочек'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/bun.png', price: [35, 90, 5]
    },

    pizza: {
      title: 'Пицца', forms: ['пиццу', 'пиццы', 'пицц'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/pizza.png', price: [120, 280, 10]
    },
    spaghetti: {
      title: 'Спагетти', forms: ['порцию спагетти', 'порции спагетти', 'порций спагетти'], gender: 'f', unit: 'piece',
      image: '/images/erudit/vpr-shop/spaghetti.png', price: [120, 260, 10]
    },
    cappuccino: {
      title: 'Капучино', forms: ['капучино', 'капучино', 'капучино'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/cappuccino.png', price: [80, 180, 10]
    },
    tea: {
      title: 'Чай', forms: ['чай', 'чая', 'чаёв'], gender: 'm', unit: 'piece',
      image: '/images/erudit/vpr-shop/tea.png', price: [50, 120, 10]
    }
  },

  categories: [
    { id: 'vegetables', intro: 'В магазине продаются овощи. На рисунке указана цена 1 кг.', products: ['potato', 'cabbage', 'onion', 'carrot'] },
    { id: 'fruit', intro: 'На рынке продаются фрукты. На рисунке указана цена 1 кг.', products: ['apple', 'mandarin', 'pear'] },
    { id: 'sweets', intro: 'В магазине продаются кондитерские изделия. На рисунке показаны цены.', products: ['crackers', 'marshmallow', 'cookies', 'chocolate'] },
    { id: 'dairy', intro: 'В магазине продаются молочные продукты. На рисунке показаны цены.', products: ['milk', 'kefir', 'cottageCheese', 'yogurt'] },
    { id: 'stationery', intro: 'В магазине продаются канцелярские товары. На рисунке показаны цены.', products: ['pen', 'pencil', 'notebook', 'ruler'] },
    { id: 'toys', intro: 'В магазине продаются игрушки. На рисунке показаны цены.', products: ['toyCar', 'blocks', 'ball'] },
    { id: 'clothes', intro: 'В магазине продаются тёплые вещи. На рисунке показаны цены.', products: ['hat', 'scarf', 'mittens'] },
    { id: 'flowers', intro: 'В цветочном магазине продаются цветы. На рисунке показаны цены.', products: ['rose', 'tulip', 'lily'] },
    { id: 'care', intro: 'В магазине продаются товары для ухода. На рисунке показаны цены.', products: ['shampoo', 'faceCream', 'toothpaste', 'toothbrush'] },
    { id: 'bakery', intro: 'В магазине продаются хлебобулочные изделия. На рисунке показаны цены.', products: ['bread', 'baguette', 'bun'] },
    { id: 'cafe', intro: 'В кафе действует меню, показанное на рисунке.', products: ['pizza', 'spaghetti', 'cappuccino', 'tea'] }
  ]
};

const state = {
  count: CONFIG.defaultCount,
  questions: [],
  index: 0,
  correct: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
  currentMistakes: 0,
  mistakes: new Map(),
  finished: false,
  reviewMode: false,
  locked: false,
  typeStats: createEmptyTypeStats()
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function init() {
  renderCountPicker();
  bindActions();
}

function renderCountPicker() {
  $('[data-role="count-picker"]').innerHTML = CONFIG.counts.map(count => `
    <button type="button" class="vpr-count-card ${state.count === count ? 'is-selected' : ''}" data-count="${count}" aria-pressed="${state.count === count}">
      ${count} заданий
    </button>
  `).join('');
}

function bindActions() {
  document.addEventListener('click', event => {
    const countButton = event.target.closest('[data-count]');
    if (countButton) {
      state.count = Number(countButton.dataset.count);
      renderCountPicker();
      return;
    }

    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;
    if (action === 'start') return startTraining();
    if (action === 'check-input') return checkInputAnswer();
    if (action === 'next') return nextQuestion();
    if (action === 'stop') return finishTraining();
    if (action === 'restart') return startTraining();
    if (action === 'settings') return showScreen('settings');
    if (action === 'retry-mistakes') return startMistakeReview();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    if (!$('[data-screen="training"]')?.classList.contains('is-active')) return;

    const next = $('[data-action="next"]');
    if (next && !next.disabled) {
      nextQuestion();
      return;
    }

    const input = $('[data-role="answer-input"]');
    if (!input || input.disabled) return;
    checkInputAnswer();
  });
}

function startTraining() {
  resetRun();
  state.questions = Array.from({ length: state.count }, () => generateQuestion());
  showScreen('training');
  renderQuestion();
}

function resetRun() {
  state.index = 0;
  state.correct = 0;
  state.attempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.mistakes = new Map();
  state.finished = false;
  state.reviewMode = false;
  state.locked = false;
  state.typeStats = createEmptyTypeStats();
}

function createEmptyTypeStats() {
  return {
    total: { shown: 0, correct: 0 },
    change: { shown: 0, correct: 0 }
  };
}

function generateQuestion() {
  /* Оба вида ВПР встречаются случайно; ребёнок заранее тип не выбирает. */
  return Math.random() < 0.5 ? generateTotalQuestion() : generateChangeQuestion();
}

function generateTotalQuestion() {
  const category = randomItem(CONFIG.categories);
  const productIds = sample(category.products, randomInt(2, Math.min(3, category.products.length)));
  const lines = productIds.map((id, index) => {
    const product = CONFIG.products[id];
    const quantity = index === 0 ? randomInt(2, 4) : randomInt(1, 3);
    return buildLine(id, product, quantity);
  });

  const answer = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return {
    id: uid(),
    type: 'total',
    categoryId: category.id,
    intro: category.intro,
    lines,
    banknote: null,
    answer,
    text: buildTotalText(category, lines),
    solution: buildSolution('total', lines, null, answer)
  };
}

function generateChangeQuestion() {
  /*
   * Генерируем покупку, а затем подбираем подходящую купюру.
   * Так не появляется невозможная ситуация «покупка 780 ₽, дали 500 ₽».
   */
  for (let guard = 0; guard < 80; guard++) {
    const category = randomItem(CONFIG.categories);
    const productIds = sample(category.products, Math.random() < 0.58 ? 1 : 2);
    const lines = productIds.map(id => {
      const product = CONFIG.products[id];
      const quantity = product.unit === 'kg' ? randomInt(2, 6) : randomInt(1, 3);
      return buildLine(id, product, quantity);
    });

    const cost = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const possibleBanknotes = CONFIG.banknotes.filter(value => value > cost);
    if (!possibleBanknotes.length) continue;

    const banknote = possibleBanknotes[0];
    const answer = banknote - cost;

    return {
      id: uid(),
      type: 'change',
      categoryId: category.id,
      intro: category.intro,
      lines,
      banknote,
      answer,
      text: buildChangeText(category, lines, banknote),
      solution: buildSolution('change', lines, banknote, answer)
    };
  }

  /* Безопасный запасной вариант, практически недостижимый при текущих диапазонах. */
  const product = CONFIG.products.pencil;
  const line = buildLine('pencil', product, 4);
  const cost = line.price * line.quantity;
  return {
    id: uid(), type: 'change', categoryId: 'stationery',
    intro: 'В магазине продаются канцелярские товары. На рисунке показаны цены.',
    lines: [line], banknote: 500, answer: 500 - cost,
    text: `В магазине продаются канцелярские товары. На рисунке показаны цены. Покупатель взял ${purchasePhrase(line)}. Сколько рублей сдачи он получит с 500 рублей?`,
    solution: buildSolution('change', [line], 500, 500 - cost)
  };
}

function buildLine(id, product, quantity) {
  return {
    id,
    title: product.title,
    image: product.image,
    unit: product.unit,
    quantity,
    price: randomStepped(...product.price),
    genitive: product.genitive || null,
    forms: product.forms || null,
    gender: product.gender || 'm'
  };
}

function buildTotalText(category, lines) {
  const purchase = joinRussian(lines.map(purchasePhrase));
  const variants = [
    `${category.intro} Сколько всего рублей надо заплатить за ${purchase}?`,
    `${category.intro} Сколько рублей стоит покупка: ${purchase}?`,
    `${category.intro} Сколько рублей нужно заплатить, если купить ${purchase}?`
  ];
  return randomItem(variants);
}

function buildChangeText(category, lines, banknote) {
  const purchase = joinRussian(lines.map(purchasePhrase));
  const variants = [
    `${category.intro} Покупатель взял ${purchase}. Сколько рублей сдачи он получит с ${banknote} рублей?`,
    `${category.intro} Покупатель купил ${purchase} и отдал продавцу ${banknote} рублей. Сколько рублей сдачи он должен получить?`,
    `${category.intro} Сколько рублей сдачи получит покупатель, если купит ${purchase} и расплатится купюрой ${banknote} рублей?`
  ];
  return randomItem(variants);
}

function purchasePhrase(line) {
  const n = line.quantity;

  if (line.unit === 'kg') {
    return `${numberWord(n, 'm')} ${pluralForm(n, ['килограмм', 'килограмма', 'килограммов'])} ${line.genitive}`;
  }

  if (line.unit === 'pack') {
    return `${numberWord(n, 'f')} ${pluralForm(n, ['пачку', 'пачки', 'пачек'])} ${line.genitive}`;
  }

  return `${numberWord(n, line.gender)} ${pluralForm(n, line.forms)}`;
}

function buildSolution(type, lines, banknote, answer) {
  const steps = [];

  lines.forEach(line => {
    const subtotal = line.price * line.quantity;
    if (line.quantity > 1) {
      steps.push(`${line.price} × ${line.quantity} = ${subtotal} (руб.) — стоимость ${solutionName(line)}.`);
    }
  });

  const subtotals = lines.map(line => line.price * line.quantity);
  const cost = subtotals.reduce((sum, value) => sum + value, 0);

  if (lines.length > 1) {
    steps.push(`${subtotals.join(' + ')} = ${cost} (руб.) — стоимость всей покупки.`);
  } else if (lines[0].quantity === 1) {
    steps.push(`${lines[0].price} руб. — стоимость покупки.`);
  }

  if (type === 'change') {
    steps.push(`${banknote} − ${cost} = ${answer} (руб.) — сдача.`);
  }

  return { steps, answer };
}

function solutionName(line) {
  if (line.unit === 'kg') return `${line.quantity} ${pluralForm(line.quantity, ['килограмма', 'килограммов', 'килограммов'])} ${line.genitive}`;
  if (line.unit === 'pack') return `${line.quantity} ${pluralForm(line.quantity, ['пачки', 'пачек', 'пачек'])} ${line.genitive}`;
  return `${line.quantity} ${pluralForm(line.quantity, line.forms)}`;
}

function renderQuestion() {
  if (state.index >= state.questions.length) return finishTraining();

  state.currentMistakes = 0;
  state.locked = false;

  const q = state.questions[state.index];
  state.typeStats[q.type].shown++;

  $('[data-role="task-kind"]').textContent = q.type === 'total' ? 'Стоимость покупки' : 'Сдача';
  $('[data-role="task-text"]').textContent = q.text;
  $('[data-role="scene"]').innerHTML = q.type === 'total' ? renderCounter(q) : renderCards(q);

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = '';
  feedback.className = 'feedback';

  const hint = $('[data-role="hint"]');
  hint.hidden = true;
  hint.textContent = '';

  const solution = $('[data-role="solution"]');
  solution.hidden = true;
  solution.innerHTML = '';

  renderAnswerArea();
  updateHud();
  renderProgress();
}

function renderCounter(q) {
  return `
    <div class="vpr-counter" style="background-image: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.05)), url('${CONFIG.assets.counter}')">
      ${q.lines.map(line => `
        <article class="vpr-counter-item">
          <img src="${line.image}" alt="${escapeHtml(line.title)}">
          <span class="vpr-product-name">${escapeHtml(line.title)}</span>
          ${priceTag(line)}
        </article>
      `).join('')}
    </div>
  `;
}

function renderCards(q) {
  return `
    <div class="vpr-product-grid">
      ${q.lines.map(line => `
        <article class="vpr-product-card">
          <img src="${line.image}" alt="${escapeHtml(line.title)}">
          <span class="vpr-product-name">${escapeHtml(line.title)}</span>
          ${priceTag(line)}
        </article>
      `).join('')}
    </div>
  `;
}

function priceTag(line) {
  const unit = line.unit === 'kg' ? '/ кг' : line.unit === 'pack' ? '/ пачка' : '';
  return `<span class="vpr-price-tag">${line.price} ₽${unit ? `<small class="vpr-price-unit">${unit}</small>` : ''}</span>`;
}

function renderAnswerArea() {
  $('[data-role="answer-area"]').innerHTML = `
    <div class="vpr-answer-row input-answer">
      <div class="vpr-answer-wrap">
        <input data-role="answer-input" type="number" inputmode="numeric" min="0" autocomplete="off" aria-label="Введите ответ в рублях">
        <span class="vpr-answer-suffix">руб.</span>
      </div>
      <button class="trainer-btn trainer-btn--primary" type="button" data-action="check-input">Проверить</button>
    </div>
  `;

  requestAnimationFrame(() => $('[data-role="answer-input"]')?.focus());
}

function checkInputAnswer() {
  const input = $('[data-role="answer-input"]');
  if (!input || input.disabled || state.locked || input.value.trim() === '') return;

  const value = Number(input.value);
  const q = state.questions[state.index];
  state.attempts++;

  if (value === q.answer) {
    input.classList.add('is-correct');
    handleCorrect(q);
    return;
  }

  input.classList.add('is-wrong');
  setTimeout(() => input.classList.remove('is-wrong'), 360);
  handleWrong(q);
}

function handleCorrect(q) {
  state.correct++;
  state.streak++;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.typeStats[q.type].correct++;
  state.locked = true;

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = randomItem(CONFIG.feedback.correct);
  feedback.className = 'feedback is-good';

  disableAnswer();
  showSolution(q);
  recordStat(q.type, true);
  updateHud();
}

function handleWrong(q) {
  state.streak = 0;
  state.currentMistakes++;
  recordMistake(q);
  recordStat(q.type, false);

  const feedback = $('[data-role="feedback"]');
  feedback.className = 'feedback is-bad';

  if (state.currentMistakes === 1) {
    feedback.textContent = CONFIG.feedback.retry;
    clearInput();
    return;
  }

  if (state.currentMistakes === 2) {
    feedback.textContent = CONFIG.feedback.secondTry;
    const hint = $('[data-role="hint"]');
    hint.hidden = false;
    hint.textContent = hintText(q);
    clearInput();
    return;
  }

  feedback.textContent = CONFIG.feedback.reveal(q.answer);
  state.locked = true;
  disableAnswer();
  showSolution(q);
  updateHud();
}

function hintText(q) {
  if (q.type === 'change') {
    return q.lines.length > 1
      ? 'Сначала найди стоимость каждого товара, затем стоимость всей покупки. После этого вычти её из суммы, которую отдал покупатель.'
      : 'Сначала найди стоимость всей покупки. Затем вычти её из суммы, которую отдал покупатель.';
  }

  return q.lines.length > 1
    ? 'Найди стоимость каждого вида товара и сложи полученные суммы.'
    : 'Цена одного товара известна. Умножь цену на количество.';
}

function showSolution(q) {
  const solution = $('[data-role="solution"]');
  solution.hidden = false;
  solution.innerHTML = `
    <h3>Как записать решение</h3>
    ${q.solution.steps.map(step => `<p>${escapeHtml(step)}</p>`).join('')}
    <p><strong>Ответ: ${q.answer} рублей.</strong></p>
    <div class="vpr-next-row">
      <button class="trainer-btn trainer-btn--primary" type="button" data-action="next">${state.index + 1 >= state.questions.length ? 'Показать результат' : 'Следующее задание'}</button>
    </div>
  `;
}

function disableAnswer() {
  $$('[data-role="answer-input"], [data-action="check-input"]').forEach(element => {
    element.disabled = true;
  });
}

function clearInput() {
  const input = $('[data-role="answer-input"]');
  if (!input) return;
  input.value = '';
  requestAnimationFrame(() => input.focus());
}

function nextQuestion() {
  if (!state.locked) return;
  state.index++;
  renderQuestion();
}

function recordMistake(q) {
  const previous = state.mistakes.get(q.id);
  state.mistakes.set(q.id, {
    ...cloneQuestion(q),
    count: (previous?.count || 0) + 1
  });
}

function cloneQuestion(q) {
  return JSON.parse(JSON.stringify(q));
}

function updateHud() {
  const total = state.questions.length;
  $('[data-role="question-counter"]').textContent = `${Math.min(state.index + 1, total)} из ${total}`;
  $('[data-role="score-counter"]').textContent = state.correct;
  $('[data-role="streak-counter"]').textContent = state.streak;
}

function renderProgress() {
  const total = state.questions.length;
  const displayCount = Math.min(total, 20);
  let progress = '';

  for (let i = 0; i < displayCount; i++) {
    const threshold = Math.floor((i / displayCount) * total);
    if (threshold < state.index) progress += '😊';
    else if (threshold === state.index) progress += '🙂';
    else progress += '⚪';
  }

  $('[data-role="emoji-progress"]').textContent = progress;
}

function finishTraining() {
  if (state.finished) return;
  state.finished = true;

  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  const completed = Math.min(state.index + (state.locked ? 1 : 0), state.questions.length);

  $('[data-role="result-score"]').textContent = `${state.correct} из ${completed}`;
  $('[data-role="result-accuracy"]').textContent = `${accuracy}%`;
  $('[data-role="result-streak"]').textContent = state.bestStreak;

  let title = 'Продолжай тренироваться!';
  let emoji = '💪';
  let message = 'Разбери ошибки и попробуй ещё раз — задачи быстро станут привычными.';

  if (accuracy >= 90) {
    title = 'Отличный результат!';
    emoji = '🎉';
    message = 'Ты уверенно считаешь стоимость покупки и сдачу.';
  } else if (accuracy >= 70) {
    title = 'Хорошая работа!';
    emoji = '😊';
    message = 'Ещё немного практики — и такие задания будут решаться совсем уверенно.';
  }

  $('[data-role="result-title"]').textContent = title;
  $('[data-role="result-emoji"]').textContent = emoji;
  $('[data-role="result-message"]').textContent = message;

  renderTypeResults();
  renderReview();
  $('[data-action="retry-mistakes"]').disabled = state.mistakes.size === 0;
  showScreen('result');
}

function renderTypeResults() {
  const labels = { total: 'Стоимость покупки', change: 'Сдача' };
  $('[data-role="type-results"]').innerHTML = ['total', 'change'].map(type => {
    const stats = state.typeStats[type];
    return `
      <div class="vpr-type-result">
        <span>${labels[type]}</span>
        <strong>${stats.correct} из ${stats.shown}</strong>
      </div>
    `;
  }).join('');
}

function renderReview() {
  const reviewList = $('[data-role="review-list"]');

  if (!state.mistakes.size) {
    reviewList.innerHTML = '<p class="review-empty">Ошибок нет — всё решено верно! ✅</p>';
    return;
  }

  const typeCounts = { total: 0, change: 0 };
  [...state.mistakes.values()].forEach(item => { typeCounts[item.type]++; });

  const chips = [];
  if (typeCounts.total) chips.push(`<span class="review-chip">Стоимость покупки · ${typeCounts.total}</span>`);
  if (typeCounts.change) chips.push(`<span class="review-chip">Сдача · ${typeCounts.change}</span>`);
  reviewList.innerHTML = chips.join('');
}

function startMistakeReview() {
  if (!state.mistakes.size) return;

  const questions = shuffle([...state.mistakes.values()].map(item => {
    const copy = cloneQuestion(item);
    delete copy.count;
    return copy;
  }));

  state.index = 0;
  state.correct = 0;
  state.attempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.mistakes = new Map();
  state.finished = false;
  state.reviewMode = true;
  state.locked = false;
  state.typeStats = createEmptyTypeStats();
  state.questions = questions;

  showScreen('training');
  renderQuestion();
}

function recordStat(type, isCorrect) {
  let stats = {};
  try {
    stats = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
  } catch (error) {
    stats = {};
  }

  if (!stats[type]) stats[type] = { correct: 0, wrong: 0 };
  if (isCorrect) stats[type].correct++;
  else stats[type].wrong++;

  localStorage.setItem(CONFIG.storageKey, JSON.stringify(stats));
}

function showScreen(name) {
  $$('.trainer-screen').forEach(screen => {
    screen.classList.toggle('is-active', screen.dataset.screen === name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomStepped(min, max, step) {
  const count = Math.floor((max - min) / step);
  return min + randomInt(0, count) * step;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sample(array, count) {
  return shuffle([...array]).slice(0, count);
}

function pluralForm(number, forms) {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 === 1) return forms[0];
  if (n1 >= 2 && n1 <= 4) return forms[1];
  return forms[2];
}

function numberWord(number, gender = 'm') {
  const words = {
    m: { 1: 'один', 2: 'два', 3: 'три', 4: 'четыре', 5: 'пять', 6: 'шесть' },
    f: { 1: 'одну', 2: 'две', 3: 'три', 4: 'четыре', 5: 'пять', 6: 'шесть' }
  };
  return words[gender]?.[number] || String(number);
}

function joinRussian(parts) {
  if (parts.length <= 1) return parts[0] || '';
  if (parts.length === 2) return `${parts[0]} и ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} и ${parts.at(-1)}`;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', init);
