let livros = [];

let configuracao = {
    quantidade_estantes: 5,
    quantidade_prateleiras: 5,
    estantes: [],
};

let idExcluir = null;
let estanteSelecionada = 1;

const $ = (id) => document.getElementById(id);

const titulos = {
    inicio: "Início",
    livros: "Meus livros",
    adicionar: "Adicionar livro",
    estantes: "Minhas estantes",
    configuracoes: "Configurações",
};


function mostrarMensagem(texto, tipo = "sucesso") {
    const mensagem = $("mensagem");

    mensagem.textContent = texto;
    mensagem.className = `mensagem visivel ${tipo}`;

    clearTimeout(mostrarMensagem.timer);

    mostrarMensagem.timer = setTimeout(() => {
        mensagem.className = "mensagem";
    }, 4500);
}


function navegar(tela) {
    document.querySelectorAll(".tela").forEach((elemento) => {
        elemento.classList.remove("ativa");
    });

    $(`tela-${tela}`).classList.add("ativa");

    document.querySelectorAll(".menu-item").forEach((item) => {
        item.classList.toggle(
            "ativo",
            item.dataset.tela === tela,
        );
    });

    $("titulo-tela").textContent = titulos[tela];

    if (tela === "livros") {
        renderizarLivros();
    }

    if (tela === "estantes") {
        renderizarEstantes();
    }

    if (tela === "configuracoes") {
        preencherConfiguracao();
    }

    if (
        tela === "adicionar"
        && !$("livro-id").value
    ) {
        limparFormulario();
    }

    window.scrollTo(0, 0);
}


function nomeEstante(numero) {
    const estante = configuracao.estantes.find(
        (item) => Number(item.numero) === Number(numero),
    );

    return estante?.nome || `Estante ${numero}`;
}


function criar(tag, classe = "", texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}


function popularPrateleiras() {
    const selectPrateleira = $("prateleira");
    const valorAtual = selectPrateleira.value;

    const estante = configuracao.estantes.find(
        (item) => (
            Number(item.numero)
            === Number($("estante").value)
        ),
    );

    selectPrateleira.replaceChildren();

    const quantidade = Number(
        estante?.quantidade_prateleiras || 1,
    );

    for (
        let numero = 1;
        numero <= quantidade;
        numero += 1
    ) {
        const opcao = criar(
            "option",
            "",
            `Prateleira ${numero}`,
        );

        opcao.value = numero;
        selectPrateleira.append(opcao);
    }

    const valorAindaExiste = [
        ...selectPrateleira.options,
    ].some((opcao) => opcao.value === valorAtual);

    if (valorAindaExiste) {
        selectPrateleira.value = valorAtual;
    }
}


function popularPosicoes() {
    const selectEstante = $("estante");

    selectEstante.replaceChildren();

    configuracao.estantes.forEach((estante) => {
        const opcao = criar(
            "option",
            "",
            estante.nome,
        );

        opcao.value = estante.numero;
        selectEstante.append(opcao);
    });

    popularPrateleiras();

    const filtroEstante = $("filtro-estante");
    filtroEstante.replaceChildren();

    const opcaoTodas = criar(
        "option",
        "",
        "Todas",
    );

    opcaoTodas.value = "Todos";
    filtroEstante.append(opcaoTodas);

    configuracao.estantes.forEach((estante) => {
        const opcao = criar(
            "option",
            "",
            estante.nome,
        );

        opcao.value = estante.numero;
        filtroEstante.append(opcao);
    });
}


function atualizarResumo() {
    $("total-livros").textContent = livros.length;

    $("total-lendo").textContent = livros.filter(
        (livro) => livro.status === "Lendo",
    ).length;

    $("total-lidos").textContent = livros.filter(
        (livro) => livro.status === "Lido",
    ).length;
}


