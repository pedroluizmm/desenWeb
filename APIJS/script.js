// Array global para armazenar os dados de todos os Pokémon
let pokemonList = [];

// Evento que é disparado quando o DOM (estrutura HTML) é carregado
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Faz uma requisição para a PokéAPI buscando TODOS os Pokémon
    // Usamos um limit muito alto (100000) para tentar pegar todos disponíveis
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
    const data = await response.json();
    const results = data.results; // Array com objetos do tipo { name, url } de cada Pokémon

    // Para cada Pokémon, buscamos os detalhes (imagem, tipos, altura, peso) usando a URL fornecida
    // Usamos map para transformar cada item em uma requisição fetch que retorna os detalhes
    const promises = results.map(async (pokemon) => {
      const detailsResponse = await fetch(pokemon.url);
      const detailsData = await detailsResponse.json();
      return {
        name: detailsData.name, // Nome do Pokémon
        sprite: detailsData.sprites.front_default, // Imagem padrão do Pokémon
        height: detailsData.height, // Altura (em decímetros)
        weight: detailsData.weight, // Peso (em hectogramas)
        types: detailsData.types.map(t => t.type.name) // Array com os tipos do Pokémon (ex.: ["grass", "poison"])
      };
    });

    // Aguarda que todas as requisições de detalhes sejam concluídas e armazena o resultado em pokemonList
    pokemonList = await Promise.all(promises);

    console.log(`Carregados ${pokemonList.length} Pokémon no array!`);
  } catch (error) {
    console.error('Erro ao carregar lista de Pokémon:', error);
  }
});

// Captura elementos HTML para interação com o usuário
const form = document.getElementById('pokemonForm');         // Formulário de busca
const inputName = document.getElementById('pokemonName');      // Campo de texto para digitar o nome do Pokémon
const resultDiv = document.getElementById('result');           // Div onde os detalhes do Pokémon serão exibidos
const suggestionsDiv = document.getElementById('suggestions'); // Div para exibir as sugestões enquanto o usuário digita

// 1. Evento para exibir sugestões enquanto o usuário digita no campo de texto
inputName.addEventListener('input', () => {
  // Converte o valor digitado para minúsculas e remove espaços extras
  const searchTerm = inputName.value.trim().toLowerCase();

  // Se o usuário não digitou nada, limpa e esconde as sugestões
  if (!searchTerm) {
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';
    return;
  }

  // Filtra o array pokemonList para encontrar Pokémon cujo nome contenha o termo digitado
  const filtered = pokemonList.filter(p => p.name.includes(searchTerm));

  // Se não houver correspondência, limpa e esconde a área de sugestões
  if (filtered.length === 0) {
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';
    return;
  }

  // Limita o número de sugestões exibidas para 5
  const limited = filtered.slice(0, 5);

  // Monta o HTML das sugestões, exibindo imagem e nome do Pokémon
  suggestionsDiv.innerHTML = limited.map(p => `
    <div class="suggestion-item" data-name="${p.name}">
      <img src="${p.sprite}" alt="${p.name}">
      <span>${capitalize(p.name)}</span>
    </div>
  `).join('');

  // Exibe a div de sugestões
  suggestionsDiv.style.display = 'block';

  // Adiciona evento de clique a cada item de sugestão para que o usuário possa selecioná-lo
  const items = suggestionsDiv.querySelectorAll('.suggestion-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      // Ao clicar, recupera o nome do Pokémon selecionado (atributo data-name)
      const selectedName = item.getAttribute('data-name');
      // Preenche o input com o nome selecionado
      inputName.value = selectedName;
      // Esconde a área de sugestões
      suggestionsDiv.style.display = 'none';
      // Exibe os detalhes do Pokémon selecionado
      showPokemonDetails(selectedName);
    });
  });
});

// 2. Evento para tratar o envio do formulário
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Previne o comportamento padrão (recarregar a página)
  // Recupera o nome digitado no campo e converte para minúsculas
  const pokemonName = inputName.value.trim().toLowerCase();
  if (!pokemonName) {
    resultDiv.innerHTML = '<p>Por favor, digite o nome de um Pokémon.</p>';
    return;
  }
  // Exibe os detalhes do Pokémon
  showPokemonDetails(pokemonName);
});

// 3. Função para exibir os detalhes de um Pokémon selecionado
function showPokemonDetails(name) {
  // Procura no array pokemonList o Pokémon com o nome informado
  const pokemon = pokemonList.find(p => p.name === name);
  
  // Se não encontrar, exibe uma mensagem de erro
  if (!pokemon) {
    resultDiv.innerHTML = '<p>Pokémon não encontrado.</p>';
    return;
  }

  // Cria uma string com os tipos do Pokémon separados por vírgula
  const types = pokemon.types.join(', ');
  // Exibe os detalhes (nome, imagem, tipos, altura e peso) na div de resultado
  resultDiv.innerHTML = `
    <h2>${capitalize(pokemon.name)}</h2>
    <img src="${pokemon.sprite}" alt="${pokemon.name}">
    <p><strong>Tipos:</strong> ${types}</p>
    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
  `;
}

// Função auxiliar para transformar a primeira letra de uma string em maiúscula
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
