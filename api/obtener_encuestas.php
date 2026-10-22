<?php
/**
 * Endpoint para obtener el listado de encuestas desde MySQL
 * Heladería y Frutería Arcoíris
 */

require_once __DIR__ . '/db_config.php';

if (!$pdo) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error'   => 'Base de datos MySQL no disponible en localhost.',
        'data'    => []
    ]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT * FROM `vista_resumen_encuestas` LIMIT 500");
    $encuestas = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'total'   => count($encuestas),
        'data'    => $encuestas
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al consultar MySQL: ' . $e->getMessage()
    ]);
}
