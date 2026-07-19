(() => {
  'use strict';

  /* =========================================================
     НАСТРОЙКИ ВИКТОРИНЫ
  ========================================================= */

  const CONFIG = {
    roundsCount: 15,
    questionsPerGroup: 4,
    answersPerQuestion: 4,

    // true — перемешивать варианты ответов внутри каждого вопроса
    shuffleAnswerOptions: true,

    teams: {
      one: {
        defaultName: 'Команда 1'
      },

      two: {
        defaultName: 'Команда 2'
      }
    },

    selectors: {
      intro: '#pushkin-intro',
      shell: '#pushkin-shell',

      startButton: '#pushkin-start-btn',
      restartButton: '#pushkin-restart-btn',

      teamOneInput: '#team-one-input',
      teamTwoInput: '#team-two-input',

      teamOneCard: '#team-one-card',
      teamTwoCard: '#team-two-card',

      teamOneName: '#team-one-name',
      teamTwoName: '#team-two-name',

      teamOneScore: '#team-one-score',
      teamTwoScore: '#team-two-score',

      roundCurrent: '#round-current',
      roundTotal: '#round-total',
      questionNumber: '#question-number',

      turnBadge: '#turn-badge',
      questionText: '#question-text',
      answerOptions: '#answer-options',

      feedback: '#answer-feedback',
      feedbackLabel: '#feedback-label',
      feedbackText: '#feedback-text',

      nextButton: '#next-question-btn',
      status: '#pushkin-status',

      modal: '#pushkin-modal',
      modalTitle: '#pushkin-modal-title',
      modalText: '#pushkin-modal-text',

      finalTeamOneName: '#final-team-one-name',
      finalTeamTwoName: '#final-team-two-name',

      finalTeamOneScore: '#final-team-one-score',
      finalTeamTwoScore: '#final-team-two-score',

      modalRestart: '#pushkin-modal-restart',

      burger: '#nav-burger',
      navigation: '.top-nav'
    },

    classes: {
      active: 'is-active',
      teamTwoBadge: 'is-team-two',

      correctOption: 'is-correct',
      wrongOption: 'is-wrong',
      dimmedOption: 'is-dimmed',

      navigationOpen: 'is-open',
      bodyNavigationOpen: 'nav-open',
      bodyModalOpen: 'modal-open'
    },

    text: {
      turn(teamName) {
        return `Отвечает ${teamName}`;
      },

      ready(teamName) {
        return `${teamName} выбирает вариант ответа.`;
      },

      correct(teamName) {
        return `Верно! ${teamName} получает один балл.`;
      },

      wrong() {
        return 'Ответ неверный. Балл не начисляется.';
      },

      winner(teamName, score) {
        return `Победила команда «${teamName}» — ${score} правильных ответов!`;
      },

      draw(score) {
        return `Ничья! Обе команды дали по ${score} правильных ответов.`;
      }
    }
  };

  /* =========================================================
     БАНК ВОПРОСОВ

     ВАЖНО:
     QUESTION_GROUPS — массив из 15 групп.
     Каждая группа — массив из 4 вопросов.
  ========================================================= */

  const QUESTION_GROUPS = [
    // Позиция 1. «Сказка о рыбаке и рыбке»
    [
      {
        question: 'Кого старик поймал неводом в третий раз?',
        options: [
          'Щуку',
          'Золотую рыбку',
          'Русалку',
          'Морского конька'
        ],
        correctIndex: 1
      },
      {
        question: 'Сколько лет старик со старухой прожили у синего моря?',
        options: [
          'Двадцать лет',
          'Тридцать лет',
          'Тридцать лет и три года',
          'Сорок лет и один год'
        ],
        correctIndex: 2
      },
      {
        question: 'Какое чудесное умение было у золотой рыбки?',
        options: [
          'Она умела летать',
          'Она умела становиться невидимой',
          'Она умела говорить человеческим голосом',
          'Она умела превращаться в человека'
        ],
        correctIndex: 2
      },
      {
        question: 'Что сделал старик с золотой рыбкой после их первой встречи?',
        options: [
          'Отнёс её домой',
          'Продал её на базаре',
          'Посадил её в ведро',
          'Отпустил её обратно в море'
        ],
        correctIndex: 3
      }
    ],
  
    // Позиция 2. Первые события сказок
    [
      {
        question: 'Что старуха велела попросить у золотой рыбки прежде всего?',
        options: [
          'Новое корыто',
          'Красивый дом',
          'Царский дворец',
          'Сундук с золотом'
        ],
        correctIndex: 0
      },
      {
        question: 'Чем занимались три девицы в начале «Сказки о царе Салтане»?',
        options: [
          'Вышивали',
          'Пряли',
          'Рисовали',
          'Готовили ужин'
        ],
        correctIndex: 1
      },
      {
        question: 'Какой волшебный предмет был у царицы-мачехи?',
        options: [
          'Золотой гребень',
          'Хрустальный шар',
          'Говорящее зеркальце',
          'Волшебное кольцо'
        ],
        correctIndex: 2
      },
      {
        question: 'Почему царь Дадон попросил мудреца о помощи?',
        options: [
          'Он хотел найти сокровища',
          'Враги нападали на его владения',
          'Он заблудился в лесу',
          'Он хотел построить новый дворец'
        ],
        correctIndex: 1
      }
    ],
  
    // Позиция 3. Герои сказок
    [
      {
        question: 'Как звали сына царя Салтана?',
        options: [
          'Елисей',
          'Гвидон',
          'Дадон',
          'Балда'
        ],
        correctIndex: 1
      },
      {
        question: 'Как звали жениха молодой царевны?',
        options: [
          'Гвидон',
          'Салтан',
          'Елисей',
          'Черномор'
        ],
        correctIndex: 2
      },
      {
        question: 'Как звали царя, которому подарили золотого петушка?',
        options: [
          'Дадон',
          'Салтан',
          'Гвидон',
          'Елисей'
        ],
        correctIndex: 0
      },
      {
        question: 'Как звали работника попа?',
        options: [
          'Черномор',
          'Балда',
          'Елисей',
          'Гвидон'
        ],
        correctIndex: 1
      }
    ],
  
    // Позиция 4. Волшебные помощники
    [
      {
        question: 'Кто помогал князю Гвидону и исполнял его желания?',
        options: [
          'Золотая рыбка',
          'Царевна Лебедь',
          'Белка',
          'Чернавка'
        ],
        correctIndex: 1
      },
      {
        question: 'Кто рассказывал царице правду о её красоте?',
        options: [
          'Волшебное зеркальце',
          'Золотой петушок',
          'Царевна Лебедь',
          'Мудрец-звездочёт'
        ],
        correctIndex: 0
      },
      {
        question: 'Кто предупреждал царя Дадона о приближении опасности?',
        options: [
          'Белка',
          'Золотая рыбка',
          'Золотой петушок',
          'Дядька Черномор'
        ],
        correctIndex: 2
      },
      {
        question: 'Кто мог исполнить просьбы старика?',
        options: [
          'Царевна Лебедь',
          'Золотая рыбка',
          'Волшебное зеркальце',
          'Золотой петушок'
        ],
        correctIndex: 1
      }
    ],
  
    // Позиция 5. «Сказка о царе Салтане»
    [
      {
        question: 'В чём царицу и её сына бросили в море?',
        options: [
          'В сундуке',
          'В лодке',
          'В бочке',
          'В корзине'
        ],
        correctIndex: 2
      },
      {
        question: 'Как назывался остров, на котором оказался князь Гвидон?',
        options: [
          'Буян',
          'Лукоморье',
          'Черноморье',
          'Баян'
        ],
        correctIndex: 0
      },
      {
        question: 'Кого князь Гвидон спас от коршуна?',
        options: [
          'Белку',
          'Лебедь',
          'Жар-птицу',
          'Утку'
        ],
        correctIndex: 1
      },
      {
        question: 'Кем приходилась ткачиха молодой царице?',
        options: [
          'Матерью',
          'Подругой',
          'Сестрой',
          'Служанкой'
        ],
        correctIndex: 2
      }
    ],
  
    // Позиция 6. Чудеса острова Буяна
    [
      {
        question: 'Какой зверёк жил под елью и грыз золотые орешки?',
        options: [
          'Заяц',
          'Белка',
          'Ёж',
          'Лиса'
        ],
        correctIndex: 1
      },
      {
        question: 'Что находилось внутри золотых орешков, которые грызла белка?',
        options: [
          'Жемчужины',
          'Алмазы',
          'Изумруды',
          'Золотые монеты'
        ],
        correctIndex: 2
      },
      {
        question: 'Сколько богатырей выходило из моря?',
        options: [
          'Двенадцать',
          'Двадцать пять',
          'Тридцать три',
          'Сорок'
        ],
        correctIndex: 2
      },
      {
        question: 'Кто возглавлял морских богатырей?',
        options: [
          'Князь Гвидон',
          'Царь Салтан',
          'Дядька Черномор',
          'Царевич Елисей'
        ],
        correctIndex: 2
      }
    ],
  
    // Позиция 7. Превращения князя Гвидона
    [
      {
        question: 'В какое насекомое князь Гвидон превратился в первый раз?',
        options: [
          'В муху',
          'В комара',
          'В шмеля',
          'В жука'
        ],
        correctIndex: 1
      },
      {
        question: 'В какое насекомое князь Гвидон превратился во второй раз?',
        options: [
          'В муху',
          'В комара',
          'В бабочку',
          'В стрекозу'
        ],
        correctIndex: 0
      },
      {
        question: 'В какое насекомое князь Гвидон превратился в третий раз?',
        options: [
          'В жука',
          'В комара',
          'В шмеля',
          'В кузнечика'
        ],
        correctIndex: 2
      },
      {
        question: 'Зачем князь Гвидон превращался в насекомых?',
        options: [
          'Чтобы тайно попасть на корабль и увидеть отца',
          'Чтобы спрятаться от богатырей',
          'Чтобы найти золотые орешки',
          'Чтобы напугать жителей острова'
        ],
        correctIndex: 0
      }
    ],
  
    // Позиция 8. «Сказка о мёртвой царевне и о семи богатырях»
    [
      {
        question: 'Сколько богатырей жили в лесном тереме?',
        options: [
          'Пять',
          'Семь',
          'Девять',
          'Двенадцать'
        ],
        correctIndex: 1
      },
      {
        question: 'Кто приказал Чернавке отвести царевну в лес?',
        options: [
          'Царь',
          'Царица-мачеха',
          'Один из богатырей',
          'Царевич Елисей'
        ],
        correctIndex: 1
      },
      {
        question: 'Как звали девушку, которой царица поручила погубить царевну?',
        options: [
          'Чернавка',
          'Лебедь',
          'Ткачиха',
          'Повариха'
        ],
        correctIndex: 0
      },
      {
        question: 'Что сделала царевна, оказавшись одна в доме богатырей?',
        options: [
          'Спряталась в подвале',
          'Прибрала дом и приготовила еду',
          'Ушла обратно в лес',
          'Легла спать'
        ],
        correctIndex: 1
      }
    ],
  
    // Позиция 9. Царевна и отравленное яблоко
    [
      {
        question: 'В кого переоделась царица, чтобы обмануть царевну?',
        options: [
          'В молодую служанку',
          'В старуху',
          'В царевну',
          'В торговку'
        ],
        correctIndex: 1
      },
      {
        question: 'Какой плод царица дала молодой царевне?',
        options: [
          'Грушу',
          'Сливу',
          'Яблоко',
          'Персик'
        ],
        correctIndex: 2
      },
      {
        question: 'Кто пытался не пустить старуху к царевне?',
        options: [
          'Пёс Соколко',
          'Царевич Елисей',
          'Один из богатырей',
          'Дядька Черномор'
        ],
        correctIndex: 0
      },
      {
        question: 'Что случилось с царевной после того, как она откусила яблоко?',
        options: [
          'Она превратилась в птицу',
          'Она убежала из терема',
          'Она упала без чувств и погрузилась в глубокий сон',
          'Она забыла своё имя'
        ],
        correctIndex: 2
      }
    ],
  
    // Позиция 10. Поиски царевны
    [
      {
        question: 'К кому царевич Елисей сначала обратился с просьбой помочь найти невесту?',
        options: [
          'К месяцу',
          'К ветру',
          'К солнцу',
          'К морю'
        ],
        correctIndex: 2
      },
      {
        question: 'К кому Елисей обратился после солнца?',
        options: [
          'К месяцу',
          'К ветру',
          'К звёздам',
          'К морю'
        ],
        correctIndex: 0
      },
      {
        question: 'Кто подсказал Елисею, где находится царевна?',
        options: [
          'Солнце',
          'Месяц',
          'Ветер',
          'Зеркальце'
        ],
        correctIndex: 2
      },
      {
        question: 'Где богатыри оставили уснувшую царевну?',
        options: [
          'В хрустальном гробу в пещере',
          'В башне дворца',
          'В лесном тереме',
          'В лодке на берегу моря'
        ],
        correctIndex: 0
      }
    ],
  
    // Позиция 11. Концовки сказок
    [
      {
        question: 'Что увидела старуха в конце «Сказки о рыбаке и рыбке»?',
        options: [
          'Богатый дворец',
          'Новую избу',
          'Старую землянку и разбитое корыто',
          'Пустой морской берег'
        ],
        correctIndex: 2
      },
      {
        question: 'Кто стал женой князя Гвидона?',
        options: [
          'Царевна Лебедь',
          'Чернавка',
          'Молодая царевна',
          'Шамаханская царица'
        ],
        correctIndex: 0
      },
      {
        question: 'Кто разбудил молодую царевну от волшебного сна?',
        options: [
          'Один из богатырей',
          'Царевич Елисей',
          'Пёс Соколко',
          'Ветер'
        ],
        correctIndex: 1
      },
      {
        question: 'Что случилось с золотым петушком после гибели царя Дадона?',
        options: [
          'Он превратился в камень',
          'Он вернулся к мудрецу',
          'Он улетел',
          'Он остался на спице'
        ],
        correctIndex: 2
      }
    ],
  
    // Позиция 12. «Сказка о попе и о работнике его Балде»
    [
      {
        question: 'Где поп встретил Балду?',
        options: [
          'На базаре',
          'У моря',
          'В лесу',
          'Возле дворца'
        ],
        correctIndex: 0
      },
      {
        question: 'Какую плату Балда попросил за год работы?',
        options: [
          'Мешок золота',
          'Три щелчка по лбу попа',
          'Новый дом',
          'Три серебряные монеты'
        ],
        correctIndex: 1
      },
      {
        question: 'Какую пищу Балда попросил давать ему во время службы?',
        options: [
          'Варёную полбу',
          'Гречневую кашу',
          'Ржаной хлеб',
          'Пшеничные лепёшки'
        ],
        correctIndex: 0
      },
      {
        question: 'За скольких работников трудился Балда?',
        options: [
          'За троих',
          'За пятерых',
          'За семерых',
          'За десятерых'
        ],
        correctIndex: 2
      }
    ],
  
    // Позиция 13. Испытания Балды
    [
      {
        question: 'С кого Балда должен был получить оброк?',
        options: [
          'С богатырей',
          'С купцов',
          'С чертей',
          'С рыбаков'
        ],
        correctIndex: 2
      },
      {
        question: 'Кого бесы послали состязаться с Балдой?',
        options: [
          'Бесёнка',
          'Лешего',
          'Водяного',
          'Змея'
        ],
        correctIndex: 0
      },
      {
        question: 'Какого зверька Балда назвал своим младшим братом?',
        options: [
          'Белку',
          'Зайца',
          'Лису',
          'Волка'
        ],
        correctIndex: 1
      },
      {
        question: 'Что сделал Балда во время состязания по метанию палки?',
        options: [
          'Бросил палку в море',
          'Сломал палку пополам',
          'Предложил забросить палку за облако',
          'Отдал палку зайцу'
        ],
        correctIndex: 2
      }
    ],
  
    // Позиция 14. «Сказка о золотом петушке»
    [
      {
        question: 'Кто подарил царю Дадону золотого петушка?',
        options: [
          'Князь Гвидон',
          'Мудрец-звездочёт',
          'Дядька Черномор',
          'Царевич Елисей'
        ],
        correctIndex: 1
      },
      {
        question: 'Где сидел золотой петушок?',
        options: [
          'На крыше дворца',
          'На высокой спице',
          'На ветке дерева',
          'На царском троне'
        ],
        correctIndex: 1
      },
      {
        question: 'В какую сторону поворачивался петушок, когда замечал опасность?',
        options: [
          'В сторону царского дворца',
          'В сторону моря',
          'В сторону восходящего солнца',
          'В сторону, откуда приближалась опасность'
        ],
        correctIndex: 3
      },
      {
        question: 'Что царь Дадон пообещал мудрецу за золотого петушка?',
        options: [
          'Подарить ему половину царства',
          'Исполнить его первую просьбу',
          'Назначить его главным советником',
          'Построить ему новый дворец'
        ],
        correctIndex: 1
      }
    ],
  
    // Позиция 15. Узнай сказку по событию
    [
      {
        question: 'В какой сказке герой разговаривал с солнцем, месяцем и ветром?',
        options: [
          '«Сказка о царе Салтане»',
          '«Сказка о золотом петушке»',
          '«Сказка о мёртвой царевне и о семи богатырях»',
          '«Сказка о рыбаке и рыбке»'
        ],
        correctIndex: 2
      },
      {
        question: 'В какой сказке по морю плыла бочка с матерью и ребёнком?',
        options: [
          '«Сказка о царе Салтане»',
          '«Сказка о рыбаке и рыбке»',
          '«Сказка о золотом петушке»',
          '«Сказка о попе и о работнике его Балде»'
        ],
        correctIndex: 0
      },
      {
        question: 'В какой сказке волшебный помощник исполнял просьбы, но затем вернул всё к началу?',
        options: [
          '«Сказка о мёртвой царевне и о семи богатырях»',
          '«Сказка о рыбаке и рыбке»',
          '«Сказка о царе Салтане»',
          '«Сказка о золотом петушке»'
        ],
        correctIndex: 1
      },
      {
        question: 'В какой сказке волшебный страж сидел на высокой спице?',
        options: [
          '«Сказка о рыбаке и рыбке»',
          '«Сказка о царе Салтане»',
          '«Сказка о золотом петушке»',
          '«Сказка о мёртвой царевне и о семи богатырях»'
        ],
        correctIndex: 2
      }
    ]
  ];

  /* =========================================================
     DOM
  ========================================================= */

  const DOM = Object.fromEntries(
    Object.entries(CONFIG.selectors).map(([key, selector]) => {
      return [key, document.querySelector(selector)];
    })
  );

  let state = null;

  /* =========================================================
     СОЗДАНИЕ СОСТОЯНИЯ
  ========================================================= */

  function createState() {
    validateQuestions();

    return {
      names: {
        one: cleanName(
          DOM.teamOneInput?.value,
          CONFIG.teams.one.defaultName
        ),

        two: cleanName(
          DOM.teamTwoInput?.value,
          CONFIG.teams.two.defaultName
        )
      },

      scores: {
        one: 0,
        two: 0
      },

      questions: createQuestionSets(),

      roundIndex: 0,
      currentTeam: 'one',

      answered: false,
      selectedIndex: null,
      finished: false
    };
  }

  /* =========================================================
     СЛУЧАЙНЫЙ ВЫБОР ВОПРОСОВ

     Из каждой группы:
     - один случайный вопрос получает первая команда;
     - другой случайный вопрос получает вторая команда.
  ========================================================= */

  function createQuestionSets() {
    const result = {
      one: [],
      two: []
    };

    QUESTION_GROUPS
      .slice(0, CONFIG.roundsCount)
      .forEach(group => {
        const shuffledQuestions = shuffle(group);

        const questionForTeamOne = shuffledQuestions[0];
        const questionForTeamTwo = shuffledQuestions[1];

        result.one.push(
          prepareQuestion(questionForTeamOne)
        );

        result.two.push(
          prepareQuestion(questionForTeamTwo)
        );
      });

    return result;
  }

  /* =========================================================
     ПОДГОТОВКА ВАРИАНТОВ ОТВЕТА
  ========================================================= */

  function prepareQuestion(sourceQuestion) {
    const preparedOptions = sourceQuestion.options.map(
      (text, originalIndex) => ({
        text,
        isCorrect: originalIndex === sourceQuestion.correctIndex
      })
    );

    const options = CONFIG.shuffleAnswerOptions
      ? shuffle(preparedOptions)
      : preparedOptions;

    return {
      question: sourceQuestion.question,

      options,

      correctIndex: options.findIndex(option => {
        return option.isCorrect;
      })
    };
  }

  /* =========================================================
     ПРОВЕРКА БАНКА ВОПРОСОВ
  ========================================================= */

  function validateQuestions() {
    if (!Array.isArray(QUESTION_GROUPS)) {
      throw new Error('QUESTION_GROUPS должен быть массивом.');
    }

    if (QUESTION_GROUPS.length !== CONFIG.roundsCount) {
      throw new Error(
        `Должно быть ${CONFIG.roundsCount} групп вопросов. ` +
        `Сейчас найдено: ${QUESTION_GROUPS.length}.`
      );
    }

    QUESTION_GROUPS.forEach((group, groupIndex) => {
      if (!Array.isArray(group)) {
        throw new Error(
          `Группа ${groupIndex + 1} должна быть массивом.`
        );
      }

      if (group.length !== CONFIG.questionsPerGroup) {
        throw new Error(
          `В группе ${groupIndex + 1} должно быть ровно ` +
          `${CONFIG.questionsPerGroup} вопроса. ` +
          `Сейчас найдено: ${group.length}.`
        );
      }

      group.forEach((item, itemIndex) => {
        const location =
          `вопрос ${itemIndex + 1} в группе ${groupIndex + 1}`;

        if (!item || typeof item !== 'object') {
          throw new Error(`Некорректный ${location}.`);
        }

        if (
          typeof item.question !== 'string' ||
          !item.question.trim()
        ) {
          throw new Error(`Не указан текст: ${location}.`);
        }

        if (!Array.isArray(item.options)) {
          throw new Error(
            `У ${location} отсутствует массив options.`
          );
        }

        if (
          item.options.length !== CONFIG.answersPerQuestion
        ) {
          throw new Error(
            `У ${location} должно быть ровно ` +
            `${CONFIG.answersPerQuestion} варианта ответа.`
          );
        }

        item.options.forEach((option, optionIndex) => {
          if (
            typeof option !== 'string' ||
            !option.trim()
          ) {
            throw new Error(
              `Пустой вариант ${optionIndex + 1}: ${location}.`
            );
          }
        });

        if (
          !Number.isInteger(item.correctIndex) ||
          item.correctIndex < 0 ||
          item.correctIndex >= CONFIG.answersPerQuestion
        ) {
          throw new Error(
            `У ${location} correctIndex должен быть от 0 до 3.`
          );
        }
      });
    });
  }

  /* =========================================================
     ЗАПУСК ИГРЫ
  ========================================================= */

  function startGame() {
    try {
      state = createState();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    DOM.intro.hidden = true;
    DOM.shell.hidden = false;
    DOM.modal.hidden = true;

    document.body.classList.remove(
      CONFIG.classes.bodyModalOpen
    );

    DOM.roundTotal.textContent =
      String(CONFIG.roundsCount);

    render();
  }

  /* =========================================================
     ОТРИСОВКА
  ========================================================= */

  function render() {
    if (!state || state.finished) {
      return;
    }

    renderTeams();
    renderScores();
    renderQuestion();
    renderOptions();
    resetAnswerState();
  }

  function renderTeams() {
    const team = state.currentTeam;

    DOM.teamOneName.textContent = state.names.one;
    DOM.teamTwoName.textContent = state.names.two;

    DOM.teamOneCard.classList.toggle(
      CONFIG.classes.active,
      team === 'one'
    );

    DOM.teamTwoCard.classList.toggle(
      CONFIG.classes.active,
      team === 'two'
    );

    DOM.turnBadge.textContent =
      CONFIG.text.turn(state.names[team]);

    DOM.turnBadge.classList.toggle(
      CONFIG.classes.teamTwoBadge,
      team === 'two'
    );
  }

  function renderScores() {
    DOM.teamOneScore.textContent =
      String(state.scores.one);

    DOM.teamTwoScore.textContent =
      String(state.scores.two);
  }

  function renderQuestion() {
    const question = getCurrentQuestion();
    const roundNumber = state.roundIndex + 1;

    DOM.roundCurrent.textContent =
      String(roundNumber);

    DOM.questionNumber.textContent =
      String(roundNumber);

    DOM.questionText.textContent =
      question.question;

    DOM.status.textContent =
      CONFIG.text.ready(
        state.names[state.currentTeam]
      );
  }

  function renderOptions() {
    const question = getCurrentQuestion();

    DOM.answerOptions.replaceChildren();

    question.options.forEach((option, index) => {
      const button = createOptionButton(
        option,
        index
      );

      DOM.answerOptions.append(button);
    });
  }

  function createOptionButton(option, index) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'pushkin-option';
    button.dataset.index = String(index);

    const letter = document.createElement('span');
    letter.className = 'pushkin-option__letter';
    letter.textContent = String.fromCharCode(
      1040 + index
    );

    const text = document.createElement('span');
    text.className = 'pushkin-option__text';
    text.textContent = option.text;

    button.append(letter, text);

    button.addEventListener('click', () => {
      selectAnswer(index);
    });

    return button;
  }

  function resetAnswerState() {
    state.answered = false;
    state.selectedIndex = null;

    DOM.feedback.hidden = true;
    DOM.nextButton.hidden = true;
  }

  /* =========================================================
     ВЫБОР ОТВЕТА
  ========================================================= */

  function selectAnswer(selectedIndex) {
    if (
      !state ||
      state.finished ||
      state.answered
    ) {
      return;
    }

    const team = state.currentTeam;
    const question = getCurrentQuestion();

    const isCorrect =
      selectedIndex === question.correctIndex;

    state.answered = true;
    state.selectedIndex = selectedIndex;

    if (isCorrect) {
      state.scores[team] += 1;

      DOM.status.textContent =
        CONFIG.text.correct(state.names[team]);

      DOM.feedbackLabel.textContent =
        'Верный ответ';
    } else {
      DOM.status.textContent =
        CONFIG.text.wrong();

      DOM.feedbackLabel.textContent =
        'Правильный ответ';
    }

    DOM.feedbackText.textContent =
      question.options[question.correctIndex].text;

    DOM.feedback.hidden = false;
    DOM.nextButton.hidden = false;

    renderScores();
    markAnswerOptions(selectedIndex);
  }

  function markAnswerOptions(selectedIndex) {
    const question = getCurrentQuestion();

    const buttons = [
      ...DOM.answerOptions.querySelectorAll(
        '.pushkin-option'
      )
    ];

    buttons.forEach((button, index) => {
      button.disabled = true;

      if (index === question.correctIndex) {
        button.classList.add(
          CONFIG.classes.correctOption
        );

        return;
      }

      if (index === selectedIndex) {
        button.classList.add(
          CONFIG.classes.wrongOption
        );

        return;
      }

      button.classList.add(
        CONFIG.classes.dimmedOption
      );
    });
  }

  /* =========================================================
     СЛЕДУЮЩИЙ ХОД
  ========================================================= */

  function nextQuestion() {
    if (
      !state ||
      state.finished ||
      !state.answered
    ) {
      return;
    }

    if (state.currentTeam === 'one') {
      state.currentTeam = 'two';
    } else {
      state.currentTeam = 'one';
      state.roundIndex += 1;
    }

    if (
      state.roundIndex >= CONFIG.roundsCount
    ) {
      finishGame();
      return;
    }

    render();
  }

  function getCurrentQuestion() {
    return state.questions[state.currentTeam][
      state.roundIndex
    ];
  }

  /* =========================================================
     ФИНАЛ
  ========================================================= */

  function finishGame() {
    state.finished = true;

    DOM.finalTeamOneName.textContent =
      state.names.one;

    DOM.finalTeamTwoName.textContent =
      state.names.two;

    DOM.finalTeamOneScore.textContent =
      String(state.scores.one);

    DOM.finalTeamTwoScore.textContent =
      String(state.scores.two);

    if (state.scores.one > state.scores.two) {
      DOM.modalTitle.textContent =
        'Победила первая команда!';

      DOM.modalText.textContent =
        CONFIG.text.winner(
          state.names.one,
          state.scores.one
        );
    } else if (
      state.scores.two > state.scores.one
    ) {
      DOM.modalTitle.textContent =
        'Победила вторая команда!';

      DOM.modalText.textContent =
        CONFIG.text.winner(
          state.names.two,
          state.scores.two
        );
    } else {
      DOM.modalTitle.textContent =
        'Ничья!';

      DOM.modalText.textContent =
        CONFIG.text.draw(
          state.scores.one
        );
    }

    DOM.modal.hidden = false;

    document.body.classList.add(
      CONFIG.classes.bodyModalOpen
    );
  }

  /* =========================================================
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  ========================================================= */

  function shuffle(sourceArray) {
    const result = [...sourceArray];

    for (
      let index = result.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex = Math.floor(
        Math.random() * (index + 1)
      );

      [
        result[index],
        result[randomIndex]
      ] = [
        result[randomIndex],
        result[index]
      ];
    }

    return result;
  }

  function cleanName(value, fallback) {
    if (typeof value !== 'string') {
      return fallback;
    }

    return value.trim() || fallback;
  }

  /* =========================================================
     НАВИГАЦИЯ
  ========================================================= */

  function toggleNavigation() {
    if (!DOM.navigation || !DOM.burger) {
      return;
    }

    const isOpen =
      DOM.navigation.classList.toggle(
        CONFIG.classes.navigationOpen
      );

    DOM.burger.setAttribute(
      'aria-expanded',
      String(isOpen)
    );

    document.body.classList.toggle(
      CONFIG.classes.bodyNavigationOpen,
      isOpen
    );
  }

  /* =========================================================
     СОБЫТИЯ
  ========================================================= */

  DOM.startButton?.addEventListener(
    'click',
    startGame
  );

  DOM.restartButton?.addEventListener(
    'click',
    startGame
  );

  DOM.modalRestart?.addEventListener(
    'click',
    startGame
  );

  DOM.nextButton?.addEventListener(
    'click',
    nextQuestion
  );

  DOM.burger?.addEventListener(
    'click',
    toggleNavigation
  );
})();