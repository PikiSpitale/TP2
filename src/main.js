import "./style.css";

const container = document.getElementById("cards-container");
let allPokemons = [];

function getGeneration(id) {
  if (id >= 1 && id <= 151) return "Generation 1";
  if (id >= 152 && id <= 251) return "Generation 2";
  if (id >= 252 && id <= 386) return "Generation 3";
  if (id >= 387 && id <= 493) return "Generation 4";
  if (id >= 494 && id <= 649) return "Generation 5";
  if (id >= 650 && id <= 721) return "Generation 6";
  if (id >= 722 && id <= 809) return "Generation 7";
  if (id >= 810 && id <= 905) return "Generation 8";
  if (id >= 906) return "Generation 9";
  return "Desconocida";
}

function applyFilters() {
  const generation = document.getElementById("generation-filter").value;
  const type = document.getElementById("type-filter").value;
  let filtered = allPokemons;

  if (generation !== "all") {
    filtered = filtered.filter((p) => getGeneration(p.id) === generation);
  }
  if (type !== "all") {
    filtered = filtered.filter((p) =>
      p.types.find((t) => t.type.name.toLowerCase() === type.toLowerCase())
    );
  }
  renderPokemons(filtered);
}

function getCaptured() {
  return JSON.parse(localStorage.getItem("capturedPokemons") || "[]");
}
function setCaptured(arr) {
  localStorage.setItem("capturedPokemons", JSON.stringify(arr));
}
function isCaptured(id) {
  return getCaptured().includes(id);
}
function capturePokemon(id) {
  const captured = getCaptured();
  if (!captured.includes(id)) {
    captured.push(id);
    setCaptured(captured);
  }
}

function releasePokemon(id) {
  let captured = getCaptured();
  captured = captured.filter((pid) => pid !== id);
  setCaptured(captured);
}

async function fetchAndShowAllPokemons() {
  container.innerHTML = "Cargando...";
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    const data = await res.json();
    const promises = data.results.map(async (pokemon) => {
      const pokeRes = await fetch(pokemon.url);
      return pokeRes.json();
    });
    allPokemons = await Promise.all(promises);
    applyFilters();
  } catch (err) {
    container.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

document
  .getElementById("generation-filter")
  .addEventListener("change", applyFilters);
document.getElementById("type-filter").addEventListener("change", applyFilters);

async function pokemonColor(pokemon) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`
  );
  const data = await res.json();

  console.log(data.color.name);
  const color = data.color.name;
  const modalContent = document.getElementById("modal-content");
  modalContent.style.border = `2px solid ${color}`;
}

function renderPokemons(pokemons) {
  if (pokemons.length === 0) {
    container.innerHTML = `<p style="color:red;">No se encontró ningún Pokémon con los filtros aplicados.</p>`;
    return;
  }
  container.innerHTML = pokemons
    .map(
      (data, idx) => `
    <div
      style="
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 16px;
        width: 220px;
        margin: 10px;
        display: inline-block;
        text-align: center;
      "
    >
      <div>
        <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
        <img
          src="${data.sprites.front_default}"
          alt="${data.name}"
          width="96"
          height="96"
        />
        <p><strong>ID:</strong> ${data.id}</p>
        <p>
          <strong>Type:</strong> ${data.types
            .map(
              (t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
            )
            .join(", ")}
        </p>
        <p><strong>Generation:</strong> ${getGeneration(data.id)}</p>
      </div>
      <div class="cardButtons">

  <button
  class="capture-btn"
  data-id="${data.id}"
  style="
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  "
>
  ${isCaptured(data.id) ? "Liberar" : "Capturar"}
</button>
  <button
    class="info-btn"
    data-idx="${idx}"
    style="
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    "
  >
    Informacion
  </button>
        </div>
</div>
  `
    )
    .join("");

  function showPokemonModal(pokemon) {
    const modal = document.getElementById("pokemon-modal");
    const modalContent = document.getElementById("modal-content");
    modalContent.innerHTML = `
  <button class="modal-close" id="close-modal">&times;</button>
  <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
  <img src="${pokemon.sprites.front_default}" alt="${
      pokemon.name
    }" width="120" height="120" style="margin: 0 auto 16px auto; display: block;"/>
  <p><strong>ID:</strong> ${pokemon.id}</p>
  <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p>
  <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>
  <p><strong>Tipos:</strong> ${pokemon.types
    .map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
    .join(", ")}</p>
  <p><strong>Estadísticas:</strong></p>
  <ul>
    ${pokemon.stats
      .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
      .join("")}
  </ul>
`;
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
    document.getElementById("close-modal").onclick = () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    };
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    };
    pokemonColor(pokemon);
  }

  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.onclick = () => {
      const idx = btn.getAttribute("data-idx");
      showPokemonModal(pokemons[idx]);
    };
  });

  document.querySelectorAll(".capture-btn").forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.getAttribute("data-id"));
      if (isCaptured(id)) {
        releasePokemon(id);
        btn.textContent = "Capturar";
      } else {
        capturePokemon(id);
        btn.textContent = "Liberar";
      }
      applyFilters(allPokemons);
    };
  });
}

const sprite = document.getElementById("sprite");

fetchAndShowAllPokemons();
