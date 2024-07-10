let numberOfPokemonToLoad = 2;
let nextApiUrl = "";
let currentPokemonDetails = {};

async function renderPokemon(next){
  let path = "";
  if(next){
    path = nextApiUrl+".json";
  }else{
    path = API_BASE_URL+"?limit="+numberOfPokemonToLoad+".json";
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
  };
  currentPokemonDetails = pokemonDetails;
  console.log(currentPokemonDetails);
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

function getPokemonAbilityNames(abilities){
  let arrAbilities =[];
  for (let i = 0; i < abilities.length; i++) {
    arrAbilities.push(abilities[i].ability.name);
  };
  return arrAbilities;
}

async function renderPokemonDetailView(pokemonId){
  let pokemonDetailData =  await loadFromApi(API_BASE_URL+"/"+pokemonId);
  await generatePokemonDetailInformation(pokemonDetailData);
}

function loadMorePokemon(){
  renderPokemon(nextApiUrl);
}


function renderPokemonAboutInformation(){
  document.getElementById('maininfo-container').innerHTML = generateDetailsAboutHTML();
}
function renderPokemonBasestatsInformation(){

}
function renderPokemonEvolutionInformation(){

}
function renderPokemonMovesInformation(){

}

function registerEventListeners(){
  document.getElementById('load-btn').addEventListener("click", loadMorePokemon);
  document.getElementById('tabnav-about').addEventListener("click", renderPokemonAboutInformation);
  document.getElementById('tabnav-basestats').addEventListener("click", renderPokemonBasestatsInformation);
  document.getElementById('tabnav-evolution').addEventListener("click", renderPokemonEvolutionInformation);
  document.getElementById('tabnav-moves').addEventListener("click", renderPokemonMovesInformation);
}

async function testfunction(){
  await renderPokemonDetailView(1);
  renderPokemonAboutInformation();
}

function init(){ 
 renderPokemon();
 registerEventListeners();
}
window.addEventListener("load", init);

//TO DO - werte für Egg groups auslesen,ist vlt in zeile 33 im Rückgabe JSOn enthalten? wie komme ich sonst ran?
// Base Stats auslesen und in Funtion generatePokemonDetailInformation Zeite 32 mit ins globale Objekt packen