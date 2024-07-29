let numberOfPokemonToLoad = 151;
let maxPokemonId = 151;
let currentPokemonId = 0;
let loadedPokemon = [];

async function renderPokemon(){
  if(loadedPokemon.length < maxPokemonId){
    toggleSpinnerOverlay();
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
    toggleSpinnerOverlay();
    if(loadedPokemon.length >= maxPokemonId){
      deactivateLoadButton();
    }
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
    evolutionChain : await getPokemonEvolutionChain(pokemonData.id),
    genderRate: pokemonSpeciesInformation.gender_rate,
    eggGroup: getPokemonEggGroupNames(pokemonSpeciesInformation.egg_groups),
    flavorText: pokemonSpeciesInformation.flavor_text_entries[0].flavor_text

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
  toggleDetailsOverlay();
}

function setDetailViewBackgroundColor(){
  let background = document.getElementById('pokemon-details');
  let classes = background.className.split(" ");
  let filteredClasses = classes.filter(cls => !cls.startsWith("color-"));
  background.className = filteredClasses.join(" ");
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

function deactivateLoadButton(){
  document.getElementById('load-btn').disabled = true;
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

function setTabnavStyle(elementId){
  let tabs = document.querySelectorAll('.tabnavigation-tab');
  tabs.forEach(function(tab) {
    tab.classList.remove('tab-active');
  });
  document.getElementById(elementId).classList.add("tab-active"); 
}

function renderPokemonAboutInformation(){
  event.stopPropagation();
  setTabnavStyle('tabnav-about');
  let i = currentPokemonId-1;
  document.getElementById('maininfo-container').innerHTML = generateDetailsAboutHTML(i);
}
function renderPokemonBasestatsInformation(){
  event.stopPropagation();
  setTabnavStyle('tabnav-basestats');
  let i = currentPokemonId-1;
  document.getElementById('maininfo-container').innerHTML = generateDetailsBaseStatsHTML(i);
}
function renderPokemonEvolutionInformation(){
  event.stopPropagation();
  setTabnavStyle('tabnav-evolution');
  let i = currentPokemonId-1;
  document.getElementById('maininfo-container').innerHTML = generateDetailsEvolutionchainHTML(i);
}

function registerEventListeners(){
  document.getElementById('load-btn').addEventListener("click", loadMorePokemon);
  document.getElementById('tabnav-about').addEventListener("click", renderPokemonAboutInformation);
  document.getElementById('tabnav-basestats').addEventListener("click", renderPokemonBasestatsInformation);
  document.getElementById('tabnav-evolution').addEventListener("click", renderPokemonEvolutionInformation);
  document.getElementById('overlay-close').addEventListener("click", toggleDetailsOverlay);
  document.getElementById('search-input').addEventListener("input", searchPokemon); 
}

function toggleDetailsOverlay() {
  document.getElementById('detail-overlay').classList.toggle('detail-overlay-show');
}

function toggleSpinnerOverlay() {
  document.getElementById('spinner-overlay').classList.toggle('d-none');
}

async function getPokemonEvolutionChain(pokemonId) {
  let speciesData =  await loadFromApi(API_BASE_URL + "pokemon-species/" + pokemonId);
  let evolutionChainUrl = speciesData.evolution_chain.url;
  let evolutionChainData = await loadFromApi(evolutionChainUrl);
  let chain = [];
  function extractChain(evolutionNode) {
      let urlParts = evolutionNode.species.url.split('/');
      let currentId = parseInt(urlParts[urlParts.length - 2]);
      evolutionNode.evolves_to.forEach(evolveNode => {
          let evolveUrlParts = evolveNode.species.url.split('/');
          let nextId = parseInt(evolveUrlParts[evolveUrlParts.length - 2]);
          let minLevel = null;
          if (evolveNode.evolution_details.length > 0) {
              minLevel = evolveNode.evolution_details[0].min_level;
          }
          chain.push([currentId, nextId, minLevel]);
          extractChain(evolveNode);
      });
  }
  extractChain(evolutionChainData.chain);
  return chain;
}

function init(){ 
 renderPokemon();
 registerEventListeners();
}

window.addEventListener("load", init);

// TO DO: wenn evolution chain 0 groß ist, dann soll da einfach "none stehen"