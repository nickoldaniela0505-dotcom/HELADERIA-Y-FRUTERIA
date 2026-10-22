<?php
/**
 * Endpoint para recibir y almacenar una encuesta en MySQL
 * Heladería y Frutería Arcoíris
 */

require_once __DIR__ . '/db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

if (!$pdo) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error'   => 'Base de datos MySQL no disponible en localhost.',
        'details' => $db_connection_error ?? 'Error de conexión'
    ]);
    exit;
}

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos JSON inválidos']);
    exit;
}

$nombreCompleto = trim($data['nombreCompleto'] ?? '');
$correoElectronico = trim($data['correoElectronico'] ?? '');

if (empty($nombreCompleto) || empty($correoElectronico)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Nombre y correo son obligatorios']);
    exit;
}

$codigoEncuesta = $data['codigoEncuesta'] ?? ('ENC-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4)));
$telefono       = trim($data['telefono'] ?? '');
$ciudad         = trim($data['ciudad'] ?? 'Tocaima');
$rangoEdad      = $data['rangoEdad'] ?? '18-25';
$tipoCliente    = $data['tipoCliente'] ?? 'Primera vez';
$ipOrigen       = $_SERVER['REMOTE_ADDR'] ?? '';

// Datos productos
$productosProbados = $data['productosProbados'] ?? [];
$productoFavorito  = trim($data['productoFavorito'] ?? '');
$calidad           = intval($data['calificacionCalidad'] ?? 5);
$presentacion      = intval($data['calificacionPresentacion'] ?? 5);
$precio            = $data['percepcionPrecio'] ?? 'Justos y adecuados';
$sugerenciaProd    = trim($data['sugerenciaProducto'] ?? '');

// Datos web
$calificacionWeb   = intval($data['calificacionWeb'] ?? 5);
$facilidad         = $data['facilidadNavegacion'] ?? 'Muy fácil';
$diseno            = $data['percepcionDiseno'] ?? 'Me encanta el estilo arcoíris';
$whatsappUtil      = $data['utilidadWhatsapp'] ?? 'Excelente y muy práctica';
$nps               = intval($data['recomendacionNPS'] ?? 10);
$comentarios       = trim($data['comentarios'] ?? '');

try {
    $pdo->beginTransaction();

    // 1. Insertar encuestado
    $stmt1 = $pdo->prepare("
        INSERT INTO `encuestados` 
        (`codigo_encuesta`, `nombre_completo`, `correo_electronico`, `telefono`, `ciudad`, `rango_edad`, `tipo_cliente`, `ip_origen`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt1->execute([$codigoEncuesta, $nombreCompleto, $correoElectronico, $telefono, $ciudad, $rangoEdad, $tipoCliente, $ipOrigen]);
    $encuestadoId = $pdo->lastInsertId();

    // 2. Insertar productos de interés
    if (is_array($productosProbados) && !empty($productosProbados)) {
        $stmt2 = $pdo->prepare("INSERT INTO `productos_interes` (`encuestado_id`, `categoria_producto`) VALUES (?, ?)");
        foreach ($productosProbados as $cat) {
            $catTrim = trim($cat);
            if (!empty($catTrim)) {
                $stmt2->execute([$encuestadoId, $catTrim]);
            }
        }
    }

    // 3. Insertar evaluación de productos
    $stmt3 = $pdo->prepare("
        INSERT INTO `evaluaciones_productos` 
        (`encuestado_id`, `producto_favorito`, `calificacion_calidad`, `calificacion_presentacion`, `percepcion_precio`, `sugerencia_nuevo_producto`) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt3->execute([$encuestadoId, $productoFavorito, $calidad, $presentacion, $precio, $sugerenciaProd]);

    // 4. Insertar evaluación web
    $stmt4 = $pdo->prepare("
        INSERT INTO `evaluaciones_sitio_web` 
        (`encuestado_id`, `calificacion_web`, `facilidad_navegacion`, `percepcion_diseno`, `utilidad_whatsapp`, `nps_recomendacion`, `comentarios_adicionales`) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt4->execute([$encuestadoId, $calificacionWeb, $facilidad, $diseno, $whatsappUtil, $nps, $comentarios]);

    $pdo->commit();

    echo json_encode([
        'success'        => true,
        'message'        => 'Encuesta guardada con éxito en la base de datos MySQL.',
        'codigoEncuesta' => $codigoEncuesta,
        'id'             => $encuestadoId
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al registrar en MySQL: ' . $e->getMessage()
    ]);
}
