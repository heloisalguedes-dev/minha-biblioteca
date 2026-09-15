# 📚 Minha Biblioteca

Aplicativo desktop desenvolvido para facilitar a organização de uma biblioteca pessoal, com uma interface simples e acessível para pessoas com pouca familiaridade com tecnologia.

## Funcionalidades

* Cadastro, edição e exclusão de livros;
* pesquisa por título, autor ou gênero;
* filtros por status de leitura e estante;
* organização dos livros por estante e prateleira;
* personalização dos nomes das estantes;
* quantidade de prateleiras configurável para cada estante;
* resumo da biblioteca na tela inicial;
* opção para aumentar o tamanho dos textos;
* armazenamento local dos dados;
* funcionamento como aplicativo desktop;
* ícone próprio.

## Acessibilidade

A interface foi planejada para oferecer uma utilização simples e confortável.

Foram utilizados:

* textos e botões maiores;
* ícones acompanhados de descrições;
* contraste entre textos e fundos;
* linguagem simples;
* funcionalidades separadas em telas;
* menu lateral;
* opção para aumentar o texto;
* mensagens claras de confirmação e erro;
* confirmação antes da exclusão de um livro.

## Tecnologias utilizadas

* Python;
* PyWebView;
* SQLite;
* HTML;
* CSS;
* JavaScript;
* PyInstaller.

## Arquitetura

A interface HTML, CSS e JavaScript se comunica diretamente com o Python por meio do PyWebView.

```text
Interface HTML, CSS e JavaScript
                ↕
             PyWebView
                ↕
              Python
                ↕
              SQLite
```

O aplicativo não utiliza servidor local, FastAPI, Uvicorn ou portas de rede.

## Estrutura do projeto

```text
Minha_Biblioteca_Acessivel/
│
├── assets/
│   ├── icone_biblioteca.ico
│   ├── icone_biblioteca.png
│   ├── icone_biblioteca.svg
│   └── gerar_icone.py
│
├── backend/
│   └── database.py
│
├── database/
│   └── biblioteca.db
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
│
├── main.py
├── requirements.txt
└── README.md
```

## Como executar o projeto

Abra o PowerShell na pasta do projeto e crie o ambiente virtual:

```powershell
python -m venv .venv
```

Caso a execução de scripts esteja bloqueada:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

Ative o ambiente:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale as dependências:

```powershell
python -m pip install -r requirements.txt
```

Execute o aplicativo:

```powershell
python main.py
```

## Como gerar o executável

Com o ambiente virtual ativado, execute:

```powershell
python -m PyInstaller --name "Minha Biblioteca" --onefile --windowed --icon "assets\icone_biblioteca.ico" --add-data "frontend;frontend" main.py
```

O executável será criado em:

```text
dist\Minha Biblioteca.exe
```

## Utilização em outro computador

Depois de gerar o executável, basta copiar:

```text
Minha Biblioteca.exe
```

No outro computador não é necessário instalar:

* Visual Studio Code;
* Python;
* PyInstaller;
* ambiente virtual;
* arquivos do código-fonte.

O computador precisa possuir o Microsoft Edge WebView2 Runtime, normalmente já instalado no Windows 10 e no Windows 11.

## Armazenamento dos dados

Durante o desenvolvimento, o banco fica em:

```text
database\biblioteca.db
```

Na versão executável, o banco é criado em:

```text
%APPDATA%\Minha Biblioteca\biblioteca.db
```

Os livros permanecem salvos depois que o aplicativo é fechado. Cada computador possui sua própria biblioteca.

## Proteção dos dados

O sistema impede a remoção de estantes ou prateleiras que ainda contenham livros. Antes de diminuir a biblioteca, os livros precisam ser movidos para posições que continuarão existindo.

## Objetivo do projeto

O projeto foi desenvolvido para facilitar a organização de uma biblioteca pessoal, oferecendo uma interface simples e acessível para cadastrar, localizar e acompanhar livros.

## **Aviso: Este é um projeto pessoal desenvolvido para uso próprio e como parte dos meus estudos em programação. O código é disponibilizado para fins educacionais e o software é fornecido “como está”, sem garantias. Cada usuário é responsável pela instalação, utilização e proteção dos próprios dados.**
