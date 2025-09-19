//Functions Auxiliares
export function formatCurrency(value) { // <--- COM O 'export'
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function isEmpty(value){
    return !value || value.trim() === '';
}

export function validaCep(value) {
    const cepLimpo = value.replace(/\D/g, ''); 
    const regexCep = /^[0-9]{8}$/;

    if (regexCep.test(cepLimpo)) {
        return true;
    }
    
    limpaCampoEndereco(); 
    return false;
}

export function limpaCampoEndereco(){
    document.querySelectorAll('[data-campo="endereco"]').forEach( el => el.value = '' );
}