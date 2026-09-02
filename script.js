// ===========================================
// MOVI FINANÇAS
// ===========================================

let perfilAtual = "pf";

let paginaAtual = "dashboard";

let periodoSelecionado = "all";


// ===========================================
// BANCO LOCAL
// ===========================================

let banco = JSON.parse(
    localStorage.getItem("moviFinancas")
) || {
    pf: {
        movimentacoes: [],
        investimentos: []
    },

    pj: {
        movimentacoes: [],
        investimentos: [],
        clientes: []
    }
};


// GARANTIR ESTRUTURA

if (!banco.pf) {
    banco.pf = {
        movimentacoes: [],
        investimentos: []
    };
}

if (!banco.pj) {
    banco.pj = {
        movimentacoes: [],
        investimentos: [],
        clientes: []
    };
}

if (!banco.pj.clientes) {
    banco.pj.clientes = [];
}
    if (!Array.isArray(banco.pf.movimentacoes)) banco.pf.movimentacoes = [];
    if (!Array.isArray(banco.pf.investimentos)) banco.pf.investimentos = [];
    if (!Array.isArray(banco.pj.movimentacoes)) banco.pj.movimentacoes = [];
    if (!Array.isArray(banco.pj.investimentos)) banco.pj.investimentos = [];

// Converte investimentos antigos para o histórico de aportes.
banco.pf.investimentos.concat(banco.pj.investimentos).forEach(item => {
    if (!item.aportes) {
        item.aportes = [{
            id: `${item.id}-aporte-inicial`,
            valor: Number(item.investido) || 0,
            data: item.data || hoje()
        }];
    }

    if (!item.carteira) item.carteira = "Não informada";
});

salvar();


// ===========================================
// MENU
// ===========================================

const menus = {

    pf: [
        ["dashboard", "Visão Geral"],
        ["entrada", "Entradas"],
        ["saida", "Saídas"],
        ["fixo", "Custos Fixos"],
        ["variavel", "Custos Variáveis"],
        ["investimentos", "Carteira de investimentos"]
    ],

    pj: [
        ["dashboard", "Visão Geral"],
        ["entrada", "Entradas"],
        ["saida", "Saídas"],
        ["fixo", "Custos Fixos"],
        ["variavel", "Custos Variáveis"],
        ["clientes", "Clientes"],
        ["receber", "Contas a Receber"],
        ["investimentos", "Carteira de investimentos"],
        ["transferencias", "Transferências"]
    ]

};


// ===========================================
// UTILITÁRIOS
// ===========================================

function salvar() {

    localStorage.setItem(
        "moviFinancas",
        JSON.stringify(banco)
    );

}


function moeda(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function dataBR(data) {

    if (!data) return "";

    const valor = new Date(`${data}T00:00:00`);

    if (Number.isNaN(valor.getTime())) return "";

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC"
        }
    ).format(valor);

}


function hoje() {

    return new Date()
        .toISOString()
        .split("T")[0];

}

function mesDaData(data) {

    if (!data) return null;

    return Number(data.split("-")[1]) - 1;

}

function anoDaData(data) {

    if (!data) return null;

    return Number(data.split("-")[0]);

}

function movimentacoesDoPeriodo(mes = periodoSelecionado) {

    return banco[perfilAtual].movimentacoes.filter(item =>
        mes === "all" || mesDaData(item.data) === Number(mes)
    );

}


// ===========================================
// ENTRADA
// ===========================================

function entrarSistema(perfil) {

    perfilAtual = perfil;

    document
        .getElementById("homeScreen")
        .classList.add("hidden");


    document
        .getElementById("appScreen")
        .classList.remove("hidden");


    prepararSistema();

}


function voltarInicio() {

    document
        .getElementById("appScreen")
        .classList.add("hidden");


    document
        .getElementById("homeScreen")
        .classList.remove("hidden");

}


function trocarPerfil(perfil) {

    perfilAtual = perfil;

    paginaAtual = "dashboard";

    prepararSistema();

}


// ===========================================
// PREPARAR SISTEMA
// ===========================================

function prepararSistema() {

    document.getElementById(
        "profileBadge"
    ).innerText = perfilAtual.toUpperCase();


    document
        .getElementById("btnPf")
        .classList.toggle(
            "active",
            perfilAtual === "pf"
        );


    document
        .getElementById("btnPj")
        .classList.toggle(
            "active",
            perfilAtual === "pj"
        );


    montarMenu();

    abrirPagina("dashboard");

    atualizarTudo();

}


