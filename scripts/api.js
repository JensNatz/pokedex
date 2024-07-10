const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon";

async function loadFromApi(path){
  let response = await fetch (path);
  let responseToJson = await response.json();
  return responseToJson;
}
