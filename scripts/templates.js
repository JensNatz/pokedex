function generatePokemonCardHTML(pokemonInformation) {
  return `<div id="card-${pokemonInformation.name}" 
              class="pokemon-card color-${pokemonInformation.types[0]}" 
              style="background-image: url(${pokemonInformation.image})"
              onclick="showPokemonDetailView(${pokemonInformation.id})"
          >
            <div class="card-titlearea">
              <h2 class="card-name">${pokemonInformation.name}</h2>
              <span>${formatPokemonId(pokemonInformation.id)}</span>
             </div>
            <div class="card-infoarea">
                <div class="card-types">
                  ${genereateTypesHTML(pokemonInformation.types)}
                </div>
            </div>
             
          </div>`;
};

function genereateTypesHTML(types) {
  let typesHTML = '';
  for (let i = 0; i < types.length; i++) {
    typesHTML += `<span class="card-type">${types[i]}</span>`;
  };
  return typesHTML;
};


function generateDetailsAboutHTML(i) {
  return `
      <div class="maininfo-about">
          <p class="about-flavortext">
          ${loadedPokemon[i].flavorText}
          </p>
          <table class="about-table">
              <tr>
                  <td>Height</td>
                  <td>${convertHeight(loadedPokemon[i].height)}</td>
              </tr>
              <tr>
                  <td>Weight</td>
                  <td>${convertWeight(loadedPokemon[i].weight)}</td>
              </tr>
              <tr>
                  <td>Abilities</td>
                  <td class="about-table-caps">${loadedPokemon[i].abilities.join(', ')}</td>
              </tr>
          </table>
          <h3>Breeding</h3>
          <table class="about-table">
              <tr>
                  <td>Gender</td>
                  <td>${convertGenderRateDescription(loadedPokemon[i].genderRate)}</td>
              </tr>
              <tr>
                  <td>Egg Groups</td>
                  <td  class="about-table-caps">${loadedPokemon[i].eggGroup.join(', ')}</td>
              </tr>
          </table>                     
      </div>
  `;
}

function generateDetailsBaseStatsHTML(i) {
  let table = `<table class="stats-table">`;
  for (let k = 0; k < loadedPokemon[i].stats.length; k++) {
    let colorcode
    if (loadedPokemon[i].stats[k][1] >= 50){
      colorcode = "green";
    } else { colorcode = "red"}
      table += `
          <tr>
              <td>${loadedPokemon[i].stats[k][0]}</td>
              <td>${loadedPokemon[i].stats[k][1]}</td>
              <td>
                  <div class="progress-container">
                      <div class="progress-bar bar-color-${colorcode}" style="width: ${loadedPokemon[i].stats[k][1]}%;"></div>
                  </div>
              </td>
          </tr>
      `;
  }
  table += `</table>`
  return table;
}

// function generateDetailsEvolutionchainHTML(i) {
//   let container = `<div class="maininfo-evochain">`;
//   for (let k = 0; k < loadedPokemon[i].evolutionChainIds.length; k++) {
//         container += `<img class="evochain-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${loadedPokemon[i].evolutionChainIds[k]}.png">`
//         if(k < loadedPokemon[i].evolutionChainIds.length-1){
//           container += `<img src="./assets/img/arrow-right.png" class="evochain-arrow">`;
//         }
//   }
//   container += `</div>`;
//   return container;
// }

function generateDetailsEvolutionchainHTML(i) {
  let container = `<div class="maininfo-evochain">`;
  for (let k = 0; k < loadedPokemon[i].evolutionChain.length; k++) {
        container += `<div class="evochain-entry">`
        container += `<img class="evochain-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${loadedPokemon[i].evolutionChain[k][0]}.png">`;
        container += `<div class="evochain-level"><img class="evochain-arrow" src="./assets/img/arrow_right.png" >Lvl ${loadedPokemon[i].evolutionChain[k][2]}</div>`;
        container += `<img class="evochain-image" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${loadedPokemon[i].evolutionChain[k][1]}.png">`;
        container += `</div>`
  }
  container += `</div>`;
  return container;
}

function formatPokemonId(pokemonId) {
  if (pokemonId < 1 || pokemonId > 999) {
      throw new Error("Id has to be between 1 and 999.");
  }
  return '#' + pokemonId.toString().padStart(3, '0');
}

function convertWeight(hectograms) {
  let kilograms = hectograms / 10;
  let pounds = (kilograms * 2.20462).toFixed(2);
  return `${pounds} lbs (${kilograms} kg)`;
}

function convertHeight(decimetres) {
  let meters = decimetres / 10;
  let totalInches = meters * 39.37;
  let feet = Math.floor(totalInches / 12);
  let inches = (totalInches % 12).toFixed(1);
  return `${feet}'${inches}" (${meters.toFixed(2)} m)`;
}

function convertGenderRateDescription(genderRate) {
  switch (genderRate) {
    case 0:
      return "100% male, 0% female";
    case 1:
      return "87.5% male, 12.5% female";
    case 2:
      return "75% male, 25% female";
    case 3:
      return "62.5% male, 37.5% female";
    case 4:
      return "50% male, 50% female";
    case 5:
      return "37.5% male, 62.5% female";
    case 6:
      return "25% male, 75% female";
    case 7:
      return "12.5% male, 87.5% female";
    case 8:
      return "0% male, 100% female";
    default:
      return "genderless";
  }
}