// ===========================================
// MENU
// ===========================================

function montarMenu() {

    const menu =
        document.getElementById("menu");


    menu.innerHTML = "";


    menus[perfilAtual].forEach(item => {

        const btn =
            document.createElement("button");


        btn.innerText = item[1];

        btn.dataset.page = item[0];


        btn.onclick = () => {

            abrirPagina(item[0]);

        };


        menu.appendChild(btn);

    });

}


// ===========================================
// PÁGINAS
// ===========================================

function abrirPagina(pagina) {

    paginaAtual = pagina;


    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    document
        .querySelectorAll(".menu button")
        .forEach(btn => {

            btn.classList.remove("active");

            if (
                btn.dataset.page === pagina
            ) {

                btn.classList.add("active");

            }

        });

    if (pagina === "dashboard") {

        document
            .getElementById("dashboardPage")
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).innerText = "Visão Geral";

        atualizarDashboard();

        return;

    }


    if (
        ["entrada", "saida", "fixo", "variavel"]
        .includes(pagina)
    ) {

        abrirMovimentacoes(pagina);

        return;

    }


    if (pagina === "investimentos") {

        document
            .getElementById("investimentosPage")
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).innerText = "Carteira de investimentos";

        document.getElementById("investData").value = hoje();

        atualizarInvestimentos();

        return;

    }


    if (pagina === "clientes") {

        document
            .getElementById("clientesPage")
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).innerText = "Clientes";

        document.getElementById("clienteData").value = hoje();

        atualizarClientes();

        return;

    }


    if (pagina === "receber") {

        document
            .getElementById("receberPage")
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).innerText =
            "Contas a Receber";

        atualizarReceber();

        return;

    }


    if (pagina === "transferencias") {

        document
            .getElementById(
                "transferenciasPage"
            )
            .classList.add("active");


        document.getElementById(
            "pageTitle"
        ).innerText =
            "Transferências";


        document.getElementById(
            "transferData"
        ).value = hoje();

    }

}


// ===========================================
// MOVIMENTAÇÕES
// ===========================================

function abrirMovimentacoes(tipo) {

    const textos = {

        entrada: {
            titulo: "Entradas",
            descricao:
                "Registre valores recebidos."
        },

        saida: {
            titulo: "Saídas",
            descricao:
                "Registre seus pagamentos e despesas."
        },

        fixo: {
            titulo: "Custos Fixos",
            descricao:
                "Controle despesas recorrentes."
        },

        variavel: {
            titulo: "Custos Variáveis",
            descricao:
                "Controle despesas que mudam ao longo do mês."
        }

    };


    document
        .getElementById("movPage")
        .classList.add("active");


    document.getElementById(
        "pageTitle"
    ).innerText =
        textos[tipo].titulo;


    document.getElementById(
        "movTitle"
    ).innerText =
        textos[tipo].titulo;


    document.getElementById(
        "movSubtitle"
    ).innerText =
        textos[tipo].descricao;


    document.getElementById(
        "movTipo"
    ).value = tipo;


    document.getElementById(
        "formTitle"
    ).innerText =
        `Nova ${textos[tipo].titulo.toLowerCase()}`;


    document.getElementById(
        "data"
    ).value = hoje();


    atualizarMovLista(tipo);

}

document
    .getElementById("periodoMes")
    .addEventListener("change", function() {

        periodoSelecionado = this.value;
        atualizarDashboard();

    });


// FORM

document
    .getElementById("movForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const tipo =
                document.getElementById(
                    "movTipo"
                ).value;


            const descricao =
                document.getElementById(
                    "descricao"
                ).value;


            const valor =
                Number(
                    document.getElementById(
                        "valor"
                    ).value
                );


            const data =
                document.getElementById(
                    "data"
                ).value;


            banco[
                perfilAtual
            ].movimentacoes.push({

                id: Date.now(),

                tipo,

                descricao,

                valor,

                data

            });


            salvar();


            this.reset();

            document.getElementById(
                "data"
            ).value = hoje();


            document.getElementById(
                "movTipo"
            ).value = tipo;


            atualizarTudo();

            atualizarMovLista(tipo);

        }
    );


