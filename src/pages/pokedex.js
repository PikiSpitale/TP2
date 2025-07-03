import "../style.css";
import "./pokedexstyle.css";

const sprite = document.getElementById("sprite");
let allPokemons = [];

function getCaptured() {
  return JSON.parse(localStorage.getItem("capturedPokemons") || "[]");
}
function isCaptured(id) {
  return getCaptured().includes(id);
}

function showAllSprites(pokemons) {
  sprite.innerHTML = pokemons
    .map(
      (pokemon) => `
      <img src="${pokemon.sprites.front_default}" alt="${
        pokemon.name
      }" width="120" height="120"
        style="margin: 0 auto; display: block; -webkit-user-drag: none; 
        ${
          isCaptured(pokemon.id)
            ? ""
            : "filter: grayscale(100%) brightness(0); opacity: 0.6;"
        }"
      />
    `
    )
    .join("");
}

async function fetchAndShowAllPokemons() {
  try {
    sprite.innerHTML = "Cargando...";
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    const data = await res.json();
    const promises = data.results.map(async (pokemon) => {
      const pokeRes = await fetch(pokemon.url);
      console.log(`Fetched details for ${pokemon.name}`);
      return pokeRes.json();
    });
    allPokemons = await Promise.all(promises);

    showAllSprites(allPokemons);
  } catch (err) {
    sprite.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

fetchAndShowAllPokemons();
