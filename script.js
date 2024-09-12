const pokemonContainer = document.querySelector(".pokemon-container");
const spinner = document.querySelector("#spinner");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const resetButton = document.querySelector("#resetButton");

let limit = 8;
let offset = 1;

function togglePaginationButtons(disabled) {
    previous.querySelector("a").classList.toggle("disabled", disabled);
    next.querySelector("a").classList.toggle("disabled", disabled);
}

previous.addEventListener("click", () => {
    if (offset != 1) {
        offset -= 9;
        removeChildNodes(pokemonContainer);
        togglePaginationButtons(true);
        fetchPokemons(offset, limit);
        togglePaginationButtons(false);
    }
});

next.addEventListener("click", () => {
    offset += 9;
    removeChildNodes(pokemonContainer);
    togglePaginationButtons(true);
    fetchPokemons(offset, limit);
    togglePaginationButtons(false);
    document.querySelector("#resetButton").style.display = "block";
});

searchButton.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        removeChildNodes(pokemonContainer);
        fetchPokemonByNameOrId(searchTerm);
        document.querySelector("#resetButton").style.display = "block"; 
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            removeChildNodes(pokemonContainer);
            fetchPokemonByNameOrId(searchTerm);
        }
    }
});

resetButton.addEventListener("click", () => {
    removeChildNodes(pokemonContainer);
    fetchPokemons(offset, limit);
    resetButton.style.display = "none";
    document.querySelector("#resetButton").style.display = "none"; 
});

function fetchPokemonByNameOrId(term) {
    spinner.style.display = "block";
    fetch(`https://pokeapi.co/api/v2/pokemon/${term}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Pokémon no encontrado");
            }
            return res.json();
        })
        .then((data) => {
            createPokemon(data);
            spinner.style.display = "none";
            resetButton.style.display = "block";
            togglePaginationButtons(true);
        })
        .catch((error) => {
            showError(error.message);
            spinner.style.display = "none";
        });
}

function fetchPokemons(offset, limit) {
    spinner.style.display = "block";
    for (let i = offset; i <= offset + limit; i++) {
        fetchPokemon(i);
    }
}

function fetchPokemon(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
        .then((res) => res.json())
        .then((data) => {
            createPokemon(data);
            spinner.style.display = "none";
        });
}

function createPokemon(pokemon) {
    const flipCard = document.createElement("div");
    flipCard.classList.add("flip-card");

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

    flipCard.appendChild(cardContainer);

    const card = document.createElement("div");
    card.classList.add("pokemon-block");

    const spriteContainer = document.createElement("div");
    spriteContainer.classList.add("img-container");

    const sprite = document.createElement("img");
    sprite.src = pokemon.sprites.front_default;

    spriteContainer.appendChild(sprite);

    const number = document.createElement("p");
    number.textContent = `#${pokemon.id.toString().padStart(3, 0)}`;

    const name = document.createElement("p");
    name.classList.add("name");
    name.textContent = pokemon.name;

    const weight = document.createElement("p");
    weight.textContent = ` ${(pokemon.weight / 10)} kg`;

    const typesContainer = document.createElement("div");
    typesContainer.classList.add("types-container");
    pokemon.types.forEach(typeInfo => {
        const typeElement = document.createElement("span");
        typeElement.textContent = typeInfo.type.name;
        typeElement.classList.add("type", `type-${typeInfo.type.name}`);
        typesContainer.appendChild(typeElement);
    });

    card.appendChild(spriteContainer);
    card.appendChild(number);
    card.appendChild(name);
    card.appendChild(weight);
    card.appendChild(typesContainer);

    const cardBack = document.createElement("div");
    cardBack.classList.add("pokemon-block-back");
    cardBack.appendChild(progressBars(pokemon.stats));

    cardContainer.appendChild(card);
    cardContainer.appendChild(cardBack);
    pokemonContainer.appendChild(flipCard);
}

function progressBars(stats) {
    const statsContainer = document.createElement("div");
    statsContainer.classList.add("stats-container");

    for (let i = 0; i < 3; i++) {
        const stat = stats[i];

        const statContainer = document.createElement("div");
        statContainer.classList.add("stat-container");

        const statIcon = document.createElement("img");
        
        if (stat.stat.name === "hp") {
            statIcon.src = "imagenes/corazon.png";
        } else if (stat.stat.name === "attack") {
            statIcon.src = "imagenes/espada.png";
        } else if (stat.stat.name === "defense") {
            statIcon.src = "imagenes/escudo.png";
        }

        statIcon.style.width = "24px";
        statIcon.style.height = "24px";

        const progress = document.createElement("div");
        progress.classList.add("progress");

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar", stat.stat.name);
        progressBar.setAttribute("aria-valuenow", stat.base_stat);
        progressBar.setAttribute("aria-valuemin", 0);
        progressBar.setAttribute("aria-valuemax", 255);
        progressBar.style.width = stat.base_stat + "%";
        progressBar.textContent = stat.base_stat;

        progress.appendChild(progressBar);
        statContainer.appendChild(statIcon);
        statContainer.appendChild(progress);
        statsContainer.appendChild(statContainer);
    }

    return statsContainer;
}

function removeChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function showError(message) {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = message;
    errorMessage.style.color = "red";
    pokemonContainer.appendChild(errorMessage);
}

fetchPokemons(offset, limit);
