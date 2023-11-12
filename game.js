const CARDS_STATES = {
    finished: 'finished',
    closed: 'closed',
    comparing: 'comparing',
    invalid: 'invalid'
};

const ELEMENTS = [
    'butterfly',
    'hand-heart',
    'handshake',
    'heart',
    'home',
    'search-heart',
    'smile',
    'sun',
    'users-alt',
    'flower'
];

const CARDS_PER_ROW = 4;

const getStepsCounter = () => {
    return document.getElementById('steps-counter');
}

const buildcardsRow = () => {
    const row = document.createElement('div');
    row.classList.add('row', 'justify-content-center');
    row.style.gap = '43px';
    row.style.marginBottom = '20px';

    return row;
}

const buildCardElement = ({ id, name, state }) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card', 'col', 'bg-secondary', 'shadow');
    cardElement.style.minWidth = "10rem;";
    cardElement.style.minHeight = '10rem';

    const root = window.location.href;
    const cardImageUrl = `img/${name}.svg`;
    const cardCoverUrl = 'img/logo.jpg';

    let url = '';

    if (state === CARDS_STATES.finished) {
        url = cardImageUrl;
        cardElement.classList.add('bg-success');

    } else if (state === CARDS_STATES.comparing) {
        url = cardImageUrl;
        cardElement.classList.add('bg-secondary');
    } else if (state === CARDS_STATES.closed) {
        url = cardCoverUrl;
        cardElement.classList.add('bg-white');
    } else if (state === CARDS_STATES.invalid) {
        url = cardImageUrl;
        cardElement.classList.add('bg-danger');
    } else {
        throw Error("invalid card state");
    }
    cardElement.style.backgroundImage = `url("${url}")`;
    cardElement.style.backgroundPosition = 'center';
    cardElement.style.backgroundRepeat = 'no-repeat';
    cardElement.style.backgroundSize = '70%';

    cardElement.dataset.role = 'card';
    cardElement.dataset.name = name;
    cardElement.dataset.state = state;
    cardElement.dataset.id = id;

    return cardElement;
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
    const newClickedCard = buildCardElement({ ...clickedCardData });
    clickedCard.replaceWith(newClickedCard);

    newClickedCard.addEventListener('click', (event) => {
        handleClickCard(gameField, event.target);
    });

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
        const card1 = buildCardElement({ ...clickedCardData, state: CARDS_STATES.invalid });
        newClickedCard.replaceWith(card1);
        const card2 = buildCardElement({ ...anotherCard.dataset, state: CARDS_STATES.invalid });
        anotherCard.replaceWith(card2);

        setTimeout(() => {
            gameField
                .querySelectorAll(`[data-state="${CARDS_STATES.invalid}"]`)
                .forEach((cardElement) => {
                    const closedCard = buildCardElement({ ...cardElement.dataset, state: CARDS_STATES.closed });
                    closedCard.addEventListener('click', (event) => handleClickCard(gameField, event.target));
                    cardElement.replaceWith(closedCard);
            });
        }, 500);
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

    const modal = new bootstrap.Modal(document.getElementById('modal'));
    document.getElementById('modal-reset-game')
        .addEventListener('click', () => resetGame());
    const modalMessage = document.getElementById('modal-message');
    modalMessage.innerText = `Поздравляем, вы завершили игру. Количество выполненных ходов: ${stepsCountInc}`;
    const gif = document.createElement('img');
    gif.src = 'img/wow-shocked.gif';
    modalMessage.append(gif);
    modal.show();
};

const prepareCards = (elements) => {
    let id = 1;

    const cards = shuffle([...elements, ...elements]);

    return cards.map((name) => ({name, state: 'closed', id: id++ }));
};

const buildStepsCounter = (count = 0) => {
    const counter = document.createElement('p');
    counter.id = 'steps-counter';
    counter.innerText = `Ходов: ${count}`;
    counter.dataset.stepsCount = count;

    return counter;
};

const buildResetButton = () => {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-danger');
    button.id = 'reset-game';
    button.innerText = 'Сброс';

    return button;
}

const startGame = () => {
    const stepsCount = 0;
    const cards = prepareCards(ELEMENTS);

    const controlsBar = document.getElementById('controls');
    controlsBar.innerText = '';
    const stepsCounter = buildStepsCounter();
    controlsBar.append(stepsCounter);
    stepsCounter.innerText = `Ходов: ${stepsCount}`;

    const resetButton = buildResetButton();
    controlsBar.append(resetButton);

    resetButton.addEventListener('click', () => {
        const confirmResult = confirm("сбросить?");
        if (confirmResult) {
            resetGame();
        }
    });

    const gameField = document.getElementById('game-field');
    gameField.innerText = '';

    const cardsElements = cards.map((card) => buildCardElement(card));
    const rowsCount = cardsElements.length / CARDS_PER_ROW;

    for(let i = 0; i < rowsCount; i += 1) {
        const rowElement = buildcardsRow();
        const sliceStart = CARDS_PER_ROW * i;
        const sliceEnd = CARDS_PER_ROW * (i + 1);
        const cardsSlice = cardsElements.slice(sliceStart, sliceEnd);
        rowElement.append(...cardsSlice);
        gameField.append(rowElement);
    }

    cardsElements.forEach((card) => {
        card.addEventListener('click', (event) => {
            handleClickCard(gameField, event.target);
        });
    }, true);
};

const resetGame = () => {
    startGame();
};
