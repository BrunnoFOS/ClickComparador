document.getElementById('botao-comparar').addEventListener('click', compararArquivos);

async function compararArquivos() {
    const arq_1 = document.getElementById('arq_1').files[0];
    const arq_2 = document.getElementById('arq_2').files[0];

    if (!arq_1 || !arq_2) {
        mostrarModal('Por favor, selecione as duas planilhas.');
        return;
    }

    const [dados1, dados2] = await Promise.all([lerArquivo(arq_1), lerArquivo(arq_2)]);

    const numeros1 = buscarContatosNaPlanilha(dados1)

    const pessoas_unicas = dados2.filter(pessoa => !numeros1.includes(pessoa.number || pessoa.numero));

    if (pessoas_unicas.length === 0) {
        mostrarModal('Todas as linhas da segunda planilha estão presentes na primeira.');
    } else {
        gerarXLSX(pessoas_unicas);
    }
}

function lerArquivo(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onloadend = (evento) => {
            const dados = new Uint8Array(evento.target.result);
            const planilha = XLSX.read(dados, { type: 'array' });
            const primeiraAba = planilha.Sheets[planilha.SheetNames[0]];
            const dadosAnalisados = XLSX.utils.sheet_to_json(primeiraAba);
            resolve(dadosAnalisados);
        };

        leitor.onerror = (erro) => reject(erro);

        leitor.readAsArrayBuffer(arquivo);
    });
}

function buscarContatosNaPlanilha(dados) {
    return dados.map(linha => linha.number || linha.numero).filter(Boolean);
}

function gerarXLSX(dados) {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'pessoas_funil');
    XLSX.writeFile(workbook, 'pessoas_funil.xlsx');
}

function mostrarModal(mensagem) {
    const modal = document.getElementById('modal');
    const mensagemModal = document.getElementById('mensagem-modal');
    mensagemModal.textContent = mensagem;
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 2000);
}