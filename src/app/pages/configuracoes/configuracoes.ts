import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.css'
})
export class Configuracoes {
  chave = '';
  mensagem = '';

  constructor(private api: Api) {
    this.chave = this.api.obterApiKey();
  }

  salvar(): void {
    if (!this.chave.trim()) {
      this.mensagem = 'Informe uma API Key válida.';
      return;
    }

    this.api.salvarApiKey(this.chave);
    this.mensagem = 'API Key salva nesta sessão do navegador.';
  }

  remover(): void {
    this.api.removerApiKey();
    this.chave = '';
    this.mensagem = 'API Key removida.';
  }
}
