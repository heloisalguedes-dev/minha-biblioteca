"""Persistência SQLite da aplicação."""

import os
import sqlite3
import sys


def obter_pasta_dados():
    if getattr(sys, "frozen", False):
        base = os.getenv("APPDATA") or os.path.expanduser("~")
        pasta = os.path.join(base, "Minha Biblioteca")
    else:
        pasta = os.path.join(
            os.path.dirname(
                os.path.dirname(os.path.abspath(__file__))
            ),
            "database",
        )

    os.makedirs(pasta, exist_ok=True)
    return pasta


class BancoBiblioteca:
    def __init__(self):
        self.caminho = os.path.join(
            obter_pasta_dados(),
            "biblioteca.db",
        )
        self.criar_tabelas()

    def conectar(self):
        conexao = sqlite3.connect(self.caminho)
        conexao.row_factory = sqlite3.Row
        return conexao

    def criar_tabelas(self):
        with self.conectar() as conexao:
            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS livros (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    autor TEXT,
                    ano INTEGER,
                    genero TEXT,
                    status TEXT DEFAULT 'Não lido',
                    estante INTEGER DEFAULT 1,
                    prateleira INTEGER DEFAULT 1,
                    capa TEXT
                )
                """
            )

            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS estantes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    numero INTEGER NOT NULL UNIQUE,
                    quantidade_prateleiras INTEGER
                        NOT NULL DEFAULT 5
                )
                """
            )

            conexao.execute(
                """
                CREATE TABLE IF NOT EXISTS configuracao (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    quantidade_estantes INTEGER NOT NULL,
                    quantidade_prateleiras INTEGER NOT NULL
                )
                """
            )

            colunas_livros = {
                registro[1]
                for registro in conexao.execute(
                    "PRAGMA table_info(livros)"
                )
            }

            colunas_necessarias = {
                "estante": "INTEGER DEFAULT 1",
                "prateleira": "INTEGER DEFAULT 1",
                "capa": "TEXT",
            }

            for nome, definicao in colunas_necessarias.items():
                if nome not in colunas_livros:
                    conexao.execute(
                        f"""
                        ALTER TABLE livros
                        ADD COLUMN {nome} {definicao}
                        """
                    )

            colunas_estantes = {
                registro[1]
                for registro in conexao.execute(
                    "PRAGMA table_info(estantes)"
                )
            }

            if "quantidade_prateleiras" not in colunas_estantes:
                conexao.execute(
                    """
                    ALTER TABLE estantes
                    ADD COLUMN quantidade_prateleiras
                        INTEGER NOT NULL DEFAULT 5
                    """
                )

            configuracao_existe = conexao.execute(
                """
                SELECT 1
                FROM configuracao
                WHERE id = 1
                """
            ).fetchone()

            if not configuracao_existe:
                conexao.execute(
                    """
                    INSERT INTO configuracao (
                        id,
                        quantidade_estantes,
                        quantidade_prateleiras
                    )
                    VALUES (1, 5, 5)
                    """
                )

            estantes_existem = conexao.execute(
                "SELECT 1 FROM estantes"
            ).fetchone()

            if not estantes_existem:
                estantes_padrao = [
                    (f"Estante {numero}", numero, 5)
                    for numero in range(1, 6)
                ]

                conexao.executemany(
                    """
                    INSERT INTO estantes (
                        nome,
                        numero,
                        quantidade_prateleiras
                    )
                    VALUES (?, ?, ?)
                    """,
                    estantes_padrao,
                )

    def listar_livros(self):
        with self.conectar() as conexao:
            registros = conexao.execute(
                """
                SELECT *
                FROM livros
                ORDER BY titulo COLLATE NOCASE
                """
            ).fetchall()

            return [
                dict(registro)
                for registro in registros
            ]

    def adicionar_livro(self, livro):
        with self.conectar() as conexao:
            cursor = conexao.execute(
                """
                INSERT INTO livros (
                    titulo,
                    autor,
                    ano,
                    genero,
                    status,
                    estante,
                    prateleira,
                    capa
                )
                VALUES (
                    :titulo,
                    :autor,
                    :ano,
                    :genero,
                    :status,
                    :estante,
                    :prateleira,
                    :capa
                )
                """,
                livro,
            )

            return cursor.lastrowid

    def editar_livro(self, livro_id, livro):
        valores = {
            **livro,
            "id": livro_id,
        }

        with self.conectar() as conexao:
            cursor = conexao.execute(
                """
                UPDATE livros
                SET titulo = :titulo,
                    autor = :autor,
                    ano = :ano,
                    genero = :genero,
                    status = :status,
                    estante = :estante,
                    prateleira = :prateleira,
                    capa = :capa
                WHERE id = :id
                """,
                valores,
            )

            return cursor.rowcount > 0

    def excluir_livro(self, livro_id):
        with self.conectar() as conexao:
            cursor = conexao.execute(
                """
                DELETE FROM livros
                WHERE id = ?
                """,
                (livro_id,),
            )

            return cursor.rowcount > 0

    def obter_configuracao(self):
        with self.conectar() as conexao:
            configuracao = conexao.execute(
                """
                SELECT *
                FROM configuracao
                WHERE id = 1
                """
            ).fetchone()

            estantes = conexao.execute(
                """
                SELECT
                    id,
                    nome,
                    numero,
                    quantidade_prateleiras
                FROM estantes
                ORDER BY numero
                """
            ).fetchall()

            return {
                "quantidade_estantes": (
                    configuracao["quantidade_estantes"]
                ),
                "quantidade_prateleiras": (
                    configuracao["quantidade_prateleiras"]
                ),
                "estantes": [
                    dict(estante)
                    for estante in estantes
                ],
            }

    def salvar_configuracao(self, estantes):
        quantidade_estantes = len(estantes)

        if not 1 <= quantidade_estantes <= 20:
            raise ValueError(
                "Escolha entre 1 e 20 estantes."
            )

        dados_estantes = []

        for numero, estante in enumerate(estantes, start=1):
            try:
                quantidade_prateleiras = int(
                    estante.get("quantidade_prateleiras")
                )
            except (TypeError, ValueError):
                raise ValueError(
                    "Informe a quantidade de prateleiras "
                    f"da estante {numero}."
                )

            if not 1 <= quantidade_prateleiras <= 20:
                raise ValueError(
                    f"A estante {numero} deve ter entre "
                    "1 e 20 prateleiras."
                )

            nome = str(
                estante.get("nome", "")
            ).strip()[:60]

            if not nome:
                nome = f"Estante {numero}"

            dados_estantes.append(
                (
                    nome,
                    numero,
                    quantidade_prateleiras,
                )
            )

        with self.conectar() as conexao:
            livro_em_estante_removida = conexao.execute(
                """
                SELECT 1
                FROM livros
                WHERE estante > ?
                LIMIT 1
                """,
                (quantidade_estantes,),
            ).fetchone()

            if livro_em_estante_removida:
                raise ValueError(
                    "Mova os livros das estantes que seriam "
                    "removidas antes de diminuir a biblioteca."
                )

            for _, numero, quantidade_prateleiras in dados_estantes:
                livro_em_prateleira_removida = conexao.execute(
                    """
                    SELECT 1
                    FROM livros
                    WHERE estante = ?
                      AND prateleira > ?
                    LIMIT 1
                    """,
                    (
                        numero,
                        quantidade_prateleiras,
                    ),
                ).fetchone()

                if livro_em_prateleira_removida:
                    raise ValueError(
                        "Mova os livros das prateleiras que "
                        "seriam removidas da estante "
                        f"{numero}."
                    )

            maior_quantidade_prateleiras = max(
                estante[2]
                for estante in dados_estantes
            )

            conexao.execute(
                """
                UPDATE configuracao
                SET quantidade_estantes = ?,
                    quantidade_prateleiras = ?
                WHERE id = 1
                """,
                (
                    quantidade_estantes,
                    maior_quantidade_prateleiras,
                ),
            )

            conexao.execute(
                "DELETE FROM estantes"
            )

            conexao.executemany(
                """
                INSERT INTO estantes (
                    nome,
                    numero,
                    quantidade_prateleiras
                )
                VALUES (?, ?, ?)
                """,
                dados_estantes,
            )