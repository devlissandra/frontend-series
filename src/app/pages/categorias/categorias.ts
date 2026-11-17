import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, Categoria } from '../../services/api';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {
  categorias: Categoria[] = [];
  nome = '';
  carregando = false;
  enviando = false;
  erro = '';
  mensagem = '';
  mostrarFormulario = false;

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';

    this.api.listarCategorias().subscribe({
      next: dados => {
        this.categorias = this.extrairCategorias(dados);
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as categorias. Verifique sua API Key.';
        this.carregando = false;
      }
    });
  }

  private extrairCategorias(dados: any): Categoria[] {
    if (Array.isArray(dados)) return dados;
    if (Array.isArray(dados?.content)) return dados.content;
    if (Array.isArray(dados?.conteudo)) return dados.conteudo;

    const embedded = dados?._embedded;
    if (embedded) {
      const lista = Object.values(embedded).find(valor => Array.isArray(valor));
      if (Array.isArray(lista)) return lista as Categoria[];
    }

    return [];
  }

  criar(): void {
    this.erro = '';
    this.mensagem = '';

    if (!this.nome.trim()) {
      this.erro = 'Digite o nome da categoria.';
      return;
    }

    this.enviando = true;

    this.api.criarCategoria(this.nome.trim()).subscribe({
      next: () => {
        this.mensagem = 'Categoria cadastrada com sucesso!';
        this.nome = '';
        this.mostrarFormulario = false;
        this.enviando = false;
        this.carregar();
      },
      error: resposta => {
        this.erro = resposta?.error?.message || 'Não foi possível cadastrar a categoria.';
        this.enviando = false;
      }
    });
  }
}
