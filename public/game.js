const CARDS_STATES = {
    finished: 'finished',
    closed: 'closed',
    comparing: 'comparing',
    invalid: 'invalid'
};

const ELEMENTS = [
    'red',
    'blue',
    'orange',
    'purple'
];

const getStepsCounter = () => {
    return document.getElementById('stepsCount');
}

const buildOpenCardUrl = (id) => `https://placehold.co/50x50/gray/white?text=${id}`;
const buildClosedCardUrl = () => `https://placehold.co/50x50/white/black?text=Closed`;

const buildCardElement = ({ id, name, state }) => {
    const el = document.createElement('img');

    let url = '';
    if (state === CARDS_STATES.finished) {
        url = `https://placehold.co/50x50/green/white?text=${name}`;
    } else if (state === CARDS_STATES.comparing) {
        url = `https://placehold.co/50x50/gray/white?text=${name}`;
    } else if (state === CARDS_STATES.closed) {
        url = `https://placehold.co/50x50/white/black?text=Closed`;
    } else if (state === CARDS_STATES.invalid) {
        url = `https://placehold.co/50x50/red/white?text=${name}`;
    } else {
        throw Error("invalid card state");
    }

    el.setAttribute('src', url);

    el.dataset.role = 'card';
    el.dataset.name = name;
    el.dataset.state = state;
    el.dataset.id = id;

    return el;
}

const shuffle = (elements) => elements
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

/**
 * @param {HTMLElement} gameField
 * @param {HTMLElement} cardEl
 */
const handleClickCard = (gameField, clickedCard) => {
    const { dataset: clickedCardData } = clickedCard;
    const anotherCard = gameField
        .querySelector(`[data-state="${CARDS_STATES.comparing}"]:not([data-id="${clickedCardData.id}"])`);

    if (clickedCardData.state !== CARDS_STATES.closed) {
        return;
    }

    // NOTE: открытую карту помечаем для сравнения
    clickedCardData.state = CARDS_STATES.comparing;
    clickedCard.replaceWith(buildCardElement({ ...clickedCardData}));
    const newClickedCard = document.querySelector(`[data-id="${clickedCardData.id}"]`);

    if (anotherCard === null) {
        return;
    }

    if (anotherCard.dataset.name === clickedCard.dataset.name) {
        newClickedCard.replaceWith(
            buildCardElement({ ...clickedCardData, state: CARDS_STATES.finished })
        );
        anotherCard.replaceWith(
            buildCardElement({ ...anotherCard.dataset, state: CARDS_STATES.finished })
        );
    } else {
        newClickedCard.replaceWith(
            buildCardElement({ ...clickedCardData, state: CARDS_STATES.invalid })
        );
        anotherCard.replaceWith(
            buildCardElement({ ...anotherCard.dataset, state: CARDS_STATES.invalid })
        );

        setTimeout(() => {
            gameField
                .querySelectorAll(`[data-state="${CARDS_STATES.invalid}"]`)
                .forEach((cardElement) => {
                    cardElement.replaceWith(
                        buildCardElement({ ...cardElement.dataset, state: CARDS_STATES.closed })
                    );
            });
        }, 1000);
    }

    const counterElement = getStepsCounter();

    const stepsCount = Number(counterElement.dataset.stepsCount);
    const stepsCountInc = stepsCount + 1;
    counterElement.dataset.stepsCount = stepsCountInc;

    counterElement.innerText = `Ходов: ${stepsCountInc}`;

    const finishedCards = gameField.querySelectorAll(`[data-role="card"][data-state= "${CARDS_STATES.finished}"]`);
    const isWon = (finishedCards.length / 2) === ELEMENTS.length;

    if (!isWon) {
        return;
    }

    setTimeout(() => {
        alert(`МОЛОДЕЦ, ВЫ ПОБЕДИЛИ, ЭТО ЗАНЯЛО У ВАС ${stepsCountInc} ХОДОВ!!!!!`)
        const confirmNewGame = confirm("Вы хотите продолжить игру?");
        if (confirmNewGame) {
            startGame();
        }
    }, 1500);
};

const prepareCards = (elements) => {
    let id = 1;

    const cards = shuffle([...elements, ...elements]);

    return cards.map((name) => ({name, state: 'closed', id: id++ }));
};

const startGame = () => {
    const stepsCount = 0;
    const cards = prepareCards(ELEMENTS);

    const gameField = document.getElementById('gameField');
    gameField.innerText = '';
    const stepsCounter = getStepsCounter();
    stepsCounter.dataset.stepsCount = stepsCount;
    stepsCounter.innerText = `Ходов: ${stepsCount}`;

    stepsCounter.classList.remove('d-none');

    cards.forEach((card) => {
        const cardEl = buildCardElement(card);
        gameField.append(cardEl);
    });
    gameField.addEventListener('click', (event) => {
        handleClickCard(gameField, event.target);
    });
};