// ===========================================
// LISTA MOVIMENTAÇÕES
// ===========================================

function atualizarMovLista(tipo) {

    const lista =
        banco[
            perfilAtual
        ].movimentacoes
        .filter(item => item.tipo === tipo)
        .sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        );


    const container =
        document.getElementById(
            "movLista"
        );


    const total =
        lista.reduce(
            (soma, item) =>
                soma + item.valor,
            0
        );


    document.getElementById(
        "movTotal"
    ).innerText = moeda(total);


    if (!lista.length) {

        container.innerHTML = `
            <div class="empty">
                Nenhum lançamento cadastrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        lista.map(item => `

            <div class="list-item">

                <div>

                    <div class="item-title">
                        ${item.descricao}
                    </div>

                    <div class="item-meta">
                        ${dataBR(item.data)}
                    </div>

                </div>

                <strong>
                    ${moeda(item.valor)}
                </strong>

                <button
                    class="delete-btn"
                    onclick="excluirMov(${item.id})"
                >
                    ×
                </button>

            </div>

        `).join("");

}


// ===========================================
// EXCLUIR MOVIMENTAÇÃO
// ===========================================

function excluirMov(id) {

    banco[
        perfilAtual
    ].movimentacoes =
        banco[
            perfilAtual
        ].movimentacoes
        .filter(
            item => item.id !== id
        );


    salvar();

    atualizarTudo();

    abrirPagina(paginaAtual);

}


// ===========================================
// SOMAS
// ===========================================

function totalTipo(tipo, mes = "all") {

    return movimentacoesDoPeriodo(mes)

        .filter(
            item => item.tipo === tipo
        )

        .reduce(
            (total, item) =>
                total + item.valor,
            0
        );

}


// ===========================================
// DASHBOARD
// ===========================================

function atualizarDashboard() {

    const entrada =
        totalTipo("entrada", periodoSelecionado);

    const saida =
        totalTipo("saida", periodoSelecionado);

    const fixo =
        totalTipo("fixo", periodoSelecionado);

    const variavel =
        totalTipo("variavel", periodoSelecionado);


    const despesas =
        saida + fixo + variavel;


    const saldo =
        entrada - despesas;


    document.getElementById(
        "saldoAtual"
    ).innerText =
        moeda(saldo);


    document.getElementById(
        "totalEntradas"
    ).innerText =
        moeda(entrada);


    document.getElementById(
        "totalSaidas"
    ).innerText =
        moeda(saida);


    document.getElementById(
        "totalFixos"
    ).innerText =
        moeda(fixo);


    document.getElementById(
        "totalVariaveis"
    ).innerText =
        moeda(variavel);


    document.getElementById(
        "resumoReceitas"
    ).innerText =
        moeda(entrada);


    document.getElementById(
        "resumoDespesas"
    ).innerText =
        moeda(despesas);


    document.getElementById(
        "resumoResultado"
    ).innerText =
        moeda(saldo);

    document.getElementById(
        "saldoTexto"
    ).innerText = periodoSelecionado === "all"
        ? "Resultado das movimentações do ano inteiro"
        : `Resultado de ${document.getElementById("periodoMes").selectedOptions[0].text}`;

    atualizarResumoMensal();


    atualizarUltimas();

}

function atualizarResumoMensal() {

    const meses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const anoAtual = new Date().getFullYear();
    const container = document.getElementById("resumoMensal");

    container.innerHTML = meses.map((nome, mes) => {

        const doMes = banco[perfilAtual].movimentacoes.filter(item =>
            anoDaData(item.data) === anoAtual && mesDaData(item.data) === mes
        );

        const entradas = doMes
            .filter(item => item.tipo === "entrada")
            .reduce((total, item) => total + item.valor, 0);

        const despesas = doMes
            .filter(item => ["saida", "fixo", "variavel"].includes(item.tipo))
            .reduce((total, item) => total + item.valor, 0);

        return `
            <button class="month-card ${String(mes) === periodoSelecionado ? "selected" : ""}" onclick="selecionarMes(${mes})">
                <span>${nome}</span>
                <strong>${moeda(entradas - despesas)}</strong>
                <small>+ ${moeda(entradas)} · - ${moeda(despesas)}</small>
            </button>
        `;

    }).join("");

}

function selecionarMes(mes) {

    periodoSelecionado = String(mes);
    document.getElementById("periodoMes").value = periodoSelecionado;
    atualizarDashboard();

}


// ===========================================
// ÚLTIMAS MOVIMENTAÇÕES
// ===========================================

function atualizarUltimas() {

    const lista =
        [
            ...banco[
                perfilAtual
            ].movimentacoes
        ]

        .sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        )

        .slice(0, 6);


    const container =
        document.getElementById(
            "ultimasMovimentacoes"
        );


    if (!lista.length) {

        container.innerHTML = `
            <div class="empty">
                Seus lançamentos aparecerão aqui.
            </div>
        `;

        return;

    }


    container.innerHTML =
        lista.map(item => {

            const sinal =
                item.tipo === "entrada"
                    ? "+"
                    : "-";


            return `

                <div class="transaction">

                    <div>

                        <div class="item-title">
                            ${item.descricao}
                        </div>

                        <div class="item-meta">
                            ${dataBR(item.data)}
                        </div>

                    </div>

                    <strong>
                        ${item.tipo}
                    </strong>

                    <strong>
                        ${sinal}
                        ${moeda(item.valor)}
                    </strong>

                </div>

            `;

        }).join("");

}


// ===========================================
// INVESTIMENTOS
// ===========================================

document
    .getElementById(
        "investimentoForm"
    )
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const idEdicao = Number(document.getElementById("investId").value);
            const valorAporte = Number(document.getElementById("investValor").value);
            const dataAporte = document.getElementById("investData").value;
            const investimentos = banco[perfilAtual].investimentos;
            if (!idEdicao && valorAporte <= 0) {
                alert("Informe o valor do primeiro aporte.");
                return;
            }

            if (idEdicao) {
                const investimento = investimentos.find(item => item.id === idEdicao);
                if (!investimento) return;

                investimento.nome = document.getElementById("investNome").value;
                investimento.categoria = document.getElementById("investCategoria").value;
                investimento.carteira = document.getElementById("investCarteira").value;
                investimento.atual = Number(document.getElementById("investAtual").value);
                investimento.aportes = investimento.aportes || [];

                if (valorAporte > 0) {
                    investimento.aportes.push({
                        id: `${Date.now()}-${investimento.aportes.length}`,
                        valor: valorAporte,
                        data: dataAporte
                    });
                }
            } else {
                investimentos.push({
                    id: Date.now(),
                    nome: document.getElementById("investNome").value,
                    categoria: document.getElementById("investCategoria").value,
                    carteira: document.getElementById("investCarteira").value,
                    atual: Number(document.getElementById("investAtual").value),
                    aportes: [{
                        id: `${Date.now()}-aporte-inicial`,
                        valor: valorAporte,
                        data: dataAporte
                    }]
                });
            }


            salvar();

            cancelarEdicaoInvestimento();

            atualizarInvestimentos();

        }
    );


function atualizarInvestimentos() {

    const lista =
        banco[
            perfilAtual
        ].investimentos;


    const container =
        document.getElementById(
            "investLista"
        );


    const total =
        lista.reduce(
            (soma, item) =>
                soma + Number(item.atual || 0),
            0
        );


    document.getElementById(
        "totalInvestimentos"
    ).innerText =
        moeda(total);


    if (!lista.length) {

        container.innerHTML = `
            <div class="empty">
                Nenhum investimento cadastrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        lista.map(item => {

            const aportes = item.aportes || [];
            const investido = aportes.reduce(
                (soma, aporte) => soma + Number(aporte.valor || 0),
                0
            );
            const resultado = Number(item.atual || 0) - investido;
            const percentual = investido ? (resultado / investido) * 100 : 0;


            return `

                <div class="list-item">

                    <div>

                        <div class="item-title">
                            ${item.nome}
                        </div>

                        <div class="item-meta">
                            ${item.categoria}
                            · ${item.carteira || "Não informada"}
                        </div>

                        <div class="item-meta">
                            ${aportes.length} ${aportes.length === 1 ? "aporte" : "aportes"}
                            · Capital: ${moeda(investido)}
                            · Rendimento: <span class="${resultado >= 0 ? "positive" : "negative"}">${moeda(resultado)} (${percentual.toFixed(2).replace(".", ",")}%)</span>
                        </div>

                        <div class="aporte-history">
                            ${aportes.slice().sort((a, b) => b.data.localeCompare(a.data)).map(aporte => `
                                <span>${dataBR(aporte.data)} · ${moeda(aporte.valor)}</span>
                            `).join("")}
                        </div>

                    </div>

                    <strong>
                        ${moeda(item.atual || 0)}
                    </strong>

                    <button
                        class="edit-btn"
                        onclick="editarInvestimento(${item.id})"
                        title="Editar investimento"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="delete-btn"
                        onclick="excluirInvestimento(${item.id})"
                    >
                        ×
                    </button>

                </div>

            `;

        }).join("");

}


