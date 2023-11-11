const CARDS_STATES = {
    open: 'open',
    closed: 'closed',
    comparing: 'comparing',
};

const buildOpenCardUrl = (color) => `https://placehold.co/50x50/${color}/white?text=Open`;
const buildClosedCardUrl = (color) => `https://placehold.co/50x50/gray/white?text=Closed`;

const buildCardElement = (cardData) => {
    const el = document.createElement('img');
    const url = cardData.state === CARDS_STATES.open
        ? buildOpenCardUrl(cardData.name)
        : buildClosedCardUrl(cardData);
    el.setAttribute('src', url);
    el.dataset.name = cardData.name;
    el.dataset.state = cardData.state;
    el.addEventListener('click', ({ target }) => changeState(target));

    return el;
}



const changeState = (cardElement) => {
    const { name, state } = cardElement.dataset;

    const nextState =
        state === CARDS_STATES.open ? CARDS_STATES.closed : CARDS_STATES.open;

    const nextElement = buildCardElement({name, state: nextState});
    cardElement.replaceWith(nextElement);
};

const shuffle = (elements) => elements
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const prepareCards = () => {
    const elements = [
        'red',
        'blue',
        'orange',
        'purple'
    ];
    const cards = shuffle([...elements, ...elements]);
    return cards.map((name) => ({name, state: 'closed'}));
};

const startGame = () => {
    const gameData = {
        stepsCount: 0,
        cards: prepareCards(),
    };

    const gameField = document.getElementById('gameField');

    gameData.cards.forEach((card) => {
        const cardEl = buildCardElement(card);
        gameField.append(cardEl);
    });
    gameField.addEventListener('click', (event) => {
        console.log(gameField);
    });
};

startGame();
