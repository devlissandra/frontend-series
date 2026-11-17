import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, Categoria, Serie } from '../../services/api';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './series.html',
  styleUrl: './series.css'
})
export class Series implements OnInit {

  series: Serie[] = [];
  categorias: Categoria[] = [];
  selecionadas: number[] = [];

  titulo = '';
  paisOrigem = '';
  anoLancamento = new Date().getFullYear();
  status = 'Em Andamento';

  pagina = 0;
  totalPaginas = 0;
  totalElementos = 0;

  carregando = false;
  enviando = false;

  mensagem = '';
  erro = '';
  mostrarFormulario = false;

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.carregar();
    this.carregarCategorias();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';

    this.api.listarSeries(this.pagina).subscribe({
      next: (resposta) => {
        this.series = resposta?.conteudo ?? [];
        this.totalPaginas = resposta?.totalPaginas ?? 0;
        this.totalElementos =
          resposta?.totalElementos ?? this.series.length;

        this.carregando = false;
      },
      error: () => {
        this.erro =
          'Falha ao carregar séries. Confira a API Key nas configurações.';
        this.carregando = false;
      }
    });
  }

  carregarCategorias(): void {
    this.api.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias = this.extrairCategorias(dados);
      },
      error: () => {
        this.categorias = [];
      }
    });
  }

  private extrairCategorias(dados: any): Categoria[] {
    if (Array.isArray(dados)) {
      return dados;
    }

    if (Array.isArray(dados?.content)) {
      return dados.content;
    }

    if (Array.isArray(dados?.conteudo)) {
      return dados.conteudo;
    }

    const embedded = dados?._embedded;

    if (embedded) {
      const lista = Object.values(embedded).find(
        (valor) => Array.isArray(valor)
      );

      if (Array.isArray(lista)) {
        return lista as Categoria[];
      }
    }

    return [];
  }

  alternarCategoria(id: number, marcado: boolean): void {
    if (marcado) {
      if (!this.selecionadas.includes(id)) {
        this.selecionadas = [...this.selecionadas, id];
      }
    } else {
      this.selecionadas = this.selecionadas.filter(
        (item) => item !== id
      );
    }
  }

  nomesCategorias(categorias?: (Categoria | string)[]): string {
    if (!categorias || categorias.length === 0) {
      return '—';
    }

    return categorias
      .map((categoria) =>
        typeof categoria === 'string'
          ? categoria
          : categoria.nome
      )
      .join(', ');
  }

  criar(): void {
    this.mensagem = '';
    this.erro = '';

    if (
      !this.titulo.trim() ||
      !this.paisOrigem.trim() ||
      !this.anoLancamento
    ) {
      this.erro = 'Preencha título, país de origem e ano.';
      return;
    }

    if (this.selecionadas.length === 0) {
      this.erro = 'Selecione pelo menos uma categoria.';
      return;
    }

    const novaSerie: Serie = {
      titulo: this.titulo.trim(),
      paisOrigem: this.paisOrigem.trim(),
      anoLancamento: Number(this.anoLancamento),
      status: this.status,
      categorias: this.selecionadas.map((id) => ({
        id,
        nome: ''
      }))
    };

    this.enviando = true;

    this.api.criarSerie(novaSerie).subscribe({
      next: () => {
        this.mensagem = 'Série cadastrada com sucesso!';

        this.limparFormulario();
        this.mostrarFormulario = false;
        this.pagina = 0;

        this.enviando = false;
        this.carregar();
      },
      error: (resposta) => {
        this.erro =
          resposta?.error?.message ||
          'Não foi possível cadastrar. Confira os dados e sua API Key.';

        this.enviando = false;
      }
    });
  }

  limparFormulario(): void {
    this.titulo = '';
    this.paisOrigem = '';
    this.anoLancamento = new Date().getFullYear();
    this.status = 'Em Andamento';
    this.selecionadas = [];
  }

  mudarPagina(delta: number): void {
    const proxima = this.pagina + delta;

    if (proxima < 0 || proxima >= this.totalPaginas) {
      return;
    }

    this.pagina = proxima;
    this.carregar();
  }
}