function criarCard(livro) {
    const card = criar(
        "article",
        "livro-card",
    );

    card.append(
        criar("h3", "", livro.titulo),
        criar("p", "", livro.autor),
    );

    const classeStatus = livro.status
        .toLowerCase()
        .replaceAll(" ", "-");

    const status = criar(
        "span",
        `etiqueta status-${classeStatus}`,
        livro.status,
    );

    const informacoes = criar(
        "p",
        "",
        `${livro.genero} · ${livro.ano}`,
    );

    const posicao = criar(
        "p",
        "",
        `${nomeEstante(livro.estante)} · `
        + `Prateleira ${livro.prateleira}`,
    );

    card.append(
        status,
        informacoes,
        posicao,
    );

    const acoes = criar(
        "div",
        "livro-acoes",
    );

    const botaoEditar = criar(
        "button",
        "",
        "Editar",
    );

    botaoEditar.type = "button";

    botaoEditar.addEventListener("click", () => {
        abrirEdicao(livro.id);
    });

    const botaoExcluir = criar(
        "button",
        "excluir",
        "Excluir",
    );

    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", () => {
        abrirExclusao(livro.id);
    });

    acoes.append(
        botaoEditar,
        botaoExcluir,
    );

    card.append(acoes);

    return card;
}


function renderizarLivros() {
    const termo = $("pesquisa")
        .value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const statusSelecionado = $("filtro-status").value;
    const estanteSelecionadaFiltro = $("filtro-estante").value;

    const livrosFiltrados = livros.filter((livro) => {
        const textoLivro = (
            `${livro.titulo} `
            + `${livro.autor} `
            + `${livro.genero}`
        ).toLocaleLowerCase("pt-BR");

        const correspondePesquisa = textoLivro.includes(termo);

        const correspondeStatus = (
            statusSelecionado === "Todos"
            || livro.status === statusSelecionado
        );

        const correspondeEstante = (
            estanteSelecionadaFiltro === "Todos"
            || Number(livro.estante)
                === Number(estanteSelecionadaFiltro)
        );

        return (
            correspondePesquisa
            && correspondeStatus
            && correspondeEstante
        );
    });

    const lista = $("lista-livros");
    lista.replaceChildren();

    $("contagem-resultados").textContent = (
        livrosFiltrados.length === 1
            ? "1 livro encontrado"
            : `${livrosFiltrados.length} livros encontrados`
    );

    if (livrosFiltrados.length === 0) {
        lista.append(
            criar(
                "p",
                "vazio",
                "Nenhum livro corresponde à pesquisa.",
            ),
        );

        return;
    }

    livrosFiltrados.forEach((livro) => {
        lista.append(criarCard(livro));
    });
}


function limparFormulario() {
    $("form-livro").reset();
    $("livro-id").value = "";
    $("titulo-formulario").textContent = (
        "Cadastrar novo livro"
    );

    popularPrateleiras();
}


function dadosFormulario() {
    return {
        titulo: $("titulo").value,
        autor: $("autor").value,
        ano: Number($("ano").value),
        genero: $("genero").value,
        status: $("status").value,
        estante: Number($("estante").value),
        prateleira: Number($("prateleira").value),
    };
}


function abrirEdicao(id) {
    const livro = livros.find(
        (item) => item.id === id,
    );

    if (!livro) {
        return;
    }

    $("livro-id").value = livro.id;
    $("titulo").value = livro.titulo;
    $("autor").value = livro.autor;
    $("ano").value = livro.ano;
    $("genero").value = livro.genero;
    $("status").value = livro.status;
    $("estante").value = livro.estante;

    popularPrateleiras();

    $("prateleira").value = livro.prateleira;
    $("titulo-formulario").textContent = "Editar livro";

    navegar("adicionar");
}


function abrirExclusao(id) {
    idExcluir = id;

    $("modal-exclusao").classList.add("aberto");
    $("cancelar-exclusao").focus();
}


function fecharExclusao() {
    $("modal-exclusao").classList.remove("aberto");
    idExcluir = null;
}


