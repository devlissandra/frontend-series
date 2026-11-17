import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalSeries = 0;
  totalCategorias = 0;
  carregando = false;
  erro = '';
  apiConectada = false;

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    if (this.carregando) return;

    if (!this.api.obterApiKey()) {
      this.erro = 'Configure sua API Key para carregar os dados.';
      this.apiConectada = false;
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.apiConectada = false;

    let erroSeries = '';
    let erroCategorias = '';

    forkJoin({
      series: this.api.listarSeries().pipe(
        timeout({ first: 60000 }),
        catchError((erro) => {
          erroSeries = this.mensagemErro(erro);
          return of(null);
        })
      ),

      categorias: this.api.listarCategorias().pipe(
        timeout({ first: 60000 }),
        catchError((erro) => {
          erroCategorias = this.mensagemErro(erro);
          return of(null);
        })
      )
    })
    .pipe(
      finalize(() => {
        this.carregando = false;
      })
    )
    .subscribe(({ series, categorias }) => {
      if (series) {
        this.totalSeries =
          series.totalElementos ??
          series.conteudo?.length ??
          0;
      }

      if (categorias) {
        this.totalCategorias =
          this.extrairTotalCategorias(categorias);
      }

      this.apiConectada = !!series && !!categorias;

      const mensagens: string[] = [];

      if (erroSeries) {
        mensagens.push('Séries: ' + erroSeries);
      }

      if (erroCategorias) {
        mensagens.push('Categorias: ' + erroCategorias);
      }

      this.erro = mensagens.join(' | ');
    });
  }

  private mensagemErro(erro: any): string {
    if (erro?.name === 'TimeoutError') {
      return 'A API demorou demais para responder. Tente atualizar novamente.';
    }

    if (erro?.status === 401 || erro?.status === 403) {
      return 'Chave de API inválida ou sem autorização.';
    }

    if (erro?.status === 429) {
      return 'Limite de requisições atingido. Aguarde um pouco.';
    }

    if (erro?.status === 0) {
      return 'Não foi possível conectar à API.';
    }

    return erro?.error?.message ||
      erro?.message ||
      'Não foi possível carregar os dados.';
  }

  private extrairTotalCategorias(dados: any): number {
    if (typeof dados?.page?.totalElements === 'number') {
      return dados.page.totalElements;
    }

    if (typeof dados?.totalElementos === 'number') {
      return dados.totalElementos;
    }

    if (typeof dados?.totalElements === 'number') {
      return dados.totalElements;
    }

    if (Array.isArray(dados)) {
      return dados.length;
    }

    if (Array.isArray(dados?.content)) {
      return dados.content.length;
    }

    if (Array.isArray(dados?.conteudo)) {
      return dados.conteudo.length;
    }

    const embedded = dados?._embedded;

    if (embedded) {
      const lista = Object.values(embedded).find(
        (valor) => Array.isArray(valor)
      );

      if (Array.isArray(lista)) {
        return lista.length;
      }
    }

    return 0;
  }
}
