// js/services/viaCep.js
export async function fetchAddressByCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (!response.ok) throw new Error("Erro na requisição");
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado");
        return data;
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        return null;
    }
}