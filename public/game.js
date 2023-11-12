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
    return document.getElementById('steps-count');
}

const buildcardsRow = () => {
    // <div class="row justify-content-center" style="gap: 43px; margin-bottom: 20px;">
    const row = document.createElement('div');
    row.classList.add('row', 'justify-content-center');
    row.style.gap = '43px';
    row.style.marginBottom = '20px';

    return row;
}

const buildCardElement = ({ id, name, state }) => {
    const cardWrapper = document.createElement('div');
    // <div class="card col bg-secondary shadow" style="max-width: 10rem;">
    //     <img src="img/home.svg" class="card-img-top py-5 mx-auto" alt="..." style="width: 100px;">
    // </div>
    cardWrapper.classList.add('card', 'col', 'bg-secondary', 'shadow');
    cardWrapper.style.width = "10rem;";
    cardWrapper.style.height = '10rem';
    // cardWrapper.style.backgroundImage =


    // <img src="img/butterfly.svg" class="card-img-top py-5 mx-auto" alt="..." style="width: 100px;"></img>
    const cardImage = document.createElement('img');
    cardImage.classList.add('card-img-top', 'py-5', 'mx-auto');
    cardImage.style.width = '100px';

    const cardImageUrl = `/img/${name}.svg`;
    const cardCoverUrl = '/img/logo.jpg';

    let url = '';

    if (state === CARDS_STATES.finished) {
        url = cardImageUrl;
        cardWrapper.classList.add('bg-success');

    } else if (state === CARDS_STATES.comparing) {
        url = cardImageUrl;
        cardWrapper.classList.add('bg-secondary');
    } else if (state === CARDS_STATES.closed) {
        url = cardCoverUrl;
        cardWrapper.classList.add('bg-white');
    } else if (state === CARDS_STATES.invalid) {
        url = cardImageUrl;
        cardWrapper.classList.add('bg-danger');
    } else {
        throw Error("invalid card state");
    }
    cardWrapper.style.backgroundImage = `url("${url}")`;
    cardWrapper.style.backgroundPosition = 'center';
    cardWrapper.style.backgroundRepeat = 'no-repeat';
    cardWrapper.style.backgroundSize = '70%';
    cardImage.setAttribute('src', url);

    cardWrapper.dataset.role = 'card';
    cardWrapper.dataset.name = name;
    cardWrapper.dataset.state = state;
    cardWrapper.dataset.id = id;
    // cardWrapper.append(cardImage);

    cardWrapper.addEventListener('click', (event) => {
        console.log('click!');
        handleClickCard(gameField, event.target);
    });

    return cardWrapper;
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
    console.log(clickedCard);
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
            console.log('click!');
            handleClickCard(gameField, event.target);
        });
    }, true);
};