function excluirInvestimento(id) {

    banco[
        perfilAtual
    ].investimentos =
        banco[
            perfilAtual
        ].investimentos
        .filter(
            item => item.id !== id
        );


    salvar();

    atualizarInvestimentos();

}

function editarInvestimento(id) {
    const investimento = banco[perfilAtual].investimentos.find(item => item.id === id);
    if (!investimento) return;

    const ultimoAporte = (investimento.aportes || []).slice(-1)[0] || {};
    document.getElementById("investId").value = investimento.id;
    document.getElementById("investNome").value = investimento.nome;
    document.getElementById("investCategoria").value = investimento.categoria;
    document.getElementById("investCarteira").value = investimento.carteira || "";
    document.getElementById("investValor").value = "";
    document.getElementById("investAtual").value = investimento.atual || 0;
    document.getElementById("investData").value = hoje();
    document.querySelector("#investimentosPage .form-panel h3").innerText = "Editar investimento";
    document.getElementById("investSubmit").innerText = "Salvar alterações";
    document.getElementById("investCancelar").classList.remove("hidden");
    document.getElementById("investValor").placeholder = ultimoAporte.valor
        ? `Novo aporte (último: ${moeda(ultimoAporte.valor)})`
        : "Novo aporte";
    document.getElementById("investNome").focus();
}

