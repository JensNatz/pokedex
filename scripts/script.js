let numberOfPokemonToLoad = 4;
let maxPokemonId = 151;
let nextApiUrl = "";
let currentPokemonDetails = {};

async function renderPokemon(next){
  let path = "";
  if(next){
    path = nextApiUrl+".json";
  }else{
    path = API_BASE_URL+"pokemon?limit="+numberOfPokemonToLoad+".json";
  }
  let currentPokemons =  await loadFromApi(path);
  for (let i = 0; i < currentPokemons.results.length; i++) {
    let pokemonData = await loadFromApi(currentPokemons.results[i].url);
    let pokemonInformation = generatePokemonInformation(pokemonData);
    let pokemonCardHTML = generatePokemonCardHTML(pokemonInformation);
    document.getElementById('pokedex-container').innerHTML += pokemonCardHTML;
  }
  nextApiUrl = currentPokemons.next;
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

async function loadNextPokemonDetailView(){
  let nextId;
  if (currentPokemonDetails.id == maxPokemonId){
    nextId = 1;
  } else {
    nextId = currentPokemonDetails.id+1;
  }
  await loadPokemonDetailView(nextId);
  renderPokemonDetailView();
  renderPokemonAboutInformation();
}

async function loadPreviousPokemonDetailView(){
  let previousId;
  if (currentPokemonDetails.id == 1){
    previousId = maxPokemonId;
  } else {
    previousId = currentPokemonDetails.id-1;
  }
  await loadPokemonDetailView(previousId);
  renderPokemonDetailView();
  renderPokemonAboutInformation();
}


function loadMorePokemon(){
  renderPokemon(nextApiUrl);
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
  //document.getElementById('detail-overlay').addEventListener("click", showDetailsOverlay);
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
//für die evolutuon chain URL in zeile 45 eine funktio nschreibemn, die mittels dieser URL einen
// api request stellt, der dann alle ids der Pokemon aus der Chain in der aufsteigenden Reihenfolge zurück gibt 
//da alle Bilder mit der ID des Pokemt verbunden sind, kann man dann über die URLS die Bilder anzeigen lassen
// Suchfunktion?! 
//load more button