document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const exercicioInput = document.getElementById('exercicio-input');
  const adicionarBtn = document.getElementById('adicionar-btn');
  const listaExercicios = document.getElementById('lista-exercicios');
  const filtros = document.querySelectorAll('.filtro-btn');
  const contador = document.getElementById('contador');
  const limparBtn = document.getElementById('limpar-btn');
  const listaVazia = document.getElementById('lista-vazia');
  
  // Filtro atual
  let filtroAtual = 'todos';
  
  // Carregar exercícios do localStorage
  carregarExercicios();
  
  // Event Listeners
  adicionarBtn.addEventListener('click', adicionarExercicio);
  exercicioInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          adicionarExercicio();
      }
  });
  
  limparBtn.addEventListener('click', limparConcluidos);
  
  filtros.forEach(filtro => {
      filtro.addEventListener('click', function() {
          // Remover classe ativo de todos os filtros
          filtros.forEach(f => f.classList.remove('ativo'));
          // Adicionar classe ativo ao filtro clicado
          this.classList.add('ativo');
          // Atualizar filtro atual
          filtroAtual = this.getAttribute('data-filtro');
          // Aplicar filtro
          aplicarFiltro();
      });
  });
  
  // Funções
  function adicionarExercicio() {
      const texto = exercicioInput.value.trim();
      
      if (texto === '') {
          alert('Por favor, digite um exercício válido!');
          exercicioInput.focus();
          return;
      }
      
      // Criar novo exercício
      criarExercicio(texto, false);
      
      // Limpar input
      exercicioInput.value = '';
      exercicioInput.focus();
      
      // Salvar no localStorage
      salvarExercicios();
      
      // Atualizar contador
      atualizarContador();
      
      // Esconder mensagem de lista vazia
      verificarListaVazia();
  }
  
  function criarExercicio(texto, concluido) {
      const li = document.createElement('li');
      if (concluido) {
          li.classList.add('concluido');
      }
      
      const span = document.createElement('span');
      span.textContent = texto;
      span.addEventListener('click', function() {
          li.classList.toggle('concluido');
          salvarExercicios();
          atualizarContador();
          aplicarFiltro();
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
      deleteBtn.addEventListener('click', function() {
          li.remove();
          salvarExercicios();
          atualizarContador();
          verificarListaVazia();
      });
      
      li.appendChild(span);
      li.appendChild(deleteBtn);
      listaExercicios.appendChild(li);
      
      // Aplicar filtro atual
      aplicarFiltro();
  }
  
  function salvarExercicios() {
      const exercicios = [];
      
      document.querySelectorAll('#lista-exercicios li').forEach(li => {
          exercicios.push({
              texto: li.querySelector('span').textContent,
              concluido: li.classList.contains('concluido')
          });
      });
      
      localStorage.setItem('exercicios', JSON.stringify(exercicios));
  }
  
  function carregarExercicios() {
      const exercicios = JSON.parse(localStorage.getItem('exercicios')) || [];
      
      exercicios.forEach(exercicio => {
          criarExercicio(exercicio.texto, exercicio.concluido);
      });
      
      atualizarContador();
      verificarListaVazia();
  }
  
  function limparConcluidos() {
      const exerciciosConcluidos = document.querySelectorAll('#lista-exercicios li.concluido');
      
      if (exerciciosConcluidos.length === 0) {
          alert('Não há exercícios concluídos para limpar!');
          return;
      }
      
      exerciciosConcluidos.forEach(li => {
          li.remove();
      });
      
      salvarExercicios();
      atualizarContador();
      verificarListaVazia();
  }
  
  function aplicarFiltro() {
      document.querySelectorAll('#lista-exercicios li').forEach(li => {
          const estaConcluido = li.classList.contains('concluido');
          
          if (filtroAtual === 'todos') {
              li.style.display = '';
          } else if (filtroAtual === 'pendentes') {
              li.style.display = estaConcluido ? 'none' : '';
          } else if (filtroAtual === 'concluidos') {
              li.style.display = estaConcluido ? '' : 'none';
          }
      });
      
      verificarListaVazia();
  }
  
  function atualizarContador() {
      const pendentes = document.querySelectorAll('#lista-exercicios li:not(.concluido)').length;
      contador.textContent = pendentes === 1 ? 
          '1 exercício restante' : 
          `${pendentes} exercícios restantes`;
  }
  
  function verificarListaVazia() {
      const totalExercicios = document.querySelectorAll('#lista-exercicios li').length;
      const exerciciosVisiveis = Array.from(document.querySelectorAll('#lista-exercicios li')).filter(li => li.style.display !== 'none').length;
      
      if (totalExercicios === 0) {
          listaVazia.style.display = 'block';
          listaVazia.querySelector('p').textContent = 'Nenhum exercício adicionado';
          listaVazia.querySelector('.dica').textContent = 'Adicione seu primeiro exercício acima';
      } else if (exerciciosVisiveis === 0) {
          listaVazia.style.display = 'block';
          listaVazia.querySelector('p').textContent = 'Nenhum exercício nesta categoria';
          listaVazia.querySelector('.dica').textContent = 'Tente mudar o filtro ou adicionar novos exercícios';
      } else {
          listaVazia.style.display = 'none';
      }
  }
});