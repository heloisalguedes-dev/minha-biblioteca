"""Aplicativo desktop Minha Biblioteca, sem servidor HTTP local."""

import os
import sys

import webview

from backend.database import BancoBiblioteca


def caminho_recurso(*partes):
    base = getattr(
        sys,
        "_MEIPASS",
        os.path.dirname(os.path.abspath(__file__)),
    )

    return os.path.join(base, *partes)


class ApiBiblioteca:
    STATUS_VALIDOS = {
        "Não lido",
        "Lendo",
        "Lido",
    }

    def __init__(self):
        self.banco = BancoBiblioteca()

    def listar_livros(self):
        return self.banco.listar_livros()

    def obter_configuracao(self):
        return self.banco.obter_configuracao()

    def _validar_livro(self, dados):
        configuracao = self.banco.obter_configuracao()

        titulo = str(
            dados.get("titulo", "")
        ).strip()

        autor = str(
            dados.get("autor", "")
        ).strip()

        genero = str(
            dados.get("genero", "")
        ).strip()

        status = str(
            dados.get("status", "")
        )

        if not titulo or not autor or not genero:
            raise ValueError(
                "Preencha o título, o autor e o gênero."
            )

        if (
            len(titulo) > 150
            or len(autor) > 120
            or len(genero) > 80
        ):
            raise ValueError(
                "Um dos textos informados é muito longo."
            )

        try:
            ano = int(dados.get("ano"))
            estante = int(dados.get("estante"))
            prateleira = int(dados.get("prateleira"))
        except (TypeError, ValueError):
            raise ValueError(
                "Ano, estante e prateleira precisam "
                "ser números válidos."
            )

        if not 0 <= ano <= 2200:
            raise ValueError(
                "Informe um ano entre 0 e 2200."
            )

        if status not in self.STATUS_VALIDOS:
            raise ValueError(
                "Selecione um status válido."
            )

        if not 1 <= estante <= configuracao["quantidade_estantes"]:
            raise ValueError(
                "A estante selecionada não existe."
            )

        informacoes_estante = next(
            (
                item
                for item in configuracao["estantes"]
                if int(item["numero"]) == estante
            ),
            None,
        )

        if not informacoes_estante:
            raise ValueError(
                "A estante selecionada não existe."
            )

        quantidade_prateleiras = int(
            informacoes_estante["quantidade_prateleiras"]
        )

        if not 1 <= prateleira <= quantidade_prateleiras:
            raise ValueError(
                "A prateleira selecionada não existe "
                "nessa estante."
            )

        return {
            "titulo": titulo,
            "autor": autor,
            "ano": ano,
            "genero": genero,
            "status": status,
            "estante": estante,
            "prateleira": prateleira,
            "capa": dados.get("capa") or None,
        }

    def adicionar_livro(self, dados):
        try:
            livro_validado = self._validar_livro(dados)

            novo_id = self.banco.adicionar_livro(
                livro_validado
            )

            return {
                "ok": True,
                "id": novo_id,
                "mensagem": "Livro adicionado com sucesso.",
            }

        except (ValueError, TypeError) as erro:
            return {
                "ok": False,
                "mensagem": str(erro),
            }

    def editar_livro(self, livro_id, dados):
        try:
            livro_validado = self._validar_livro(dados)

            livro_editado = self.banco.editar_livro(
                int(livro_id),
                livro_validado,
            )

            if not livro_editado:
                return {
                    "ok": False,
                    "mensagem": "Livro não encontrado.",
                }

            return {
                "ok": True,
                "mensagem": "Alterações salvas com sucesso.",
            }

        except (ValueError, TypeError) as erro:
            return {
                "ok": False,
                "mensagem": str(erro),
            }

    def excluir_livro(self, livro_id):
        livro_excluido = self.banco.excluir_livro(
            int(livro_id)
        )

        if not livro_excluido:
            return {
                "ok": False,
                "mensagem": "Livro não encontrado.",
            }

        return {
            "ok": True,
            "mensagem": "Livro excluído.",
        }

    def salvar_configuracao(self, estantes):
        try:
            self.banco.salvar_configuracao(estantes)

            return {
                "ok": True,
                "mensagem": "Configuração salva com sucesso.",
            }

        except (ValueError, TypeError) as erro:
            return {
                "ok": False,
                "mensagem": str(erro),
            }


def main():
    webview.create_window(
        title="Minha Biblioteca",
        url=caminho_recurso(
            "frontend",
            "index.html",
        ),
        js_api=ApiBiblioteca(),
        width=1240,
        height=820,
        min_size=(900, 620),
    )

    webview.start(debug=False)


if __name__ == "__main__":
    main()