function renderizarEstantes() {
    const botoes = $("botoes-estantes");
    botoes.replaceChildren();

    configuracao.estantes.forEach((estante) => {
        const botao = criar(
            "button",
            "botao-estante",
            estante.nome,
        );

        botao.classList.toggle(
            "ativo",
            Number(estante.numero)
                === Number(estanteSelecionada),
        );

        botao.addEventListener("click", () => {
            estanteSelecionada = estante.numero;
            renderizarEstantes();
        });

        botoes.append(botao);
    });

    const visualizacao = $("visualizacao-estante");
    visualizacao.replaceChildren();

    const estanteAtual = configuracao.estantes.find(
        (estante) => (
            Number(estante.numero)
            === Number(estanteSelecionada)
        ),
    );

    const quantidadePrateleiras = Number(
        estanteAtual?.quantidade_prateleiras || 1,
    );

    for (
        let numero = 1;
        numero <= quantidadePrateleiras;
        numero += 1
    ) {
        const prateleira = criar(
            "section",
            "prateleira",
        );

        prateleira.append(
            criar(
                "h3",
                "",
                `Prateleira ${numero}`,
            ),
        );

        const caixaLivros = criar(
            "div",
            "livros-prateleira",
        );

        const livrosDaPrateleira = livros.filter(
            (livro) => (
                Number(livro.estante)
                    === Number(estanteSelecionada)
                && Number(livro.prateleira)
                    === numero
            ),
        );

        if (livrosDaPrateleira.length === 0) {
            caixaLivros.append(
                criar(
                    "p",
                    "vazio",
                    "Nenhum livro nesta prateleira.",
                ),
            );
        } else {
            livrosDaPrateleira.forEach((livro) => {
                caixaLivros.append(
                    criar(
                        "span",
                        "livro-mini",
                        livro.titulo,
                    ),
                );
            });
        }

        prateleira.append(caixaLivros);
        visualizacao.append(prateleira);
    }
}


function preencherConfiguracao() {
    $("quantidade-estantes").value = (
        configuracao.quantidade_estantes
    );

    criarCamposEstantes();
}


function criarCamposEstantes() {
    const quantidade = Math.max(
        1,
        Math.min(
            20,
            Number($("quantidade-estantes").value) || 1,
        ),
    );

    const area = $("nomes-estantes");

    const nomesAtuais = [
        ...area.querySelectorAll("[data-nome]"),
    ].map((input) => input.value);

    const quantidadesAtuais = [
        ...area.querySelectorAll("[data-prateleiras]"),
    ].map((input) => input.value);

    area.replaceChildren();

    for (
        let numero = 1;
        numero <= quantidade;
        numero += 1
    ) {
        const estanteSalva = configuracao.estantes.find(
            (estante) => Number(estante.numero) === numero,
        );

        const grupo = criar(
            "section",
            "config-estante",
        );

        grupo.append(
            criar(
                "h3",
                "",
                `Estante ${numero}`,
            ),
        );

        const campoNome = criar("div", "campo");
        const labelNome = criar(
            "label",
            "",
            `Nome da estante ${numero}`,
        );
        const inputNome = criar("input");

        labelNome.htmlFor = `nome-estante-${numero}`;
        inputNome.id = `nome-estante-${numero}`;
        inputNome.dataset.nome = "";
        inputNome.maxLength = 60;
        inputNome.placeholder = `Estante ${numero}`;
        inputNome.value = (
            nomesAtuais[numero - 1]
            ?? estanteSalva?.nome
            ?? ""
        );

        campoNome.append(
            labelNome,
            inputNome,
        );

        const campoQuantidade = criar("div", "campo");
        const labelQuantidade = criar(
            "label",
            "",
            "Quantidade de prateleiras",
        );
        const inputQuantidade = criar("input");

        labelQuantidade.htmlFor = (
            `prateleiras-estante-${numero}`
        );
        inputQuantidade.id = (
            `prateleiras-estante-${numero}`
        );
        inputQuantidade.dataset.prateleiras = "";
        inputQuantidade.type = "number";
        inputQuantidade.min = 1;
        inputQuantidade.max = 20;
        inputQuantidade.required = true;
        inputQuantidade.value = (
            quantidadesAtuais[numero - 1]
            ?? estanteSalva?.quantidade_prateleiras
            ?? 5
        );

        campoQuantidade.append(
            labelQuantidade,
            inputQuantidade,
        );

        grupo.append(
            campoNome,
            campoQuantidade,
        );

        area.append(grupo);
    }
}