function cancelarEdicaoInvestimento() {
    const form = document.getElementById("investimentoForm");
    form.reset();
    document.getElementById("investId").value = "";
    document.querySelector("#investimentosPage .form-panel h3").innerText = "Novo investimento";
    document.getElementById("investSubmit").innerText = "Adicionar investimento";
    document.getElementById("investCancelar").classList.add("hidden");
    document.getElementById("investData").value = hoje();
    document.getElementById("investValor").placeholder = "Valor do aporte";
}


// ===========================================
// CLIENTES PJ
// ===========================================

document
    .getElementById(
        "clienteForm"
    )
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            banco.pj.clientes.push({

                id: Date.now(),

                nome:
                    document.getElementById(
                        "clienteNome"
                    ).value,

                servico:
                    document.getElementById(
                        "clienteServico"
                    ).value,

                valor:
                    Number(
                        document.getElementById(
                            "clienteValor"
                        ).value
                    ),

                vencimento:
                    Number(
                        document.getElementById(
                            "clienteVencimento"
                        ).value
                    ),

                data:
                    document.getElementById(
                        "clienteData"
                    ).value,

                status:
                    document.getElementById(
                        "clienteStatus"
                    ).value,

                pago: false

            });


            salvar();

            this.reset();

            atualizarClientes();

        }
    );


