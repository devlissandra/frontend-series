
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nome: string;
}

export interface Serie {
  id?: number;
  titulo: string;
  paisOrigem: string;
  anoLancamento: number;
  status: string;
  categorias: Categoria[];
}

export interface PaginaSeries {
  versao: number;
  conteudo: Serie[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class Api {

  readonly baseUrl = 'https://api-series-11cp.onrender.com';

  constructor(private http: HttpClient) {}

  salvarApiKey(chave: string): void {
    sessionStorage.setItem('series_api_key', chave.trim());
  }

  obterApiKey(): string {
    return sessionStorage.getItem('series_api_key') || '';
  }

  removerApiKey(): void {
    sessionStorage.removeItem('series_api_key');
  }

  private headers(
    versionado = false,
    idempotencia = false
  ): HttpHeaders {

    let headers = new HttpHeaders({
      'X-API-Key': this.obterApiKey()
    });

    if (versionado) {
      headers = headers.set('X-API-Version', '1');
    }

    if (idempotencia) {
      headers = headers.set(
        'X-Idempotency-Key',
        crypto.randomUUID()
      );
    }

    return headers;
  }

  listarSeries(
    pagina = 0,
    tamanho = 20
  ): Observable<PaginaSeries> {

    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho);

    return this.http.get<PaginaSeries>(
      `${this.baseUrl}/api/v1/series`,
      {
        headers: this.headers(true),
        params
      }
    );
  }

  listarCategorias(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/categorias`,
      {
        headers: this.headers()
      }
    );
  }

  criarSerie(serie: Serie): Observable<any> {

    const payload = {
      titulo: serie.titulo,
      paisOrigem: serie.paisOrigem,
      anoLancamento: serie.anoLancamento,
      status: serie.status,
      categoriaIds: serie.categorias.map(c => c.id)
    };

    return this.http.post(
      `${this.baseUrl}/api/v1/series`,
      payload,
      {
        headers: this.headers(true, true)
      }
    );
  }

  criarCategoria(nome: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/categorias`,
      { nome },
      {
        headers: this.headers(false, true)
      }
    );
  }
}