async function recarregar() {
    const resultados = await Promise.all([
        window.pywebview.api.obter_configuracao(),
        window.pywebview.api.listar_livros(),
    ]);

    configuracao = resultados[0];
    livros = resultados[1];

    estanteSelecionada = Math.min(
        estanteSelecionada,
        configuracao.quantidade_estantes,
    );

    popularPosicoes();
    atualizarResumo();
    renderizarLivros();
}


document.querySelectorAll("[data-tela]").forEach((botao) => {
    botao.addEventListener("click", () => {
        navegar(botao.dataset.tela);
    });
});


$("pesquisa").addEventListener(
    "input",
    renderizarLivros,
);

$("filtro-status").addEventListener(
    "change",
    renderizarLivros,
);

$("filtro-estante").addEventListener(
    "change",
    renderizarLivros,
);

$("estante").addEventListener(
    "change",
    popularPrateleiras,
);


$("limpar-filtros").addEventListener("click", () => {
    $("pesquisa").value = "";
    $("filtro-status").value = "Todos";
    $("filtro-estante").value = "Todos";

    renderizarLivros();
});


$("cancelar-formulario").addEventListener("click", () => {
    limparFormulario();
    navegar("livros");
});


$("form-livro").addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const id = $("livro-id").value;
        const dados = dadosFormulario();

        let resposta;

        if (id) {
            resposta = (
                await window.pywebview.api.editar_livro(
                    Number(id),
                    dados,
                )
            );
        } else {
            resposta = (
                await window.pywebview.api.adicionar_livro(
                    dados,
                )
            );
        }

        if (!resposta.ok) {
            mostrarMensagem(
                resposta.mensagem,
                "erro",
            );
            return;
        }

        await recarregar();

        limparFormulario();
        navegar("livros");
        mostrarMensagem(resposta.mensagem);
    },
);


$("quantidade-estantes").addEventListener(
    "input",
    criarCamposEstantes,
);


$("form-configuracao").addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const quantidade = Number(
            $("quantidade-estantes").value,
        );

        const estantes = [];

        for (
            let numero = 1;
            numero <= quantidade;
            numero += 1
        ) {
            estantes.push({
                nome: $(
                    `nome-estante-${numero}`
                ).value,
                quantidade_prateleiras: Number(
                    $(
                        `prateleiras-estante-${numero}`
                    ).value,
                ),
            });
        }

        const resposta = (
            await window.pywebview.api
                .salvar_configuracao(estantes)
        );

        if (!resposta.ok) {
            mostrarMensagem(
                resposta.mensagem,
                "erro",
            );
            return;
        }

        await recarregar();

        navegar("configuracoes");
        mostrarMensagem(resposta.mensagem);
    },
);


$("cancelar-exclusao").addEventListener(
    "click",
    fecharExclusao,
);


$("confirmar-exclusao").addEventListener(
    "click",
    async () => {
        if (idExcluir === null) {
            return;
        }

        const resposta = (
            await window.pywebview.api
                .excluir_livro(idExcluir)
        );

        fecharExclusao();

        if (!resposta.ok) {
            mostrarMensagem(
                resposta.mensagem,
                "erro",
            );
            return;
        }

        await recarregar();
        mostrarMensagem(resposta.mensagem);
    },
);


$("alternar-fonte").addEventListener("click", () => {
    document.body.classList.toggle("texto-grande");

    const textoGrandeAtivo = (
        document.body.classList.contains("texto-grande")
    );

    $("alternar-fonte").textContent = textoGrandeAtivo
        ? "A⁻ Texto normal"
        : "A⁺ Aumentar texto";
});


document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharExclusao();
    }
});


window.addEventListener(
    "pywebviewready",
    async () => {
        try {
            await recarregar();
        } catch (erro) {
            mostrarMensagem(
                "Não foi possível abrir os dados da biblioteca.",
                "erro",
            );

            console.error(erro);
        }
    },
);