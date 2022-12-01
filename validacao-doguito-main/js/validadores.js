export function valida(input) {
    const tipoInput = input.dataset.tipo;

    if(validadores[tipoInput]){
        validadores[tipoInput](input);
    }

    if(input.validity.valid){
        input.parentElement.classList.remove('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
    }else{
        input.parentElement.classList.add('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoInput, input)
    }
}

const mensagensDeErro = {
    nome:{
        valueMissing: 'O campo nome não pode estar vazio.'
    },
    email:{
        valueMissing: 'O campo email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    senha:{
        valueMissing: 'O campo senha não pode estar vazio.',
        patternMismatch: 'A sua senha deve conter de 6 a 12 caracteres, pelo menos uma letra minúscula, uma letra maiúscula, um caracter especial e um número.',

    },
    dataNascimento:{
        customError: 'Você deve ser maior de 18 anos para se cadastrar.'
    },
    cpf:{
        valueMissing: 'O campo CPF não pode estar vazio.',
        patternMismatch:'O formato de CPF Digitado não é válido.',
        customError: 'O CPF digitado não é válido'
    },
    cep:{
        valueMissing: 'O campo CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'O CEP digitado não existe.'
    }
}

const tiposDeErrosDoValidity = [
    'customError',
    'valueMissing', 
    'typeMismatch', 
    'patternMismatch', 
    
]

function mostraMensagemDeErro(tipoInput, input) {
    var msg = ''
    tiposDeErrosDoValidity.forEach(erro => {
        if(input.validity[erro]) { msg = mensagensDeErro[tipoInput][erro]}
    })

    return msg;
}
    

const validadores = {
    dataNascimento:input => validaDataNascimento(input),
    cpf:input => validaCpf(input),
    cep:input => recuperaCEP(input)
}

function validaDataNascimento(input){
    const dataInserida = new Date(input.value);
    var msg = '';

    if(!maiorDe18(dataInserida)){
        msg = 'É necessário ter no mínimo 18 anos para realizar o cadastro.'
    }
    input.setCustomValidity(msg);
}

function maiorDe18(data){
    const dataAtual = new Date();
    const dataMaior18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

    return dataAtual >= dataMaior18;
}

function validaCpf(input){
    const cpf =  input.value.replace(/\D/g, '');
    var msg = '';
                                      
    if(!verificaDigito(cpf) ^ verificaCasoInvalido(cpf)) { msg = 'CPF inválido.'}
    input.setCustomValidity(msg);
    
}

function verificaCasoInvalido(cpf){
    
    const casosInvalidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    if(casosInvalidos.includes(cpf)) { return true }
}

function verificaDigito(cpf){
    var cpfOK = true;

    var calcDigito1 = 0, calcDigito2 = 0;

    var multiplicador1 = 10, multiplicador2 = 11;
    for(var i=0; i<10; i++) {
        if(i < 9){
            calcDigito1 += parseInt(cpf[i]) * multiplicador1;
        }
        calcDigito2 += parseInt(cpf[i]) * multiplicador2;

        //console.log(`${cpf[i]} * ${multiplicador1} = ${cpf[i] * multiplicador1} ||| TOT acum = ${calcDigito1}`)

        multiplicador1--;
        multiplicador2--;
        
    }
    

    calcDigito1 = 11 - (calcDigito1 % 11);
    if(calcDigito1 >= 10){calcDigito1 = 0} 
    
    calcDigito2 = 11 - (calcDigito2 % 11);
    if(calcDigito2 >= 10) {calcDigito2 = 0}

    if(calcDigito1 != cpf[9] || calcDigito2 != cpf[10]) {cpfOK = false}

    return cpfOK;
}

function recuperaCEP(input){
    const cep = input.value.replace(/\D/g, '');
    console.log(cep);
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.valueMissing && !input.validity.patternMismatch){
        fetch(url, options).then(
            response => response.json()
        ).then(
            data => { 
                if(data.erro) { 
                    input.setCustomValidity('O CEP digitado não existe.')
                    return 
                } 
                input.setCustomValidity('')
                
                preencheCamposCEP(data)
                return;
            }
        )
    }
}

function preencheCamposCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro;
    cidade.value = data.localidade;
    estado.value = data.uf;
}