function atualizarClientes() {

    const clientes =
        banco.pj.clientes;


    const ativos =
        clientes.filter(
            cliente =>
                cliente.status === "ativo"
        ).length;


    document.getElementById(
        "clientesAtivos"
    ).innerText = ativos;


    const container =
        document.getElementById(
            "clientesLista"
        );


    if (!clientes.length) {

        container.innerHTML = `
            <div class="empty">
                Nenhum cliente cadastrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        clientes.map(cliente => `

            <div class="list-item">

                <div>

                    <div class="item-title">
                        ${cliente.nome}
                    </div>

                    <div class="item-meta">
                        ${cliente.servico}
                        · Venc. dia
                        ${cliente.vencimento}
                        ${cliente.data ? `· ${dataBR(cliente.data)}` : ""}
                    </div>

                </div>

                <div>

                    <strong>
                        ${moeda(cliente.valor)}
                    </strong>

                    <div
                        class="status ${cliente.status}"
                    >
                        ${cliente.status}
                    </div>

                </div>

                <button
                    class="delete-btn"
                    onclick="excluirCliente(${cliente.id})"
                >
                    ×
                </button>

            </div>

        `).join("");

}


function excluirCliente(id) {

    banco.pj.clientes =
        banco.pj.clientes.filter(
            cliente =>
                cliente.id !== id
        );


    salvar();

    atualizarClientes();

}


// ===========================================
// CONTAS A RECEBER
// ===========================================

function atualizarReceber() {

    const clientes =
        banco.pj.clientes
        .filter(
            cliente =>
                cliente.status === "ativo"
        );


    const pendentes =
        clientes.filter(
            cliente =>
                !cliente.pago
        );


    const totalPendente =
        pendentes.reduce(
            (total, cliente) =>
                total + cliente.valor,
            0
        );


    document.getElementById(
        "totalPendente"
    ).innerText =
        moeda(totalPendente);


    const container =
        document.getElementById(
            "receberLista"
        );


    if (!clientes.length) {

        container.innerHTML = `
            <div class="empty">
                Nenhum recebimento previsto.
            </div>
        `;

        return;

    }


    container.innerHTML =
        clientes.map(cliente => `

            <div class="list-item">

                <div>

                    <div class="item-title">
                        ${cliente.nome}
                    </div>

                    <div class="item-meta">
                        Vencimento dia
                        ${cliente.vencimento}
                        ${cliente.data ? `· ${dataBR(cliente.data)}` : ""}
                    </div>

                </div>

                <strong>
                    ${moeda(cliente.valor)}
                </strong>

                <button
                    class="primary-btn"
                    style="
                        width:auto;
                        margin:0;
                        padding:8px 12px;
                    "
                    onclick="alternarPagamento(${cliente.id})"
                >

                    ${
                        cliente.pago
                        ? "Pago"
                        : "Marcar pago"
                    }

                </button>

            </div>

        `).join("");

}


function alternarPagamento(id) {

    const cliente =
        banco.pj.clientes.find(
            cliente =>
                cliente.id === id
        );


    if (!cliente) return;


    cliente.pago =
        !cliente.pago;


    if (cliente.pago) {

        const recebimento = {

            id: Date.now(),

            tipo: "entrada",

            descricao:
                `Recebimento - ${cliente.nome}`,

            valor:
                cliente.valor,

            data:
                hoje()

        };

        banco.pj.movimentacoes.push(recebimento);
        cliente.recebimentoMovimentacaoId = recebimento.id;
        cliente.dataPagamento = recebimento.data;

    } else if (cliente.recebimentoMovimentacaoId) {

        banco.pj.movimentacoes = banco.pj.movimentacoes.filter(item =>
            item.id !== cliente.recebimentoMovimentacaoId
        );

        delete cliente.recebimentoMovimentacaoId;
        delete cliente.dataPagamento;

    }


    salvar();

    atualizarReceber();

}


// ===========================================
// TRANSFERÊNCIA
// ===========================================

document
    .getElementById(
        "transferForm"
    )
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const origem =
                document.getElementById(
                    "transferOrigem"
                ).value;


            const destino =
                document.getElementById(
                    "transferDestino"
                ).value;


            if (origem === destino) {

                alert(
                    "A origem e o destino precisam ser diferentes."
                );

                return;

            }


            const descricao =
                document.getElementById(
                    "transferDescricao"
                ).value;


            const valor =
                Number(
                    document.getElementById(
                        "transferValor"
                    ).value
                );


            const data =
                document.getElementById(
                    "transferData"
                ).value;


            banco[
                origem
            ].movimentacoes.push({

                id: Date.now(),

                tipo: "saida",

                descricao:
                    `${descricao} → ${destino.toUpperCase()}`,

                valor,

                data

            });


            banco[
                destino
            ].movimentacoes.push({

                id: Date.now() + 1,

                tipo: "entrada",

                descricao:
                    `${descricao} ← ${origem.toUpperCase()}`,

                valor,

                data

            });


            salvar();

            this.reset();

            document.getElementById(
                "transferData"
            ).value = hoje();


            alert(
                "Transferência registrada."
            );

        }
    );


// ===========================================
// ATUALIZAÇÃO GERAL
// ===========================================

function atualizarTudo() {

    atualizarDashboard();

}


// ===========================================
// DATA PADRÃO
// ===========================================

document.getElementById(
    "data"
).value = hoje();


document.getElementById(
    "transferData"
).value = hoje();