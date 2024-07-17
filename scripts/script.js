let numberOfPokemonToLoad = 3;
let maxPokemonId = 151;
let totalNumberofLoadedPokemon = 0;
let currentPokemonDetails = {};

async function renderPokemon(){
  if(totalNumberofLoadedPokemon < maxPokemonId){
    let limit = numberOfPokemonToLoad;
    if(totalNumberofLoadedPokemon+numberOfPokemonToLoad > maxPokemonId){limit = maxPokemonId-totalNumberofLoadedPokemon};
    path = `${API_BASE_URL}pokemon?limit=${limit}&offset=${totalNumberofLoadedPokemon}.json`;
    console.log(path);
    let currentPokemons =  await loadFromApi(path);
    for (let i = 0; i < currentPokemons.results.length; i++) {
      let pokemonData = await loadFromApi(currentPokemons.results[i].url);
      let pokemonInformation = generatePokemonInformation(pokemonData);
      let pokemonCardHTML = generatePokemonCardHTML(pokemonInformation);
      document.getElementById('pokedex-container').innerHTML += pokemonCardHTML;
      totalNumberofLoadedPokemon++;
    }
  }else {
    alert("no more to load");
  }
}

function generatePokemonInformation(pokemonData){
  let pokemonInformation = {
    id: pokemonData.id,
    name: pokemonData.name,
    image: pokemonData.sprites.other["official-artwork"].front_default,
    types: getPokemonTypeNames(pokemonData.types)
  };
  return pokemonInformation;
}

async function generatePokemonDetailInformation(pokemonData){
  let pokemonSpeciesInformation = await(generatePokemonSpeciesInformation(pokemonData.id))
  let pokemonDetails = {
    id: pokemonData.id,
    name: pokemonData.name,
    image: pokemonData.sprites.other["official-artwork"].front_default,
    types: getPokemonTypeNames(pokemonData.types),
    weight: pokemonData.weight,
    height: pokemonData.height,
    abilities: getPokemonAbilityNames(pokemonData.abilities),
    genderRate: pokemonSpeciesInformation.gender_rate,
    eggGroup: getPokemonEggGroupNames(pokemonSpeciesInformation.egg_groups),
    stats: getPokemonStatsInformation(pokemonData.stats),
    evolutionChainIds : await getPokemonEvolutionChainIds(pokemonData.id)
  };
  currentPokemonDetails = pokemonDetails;
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

async function showPokemonDetailView(pokemonId){
  await loadPokemonDetailView(pokemonId);
  renderPokemonDetailView();
  renderPokemonAboutInformation();
  showDetailsOverlay();
}

async function loadPokemonDetailView(pokemonId){
  let pokemonDetailData =  await loadFromApi(API_BASE_URL+"pokemon/"+pokemonId);
  await generatePokemonDetailInformation(pokemonDetailData);
}

function renderPokemonDetailView(){
  document.getElementById('baseinfo-name').innerHTML = currentPokemonDetails.name;
  document.getElementById('baseinfo-image').src = currentPokemonDetails.image;
  document.getElementById('baseinfo-id').innerHTML = formatPokemonId(currentPokemonDetails.id);
  document.getElementById('baseinfo-types').innerHTML = genereateTypesHTML(currentPokemonDetails.types);
};

async function loadNextPokemonDetailView(event, step){
  event.stopPropagation();
  let nextId;
  if (currentPokemonDetails.id == totalNumberofLoadedPokemon && step > 0){
    nextId = 1;
  } else if (currentPokemonDetails.id == 1 && step < 0){
    nextId = totalNumberofLoadedPokemon;
  } else {
    nextId = currentPokemonDetails.id+step;
  }
  await loadPokemonDetailView(nextId);
  renderPokemonDetailView();
  renderPokemonAboutInformation();
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
  document.getElementById('maininfo-container').innerHTML = generateDetailsAboutHTML();
}
function renderPokemonBasestatsInformation(){
  document.getElementById('maininfo-container').innerHTML = generateDetailsBaseStatsHTML();
}
function renderPokemonEvolutionInformation(){
  document.getElementById('maininfo-container').innerHTML = generateDetailsEvolutionchainHTML();
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
  document.getElementById('detail-overlay').classList.toggle('detail-overlay-show');
}

async function testfunction(){
  await renderPokemonDetailView(1);
  renderPokemonBasestatsInformation();
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

// Suchfunktion?! 
//load more button