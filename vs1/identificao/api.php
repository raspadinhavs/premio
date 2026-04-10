<?php
/**
 * API Wrapper para consulta de CPF
 * Integração com: https://apela-api.tech/
 * Versão Multi-Plataforma: Usa extensões nativas do PHP (cURL)
 */

// Desativa a exibição de erros HTML e define o cabeçalho JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

// Função para retornar erro em JSON
function responderErro($mensagem, $codigo = 200)
{
    http_response_code($codigo);
    echo json_encode(['erro' => $mensagem]);
    exit;
}

// Captura o CPF via GET
$cpf = isset($_GET['cpf']) ? $_GET['cpf'] : '';
$cpf = preg_replace('/\D/', '', $cpf);

// Validação básica
if (empty($cpf) || strlen($cpf) !== 11) {
    responderErro('CPF inválido ou não informado.', 400);
}

// Configurações da API Externa
$api_user = "f3321c2315589bf37dd6893a77bf037c";
$api_url = "https://apela-api.tech/?user=" . $api_user . "&cpf=" . $cpf;

try {
    // Inicializa o cURL
    $ch = curl_init();

    // Configura as opções do cURL
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignora erros de SSL
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);           // Timeout de 15 segundos

    // Executa a requisição
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);

    // Fecha a conexão
    curl_close($ch);

    if ($response === false) {
        throw new Exception('Erro ao conectar com a API: ' . $curl_error);
    }

    if (empty($response)) {
        throw new Exception('O servidor retornou uma resposta vazia.');
    }

    // Tenta verificar se o retorno é um JSON válido
    $testJson = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        responderErro('A API externa retornou um formato inválido ou erro de sistema.');
    }

    // Se a API externa retornou erro no JSON mas com status 200 ou similar
    if (isset($testJson['erro'])) {
        // Retorna o JSON de erro da API externa
        echo $response;
        exit;
    }

    // Retorna a resposta original com status OK
    http_response_code(200);
    echo $response;

} catch (Exception $e) {
    responderErro($e->getMessage(), 500);
}
