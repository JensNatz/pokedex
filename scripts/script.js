let numberOfPokemonToLoad = 7;
let maxPokemonId = 151;
let currentPokemonId = 0;
let loadedPokemon = [];

async function renderPokemon(){
  if(loadedPokemon.length < maxPokemonId){
    showSpinnerOverlay();
    let limit = numberOfPokemonToLoad;
    let offset = loadedPokemon.length;
    if(loadedPokemon.length+numberOfPokemonToLoad > maxPokemonId){limit = maxPokemonId-loadedPokemon.length};
    path = `${API_BASE_URL}pokemon?limit=${limit}&offset=${loadedPokemon.length}.json`;
    let currentPokemons =  await loadFromApi(path);
    for (let i = 0; i < currentPokemons.results.length; i++) {
      let pokemonData = await loadFromApi(currentPokemons.results[i].url);
      await generatePokemonInformation(pokemonData);
    }
    renderPokemonCards(offset);
    showSpinnerOverlay();
  }else {
    alert("no more to load");
  }
}

function renderPokemonCards(offset){
  for (let i = offset; i < loadedPokemon.length; i++) {
    let pokemonCardHTML = generatePokemonCardHTML(loadedPokemon[i]);
    document.getElementById('pokedex-container').innerHTML += pokemonCardHTML;
  }
}

async function generatePokemonInformation(pokemonData){
  let pokemonSpeciesInformation = await(generatePokemonSpeciesInformation(pokemonData.id))
  let pokemonInformation = {
    id: pokemonData.id,
    name: pokemonData.name,
    image: pokemonData.sprites.other["official-artwork"].front_default,
    types: getPokemonTypeNames(pokemonData.types),
    weight: pokemonData.weight,
    height: pokemonData.height,
    abilities: getPokemonAbilityNames(pokemonData.abilities),
    stats: getPokemonStatsInformation(pokemonData.stats),
    evolutionChainIds : await getPokemonEvolutionChainIds(pokemonData.id),
    genderRate: pokemonSpeciesInformation.gender_rate,
    eggGroup: getPokemonEggGroupNames(pokemonSpeciesInformation.egg_groups),
  };
  loadedPokemon.push(pokemonInformation);
  return pokemonInformation;
}

async function generatePokemonSpeciesInformation(pokemonId){
  let pokemonSpeciesJson =  await loadFromApi(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
  return pokemonSpeciesJson;
}

function getPokemonTypeNames(types){
  let arrTypeNames =[];
  for (let i = 0; i < types.length; i++) {
    arrTypeNames.push(types[i].type.name);
  };
  return arrTypeNames;
}

function getPokemonStatsInformation(stats){
  let arrStats =[];
  for (let i = 0; i < stats.length; i++) {
    let arrStat = [stats[i].stat.name, stats[i].base_stat];
    arrStats.push(arrStat); 
  }
  return arrStats;
}

function getPokemonEggGroupNames(eggGroups){
  let arrEggGroups =[];
  for (let i = 0; i < eggGroups.length; i++) {
    arrEggGroups.push(eggGroups[i].name);
  };
  return arrEggGroups;
}

function getPokemonAbilityNames(abilities){
  let arrAbilities =[];
  for (let i = 0; i < abilities.length; i++) {
    arrAbilities.push(abilities[i].ability.name);
  };
  return arrAbilities;
}

function showPokemonDetailView(pokemonId){
  currentPokemonId = pokemonId;
  renderPokemonDetailView(currentPokemonId);
  renderPokemonAboutInformation(currentPokemonId);
  setDetailViewBackgroundColor();
  showDetailsOverlay();
}

function setDetailViewBackgroundColor(){
  let background = document.getElementById('pokemon-details-bg');
  background.className= '';
  background.classList.add(`color-${loadedPokemon[currentPokemonId-1].types[0]}`)
}

function renderPokemonDetailView(pokemonId){
  let i = pokemonId-1;
  document.getElementById('baseinfo-name').innerHTML = loadedPokemon[i].name;
  document.getElementById('baseinfo-image').src = loadedPokemon[i].image;
  document.getElementById('baseinfo-id').innerHTML = formatPokemonId(pokemonId);
  document.getElementById('baseinfo-types').innerHTML = genereateTypesHTML(loadedPokemon[i].types);
};

async function loadNextPokemonDetailView(event, step){
  event.stopPropagation();
  let nextId;
  if (currentPokemonId == loadedPokemon.length && step > 0){
    nextId = 1;
  } else if (currentPokemonId == 1 && step < 0){
    nextId = loadedPokemon.length;
  } else {
    nextId = currentPokemonId+step;
  }
  currentPokemonId = nextId;
  renderPokemonDetailView(nextId);
  renderPokemonAboutInformation();
  setDetailViewBackgroundColor();
}

function loadMorePokemon(){
  renderPokemon();
}

function searchPokemon(){
  let searchString = document.getElementById('search-input').value;
  let pokemonCards = document.getElementsByClassName('pokemon-card');
  if(searchString.length > 2){
    for (let card of pokemonCards) {
      if(card.id.substring(5).includes(searchString.toLowerCase())){
        card.style.display = "flex"
      }
      else {
         card.style.display = "none"
      }
    }
  } else {
    for (let card of pokemonCards) {
        card.style.display = "flex"
    }
  }
}

function renderPokemonAboutInformation(){
  let i = currentPokemonId-1;
  document.getElementById('maininfo-container').innerHTML = generateDetailsAboutHTML(i);
}
function renderPokemonBasestatsInformation(){
  let i = currentPokemonId-1;
  document.getElementById('maininfo-container').innerHTML = generateDetailsBaseStatsHTML(i);
}
function renderPokemonEvolutionInformation(){
  let i = currentPokemonId-1;
  document.getElementById('maininfo-container').innerHTML = generateDetailsEvolutionchainHTML(i);
}

function registerEventListeners(){
  document.getElementById('load-btn').addEventListener("click", loadMorePokemon);
  document.getElementById('tabnav-about').addEventListener("click", renderPokemonAboutInformation);
  document.getElementById('tabnav-basestats').addEventListener("click", renderPokemonBasestatsInformation);
  document.getElementById('tabnav-evolution').addEventListener("click", renderPokemonEvolutionInformation);
  document.getElementById('detail-overlay').addEventListener("click", showDetailsOverlay);
  document.getElementById('search-input').addEventListener("input", searchPokemon); 
}

function showDetailsOverlay() {
  document.getElementById('detail-overlay').classList.add('detail-overlay-show');
}

function showSpinnerOverlay() {
  document.getElementById('spinner-overlay').classList.toggle('d-none');
}

async function getPokemonEvolutionChainIds(pokemonId) {
  let speciesData =  await loadFromApi(API_BASE_URL+"pokemon-species/"+pokemonId);
  let evolutionChainUrl = speciesData.evolution_chain.url;
  let evolutionChainData = await loadFromApi(evolutionChainUrl);
  let evolutionIds = [];
  function extractIds(evolutionNode) {
      let urlParts = evolutionNode.species.url.split('/');
      let id = urlParts[urlParts.length - 2];
      evolutionIds.push(parseInt(id));
      if (evolutionNode.evolves_to.length > 0) {
          evolutionNode.evolves_to.forEach(evolveNode => extractIds(evolveNode));
      }
  }
  extractIds(evolutionChainData.chain);
  return evolutionIds;
}

function init(){ 
 renderPokemon();
 registerEventListeners();
}
window.addEventListener("load", init);

//TO DO -
// Meldung wenn alle pokemon geladen sind oder button deaktivieren 
// Style der Balken in 3 Farben, rot, grün gelb
