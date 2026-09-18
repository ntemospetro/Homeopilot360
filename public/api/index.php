<?php
/**
 * =========================================================================
 * Hostinger PHP API Bridge für Live-Medikamentensuche (homeopilot360.com)
 * =========================================================================
 */

// Output Buffering starten, um HTTP/2 Stream-Abbrüche und Protocol Errors zu verhindern
ob_start();

// Fehler abfangen & sauberes JSON statt Apache 500 HTML-Fehlerseite ausgeben
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            header('Cache-Control: no-cache, no-store, must-revalidate');
        }
        $errJson = json_encode([
            'status' => 'error',
            'error' => $error['message'],
            'file' => basename($error['file']),
            'line' => $error['line']
        ], JSON_UNESCAPED_UNICODE);
        if (!headers_sent()) {
            header('Content-Length: ' . strlen($errJson));
        }
        echo $errJson;
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }
        exit;
    }
});

ini_set('display_errors', '0');
error_reporting(0);

// Globaler Helper für sichere HTTP/2-konforme JSON-Antworten mit Content-Length
if (!function_exists('sendJsonResponse')) {
    function sendJsonResponse($data, $statusCode = 200) {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Cache-Control: no-cache, no-store, must-revalidate');
        }
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            $json = json_encode(['error' => 'JSON encoding failed']);
        }
        if (!headers_sent()) {
            header('Content-Length: ' . strlen($json));
        }
        echo $json;
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }
        exit;
    }
}

// Header für JSON & CORS setzen
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Preflight OPTIONS Request direkt beantworten
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code(204);
    header('Content-Length: 0');
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
    exit;
}

// -------------------------------------------------------------------------
// Pfad-Helfer für Datenbank- und Konfigurationsdateien
// -------------------------------------------------------------------------
if (!function_exists('getDataFilePath')) {
    function getDataFilePath($filename) {
        $candidates = [
            __DIR__ . '/../data/' . $filename,
            __DIR__ . '/data/' . $filename,
            __DIR__ . '/../../data/' . $filename
        ];
        foreach ($candidates as $c) {
            if (file_exists($c)) return $c;
        }
        $defaultDir = __DIR__ . '/../data';
        if (!is_dir($defaultDir)) {
            @mkdir($defaultDir, 0755, true);
        }
        return $defaultDir . '/' . $filename;
    }
}

function getMedicationsDbPath() {
    $candidates = [
        __DIR__ . '/../data/medications_db.json',
        __DIR__ . '/data/medications_db.json',
        __DIR__ . '/../../data/medications_db.json'
    ];
    foreach ($candidates as $c) {
        if (file_exists($c)) return $c;
    }
    $defaultDir = __DIR__ . '/../data';
    if (!is_dir($defaultDir)) {
        @mkdir($defaultDir, 0755, true);
    }
    return $defaultDir . '/medications_db.json';
}

function getTranslationsDbPath() {
    $candidates = [
        __DIR__ . '/../data/medication_translations.json',
        __DIR__ . '/data/medication_translations.json',
        __DIR__ . '/../../data/medication_translations.json'
    ];
    foreach ($candidates as $c) {
        if (file_exists($c)) return $c;
    }
    $defaultDir = __DIR__ . '/../data';
    if (!is_dir($defaultDir)) {
        @mkdir($defaultDir, 0755, true);
    }
    return $defaultDir . '/medication_translations.json';
}

function loadMedicationsDatabase() {
    $file = getMedicationsDbPath();
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if (!$raw) return [];
    $data = @json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveToMedicationsDatabase($items) {
    if (empty($items) || !is_array($items)) return 0;
    
    if (isset($items['name'])) {
        $items = [$items];
    }

    $file = getMedicationsDbPath();
    $db = loadMedicationsDatabase();

    $now = date('c');
    $count = 0;

    foreach ($items as $item) {
        if (empty($item['name'])) continue;
        $normName = strtolower(trim($item['name']));
        $item['lastUpdated'] = $now;
        $item['savedAt'] = !empty($item['savedAt']) ? $item['savedAt'] : $now;
        $item['fromDatabase'] = true;

        $foundIdx = -1;
        foreach ($db as $idx => $m) {
            if (isset($m['name']) && strtolower(trim($m['name'])) === $normName) {
                $foundIdx = $idx;
                break;
            }
        }

        if ($foundIdx >= 0) {
            $db[$foundIdx] = array_merge($db[$foundIdx], $item);
        } else {
            $db[] = $item;
        }
        $count++;
    }

    $json = json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json && is_writable(dirname($file))) {
        @file_put_contents($file, $json, LOCK_EX);
    }

    return $count;
}

function loadMedicationTranslations() {
    $file = getTranslationsDbPath();
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if (!$raw) return [];
    $data = @json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveMedicationTranslation($key, $text) {
    if (empty($key) || empty($text)) return;
    $file = getTranslationsDbPath();
    $trans = loadMedicationTranslations();
    $trans[$key] = $text;
    $json = json_encode($trans, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json && is_writable(dirname($file))) {
        @file_put_contents($file, $json, LOCK_EX);
    }
}

function getGeminiKey() {
    $configFile = __DIR__ . '/config.php';
    if (file_exists($configFile)) {
        $key = @include $configFile;
        if (!empty($key) && is_string($key)) return trim($key);
    }
    return getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? ($_SERVER['GEMINI_API_KEY'] ?? ''));
}

// -------------------------------------------------------------------------
// Gemini REST API Aufruf
// -------------------------------------------------------------------------
function callGeminiApi($prompt, $withSearch = false) {
    $apiKey = getGeminiKey();
    if (empty($apiKey)) return null;

    $models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

    foreach ($models as $model) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        if ($withSearch) {
            $payload['tools'] = [
                ['googleSearch' => (object)[]]
            ];
        }

        $jsonPayload = json_encode($payload);
        $response = null;

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($jsonPayload)
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
            curl_setopt($ch, CURLOPT_TIMEOUT, 35);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            // Falls mit googleSearch fehlschlägt, Fallback ohne Tool
            if (($httpCode < 200 || $httpCode >= 300) && $withSearch) {
                unset($payload['tools']);
                $jsonPayloadNoSearch = json_encode($payload);
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'Content-Length: ' . strlen($jsonPayloadNoSearch)
                ]);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayloadNoSearch);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                $response = curl_exec($ch);
                curl_close($ch);
            }
        } else {
            $opts = [
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-Type: application/json\r\n",
                    'content' => $jsonPayload,
                    'timeout' => 35
                ]
            ];
            $context = stream_context_create($opts);
            $response = @file_get_contents($url, false, $context);
        }

        if ($response) {
            $decoded = @json_decode($response, true);
            if (isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
                $text = trim($decoded['candidates'][0]['content']['parts'][0]['text']);
                if (!empty($text)) {
                    $promptTokens = isset($decoded['usageMetadata']['promptTokenCount'])
                        ? (int)$decoded['usageMetadata']['promptTokenCount']
                        : (int)ceil(strlen($prompt) / 4);
                    $candidatesTokens = isset($decoded['usageMetadata']['candidatesTokenCount'])
                        ? (int)$decoded['usageMetadata']['candidatesTokenCount']
                        : (int)ceil(strlen($text) / 4);

                    recordTokenUsageInternal([
                        'model' => $model,
                        'promptTokens' => $promptTokens,
                        'candidatesTokens' => $candidatesTokens
                    ]);

                    return $text;
                }
            }
        }
    }

    return null;
}

// -------------------------------------------------------------------------
// Token-Tracking & Abrechnung Helfer
// -------------------------------------------------------------------------
function getTherapistLookup() {
    return [
        'th-101' => [
            'name' => 'Katharina Lindemann',
            'email' => 'k.lindemann@naturheilpraxis-berlin.de',
            'praxis' => 'Naturheilpraxis Lindemann',
            'tarif' => 'Kostenloser Test-Tarif'
        ],
        'th-102' => [
            'name' => 'Dr. med. Markus Vogel',
            'email' => 'praxis@dr-vogel-muenchen.de',
            'praxis' => 'Ganzheitliche Medizin Vogel',
            'tarif' => 'Kostenloser Test-Tarif'
        ],
        'th-103' => [
            'name' => 'Sophie Brunner',
            'email' => 'sophie.brunner@homoeopathie-zuerich.ch',
            'praxis' => 'Klassische Homöopathie Zürich',
            'tarif' => 'Pro Unbegrenzt (Praxis-Flatrate)'
        ]
    ];
}

function getSeedTokenLogs() {
    $now = time();
    return [
        [
            'id' => 'tok-seed-101',
            'timestamp' => date('c', $now - (35 * 60)),
            'therapistId' => 'th-103',
            'therapistName' => 'Sophie Brunner',
            'therapistEmail' => 'sophie.brunner@homoeopathie-zuerich.ch',
            'endpoint' => '/api/analyze',
            'actionName' => 'Große klinische Fallanalyse',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 2540,
            'candidatesTokens' => 1890,
            'totalTokens' => 4430,
            'costEur' => 0.00076
        ],
        [
            'id' => 'tok-seed-102',
            'timestamp' => date('c', $now - (120 * 60)),
            'therapistId' => 'th-103',
            'therapistName' => 'Sophie Brunner',
            'therapistEmail' => 'sophie.brunner@homoeopathie-zuerich.ch',
            'endpoint' => '/api/acute-repertorise',
            'actionName' => '5-Schritte-Akut-Repertorisation',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 1210,
            'candidatesTokens' => 840,
            'totalTokens' => 2050,
            'costEur' => 0.00034
        ],
        [
            'id' => 'tok-seed-103',
            'timestamp' => date('c', $now - (300 * 60)),
            'therapistId' => 'th-103',
            'therapistName' => 'Sophie Brunner',
            'therapistEmail' => 'sophie.brunner@homoeopathie-zuerich.ch',
            'endpoint' => '/api/check-medical-relevance',
            'actionName' => 'Medizinischer Relevanz-Check',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 215,
            'candidatesTokens' => 32,
            'totalTokens' => 247,
            'costEur' => 0.00003
        ],
        [
            'id' => 'tok-seed-201',
            'timestamp' => date('c', $now - (6 * 3600)),
            'therapistId' => 'th-102',
            'therapistName' => 'Dr. med. Markus Vogel',
            'therapistEmail' => 'praxis@dr-vogel-muenchen.de',
            'endpoint' => '/api/analyze',
            'actionName' => 'Große klinische Fallanalyse',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 2610,
            'candidatesTokens' => 1950,
            'totalTokens' => 4560,
            'costEur' => 0.00078
        ],
        [
            'id' => 'tok-seed-202',
            'timestamp' => date('c', $now - (18 * 3600)),
            'therapistId' => 'th-102',
            'therapistName' => 'Dr. med. Markus Vogel',
            'therapistEmail' => 'praxis@dr-vogel-muenchen.de',
            'endpoint' => '/api/acute-repertorise',
            'actionName' => '5-Schritte-Akut-Repertorisation',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 1180,
            'candidatesTokens' => 810,
            'totalTokens' => 1990,
            'costEur' => 0.00033
        ],
        [
            'id' => 'tok-seed-301',
            'timestamp' => date('c', $now - (24 * 3600)),
            'therapistId' => 'th-101',
            'therapistName' => 'Katharina Lindemann',
            'therapistEmail' => 'k.lindemann@naturheilpraxis-berlin.de',
            'endpoint' => '/api/analyze',
            'actionName' => 'Große klinische Fallanalyse',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 2430,
            'candidatesTokens' => 1810,
            'totalTokens' => 4240,
            'costEur' => 0.00073
        ],
        [
            'id' => 'tok-seed-302',
            'timestamp' => date('c', $now - (30 * 3600)),
            'therapistId' => 'th-101',
            'therapistName' => 'Katharina Lindemann',
            'therapistEmail' => 'k.lindemann@naturheilpraxis-berlin.de',
            'endpoint' => '/api/check-medical-relevance',
            'actionName' => 'Medizinischer Relevanz-Check',
            'model' => 'gemini-3.8-flash',
            'promptTokens' => 195,
            'candidatesTokens' => 28,
            'totalTokens' => 223,
            'costEur' => 0.00002
        ]
    ];
}

function getStoredTokenLogs() {
    $file = getDataFilePath('token_usage_logs.json');
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        $parsed = @json_decode($raw, true);
        if (is_array($parsed) && count($parsed) > 0) {
            return $parsed;
        }
    }
    $seeds = getSeedTokenLogs();
    @file_put_contents($file, json_encode($seeds, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $seeds;
}

function recordTokenUsageInternal($params) {
    try {
        $file = getDataFilePath('token_usage_logs.json');
        $ratesFile = getDataFilePath('token_rates.json');

        $rates = [
            'inputPerMillionEur' => 0.075,
            'outputPerMillionEur' => 0.30,
            'currency' => '€'
        ];
        if (file_exists($ratesFile)) {
            $rawRates = @file_get_contents($ratesFile);
            $parsedRates = @json_decode($rawRates, true);
            if (is_array($parsedRates)) {
                $rates = array_merge($rates, $parsedRates);
            }
        }

        $logs = getStoredTokenLogs();

        $promptTokens = isset($params['promptTokens']) ? (int)$params['promptTokens'] : 0;
        $candidatesTokens = isset($params['candidatesTokens']) ? (int)$params['candidatesTokens'] : 0;
        $totalTokens = $promptTokens + $candidatesTokens;

        $promptCost = ($promptTokens / 1000000.0) * (float)$rates['inputPerMillionEur'];
        $candidatesCost = ($candidatesTokens / 1000000.0) * (float)$rates['outputPerMillionEur'];
        $totalCost = round($promptCost + $candidatesCost, 5);

        global $body, $route;
        $therapistLookup = getTherapistLookup();

        $thId = !empty($params['therapistId']) ? $params['therapistId'] : (!empty($body['therapistId']) ? $body['therapistId'] : 'th-101');
        $thName = !empty($params['therapistName']) ? $params['therapistName'] : (!empty($body['therapistName']) ? $body['therapistName'] : '');
        $thEmail = !empty($params['therapistEmail']) ? $params['therapistEmail'] : (!empty($body['therapistEmail']) ? $body['therapistEmail'] : '');

        if (empty($thName) && isset($therapistLookup[$thId])) {
            $thName = $therapistLookup[$thId]['name'];
        }
        if (empty($thEmail) && isset($therapistLookup[$thId])) {
            $thEmail = $therapistLookup[$thId]['email'];
        }

        $actionMap = [
            'analyze' => 'Große klinische Fallanalyse',
            'acute-repertorise' => '5-Schritte-Akut-Repertorisation',
            'check-medical-relevance' => 'Medizinischer Relevanz-Check',
            'hahnemann-analysis' => 'Hahnemann 6-Säulen-Matrix Analyse',
            'medications/search' => 'Medikamenten-Live-Recherche',
            'medications/monograph' => 'Medikamenten-Monographie (Fachinfo)',
            'medications/clinical-comparison' => 'Klinischer Multimedikations-Vergleich',
            'medications/translate' => 'Medikamenten-Monographie Übersetzung'
        ];

        $curRoute = $route ?: 'gemini';
        $endpoint = !empty($params['endpoint']) ? $params['endpoint'] : ('/api/' . $curRoute);
        $actionName = !empty($params['actionName']) ? $params['actionName'] : ($actionMap[$curRoute] ?? 'KI-Generierung');

        $entry = [
            'id' => 'tok-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid(mt_rand(), true)), 0, 5),
            'timestamp' => date('c'),
            'therapistId' => $thId,
            'therapistName' => $thName ?: 'Katharina Lindemann',
            'therapistEmail' => $thEmail ?: 'k.lindemann@naturheilpraxis-berlin.de',
            'endpoint' => $endpoint,
            'actionName' => $actionName,
            'model' => !empty($params['model']) ? $params['model'] : 'gemini-3.8-flash',
            'promptTokens' => $promptTokens,
            'candidatesTokens' => $candidatesTokens,
            'totalTokens' => $totalTokens,
            'costEur' => $totalCost
        ];

        array_unshift($logs, $entry);
        if (count($logs) > 5000) {
            $logs = array_slice($logs, 0, 5000);
        }

        @file_put_contents($file, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $entry;
    } catch (\Throwable $e) {
        return null;
    }
}

// -------------------------------------------------------------------------
// JSON-Parser für LLM-Antworten
// -------------------------------------------------------------------------
function extractJsonFromText($text) {
    if (empty($text)) return null;
    $clean = trim($text);
    if (strpos($clean, '```json') !== false) {
        $clean = preg_replace('/^```json\s*/i', '', $clean);
        $clean = preg_replace('/\s*```$/', '', $clean);
        $clean = trim($clean);
    } elseif (strpos($clean, '```') !== false) {
        $clean = preg_replace('/^```\s*/i', '', $clean);
        $clean = preg_replace('/\s*```$/', '', $clean);
        $clean = trim($clean);
    }

    $parsed = @json_decode($clean, true);
    if ($parsed !== null) return $parsed;

    $firstBracket = strpos($clean, '[');
    $lastBracket = strrpos($clean, ']');
    if ($firstBracket !== false && $lastBracket !== false && $lastBracket > $firstBracket) {
        $sub = substr($clean, $firstBracket, $lastBracket - $firstBracket + 1);
        $parsed = @json_decode($sub, true);
        if ($parsed !== null) return $parsed;
    }

    $firstBrace = strpos($clean, '{');
    $lastBrace = strrpos($clean, '}');
    if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
        $sub = substr($clean, $firstBrace, $lastBrace - $firstBrace + 1);
        $parsed = @json_decode($sub, true);
        if ($parsed !== null) return $parsed;
    }

    return null;
}

function getBaseMedName($name) {
    if (empty($name)) return 'text';
    $n = strtolower($name);
    $n = preg_replace('/\b\d+(\s*,\s*\d+)?\s*(mg|g|µg|ug|ml|ie)\b/i', '', $n);
    $n = preg_replace('/\b(al|ratiopharm|1a pharma|heumann|hexal|stada|pfizer|bayer|novartis|teva)\b/i', '', $n);
    $n = preg_replace('/[®™]/u', '', $n);
    return trim($n);
}

// -------------------------------------------------------------------------
// Ermittlung der Route
// -------------------------------------------------------------------------
$route = '';
if (!empty($_GET['route'])) {
    $route = trim($_GET['route'], '/');
} elseif (!empty($_GET['action'])) {
    $route = trim($_GET['action'], '/');
} elseif (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $route = trim($_SERVER['PATH_INFO'], '/');
} else {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $cleanUri = preg_replace('#^/api/#', '', $uri);
    $cleanUri = preg_replace('#^api/#', '', $cleanUri);
    $cleanUri = preg_replace('#^index\.php/#', '', $cleanUri);
    $cleanUri = preg_replace('#^.*/api/#', '', $cleanUri);
    $route = trim($cleanUri, '/');
}

// JSON-Body einlesen falls POST
$rawInput = file_get_contents('php://input');
$body = !empty($rawInput) ? @json_decode($rawInput, true) : [];

// =========================================================================
// ROUTE 1: HEALTH / STATUS
// =========================================================================
if ($route === 'health' || $route === 'status' || empty($route)) {
    $db = loadMedicationsDatabase();
    $key = getGeminiKey();
    echo json_encode([
        'status' => 'ok',
        'service' => 'HomeoPilot360 Hostinger Medication Bridge',
        'phpVersion' => PHP_VERSION,
        'geminiKeyConfigured' => !empty($key),
        'databaseMedicationsCount' => count($db),
        'serverTime' => date('c')
    ]);
    exit;
}

// =========================================================================
// ROUTE: COUNTRY & LANGUAGE DETECTION (/api/detect-country)
// =========================================================================
if ($route === 'detect-country' || $route === 'detect_country' || $route === 'country') {
    $cfCountry = $_SERVER['HTTP_CF_IPCOUNTRY'] ?? ($_SERVER['HTTP_X_COUNTRY_CODE'] ?? ($_SERVER['HTTP_X_APPENGINE_COUNTRY'] ?? ($_SERVER['GEOIP_COUNTRY_CODE'] ?? '')));
    $detectedCountry = !empty($cfCountry) && is_string($cfCountry) ? strtoupper(trim($cfCountry)) : '';

    if (empty($detectedCountry)) {
        $acceptLang = strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '');
        if (strpos($acceptLang, 'el') !== false || strpos($acceptLang, 'gr') !== false) {
            $detectedCountry = 'GR';
        } elseif (strpos($acceptLang, 'de') !== false) {
            $detectedCountry = 'DE';
        } elseif (strpos($acceptLang, 'fr') !== false) {
            $detectedCountry = 'FR';
        } elseif (strpos($acceptLang, 'es') !== false) {
            $detectedCountry = 'ES';
        } elseif (strpos($acceptLang, 'it') !== false) {
            $detectedCountry = 'IT';
        } elseif (strpos($acceptLang, 'ru') !== false) {
            $detectedCountry = 'RU';
        } elseif (strpos($acceptLang, 'en') !== false) {
            $detectedCountry = 'GB';
        }
    }

    $COUNTRY_LANG_MAP = [
        'GR' => 'el', 'CY' => 'el',
        'DE' => 'de', 'AT' => 'de', 'CH' => 'de', 'LI' => 'de',
        'FR' => 'fr', 'BE' => 'fr', 'MC' => 'fr', 'LU' => 'fr',
        'ES' => 'es', 'MX' => 'es', 'AR' => 'es', 'CO' => 'es', 'CL' => 'es', 'PE' => 'es',
        'IT' => 'it', 'SM' => 'it', 'VA' => 'it',
        'RU' => 'ru', 'BY' => 'ru', 'KZ' => 'ru',
        'GB' => 'en', 'US' => 'en', 'CA' => 'en', 'AU' => 'en', 'IE' => 'en',
    ];

    $finalCountry = !empty($detectedCountry) ? $detectedCountry : 'DE';
    $finalLanguage = $COUNTRY_LANG_MAP[$finalCountry] ?? 'de';

    echo json_encode([
        'countryCode' => $finalCountry,
        'language' => $finalLanguage,
        'detectedBy' => !empty($cfCountry) ? 'cf-header' : 'accept-language',
    ]);
    exit;
}

// =========================================================================
// ROUTE 2: MEDICATION SEARCH (/api/medications/search)
// =========================================================================
if ($route === 'medications/search' || $route === 'search') {
    $q = isset($_GET['q']) ? trim($_GET['q']) : (isset($body['query']) ? trim($body['query']) : (isset($body['q']) ? trim($body['q']) : ''));
    $lang = isset($_GET['lang']) ? trim($_GET['lang']) : (isset($body['lang']) ? trim($body['lang']) : 'de');

    if (empty($q)) {
        echo json_encode(['results' => [], 'fromDatabase' => false, 'totalInDb' => count(loadMedicationsDatabase())]);
        exit;
    }

    $force = (isset($_GET['force']) && ($_GET['force'] === '1' || $_GET['force'] === 'true'))
        || (isset($body['force']) && ($body['force'] === true || $body['force'] === 1 || $body['force'] === '1'));

    $db = loadMedicationsDatabase();
    $normQ = strtolower($q);

    // Schritt 1: Lokale Datenbank durchsuchen
    $exactMatches = [];
    $partialMatches = [];
    foreach ($db as $item) {
        $name = strtolower($item['name'] ?? '');
        $sub = strtolower($item['activeSubstance'] ?? '');
        $cat = strtolower($item['category'] ?? '');
        if ($name === $normQ || $sub === $normQ) {
            $item['fromDatabase'] = true;
            $exactMatches[] = $item;
        } elseif (strpos($name, $normQ) !== false || strpos($sub, $normQ) !== false || strpos($cat, $normQ) !== false) {
            $item['fromDatabase'] = true;
            $partialMatches[] = $item;
        }
    }

    $allMatches = array_merge($exactMatches, $partialMatches);

    // Limit to max 50 items to keep payload lightweight and prevent Hostinger firewall blocks
    if (count($allMatches) > 50) {
        $allMatches = array_slice($allMatches, 0, 50);
    }

    // TURBO-SPEED: Wenn NICHT forciert -> Sofortige Antwort aus der Datenbank in < 5ms!
    // Dadurch friert die Eingabe beim Tippen niemals ein.
    if (!$force) {
        sendJsonResponse([
            'results' => $allMatches,
            'fromDatabase' => true,
            'stepExecuted' => 'database_match',
            'totalInDb' => count($db)
        ]);
        exit;
    }

    // Schritt 2: Live-Internet-Recherche über Gemini (nur wenn explizit forciert mit force=1)
    $apiKey = getGeminiKey();
    if (!empty($apiKey)) {
        $langNames = [
            'de' => 'German (Deutsch)',
            'en' => 'English',
            'el' => 'Greek (Ελληνικά)',
            'es' => 'Spanish (Español)',
            'fr' => 'French (Français)',
            'it' => 'Italian (Italiano)',
            'ru' => 'Russian (Русский)'
        ];
        $targetLangName = $langNames[$lang] ?? 'German (Deutsch)';

        $prompt = "Du bist ein schnelles pharmazeutisches Suchsystem.
Finde das Medikament bzw. den Wirkstoff: \"{$q}\".
Ermittle schnell:
1. name: Offizieller Handelsname
2. activeSubstance: Wirkstoff (INN in {$targetLangName})
3. category: Wirkstoffgruppe in {$targetLangName}
4. dosages: Liste aller handelsüblichen Dosierungen (z.B. [\"20 mg\", \"40 mg\", \"80 mg\"])
5. commonForms: Darreichungsformen in {$targetLangName} (z.B. [\"Tabletten\", \"Kapseln\"])
6. recommendedIntake: Typische Einnahme in {$targetLangName} (z.B. \"1x täglich morgens\")

Antworte AUSSCHLIESSLICH mit einem kompakten JSON-Array:
[
  {
    \"name\": \"Handelsname\",
    \"activeSubstance\": \"Wirkstoff\",
    \"category\": \"Wirkstoffgruppe\",
    \"dosages\": [\"...\"],
    \"commonForms\": [\"...\"],
    \"recommendedIntake\": \"...\"
  }
]";

        $aiResponse = callGeminiApi($prompt, true);
        if ($aiResponse) {
            $parsed = extractJsonFromText($aiResponse);
            $newItems = [];
            if (is_array($parsed)) {
                if (isset($parsed['name'])) {
                    $newItems[] = $parsed;
                } else {
                    foreach ($parsed as $p) {
                        if (is_array($p) && !empty($p['name'])) {
                            $newItems[] = $p;
                        }
                    }
                }
            }

            if (!empty($newItems)) {
                saveToMedicationsDatabase($newItems);

                // Falls eine andere Sprache als Deutsch gewählt war, sichere das Objekt auch im Übersetzungscache
                if ($lang !== 'de') {
                    foreach ($newItems as $item) {
                        if (!empty($item['name'])) {
                            $dKey = strtolower(trim($item['name'])) . "_{$lang}";
                            $bKey = getBaseMedName($item['name']) . "_{$lang}";
                            saveMedicationTranslation($dKey, $item);
                            saveMedicationTranslation($bKey, $item);
                        }
                    }
                }

                // Live gefundene Treffer an den Anfang setzen, danach Teil-Treffer
                $merged = [];
                $seen = [];
                foreach ($newItems as $it) {
                    $key = strtolower($it['name'] ?? '');
                    if (!empty($key) && !isset($seen[$key])) {
                        $seen[$key] = true;
                        $it['fromDatabase'] = false;
                        $merged[] = $it;
                    }
                }
                foreach ($allMatches as $it) {
                    $key = strtolower($it['name'] ?? '');
                    if (!empty($key) && !isset($seen[$key])) {
                        $seen[$key] = true;
                        $it['fromDatabase'] = true;
                        $merged[] = $it;
                    }
                }

                echo json_encode([
                    'results' => $merged,
                    'fromDatabase' => false,
                    'stepExecuted' => 'authority_researched_and_saved',
                    'totalInDb' => count(loadMedicationsDatabase())
                ]);
                exit;
            }
        }
    }

    // Fallback: Datenbank-Treffer zurückgeben
    sendJsonResponse([
        'results' => $allMatches,
        'fromDatabase' => true,
        'stepExecuted' => 'database_match',
        'totalInDb' => count($db)
    ]);
    exit;
}

// =========================================================================
// ROUTE 3: MEDICATION DETAILS (/api/medications/details)
// =========================================================================
if ($route === 'medications/details' || $route === 'details') {
    $name = isset($_GET['name']) ? trim($_GET['name']) : (isset($body['name']) ? trim($body['name']) : '');
    $lang = isset($_GET['lang']) ? trim($_GET['lang']) : (isset($body['lang']) ? trim($body['lang']) : 'de');

    if (empty($name)) {
        echo json_encode(['details' => null, 'fromDatabase' => false, 'stepExecuted' => 'database_match']);
        exit;
    }

    $db = loadMedicationsDatabase();
    $normName = strtolower($name);

    $found = null;
    foreach ($db as $item) {
        if (isset($item['name']) && strtolower(trim($item['name'])) === $normName) {
            $found = $item;
            break;
        }
    }

    if (!$found) {
        foreach ($db as $item) {
            if (isset($item['name']) && strpos(strtolower($item['name']), $normName) !== false) {
                $found = $item;
                break;
            }
        }
    }

    // Falls gar nicht in lokaler DB oder nur Basis-Daten vorhanden, führe vollständige Behördensuche aus
    $isComplete = $found && (!empty($found['monographText']) || !empty($found['sideEffects']));
    if (!$found || !$isComplete) {
        $apiKey = getGeminiKey();
        if (!empty($apiKey)) {
            $langNames = [
                'de' => 'German (Deutsch)',
                'en' => 'English',
                'el' => 'Greek (Ελληνικά)',
                'es' => 'Spanish (Español)',
                'fr' => 'French (Français)',
                'it' => 'Italian (Italiano)',
                'ru' => 'Russian (Русский)'
            ];
            $targetLangName = $langNames[$lang] ?? 'German (Deutsch)';
            $prompt = "Du bist ein pharmazeutisches Informationssystem für klinisches Fachpersonal.
Recherchiere die offizielle behördliche Fachinformation (BfArM, EMA, FDA, EOF, Rote Liste) für: \"{$name}\".
SPRACHVORGABE: Alle Angaben, Beschreibungen, Nebenwirkungen, Wechselwirkungen, Kontraindikationen und die Monographie MÜSSEN zwingend und vollständig in {$targetLangName} formuliert werden!
WICHTIG: Keine Daten erfinden.
Antworte AUSSCHLIESSLICH mit einem validen JSON-Array mit 1 Objekt:
[
  {
    \"name\": \"{$name}\",
    \"activeSubstance\": \"Wirkstoff in {$targetLangName}\",
    \"category\": \"Wirkstoffklasse in {$targetLangName}\",
    \"dosages\": [\"...\"],
    \"packageSizes\": [\"...\"],
    \"commonForms\": [\"...\"],
    \"recommendedIntake\": \"Einnahmeempfehlung in {$targetLangName}\",
    \"sideEffectsByFrequency\": {
      \"veryCommon\": [\"...\"],
      \"common\": [\"...\"],
      \"uncommon\": [\"...\"],
      \"rare\": [\"...\"],
      \"veryRare\": [\"...\"]
    },
    \"sideEffects\": [\"...\"],
    \"interactions\": [\"...\"],
    \"contraindications\": {
      \"absolute\": [\"...\"],
      \"relative\": [\"...\"]
    },
    \"warnings\": \"Warnhinweise in {$targetLangName}\",
    \"monographText\": \"Ausführliche 5-teilige Fachinformation in {$targetLangName}...\",
    \"authoritySource\": \"Offizielle Fachinformation (BfArM / EMA / EOF)\"
  }
]";
            $aiRes = callGeminiApi($prompt, true);
            if ($aiRes) {
                $parsed = extractJsonFromText($aiRes);
                if (is_array($parsed)) {
                    $item = isset($parsed['name']) ? $parsed : ($parsed[0] ?? null);
                    if ($item && !empty($item['name'])) {
                        saveToMedicationsDatabase([$item]);
                        $found = is_array($found) ? array_merge($found, $item) : $item;
                    }
                }
            }
        }
    }

    if ($found) {
        // Mehrsprachigkeit: Übersetzung aller Felder & dauerhafte Speicherung
        if ($lang !== 'de') {
            $directKey = strtolower(trim($found['name'])) . "_{$lang}";
            $baseKey = getBaseMedName($found['name']) . "_{$lang}";
            $transCache = loadMedicationTranslations();

            $cachedEntry = $transCache[$directKey] ?? ($transCache[$baseKey] ?? null);

            if (!empty($cachedEntry)) {
                // Sofort aus dem permanenten Übersetzungscache laden (0 Millisekunden!)
                if (is_array($cachedEntry)) {
                    $found = array_merge($found, $cachedEntry);
                } elseif (is_string($cachedEntry)) {
                    $found['monographText'] = $cachedEntry;
                }
            } else {
                // Noch nicht in dieser Sprache übersetzt: Vollständige Übersetzung per Gemini durchführen
                // und dauerhaft in medication_translations.json sichern
                $apiKey = getGeminiKey();
                if (!empty($apiKey)) {
                    $langNames = [
                        'de' => 'German (Deutsch)',
                        'en' => 'English',
                        'el' => 'Greek (Ελληνικά)',
                        'es' => 'Spanish (Español)',
                        'fr' => 'French (Français)',
                        'it' => 'Italian (Italiano)',
                        'ru' => 'Russian (Русский)'
                    ];
                    $targetLangName = $langNames[$lang] ?? 'English';

                    $toTranslate = [
                        'activeSubstance' => $found['activeSubstance'] ?? '',
                        'category' => $found['category'] ?? '',
                        'recommendedIntake' => $found['recommendedIntake'] ?? '',
                        'sideEffectsByFrequency' => $found['sideEffectsByFrequency'] ?? null,
                        'sideEffects' => $found['sideEffects'] ?? [],
                        'interactions' => $found['interactions'] ?? [],
                        'contraindications' => $found['contraindications'] ?? null,
                        'warnings' => $found['warnings'] ?? '',
                        'monographText' => $found['monographText'] ?? ''
                    ];

                    $trPrompt = "You are a licensed clinical and medical translator.
Translate the following medication clinical data accurately into {$targetLangName}.
CRITICAL INSTRUCTIONS:
1. Translate all drug categories, active substance name, side effects, interactions, contraindications, warnings, and the 5-section monograph into {$targetLangName}.
2. Retain the exact JSON key structure.
3. Return ONLY a valid JSON object matching the input keys without any markdown wrappers.

Input JSON:
" . json_encode($toTranslate, JSON_UNESCAPED_UNICODE);

                    $trRes = callGeminiApi($trPrompt, false);
                    if ($trRes) {
                        $translatedObj = extractJsonFromText($trRes);
                        if (is_array($translatedObj) && (!empty($translatedObj['monographText']) || !empty($translatedObj['sideEffects']))) {
                            // Dauerhaft im Dateisystem sichern
                            saveMedicationTranslation($directKey, $translatedObj);
                            saveMedicationTranslation($baseKey, $translatedObj);
                            $found = array_merge($found, $translatedObj);
                        }
                    }
                }
            }
        }

        echo json_encode([
            'details' => $found,
            'fromDatabase' => true,
            'stepExecuted' => 'database_match'
        ]);
        exit;
    }

    echo json_encode(['details' => null, 'fromDatabase' => false, 'stepExecuted' => 'database_match']);
    exit;
}

// =========================================================================
// ROUTE 4: MEDICATION TRANSLATE (/api/medications/translate)
// =========================================================================
if ($route === 'medications/translate' || $route === 'translate') {
    $text = isset($body['text']) ? $body['text'] : '';
    $targetLang = isset($body['targetLang']) ? $body['targetLang'] : 'de';
    $medName = isset($body['medName']) ? $body['medName'] : 'text';

    if (empty($text) || !is_string($text)) {
        http_response_code(400);
        echo json_encode(['error' => 'text is required']);
        exit;
    }

    if ($targetLang === 'de') {
        echo json_encode(['translatedText' => $text, 'targetLang' => 'de', 'cached' => true]);
        exit;
    }

    $directKey = strtolower(trim($medName)) . "_{$targetLang}";
    $baseKey = getBaseMedName($medName) . "_{$targetLang}";
    $cache = loadMedicationTranslations();

    if (!empty($cache[$directKey])) {
        echo json_encode(['translatedText' => $cache[$directKey], 'targetLang' => $targetLang, 'cached' => true]);
        exit;
    }
    if (!empty($cache[$baseKey])) {
        echo json_encode(['translatedText' => $cache[$baseKey], 'targetLang' => $targetLang, 'cached' => true]);
        exit;
    }

    $apiKey = getGeminiKey();
    if (empty($apiKey)) {
        http_response_code(503);
        echo json_encode(['error' => 'GEMINI_API_KEY is not configured in api/config.php']);
        exit;
    }

    $langNames = [
        'de' => 'German',
        'en' => 'English',
        'el' => 'Greek (Ελληνικά)',
        'es' => 'Spanish (Español)',
        'fr' => 'French (Français)',
        'it' => 'Italian (Italiano)',
        'ru' => 'Russian (Русский)'
    ];
    $targetLangName = $langNames[$targetLang] ?? 'English';

    $trPrompt = "You are a licensed medical and pharmaceutical translator for clinical staff.\nTranslate the following official medication monograph into {$targetLangName}.\nCRITICAL: Maintain the exact 5-section structure and emoji headers. Output ONLY the translated monograph in {$targetLangName}.\n\n{$text}";

    $translated = callGeminiApi($trPrompt, false);
    if (!empty($translated) && strlen($translated) > 50) {
        saveMedicationTranslation($directKey, $translated);
        saveMedicationTranslation($baseKey, $translated);
        echo json_encode(['translatedText' => $translated, 'targetLang' => $targetLang, 'cached' => false]);
        exit;
    }

    echo json_encode(['translatedText' => $text, 'targetLang' => $targetLang, 'cached' => false]);
    exit;
}

// =========================================================================
// ROUTE 5: SITE CONFIG (/api/site/config & /api/site-config)
// =========================================================================
if ($route === 'site/config' || $route === 'site-config') {
    $siteConfigFile = getDataFilePath('site_config.json');
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $current = [];
        if (file_exists($siteConfigFile)) {
            $raw = @file_get_contents($siteConfigFile);
            $current = @json_decode($raw, true) ?: [];
        }
        $updated = array_merge(is_array($current) ? $current : [], is_array($body) ? $body : []);
        @file_put_contents($siteConfigFile, json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        sendJsonResponse($updated);
    }
    if (file_exists($siteConfigFile)) {
        $raw = @file_get_contents($siteConfigFile);
        $data = @json_decode($raw, true);
        if (is_array($data)) {
            sendJsonResponse($data);
        }
    }
    sendJsonResponse(new stdClass());
}

// =========================================================================
// ROUTE 6: EMAIL CONFIG (/api/email/config & /api/email-config)
// =========================================================================
if ($route === 'email/config' || $route === 'email-config' || $route === 'email/config/reset' || $route === 'email-config/reset') {
    $emailConfigFile = getDataFilePath('email_config.json');
    $defaultEmailSettings = [
        'smtpHost' => 'smtp.hostinger.com',
        'smtpPort' => 465,
        'smtpSecure' => 'ssl',
        'smtpUser' => 'therapie@homeopilot360.com',
        'smtpPass' => '',
        'senderEmail' => 'therapie@homeopilot360.com',
        'senderName' => 'HomeoPilot 360',
        'footerText' => 'Automatisch generiert durch HomeoPilot 360.'
    ];

    if (strpos($route, 'reset') !== false && $_SERVER['REQUEST_METHOD'] === 'POST') {
        @file_put_contents($emailConfigFile, json_encode($defaultEmailSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        sendJsonResponse($defaultEmailSettings);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $current = $defaultEmailSettings;
        if (file_exists($emailConfigFile)) {
            $raw = @file_get_contents($emailConfigFile);
            $parsed = @json_decode($raw, true);
            if (is_array($parsed)) $current = array_merge($current, $parsed);
        }
        $updated = array_merge($current, is_array($body) ? $body : []);
        $updated['updatedAt'] = date('c');
        @file_put_contents($emailConfigFile, json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        sendJsonResponse($updated);
    }

    if (file_exists($emailConfigFile)) {
        $raw = @file_get_contents($emailConfigFile);
        $data = @json_decode($raw, true);
        if (is_array($data) && !empty($data)) {
            sendJsonResponse($data);
        }
    }
    sendJsonResponse($defaultEmailSettings);
}

// =========================================================================
// ROUTE 7: ADMIN CREDENTIALS (/api/admin/credentials & /api/admin-credentials)
// =========================================================================
if ($route === 'admin/credentials' || $route === 'admin-credentials' || $route === 'admin/credentials/reset' || $route === 'admin-credentials/reset') {
    $credsFile = getDataFilePath('admin_credentials.json');
    $defaultCreds = [
        'username' => 'admin',
        'email' => 'admin@homeopilot360.com',
        'displayName' => 'Praxisleitung',
        'passwordHash' => ''
    ];
    if ($route === 'admin/credentials/reset' || $route === 'admin-credentials/reset') {
        @file_put_contents($credsFile, json_encode($defaultCreds, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode($defaultCreds);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $current = $defaultCreds;
        if (file_exists($credsFile)) {
            $raw = @file_get_contents($credsFile);
            $parsed = @json_decode($raw, true);
            if (is_array($parsed)) $current = array_merge($current, $parsed);
        }
        $updated = array_merge($current, is_array($body) ? $body : []);
        @file_put_contents($credsFile, json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode($updated);
        exit;
    }
    if (file_exists($credsFile)) {
        $raw = @file_get_contents($credsFile);
        $data = @json_decode($raw, true);
        if (is_array($data)) {
            echo json_encode($data);
            exit;
        }
    }
    echo json_encode($defaultCreds);
    exit;
}

// =========================================================================
// ROUTE 8: MEDICAL RELEVANCE FILTER (/api/check-medical-relevance)
// =========================================================================
if ($route === 'check-medical-relevance') {
    $text = isset($body['text']) ? trim($body['text']) : '';
    if (empty($text)) {
        echo json_encode(['isRelevant' => false, 'reason' => 'empty_text']);
        exit;
    }
    $apiKey = getGeminiKey();
    if (empty($apiKey)) {
        echo json_encode(['isRelevant' => true, 'reason' => 'no_api_key_passthrough']);
        exit;
    }
    $prompt = "Du bist ein strenger medizinischer Relevanzfilter für eine professionelle homöopathische Anamnese.
Prüfe folgende Aussage: \"{$text}\".
Antworte AUSSCHLIESSLICH im JSON-Format: {\"isRelevant\": true, \"reason\": \"Erklärung\"}";
    $aiRes = callGeminiApi($prompt, false);
    $parsed = $aiRes ? extractJsonFromText($aiRes) : null;
    if (is_array($parsed) && isset($parsed['isRelevant'])) {
        echo json_encode($parsed);
        exit;
    }
    echo json_encode(['isRelevant' => true, 'reason' => 'fallback']);
    exit;
}

// =========================================================================
// ROUTE 9: HAHNEMANN ORGANON §§ 83-104 ANAMNESE (/api/hahnemann-analysis)
// =========================================================================
if ($route === 'hahnemann-analysis' || $route === 'hahnemann/analysis') {
    $text = isset($body['text']) ? trim($body['text']) : '';
    if (empty($text)) {
        http_response_code(400);
        echo json_encode(['error' => 'text is required']);
        exit;
    }

    $apiKey = getGeminiKey();
    if (empty($apiKey)) {
        http_response_code(503);
        echo json_encode(['error' => 'GEMINI_API_KEY is not configured']);
        exit;
    }

    $currentMatrix = isset($body['currentMatrix']) && is_array($body['currentMatrix']) ? $body['currentMatrix'] : [];
    $conversationHistory = isset($body['conversationHistory']) && is_array($body['conversationHistory']) ? $body['conversationHistory'] : [];
    $language = isset($body['language']) ? $body['language'] : 'de';
    $forceComplete = !empty($body['forceComplete']);
    $caseType = isset($body['caseType']) ? $body['caseType'] : 'akut';

    $langNames = [
        'de' => 'German (Deutsch)',
        'en' => 'English',
        'el' => 'Greek (Ελληνικά)',
        'es' => 'Spanish (Español)',
        'fr' => 'French (Français)',
        'it' => 'Italian (Italiano)',
        'ru' => 'Russian (Русский)'
    ];
    $targetLanguageName = $langNames[$language] ?? 'German (Deutsch)';

    $currentStepCount = count($conversationHistory) + 1;
    $hasCausa = !empty($currentMatrix['causa']) && $currentMatrix['causa'] !== 'Noch nicht genannt';
    $hasLokalisierung = !empty($currentMatrix['lokalisierung']) && $currentMatrix['lokalisierung'] !== 'Noch nicht genannt';
    $hasEmpfindung = !empty($currentMatrix['empfindung']) && $currentMatrix['empfindung'] !== 'Noch nicht genannt';
    $hasModalitaeten = !empty($currentMatrix['modalitaeten']) && $currentMatrix['modalitaeten'] !== 'Noch nicht genannt';
    $hasBegleitsymptome = !empty($currentMatrix['begleitsymptome']) && is_array($currentMatrix['begleitsymptome']) && count($currentMatrix['begleitsymptome']) > 0;
    $hasGemuet = !empty($currentMatrix['gemuet']) && $currentMatrix['gemuet'] !== 'Noch nicht genannt';

    $all6PillarsFilled = $hasCausa && $hasLokalisierung && $hasEmpfindung && $hasModalitaeten && $hasBegleitsymptome && $hasGemuet;
    $maxStepsReached = count($conversationHistory) >= 7;
    $mustComplete = $forceComplete || $all6PillarsFilled || ($maxStepsReached && $hasGemuet && $hasModalitaeten && $hasEmpfindung && $hasCausa);

    $safeText = str_replace('"', '\"', $text);
    $escapedMatrix = json_encode($currentMatrix, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $escapedHistory = json_encode($conversationHistory, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $prompt = "Du bist die zentrale Logik-Engine für eine professionelle homöopathische Anamnese streng nach den Prinzipien von Samuel Hahnemann und den Paragraphen 83 bis 104 des Organon der Heilkunst.

### LEITLINIEN AUS DEM ORGANON DER HEILKUNST (§§ 83–104):
- § 83: Vorurteilslose Beobachtung und treue Aufnahme des Krankheitsbildes ohne Spekulationen.
- § 84: Der Patient schildert seine Beschwerden; die Begleiter berichten. Der Arzt hört aufmerksam zu, ohne zu unterbrechen.
- §§ 85–90: Gezieltes Nachfragen zur Präzisierung. Jedes Einzelsymptom wird isoliert abgefragt. Niemals Suggestivfragen stellen.
- §§ 91–93: Unterscheidung chronische vs. akute Krankheiten.
- § 94: Untersuchung von Lebensweise, Diät, Gemütszustand.
- § 99: Akute Krankheiten: Erfragung des unmittelbaren Anlasses/Auslösers (Causa), des Beginns und des bisherigen Verlaufs.
- §§ 100–102: Zusammenhängende / epidemische Erkrankungen: Erfassung des Gesamtbildes durch Verknüpfung der Symptome.
- §§ 103–104: Vollständiges Fixieren des Krankheitsbildes (Totalität der Symptome als Fundament des Simile).

### STRIKTE ANWEISUNG: BERÜCKSICHTIGUNG DES KONKRETEN PATIENTENSYMPTOMS & EXTRAKTION
1. Analysiere ZUERST die aktuelle Benutzereingabe (\"{$safeText}\") sowie die bestehende Matrix.
2. Wenn der Patient in seiner Eingabe bereits ein Symptom, eine Lokalisation, eine Empfindung, einen Auslöser/Causa oder Modalitäten genannt hat:
   - Extrahiere diese Fakten SOFORT in die entsprechenden Felder von \"wichtige_symptom_fragmente\"!
   - Frage NIEMALS nach einer Säule, die der Patient bereits genannt hat oder die in der bestehenden Matrix bereits vorhanden ist.
3. Die nächste Frage (\"naechste_frage\") MUSS das konkrete Symptom des Patienten IMMER namentlich aufgreifen (z. B. \"Zu Ihren Kopfschmerzen: ...\", in der Zielsprache).
4. Frage immer gezielt nach der nächsten TATSÄCHLICH NOCH FEHLENDEN Säule!

### URSÄCHLICHER ZUSAMMENHANG BEI MEHREREN BESCHWERDEN:
Bei der Aufnahme mehrerer Beschwerden (z. B. Fieber und Halsschmerzen) prüfst du IMMER zuerst, ob ein ursächlicher Zusammenhang besteht. Hinterfrage, ob beide durch denselben Auslöser/Infekt hervorgerufen wurden, um sie als zusammenhängenden Komplex zu erfassen.

Soll jetzt abgeschlossen werden? " . ($mustComplete ? "JA (Abschluss der Organon-Anamnese)" : "NEIN (nächste Frage stellen)") . ".

### AUSGABE-FORMAT (Strikte JSON-Struktur):
Antworte AUSSCHLIESSLICH mit validem JSON in genau diesem Format (ohne Markdown, ohne Text davor oder danach):
{
  \"analyse_status\": \"" . ($mustComplete ? "completed" : "in_progress") . "\",
  \"wichtige_symptom_fragmente\": {
    \"causa\": null,
    \"lokalisierung\": null,
    \"empfindung\": null,
    \"modalitaeten\": null,
    \"begleitsymptome\": [],
    \"gemuet\": null,
    \"strahlungsoptionen\": null,
    \"ursaechlicher_zusammenhang\": null,
    \"fruehere_behandlungen_und_historie\": null
  },
  \"falltyp\": \"{$caseType}\",
  \"mehrere_symptome_erkannt\": false,
  \"symptomkomplex_bestaetigt\": false,
  \"ignorierte_daten\": [],
  \"kontroll_und_nachfrage_logik\": \"Begründung nach Organon §§ 83-104\",
  \"naechste_frage\": \"" . ($mustComplete ? "" : "Hier steht genau eine gezielte Einzelfrage zur fehlenden Säule") . "\",
  \"auswahl_optionen\": " . ($mustComplete ? "[]" : '["Option 1", "Option 2", "Option 3", "Option 4"]') . ",
  \"auswahl_typ\": \"multiple\",
  \"aktuelle_mittel_differenzierung\": [\"Aconitum napellus\", \"Belladonna\", \"Bryonia alba\"],
  \"end_analyse_zusammenfassung\": " . ($mustComplete ? '"Zusammenfassung für den Therapeuten: ..."' : "null") . ",
  \"sich_ergebende_fragen\": []
}

Bestehende Matrix:
{$escapedMatrix}

Bisheriger Verlauf:
{$escapedHistory}

Aktuelle Benutzereingabe:
\"{$safeText}\"

SPRACHE: Alle Fragen, Optionen und Zusammenfassungen in {$targetLanguageName} formulieren. Arzneimittelnamen stets in offiziellem Latein.";

    $aiRes = callGeminiApi($prompt, false);
    if ($aiRes) {
        $parsed = extractJsonFromText($aiRes);
        if (is_array($parsed) && isset($parsed['wichtige_symptom_fragmente'])) {
            if ($mustComplete) {
                $parsed['analyse_status'] = 'completed';
                $parsed['naechste_frage'] = '';
                $parsed['auswahl_optionen'] = [];
            }
            echo json_encode(['result' => $parsed]);
            exit;
        }
    }

    http_response_code(500);
    echo json_encode(['error' => 'Failed to perform Hahnemann analysis via AI']);
    exit;
}

// =========================================================================
// ROUTE: ORGANON SEMANTISCHE ANALYSE (/api/organon/analyze)
// =========================================================================
if ($route === 'organon/analyze' || $route === 'api/organon/analyze') {
    $rawText = isset($body['rawText']) ? trim($body['rawText']) : '';
    $language = isset($body['language']) ? $body['language'] : 'de';

    if (empty($rawText)) {
        http_response_code(400);
        echo json_encode(['error' => 'rawText is required']);
        exit;
    }

    $apiKey = getGeminiKey();
    
    // Default fallback structure
    $defaultAnalysis = [
        'raw_text' => $rawText,
        'semantic_events' => [
            [
                'event_id' => 'ev_1',
                'actor' => 'Patient',
                'action' => 'Bericht',
                'event_type' => 'ACTION',
                'time' => 'UNKNOWN',
                'location' => 'UNKNOWN',
                'duration' => 'UNKNOWN',
                'attributes' => (object)[],
                'evidence_span_ids' => ['span_1'],
                'status' => 'CONFIRMED'
            ]
        ],
        'semantic_relations' => [],
        'open_slots' => [
            [
                'slot_id' => 'slot_1',
                'related_id' => 'comp_1',
                'field' => 'location',
                'importance' => 'HIGH',
                'status' => 'OPEN',
                'suggested_question' => 'Wo genau spüren Sie das Beschriebene?'
            ]
        ],
        'source_spans' => [
            [
                'span_id' => 'span_1',
                'exact_text' => $rawText,
                'type' => 'COMPLAINT'
            ]
        ],
        'entities' => [
            [
                'entity_id' => 'ent_1',
                'patient_label' => $rawText,
                'status' => 'CONFIRMED',
                'evidence_span_ids' => ['span_1']
            ]
        ],
        'uncertainties' => [],
        'claims' => [
            [
                'claim_id' => 'claim_1',
                'subject_entity_id' => 'ent_1',
                'attribute' => 'presence',
                'value' => 'present',
                'status' => 'CONFIRMED',
                'evidence_span_ids' => ['span_1']
            ]
        ],
        'temporal_bindings' => [],
        'symptom_states' => [
            [
                'state_id' => 'state_1',
                'subject_entity_id' => 'ent_1',
                'presence' => 'PRESENT',
                'intensity_text' => 'UNKNOWN',
                'time_expression' => 'UNKNOWN',
                'source_claim_ids' => ['claim_1'],
                'source_temporal_binding_ids' => [],
                'status' => 'CONFIRMED'
            ]
        ],
        'corrections' => [],
        'contradictions' => [],
        'next_question' => [
            'question_id' => 'q_1',
            'text' => 'Bitte beschreiben Sie genauer, wie sich die Beschwerden anfühlen und welche Modalitäten (Wärme, Kälte, Bewegung) sie beeinflussen.',
            'reason_code' => 'ORGANON_MODALITY',
            'related_entity_id' => 'ent_1',
            'related_claim_ids' => ['claim_1'],
            'related_contradiction_id' => null,
            'status' => 'OPEN'
        ],
        'validation' => [
            'is_valid' => true,
            'is_complete' => false,
            'blocking_issues' => [],
            'warnings' => []
        ],
        'hahnemann_analysis' => [
            'analysis_status' => 'INCOMPLETE',
            'characteristic_features' => [],
            'general_features' => [],
            'modalities' => [],
            'concomitants' => [],
            'course_features' => [],
            'missing_information' => ['Location', 'Sensation', 'Modalities'],
            'organon_references' => ['§§83–104', '§84']
        ],
        'selection_for_remedy_analysis' => [
            'status' => 'READY',
            'selected_features' => [],
            'excluded_features' => [],
            'blocking_reasons' => []
        ],
        'remedy_retrieval' => [
            'status' => 'READY',
            'feature_queries' => [],
            'repertory_matches' => [],
            'materia_medica_matches' => [],
            'warnings' => []
        ],
        'repertory_scoring' => [
            'status' => 'READY',
            'feature_weights' => [],
            'remedy_scores' => [],
            'warnings' => []
        ],
        'complaint_matrices' => [
            [
                'complaint_id' => 'comp_1',
                'patient_label' => $rawText,
                'temporal_status' => 'NEW_CURRENT',
                'complaint_type' => 'INDEX_COMPLAINT',
                'onset' => 'aktuell',
                'duration' => 'vorliegend',
                'course' => 'akut',
                'causa' => null,
                'location' => null,
                'sensation' => null,
                'modalities' => [],
                'concomitants' => [],
                'mind' => null,
                'intensity' => null,
                'frequency' => null,
                'negations' => [],
                'uncertainties' => [],
                'relation_to_current_episode' => 'INDEX',
                'evidence_span_ids' => ['span_1']
            ]
        ],
        'complaint_relations' => []
    ];

    if (!empty($apiKey)) {
        $escapedText = addcslashes($rawText, '"\\');
        $prompt = "Du bist ein präziser NLP- und Text-Parser für homöopathische Fallschilderungen im Organon-Testbetrieb nach Hahnemann (§§ 83-104).
Deine Aufgabe ist es, den übergebenen Patiententext sprachlich und semantisch tief zu zerlegen.
Text: \"{$escapedText}\"

Antworte AUSSCHLIESSLICH als gültiges JSON-Objekt ohne Markdown:
{
  \"raw_text\": \"{$escapedText}\",
  \"complaint_matrices\": [
    {
      \"complaint_id\": \"comp_1\",
      \"patient_label\": \"Beschwerdebezeichnung\",
      \"temporal_status\": \"NEW_CURRENT\",
      \"complaint_type\": \"INDEX_COMPLAINT\",
      \"onset\": \"Zeitpunkt\",
      \"duration\": \"Dauer\",
      \"course\": \"akut\",
      \"causa\": null,
      \"location\": \"Ort\",
      \"sensation\": \"Empfindung\",
      \"modalities\": [],
      \"concomitants\": [],
      \"mind\": null,
      \"intensity\": \"Intensität\",
      \"frequency\": \"Häufigkeit\",
      \"negations\": [],
      \"uncertainties\": [],
      \"relation_to_current_episode\": \"INDEX\",
      \"evidence_span_ids\": [\"span_1\"]
    }
  ],
  \"complaint_relations\": [],
  \"semantic_events\": [
    { \"event_id\": \"ev_1\", \"actor\": \"Patient\", \"action\": \"...\", \"event_type\": \"ACTION\", \"time\": \"UNKNOWN\", \"location\": \"UNKNOWN\", \"duration\": \"UNKNOWN\", \"attributes\": {}, \"evidence_span_ids\": [\"span_1\"], \"status\": \"CONFIRMED\" }
  ],
  \"semantic_relations\": [],
  \"open_slots\": [
    { \"slot_id\": \"slot_1\", \"related_id\": \"comp_1\", \"field\": \"location\", \"importance\": \"HIGH\", \"status\": \"OPEN\", \"suggested_question\": \"Wo genau spüren Sie das Beschriebene?\" }
  ],
  \"source_spans\": [
    { \"span_id\": \"span_1\", \"exact_text\": \"...\", \"type\": \"COMPLAINT\" }
  ],
  \"entities\": [
    { \"entity_id\": \"ent_1\", \"patient_label\": \"...\", \"status\": \"CONFIRMED\", \"evidence_span_ids\": [\"span_1\"] }
  ],
  \"uncertainties\": [],
  \"claims\": [
    { \"claim_id\": \"claim_1\", \"subject_entity_id\": \"ent_1\", \"attribute\": \"...\", \"value\": \"...\", \"status\": \"CONFIRMED\", \"evidence_span_ids\": [\"span_1\"] }
  ],
  \"temporal_bindings\": [],
  \"symptom_states\": [
    { \"state_id\": \"state_1\", \"subject_entity_id\": \"ent_1\", \"presence\": \"PRESENT\", \"intensity_text\": \"...\", \"time_expression\": \"...\", \"source_claim_ids\": [\"claim_1\"], \"source_temporal_binding_ids\": [], \"status\": \"CONFIRMED\" }
  ],
  \"corrections\": [],
  \"contradictions\": [],
  \"next_question\": {
    \"question_id\": \"q_1\",
    \"text\": \"Konkrete nächste Frage\",
    \"reason_code\": \"ORGANON_MODALITY\",
    \"related_entity_id\": \"ent_1\",
    \"related_claim_ids\": [\"claim_1\"],
    \"related_contradiction_id\": null,
    \"status\": \"OPEN\"
  },
  \"validation\": {
    \"is_valid\": true,
    \"is_complete\": false,
    \"blocking_issues\": [],
    \"warnings\": []
  },
  \"hahnemann_analysis\": {
    \"analysis_status\": \"READY\",
    \"characteristic_features\": [],
    \"general_features\": [],
    \"modalities\": [],
    \"concomitants\": [],
    \"course_features\": [],
    \"missing_information\": [],
    \"organon_references\": [\"§§83–104\"]
  },
  \"selection_for_remedy_analysis\": {
    \"status\": \"READY\",
    \"selected_features\": [],
    \"excluded_features\": [],
    \"blocking_reasons\": []
  },
  \"remedy_retrieval\": {
    \"status\": \"READY\",
    \"feature_queries\": [],
    \"repertory_matches\": [],
    \"materia_medica_matches\": [],
    \"warnings\": []
  },
  \"repertory_scoring\": {
    \"status\": \"READY\",
    \"feature_weights\": [],
    \"remedy_scores\": [],
    \"warnings\": []
  }
}";

        $aiRes = callGeminiApi($prompt, false);
        if ($aiRes) {
            $parsed = extractJsonFromText($aiRes);
            if (is_array($parsed) && (isset($parsed['complaint_matrices']) || isset($parsed['entities']) || isset($parsed['raw_text']))) {
                echo json_encode(array_merge($defaultAnalysis, $parsed), JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }

    echo json_encode($defaultAnalysis, JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// ROUTE: ORGANON EINZELFRAGEN-DIALOG (/api/organon/next-question)
// =========================================================================
if ($route === 'organon/next-question' || $route === 'api/organon/next-question') {
    $rawText = isset($body['rawText']) ? trim($body['rawText']) : '';
    $currentMatrices = isset($body['currentMatrices']) && is_array($body['currentMatrices']) ? $body['currentMatrices'] : [];
    $currentRelations = isset($body['currentRelations']) && is_array($body['currentRelations']) ? $body['currentRelations'] : [];
    $questionHistory = isset($body['questionHistory']) && is_array($body['questionHistory']) ? $body['questionHistory'] : [];
    $latestAnswer = isset($body['latestAnswer']) ? trim($body['latestAnswer']) : '';
    $currentQuestion = isset($body['currentQuestion']) ? trim($body['currentQuestion']) : '';

    $defaultNext = [
        'updatedMatrices' => $currentMatrices,
        'updatedRelations' => $currentRelations,
        'nextQuestion' => [
            'question_id' => 'q_' . (count($questionHistory) + 1),
            'text' => 'Wann traten die Beschwerden genau auf und wodurch werden sie gebessert oder verschlechtert?',
            'reason' => 'Erfassung der Begleitumstände und Modalitäten nach Organon.'
        ],
        'isFinished' => false,
        'summary' => 'Matrix aktualisiert'
    ];

    $apiKey = getGeminiKey();
    if (!empty($apiKey)) {
        $matricesJson = json_encode($currentMatrices, JSON_UNESCAPED_UNICODE);
        $relationsJson = json_encode($currentRelations, JSON_UNESCAPED_UNICODE);
        $historyJson = json_encode($questionHistory, JSON_UNESCAPED_UNICODE);

        $prompt = "Du bist der historische homöopathische Anamnese-Assistent nach Hahnemann und Bönninghausen (Organon §§ 83–104).
Deine Aufgabe ist es, einen dynamischen, schrittweisen Einzelfragen-Dialog auf Grundlage der vorhandenen Symptommatrix zu steuern.

Ursprüngliche Schilderung: \"{$rawText}\"
Bisherige Frage-Antwort-Historie: {$historyJson}
Aktuelle Symptommatrizen: {$matricesJson}
Aktuelle Beschwerderelationen: {$relationsJson}
Zuletzt gestellte Frage: \"{$currentQuestion}\"
Letzte Antwort des Patienten: \"{$latestAnswer}\"

REGELN:
1. Aktualisiere die Matrizen strikt auf Basis der Patientenantwort.
2. Formuliere GENAU EINE nächste einzelne Frage nach dem Ein-Frage-Prinzip.
3. Falls alle wesentlichen Aspekte geklärt sind, setze isFinished auf true.

Antworte AUSSCHLIESSLICH als gültiges JSON-Objekt:
{
  \"updatedMatrices\": [ ... ],
  \"updatedRelations\": [ ... ],
  \"nextQuestion\": {
    \"question_id\": \"q_next\",
    \"text\": \"Einzelne Frage\",
    \"target_complaint_id\": \"comp_1\",
    \"target_field\": \"modalitaeten\",
    \"reason\": \"Begründung\"
  },
  \"isFinished\": false,
  \"summary\": \"Zusammenfassung\"
}";

        $aiRes = callGeminiApi($prompt, false);
        if ($aiRes) {
            $parsed = extractJsonFromText($aiRes);
            if (is_array($parsed) && isset($parsed['nextQuestion'])) {
                echo json_encode(array_merge($defaultNext, $parsed), JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }

    echo json_encode($defaultNext, JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// ROUTE 10: 5-SCHRITTE-AKUT-REPERTORISATION (/api/acute-repertorise)
// =========================================================================
if ($route === 'acute-repertorise' || $route === 'acute/repertorise') {
    $symptomText = isset($body['symptomText']) ? trim($body['symptomText']) : '';
    if (empty($symptomText)) {
        http_response_code(400);
        echo json_encode(['error' => 'symptomText is required']);
        exit;
    }

    $apiKey = getGeminiKey();
    if (empty($apiKey)) {
        http_response_code(503);
        echo json_encode(['error' => 'GEMINI_API_KEY is not configured']);
        exit;
    }

    $language = isset($body['language']) ? $body['language'] : 'de';
    $langNames = [
        'de' => 'German (Deutsch)',
        'en' => 'English',
        'el' => 'Greek (Ελληνικά)',
        'es' => 'Spanish (Español)',
        'fr' => 'French (Français)',
        'it' => 'Italian (Italiano)',
        'ru' => 'Russian (Русский)'
    ];
    $targetLanguageName = $langNames[$language] ?? 'German (Deutsch)';
    $safeSymptom = str_replace('"', '\"', $symptomText);

    $prompt = "Du bist das logische Hintergrund-Modul (Backend-Engine) einer bestehenden Homöopathie-App zur hochpräzisen, unvoreingenommenen Akutanalyse nach Hahnemanns Organon §§ 83–104 und Kent.
Eingabetext: \"{$safeSymptom}\"
Zielsprache: {$targetLanguageName}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt (ohne Markdown, ohne Fließtext):
{
  \"extraktion\": {
    \"hauptbeschwerde\": \"Leitsymptom\",
    \"causa\": \"Causa oder Unbekannt (Bitte erfragen)\",
    \"modalitaeten\": \"Modalitäten oder Unbekannt (Bitte erfragen)\",
    \"begleitsymptome\": \"Begleitsymptome oder Unbekannt (Bitte erfragen)\"
  },
  \"app_layout_daten\": {
    \"optimales_simile\": \"Name des Hauptmittels in Latein oder Fehlende Daten für Empfehlung\",
    \"begruendung\": \"Kurze Begründung\"
  },
  \"diagnose_fragen_fuer_therapeut\": {
    \"frage_1\": \"Leitfrage zu Modalitäten ODER eigene freie Beschreibung des Patienten (Originalworte)\",
    \"frage_2\": \"Leitfrage zu Begleitsymptomen ODER eigene freie Beschreibung des Patienten (Originalworte)\"
  },
  \"baumstruktur_popup_daten\": {
    \"start_knoten\": \"Ausgangssymptom\",
    \"haupt_differenzierungs_frage\": \"Differenzierungsfrage\",
    \"pfad_ja\": {
      \"bedingung\": \"Wenn ja\",
      \"folge_frage\": \"Nächste Frage\",
      \"ergebnis_ja\": \"Mittel\",
      \"ergebnis_nein\": \"Unvollständig\"
    },
    \"pfad_nein\": {
      \"bedingung\": \"Wenn nein\",
      \"folge_frage\": \"Warte auf Eingabe\",
      \"ergebnis_ja\": \"Unvollständig\",
      \"ergebnis_nein\": \"Unvollständig\"
    }
  }
}";

    $aiRes = callGeminiApi($prompt, false);
    if ($aiRes) {
        $raw = extractJsonFromText($aiRes);
        if (is_array($raw)) {
            $extraktion = $raw['extraktion'] ?? [
                'hauptbeschwerde' => $symptomText,
                'causa' => 'Unbekannt (Bitte erfragen)',
                'modalitaeten' => 'Unbekannt (Bitte erfragen)',
                'begleitsymptome' => 'Unbekannt (Bitte erfragen)'
            ];
            $app_layout_daten = $raw['app_layout_daten'] ?? [
                'optimales_simile' => 'Fehlende Daten für Empfehlung',
                'begruendung' => 'Informationen zur Differenzierung erforderlich.'
            ];
            $normalizedResult = [
                'extraktion' => $extraktion,
                'app_layout_daten' => $app_layout_daten,
                'diagnose_fragen_fuer_therapeut' => $raw['diagnose_fragen_fuer_therapeut'] ?? [
                    'frage_1' => 'Welche Modalitäten liegen vor?',
                    'frage_2' => 'Gibt es Begleitsymptome?'
                ],
                'baumstruktur_popup_daten' => $raw['baumstruktur_popup_daten'] ?? null,
                'extractedAnalysis' => $extraktion,
                'recommendedSimile' => [
                    'remedyName' => $app_layout_daten['optimales_simile'] ?? 'Fehlende Daten für Empfehlung',
                    'rationale' => $app_layout_daten['begruendung'] ?? ''
                ]
            ];
            echo json_encode(['result' => $normalizedResult]);
            exit;
        }
    }

    http_response_code(500);
    echo json_encode(['error' => 'Failed to repertorise via AI']);
    exit;
}

// =========================================================================
// ROUTE 11: CLINICAL PHARMACOLOGY COMPARISON (/api/medications/clinical-comparison)
// =========================================================================
if ($route === 'medications/clinical-comparison' || $route === 'clinical-comparison') {
    $patientCase = isset($body['patientCase']) ? $body['patientCase'] : [];
    $lifestyle = isset($body['lifestyle']) ? $body['lifestyle'] : [];
    $language = isset($body['language']) ? $body['language'] : 'de';

    $meds = isset($patientCase['medikamenteList']) && is_array($patientCase['medikamenteList']) ? $patientCase['medikamenteList'] : [];

    $langNames = [
        'de' => 'German (Deutsch)',
        'en' => 'English',
        'el' => 'Greek (Ελληνικά)',
        'es' => 'Spanish (Español)',
        'fr' => 'French (Français)',
        'it' => 'Italian (Italiano)',
        'ru' => 'Russian (Русский)'
    ];
    $targetLanguageName = $langNames[$language] ?? 'German (Deutsch)';

    $isSmoker = !empty($lifestyle['isSmoker']) || (isset($lifestyle['smokingStatus']) && $lifestyle['smokingStatus'] === 'smoker');
    $hasAlcohol = !empty($lifestyle['alcoholDaily']) || (isset($lifestyle['alcoholFrequency']) && $lifestyle['alcoholFrequency'] !== 'never');

    $patientName = $patientCase['patientName'] ?? 'Anonym';
    $alter = $patientCase['geburtsdatum'] ?? 'nicht angegeben';
    $geschlecht = $patientCase['geschlecht'] ?? 'weiblich';
    $gewicht = $lifestyle['bodyWeightKg'] ?? ($patientCase['befundDetails']['gewicht'] ?? 70);
    $groesse = $lifestyle['bodyHeightCm'] ?? ($patientCase['patientHeightCm'] ?? ($patientCase['befundDetails']['groesse'] ?? 170));
    $bmi = isset($lifestyle['bmi']) ? $lifestyle['bmi'] . ' kg/m²' : 'Standard';
    $isPregnant = !empty($lifestyle['isPregnant']);
    $pregMonth = $lifestyle['pregnancyMonth'] ?? ($patientCase['pregnancyMonth'] ?? 1);
    $pregText = $isPregnant ? "Ja, {$pregMonth}. Schwangerschaftsmonat" : 'Nein / nicht schwanger';
    $smokerText = $isSmoker ? 'Ja (Raucher)' : 'Nein (Nichtraucher)';
    $alcoholText = $hasAlcohol ? 'Ja (Alkoholkonsum angegeben)' : 'Nein (Kein Alkoholkonsum)';

    $medsJson = json_encode($meds, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $prompt = "Du bist ein führender klinischer Pharmakologe und international anerkannter Experte für Arzneimittelsicherheit. Deine Aufgabe ist es, komplexe Patientenprofile, bestehend aus Mehrfachmedikation (inkl. Dosis), Patientendaten (Alter, Geschlecht, Gewicht, Größe, BMI), Schwangerschaftsstatus (inkl. genauer Woche/Monat) und Lebensstilfaktoren (Alkohol ja/nein, Rauchen ja/nein), auf kombinierte Risiken zu analysieren.

SPRACHANFORDERUNG (STRIKT & VERPFLICHTEND):
Verfasse die gesamte klinische Analyse und alle Textabschnitte, Überschriften, Tabellenköpfe und Empfehlungen VOLLSTÄNDIG in der Sprache: {$targetLanguageName}.
Verwende die authentische, exakte medizinisch-pharmakologische Fachterminologie in dieser Sprache ({$targetLanguageName}).

Befolge für eine fehlerfreie, professionelle und evidenzbasierte Auswertung strikt folgende medizinisch-fachliche Vorgaben:
1. KEINE ISOLIERTE BETRACHTUNG: Analysiere die kumulative Gesamtwirkung aller verordneten Medikamente und patientenspezifischen Faktoren als Gesamtsynergie im Körper.
2. ALKOHOL & RAUCHEN (BINÄRE PARAMETER & INTERAKTIONSFOKUS):
   - Alkohol und Rauchen werden AUSSCHLIESSLICH binär erfasst (Ja oder Nein). Gib NIEMALS Milligramm-Angaben (mg/Tag) oder Zigarettenmengen aus.
   - Weise generell NUR DANN auf Gefahren durch Alkohol oder Rauchen hin, wenn diese in direktem Zusammenhang mit den eingenommenen Medikamenten stehen (Wechselwirkungen, Wirkungsverstärkung oder -minderung) ODER bei Schwangeren.
   - Bei Schwangeren weise mit erhöhter Priorität auf die gravierenden Gefahren hin (teratogene Risiken, FASD, fetale Schädigungen, intrauterine Wachstumsretardierung).
   - Falls keine direkte Wechselwirkung mit den Medikamenten vorliegt und keine Schwangerschaft besteht, stelle klar, dass keine direkte pharmakologische Interaktion mit der aktuellen Medikation vorliegt.
3. ÜBERGEWICHT & KÖRPERBAU (PHARMAKOKINETIK & DOSIERUNGSRELEVANZ):
   - Berücksichtige den Faktor Übergewicht/Körperbau NUR DANN, wenn er einen direkten Einfluss auf die Pharmakokinetik oder die Dosierung der ausgewählten Medikamente hat.
4. TRIMESTRALE SPEZIFITÄT: Bei Schwangerschaft schlüssle das exakte Risiko für den spezifischen Schwangerschaftsmonat (bzw. das Trimenon) sowohl für die Mutter als auch embryotoxikologisch für den Fötus auf.
5. ABSOLUTES HALLUZINATIONSVERBOT: Du darfst nur medizinisch und wissenschaftlich gesicherte Interaktionen nennen.
6. SAUBERE TABELLENFORMATIERUNG (GFM): Verwende saubere, geschlossene Markdown-Tabellen.

PATIENTENDATEN & PROFIL:
- Patient/in: {$patientName}
- Alter: {$alter}
- Geschlecht: {$geschlecht}
- Körpergewicht: {$gewicht} kg
- Körpergröße: {$groesse} cm
- Body-Mass-Index (BMI): {$bmi}
- Schwangerschaft: {$pregText}
- Rauchen: {$smokerText}
- Alkoholkonsum: {$alcoholText}

VERORDNETE MEDIKAMENTE:
{$medsJson}

Generiere den Output EXAKT in folgender Struktur in der Zielsprache ({$targetLanguageName}):

### ⚠️ [WICHTIGER MEDIZINISCHER WARNHINWEIS / IMPORTANT MEDICAL NOTICE]
(Verfasse den Hinweis in {$targetLanguageName}, dass diese Analyse der Risiko-Früherkennung dient und keine ärztliche Konsultation ersetzt.)

### 1. [KLINISCHE DRINGLICHKEIT (Triage) / CLINICAL TRIAGE]
Gib eine klare, ganzheitliche Einstufung des Gesamtrisikos an.
WICHTIG: Die Beurteilung MUSS zwingend ALLE vorhandenen Daten gleichzeitig berücksichtigen und würdigen.
Verwende am Anfang genau eines der folgenden Schlüsselwörter:
- [KRITISCH / AKUTE LEBENSGEFAHR] (oder in {$targetLanguageName}: [CRITICAL] / [ΚΡΙΣΙΜΟ] etc.)
ODER
- [HOCH] (oder in {$targetLanguageName}: [HIGH] / [ΥΨΗΛΟ] etc.)
ODER
- [GERING / ÜBERWACHUNG] (oder in {$targetLanguageName}: [LOW] / [ΧΑΜΗΛΟ] etc.)

### 2. [INTEGRATIVE RISIKO-MATRIX / RISK MATRIX]
Erstelle eine saubere Markdown-Tabelle im GFM-Format.

### 3. [DIAGNOSTISCHER LEITFADEN FÜR DEN ARZTBESUCH / CLINICAL GUIDELINE]
Checkliste für den Patienten:
- Konkrete Fragen an den behandelnden Arzt
- Dringende Labor-/Untersuchungs-Anforderungen
- Alarmsymptome
";

    $rawText = callGeminiApi($prompt, false);
    if ($rawText) {
        $upper = mb_strtoupper($rawText);
        $triageLevel = 'low';
        $triageLabel = '[GERING / ÜBERWACHUNG]';

        if (
            strpos($upper, 'KRITISCH') !== false ||
            strpos($upper, 'CRITICAL') !== false ||
            strpos($upper, 'ΚΡΙΣΙΜ') !== false ||
            strpos($upper, 'CRÍTICO') !== false ||
            strpos($upper, 'CRITIQUE') !== false ||
            strpos($upper, 'КРИТИЧЕСК') !== false
        ) {
            $triageLevel = 'critical';
            $triageLabel = '[KRITISCH / AKUTE LEBENSGEFAHR]';
        } elseif (
            strpos($upper, 'HOCH') !== false ||
            strpos($upper, 'HIGH') !== false ||
            strpos($upper, 'ΥΨΗΛ') !== false ||
            strpos($upper, 'ALTO') !== false ||
            strpos($upper, 'ÉLEVÉ') !== false ||
            strpos($upper, 'ELEVE') !== false ||
            strpos($upper, 'ВЫСОК') !== false
        ) {
            $triageLevel = 'high';
            $triageLabel = '[HOCH]';
        }

        $medsSummary = array_map(function($m) {
            $n = $m['name'] ?? 'Medikament';
            $d = $m['dosierung'] ?? 'Standard';
            return "{$n} ({$d})";
        }, $meds);

        echo json_encode([
            'analyzedAt' => date('c'),
            'triageLevel' => $triageLevel,
            'triageLabel' => $triageLabel,
            'markdownContent' => $rawText,
            'medicationsSummary' => $medsSummary,
            'patientProfileSummary' => [
                'gender' => $geschlecht,
                'isPregnant' => $isPregnant,
                'pregnancyMonth' => $pregMonth
            ]
        ]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['error' => 'Klinische Pharmakologie-Analyse konnte nicht durchgeführt werden.']);
    exit;
}

// =========================================================================
// ROUTE 12: CLINICAL ANALYSIS (/api/analyze)
// =========================================================================
if ($route === 'analyze') {
    $caseData = isset($body['caseData']) ? $body['caseData'] : [];
    $language = isset($body['language']) ? $body['language'] : 'de';

    $langNames = [
        'de' => 'German (Deutsch)',
        'en' => 'English',
        'el' => 'Greek (Ελληνικά)',
        'es' => 'Spanish (Español)',
        'fr' => 'French (Français)',
        'it' => 'Italian (Italiano)',
        'ru' => 'Russian (Русский)'
    ];
    $targetLanguageName = $langNames[$language] ?? 'German (Deutsch)';

    $caseJson = json_encode($caseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $prompt = "Du bist ein medizinischer Analyseassistent und homöopathischer Experte.
Werte den gesamten übergebenen Patientenfall systematisch, professionell und vollständig aus.

WICHTIG / IMPORTANT:
Generiere alle Inhalte, Texte, Beurteilungen, Warnungen, Differenzialdiagnosen, Begründungen, Empfehlungen und homöopathischen Analysen vollständig in der Zielsprache: {$targetLanguageName}.
(Halte die JSON-Schlüssel exakt wie im Schema vorgegeben, aber alle Werte und Textinhalte MÜSSEN in {$targetLanguageName} verfasst sein).

Fall-Daten:
{$caseJson}

Antworte AUSSCHLIESSLICH mit einem gültigen JSON-Objekt im folgenden Format (ohne Markdown Code-Blöcke):
{
  \"symptomatik\": {
    \"leitsymptome\": [\"Leitsymptom 1\", \"Leitsymptom 2\"],
    \"begleitsymptome\": [\"Begleitsymptom 1\", \"Begleitsymptom 2\"],
    \"modalitaetenBesser\": [\"Besser durch Ruhe\", \"Besser durch Wärme\"],
    \"modalitaetenSchlechter\": [\"Schlechter durch Stress\", \"Schlechter durch Kälte\"],
    \"zeitverlauf\": [\"Beginn...\", \"Verlauf...\"],
    \"psychischVegetativ\": [\"Innere Unruhe...\", \"Schlaf...\"]
  },
  \"redFlags\": {
    \"warnings\": [
      {
        \"text\": \"Warnhinweis Text mit Begründung\",
        \"severity\": \"WARNUNG\",
        \"status\": \"vorhanden\",
        \"abklaerung\": \"Empfohlene medizinische Abklärung\"
      }
    ],
    \"gesamtbewertung\": \"Eine zeitnahe ärztliche Abklärung wird empfohlen.\",
    \"empfohleneFachrichtung\": \"Bitte besprechen Sie die Beschwerden zunächst mit Ihrem Hausarzt / Ihrer Hausärztin.\",
    \"dringlichkeit\": \"Zeitnahe ärztliche Abklärung sinnvoll\"
  },
  \"differentialdiagnostik\": {
    \"dringlichkeitHeader\": \"ZEITNAHE MEDIZINISCHE ABKLÄRUNG\",
    \"items\": [
      {
        \"title\": \"Mögliche Diagnose 1\",
        \"pro\": [\"Symptom A\", \"Symptom B\"],
        \"contra\": [\"Fehlendes Kriterium\"],
        \"offeneFragen\": [\"Diagnostische Frage 1\"],
        \"diagnostik\": \"Empfohlene apparative oder labortechnische Abklärung\"
      }
    ]
  },
  \"arztfallEntscheidung\": {
    \"status\": \"Ja\",
    \"begruendung\": \"Begründung, warum eine hausärztliche Untersuchung sinnvoll/erforderlich ist.\"
  }
}";

    $rawText = callGeminiApi($prompt, false);
    if ($rawText) {
        $extracted = extractJsonFromText($rawText);
        if (is_array($extracted)) {
            echo json_encode($extracted);
            exit;
        }
    }

    http_response_code(500);
    echo json_encode(['error' => 'Klinische Analyse fehlgeschlagen']);
    exit;
}

// =========================================================================
// ROUTE 13: MEDICATION DATABASE STATS (/api/medications/database)
// =========================================================================
if ($route === 'medications/database') {
    $dbFile = getDataFilePath('medications_db.json');
    $count = 0;
    if (file_exists($dbFile)) {
        $raw = @file_get_contents($dbFile);
        $data = @json_decode($raw, true);
        if (is_array($data)) $count = count($data);
    }
    echo json_encode([
        'totalCount' => $count,
        'status' => 'ok',
        'databasePath' => $dbFile
    ]);
    exit;
}

// =========================================================================
// ROUTE 14: TOKEN BILLING & RATES (/api/admin/tokens/*)
// =========================================================================
if (strpos($route, 'admin/tokens') === 0) {
    $tokenRatesFile = getDataFilePath('token_rates.json');
    $tokenLogsFile = getDataFilePath('token_usage_logs.json');

    $defaultRates = [
        'inputPerMillionEur' => 0.075,
        'outputPerMillionEur' => 0.30,
        'currency' => '€'
    ];

    if ($route === 'admin/tokens/rates') {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $currentRates = $defaultRates;
            if (file_exists($tokenRatesFile)) {
                $raw = @file_get_contents($tokenRatesFile);
                $parsed = @json_decode($raw, true);
                if (is_array($parsed)) $currentRates = array_merge($currentRates, $parsed);
            }
            $updated = array_merge($currentRates, is_array($body) ? $body : []);
            @file_put_contents($tokenRatesFile, json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(['success' => true, 'rates' => $updated]);
            exit;
        }
        $rates = $defaultRates;
        if (file_exists($tokenRatesFile)) {
            $raw = @file_get_contents($tokenRatesFile);
            $parsed = @json_decode($raw, true);
            if (is_array($parsed)) $rates = array_merge($defaultRates, $parsed);
        }
        echo json_encode(['rates' => $rates]);
        exit;
    }

    if ($route === 'admin/tokens/reset') {
        @file_put_contents($tokenLogsFile, json_encode([], JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'status' => 'ok', 'message' => 'Token-Logs erfolgreich zurückgesetzt']);
        exit;
    }

    if ($route === 'admin/tokens/logs') {
        $logs = getStoredTokenLogs();
        $therapistId = $_GET['therapistId'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
        if ($limit <= 0) $limit = 200;

        $filtered = $logs;
        if (!empty($therapistId) && $therapistId !== 'all') {
            $filtered = array_values(array_filter($logs, function($l) use ($therapistId) {
                return isset($l['therapistId']) && $l['therapistId'] === $therapistId;
            }));
        }

        echo json_encode([
            'logs' => array_slice($filtered, 0, $limit),
            'total' => count($filtered)
        ]);
        exit;
    }

    if ($route === 'admin/tokens/summary') {
        $logs = getStoredTokenLogs();
        $rates = $defaultRates;
        if (file_exists($tokenRatesFile)) {
            $raw = @file_get_contents($tokenRatesFile);
            $parsed = @json_decode($raw, true);
            if (is_array($parsed)) $rates = array_merge($defaultRates, $parsed);
        }

        $totalPromptTokens = 0;
        $totalCandidatesTokens = 0;
        $totalTokens = 0;
        $totalCostEur = 0;
        $totalRequests = count($logs);

        $therapistLookup = getTherapistLookup();
        $therapistMap = [];

        // Pre-populate with known therapists
        foreach ($therapistLookup as $id => $info) {
            $therapistMap[$id] = [
                'therapistId' => $id,
                'therapistName' => $info['name'],
                'therapistEmail' => $info['email'],
                'praxisName' => $info['praxis'],
                'tarifLabel' => $info['tarif'],
                'requestCount' => 0,
                'promptTokens' => 0,
                'candidatesTokens' => 0,
                'totalTokens' => 0,
                'totalCostEur' => 0.0,
                'lastUsedAt' => ''
            ];
        }

        foreach ($logs as $l) {
            $pTok = isset($l['promptTokens']) ? (int)$l['promptTokens'] : 0;
            $cTok = isset($l['candidatesTokens']) ? (int)$l['candidatesTokens'] : 0;
            $totTok = isset($l['totalTokens']) ? (int)$l['totalTokens'] : ($pTok + $cTok);
            $cost = isset($l['costEur']) ? (float)$l['costEur'] : 0.0;
            $ts = $l['timestamp'] ?? '';

            $totalPromptTokens += $pTok;
            $totalCandidatesTokens += $cTok;
            $totalTokens += $totTok;
            $totalCostEur += $cost;

            $thId = $l['therapistId'] ?? 'th-101';
            if (!isset($therapistMap[$thId])) {
                $therapistMap[$thId] = [
                    'therapistId' => $thId,
                    'therapistName' => $l['therapistName'] ?? ('Therapeut ' . $thId),
                    'therapistEmail' => $l['therapistEmail'] ?? '',
                    'praxisName' => '',
                    'tarifLabel' => 'Standard-Tarif',
                    'requestCount' => 0,
                    'promptTokens' => 0,
                    'candidatesTokens' => 0,
                    'totalTokens' => 0,
                    'totalCostEur' => 0.0,
                    'lastUsedAt' => ''
                ];
            }

            $therapistMap[$thId]['requestCount'] += 1;
            $therapistMap[$thId]['promptTokens'] += $pTok;
            $therapistMap[$thId]['candidatesTokens'] += $cTok;
            $therapistMap[$thId]['totalTokens'] += $totTok;
            $therapistMap[$thId]['totalCostEur'] += $cost;

            if (empty($therapistMap[$thId]['lastUsedAt']) || strcmp($ts, $therapistMap[$thId]['lastUsedAt']) > 0) {
                $therapistMap[$thId]['lastUsedAt'] = $ts;
            }
        }

        // Format and sort therapists by total tokens descending
        $byTherapist = array_values(array_map(function($t) {
            $t['totalCostEur'] = round($t['totalCostEur'], 5);
            return $t;
        }, $therapistMap));

        usort($byTherapist, function($a, $b) {
            return $b['totalTokens'] - $a['totalTokens'];
        });

        echo json_encode([
            'totalPromptTokens' => $totalPromptTokens,
            'totalCandidatesTokens' => $totalCandidatesTokens,
            'totalTokens' => $totalTokens,
            'totalCostEur' => round($totalCostEur, 5),
            'totalRequests' => $totalRequests,
            'byTherapist' => $byTherapist,
            'rates' => $rates,
            'lastUpdated' => date('c')
        ]);
        exit;
    }
}

// =========================================================================
// ROUTE 15: EMAIL SEND & TEST (/api/email/send & /api/email/test)
// =========================================================================
if ($route === 'email/send' || $route === 'email/test') {
    $emailConfigFile = getDataFilePath('email_config.json');
    $config = [];
    if (file_exists($emailConfigFile)) {
        $raw = @file_get_contents($emailConfigFile);
        $config = @json_decode($raw, true) ?: [];
    }

    $to = $body['to'] ?? ($body['recipient'] ?? ($config['testRecipient'] ?? ''));
    $subject = $body['subject'] ?? 'HomeoPilot360 Test-Nachricht';
    $htmlContent = $body['html'] ?? ($body['body'] ?? '<p>Dies ist eine Testnachricht von HomeoPilot360.</p>');

    if (empty($to)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Kein Empfänger angegeben.']);
        exit;
    }

    $from = $config['senderEmail'] ?? ($config['smtpUser'] ?? 'info@homeopilot360.com');
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: ' . $from,
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . phpversion()
    ];

    $sent = @mail($to, $subject, $htmlContent, implode("\r\n", $headers));
    if ($sent) {
        echo json_encode(['success' => true, 'message' => "E-Mail erfolgreich an {$to} gesendet."]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => "E-Mail-Auftrag an {$to} übergeben.",
        'note' => 'SMTP-Versand über Hostinger vorbereitet.'
    ]);
    exit;
}

// =========================================================================
// STRIPE & BILLING HELPERS
// =========================================================================
function maskStripeKey($key) {
    if (empty($key)) return '';
    if (strlen($key) <= 8) return '••••••••';
    return substr($key, 0, 7) . '••••••••' . substr($key, -4);
}

function getStoredStripeConfig() {
    $file = getDataFilePath('stripe_config.json');
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        $parsed = @json_decode($raw, true);
        if (is_array($parsed)) {
            return array_merge([
                'mode' => 'test',
                'publishableKey' => '',
                'secretKey' => '',
                'webhookSecret' => '',
                'updatedAt' => date('c')
            ], $parsed);
        }
    }
    return [
        'mode' => 'test',
        'publishableKey' => '',
        'secretKey' => '',
        'webhookSecret' => '',
        'updatedAt' => date('c')
    ];
}

function saveStoredStripeConfig($updates) {
    $file = getDataFilePath('stripe_config.json');
    $current = getStoredStripeConfig();
    $updated = array_merge($current, $updates);
    $updated['updatedAt'] = date('c');
    $json = json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json) {
        @file_put_contents($file, $json, LOCK_EX);
    }
    return $updated;
}

function getStoredBillingPayments() {
    $file = getDataFilePath('billing_payments.json');
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        $parsed = @json_decode($raw, true);
        if (is_array($parsed)) {
            return $parsed;
        }
    }
    return [
        [
            'id' => 'pay-seed-1',
            'therapistId' => 'th-101',
            'therapistName' => 'Katharina Lindemann',
            'therapistEmail' => 'k.lindemann@naturheilpraxis-berlin.de',
            'amountEur' => 50.0,
            'type' => 'initial_deposit',
            'status' => 'succeeded',
            'stripeSessionId' => 'cs_test_initial_th101',
            'createdAt' => '2026-09-01T10:00:00Z',
            'month' => '2026-09',
            'note' => 'Initiales Token-Guthaben Praxis-Paket'
        ],
        [
            'id' => 'pay-seed-2',
            'therapistId' => 'th-102',
            'therapistName' => 'Dr. med. Markus Vogel',
            'therapistEmail' => 'praxis@dr-vogel-muenchen.de',
            'amountEur' => 20.0,
            'type' => 'initial_deposit',
            'status' => 'succeeded',
            'stripeSessionId' => 'cs_test_initial_th102',
            'createdAt' => '2026-08-15T14:30:00Z',
            'month' => '2026-08',
            'note' => 'Startguthaben-Einzahlung'
        ],
        [
            'id' => 'pay-seed-3',
            'therapistId' => 'th-103',
            'therapistName' => 'Elena Rostova',
            'therapistEmail' => 'elena@homoeopathie-wien.at',
            'amountEur' => 100.0,
            'type' => 'package_purchase',
            'status' => 'succeeded',
            'stripeSessionId' => 'cs_test_initial_th103',
            'createdAt' => '2026-09-02T08:15:00Z',
            'month' => '2026-09',
            'note' => 'Jahreskontingent Aufladung'
        ]
    ];
}

function saveStoredBillingPayments($payments) {
    $file = getDataFilePath('billing_payments.json');
    $json = json_encode($payments, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json) {
        @file_put_contents($file, $json, LOCK_EX);
    }
}

function getStoredTherapistBalances() {
    $file = getDataFilePath('therapist_balances.json');
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        $parsed = @json_decode($raw, true);
        if (is_array($parsed)) {
            $map = [];
            foreach ($parsed as $item) {
                if (isset($item['therapistId'])) {
                    $map[$item['therapistId']] = $item;
                }
            }
            if (!empty($map)) return $map;
        }
    }
    return [
        'th-101' => [
            'therapistId' => 'th-101',
            'balanceEur' => 47.85,
            'totalDepositedEur' => 50.00,
            'lowBalanceThreshold' => 5.00,
            'autoReloadEnabled' => false,
            'autoReloadAmount' => 20.00,
            'lastDepositAt' => '2026-09-01T10:00:00Z',
            'updatedAt' => date('c')
        ],
        'th-102' => [
            'therapistId' => 'th-102',
            'balanceEur' => 18.20,
            'totalDepositedEur' => 20.00,
            'lowBalanceThreshold' => 5.00,
            'autoReloadEnabled' => true,
            'autoReloadAmount' => 20.00,
            'lastDepositAt' => '2026-08-15T14:30:00Z',
            'updatedAt' => date('c')
        ],
        'th-103' => [
            'therapistId' => 'th-103',
            'balanceEur' => 98.40,
            'totalDepositedEur' => 100.00,
            'lowBalanceThreshold' => 10.00,
            'autoReloadEnabled' => true,
            'autoReloadAmount' => 50.00,
            'lastDepositAt' => '2026-09-02T08:15:00Z',
            'updatedAt' => date('c')
        ]
    ];
}

function saveStoredTherapistBalances($map) {
    $file = getDataFilePath('therapist_balances.json');
    $arr = array_values($map);
    $json = json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json) {
        @file_put_contents($file, $json, LOCK_EX);
    }
}

function creditDepositPhp($params) {
    $therapistId = $params['therapistId'] ?? 'th-101';
    $amountEur = max(0.0, (float)($params['amountEur'] ?? 0));
    $type = $params['type'] ?? 'manual_reload';
    $stripeSessionId = $params['stripeSessionId'] ?? null;
    $stripePaymentIntentId = $params['stripePaymentIntentId'] ?? null;
    $note = $params['note'] ?? ("Guthaben-Aufladung: +" . number_format($amountEur, 2, '.', '') . " €");

    $balances = getStoredTherapistBalances();
    if (!isset($balances[$therapistId])) {
        $balances[$therapistId] = [
            'therapistId' => $therapistId,
            'balanceEur' => 20.00,
            'totalDepositedEur' => 20.00,
            'lowBalanceThreshold' => 5.00,
            'autoReloadEnabled' => false,
            'autoReloadAmount' => 20.00,
            'lastDepositAt' => date('c'),
            'updatedAt' => date('c')
        ];
    }

    $balances[$therapistId]['balanceEur'] = round($balances[$therapistId]['balanceEur'] + $amountEur, 2);
    $balances[$therapistId]['totalDepositedEur'] = round($balances[$therapistId]['totalDepositedEur'] + $amountEur, 2);
    $balances[$therapistId]['lastDepositAt'] = date('c');
    $balances[$therapistId]['updatedAt'] = date('c');
    saveStoredTherapistBalances($balances);

    // Record payment log
    $payments = getStoredBillingPayments();
    $newPayment = [
        'id' => 'pay-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid()), 0, 5),
        'therapistId' => $therapistId,
        'therapistName' => $params['therapistName'] ?? $therapistId,
        'therapistEmail' => $params['therapistEmail'] ?? '',
        'amountEur' => $amountEur,
        'type' => $type,
        'status' => 'succeeded',
        'stripeSessionId' => $stripeSessionId,
        'stripePaymentIntentId' => $stripePaymentIntentId,
        'createdAt' => date('c'),
        'month' => date('Y-m'),
        'note' => $note
    ];
    array_unshift($payments, $newPayment);
    saveStoredBillingPayments(array_slice($payments, 0, 100));

    return $balances[$therapistId];
}

function recordTariffUpgradePaymentPhp($params) {
    $therapistId = $params['therapistId'] ?? 'th-101';
    $amountEur = max(0.0, (float)($params['amountEur'] ?? 0));
    $targetTariffId = $params['targetTariffId'] ?? 'pro_monthly';
    $stripeSessionId = $params['stripeSessionId'] ?? null;
    $stripePaymentIntentId = $params['stripePaymentIntentId'] ?? null;
    $paymentMethod = $params['paymentMethod'] ?? 'card';
    $note = $params['note'] ?? ("Tarif-Upgrade auf " . $targetTariffId . ": " . number_format($amountEur, 2, '.', '') . " €");

    $payments = getStoredBillingPayments();
    $newPayment = [
        'id' => 'pay-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid()), 0, 5),
        'therapistId' => $therapistId,
        'therapistName' => $params['therapistName'] ?? $therapistId,
        'therapistEmail' => $params['therapistEmail'] ?? '',
        'amountEur' => $amountEur,
        'type' => 'package_purchase',
        'targetTariffId' => $targetTariffId,
        'paymentMethod' => $paymentMethod,
        'status' => 'paid',
        'stripeSessionId' => $stripeSessionId,
        'stripePaymentIntentId' => $stripePaymentIntentId,
        'createdAt' => date('c'),
        'month' => date('Y-m'),
        'note' => $note
    ];
    array_unshift($payments, $newPayment);
    saveStoredBillingPayments(array_slice($payments, 0, 100));

    return $newPayment;
}

// =========================================================================
// ROUTE 16: STRIPE CONFIGURATION (/api/admin/stripe/config, /api/billing/stripe-config)
// =========================================================================
if ($route === 'admin/stripe/config' || $route === 'billing/stripe-config' || $route === 'stripe/config') {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'homeopilot360.com';
    $webhookUrl = "{$protocol}://{$host}/api/billing/webhook";

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $updates = [];
        if (!empty($body['mode'])) $updates['mode'] = $body['mode'];
        if (isset($body['publishableKey'])) $updates['publishableKey'] = trim($body['publishableKey']);
        if (!empty($body['secretKey']) && strpos($body['secretKey'], '••••') === false) {
            $updates['secretKey'] = trim($body['secretKey']);
        }
        if (!empty($body['webhookSecret']) && strpos($body['webhookSecret'], '••••') === false) {
            $updates['webhookSecret'] = trim($body['webhookSecret']);
        }
        $saved = saveStoredStripeConfig($updates);

        echo json_encode([
            'success' => true,
            'mode' => $saved['mode'] ?? 'test',
            'publishableKey' => $saved['publishableKey'] ?? '',
            'secretKeyMasked' => maskStripeKey($saved['secretKey'] ?? ''),
            'secretKeyConfigured' => !empty($saved['secretKey']),
            'webhookSecretMasked' => maskStripeKey($saved['webhookSecret'] ?? ''),
            'webhookSecretConfigured' => !empty($saved['webhookSecret']),
            'isConfigured' => (!empty($saved['publishableKey']) && !empty($saved['secretKey'])),
            'webhookUrl' => $webhookUrl,
            'updatedAt' => $saved['updatedAt'] ?? date('c')
        ]);
        exit;
    }

    $cfg = getStoredStripeConfig();
    echo json_encode([
        'mode' => $cfg['mode'] ?? 'test',
        'publishableKey' => $cfg['publishableKey'] ?? '',
        'secretKeyMasked' => maskStripeKey($cfg['secretKey'] ?? ''),
        'secretKeyConfigured' => !empty($cfg['secretKey']),
        'webhookSecretMasked' => maskStripeKey($cfg['webhookSecret'] ?? ''),
        'webhookSecretConfigured' => !empty($cfg['webhookSecret']),
        'isConfigured' => (!empty($cfg['publishableKey']) && !empty($cfg['secretKey'])),
        'webhookUrl' => $webhookUrl,
        'updatedAt' => $cfg['updatedAt'] ?? date('c')
    ]);
    exit;
}

// =========================================================================
// ROUTE 17: STRIPE TEST CONNECTION (/api/admin/stripe/test, /api/billing/stripe-test)
// =========================================================================
if ($route === 'admin/stripe/test' || $route === 'billing/stripe-test' || $route === 'stripe/test') {
    $cfg = getStoredStripeConfig();
    $secretKey = $cfg['secretKey'] ?? '';
    if (empty($secretKey)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Kein Stripe Secret Key (sk_...) hinterlegt. Bitte tragen Sie diesen zuerst ein.'
        ]);
        exit;
    }

    $ch = curl_init('https://api.stripe.com/v1/balance');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $secretKey,
        'User-Agent: HomeoPilot360/1.0'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($httpCode === 200 && !empty($response)) {
        $balData = @json_decode($response, true);
        echo json_encode([
            'success' => true,
            'message' => 'Verbindung zu Stripe erfolgreich hergestellt! API-Schlüssel ist aktiv.',
            'livemode' => $balData['livemode'] ?? false,
            'currency' => strtoupper($balData['available'][0]['currency'] ?? 'EUR')
        ]);
        exit;
    }

    $errJson = @json_decode($response, true);
    $msg = $errJson['error']['message'] ?? (!empty($curlErr) ? $curlErr : 'Verbindung zu Stripe fehlgeschlagen.');
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// =========================================================================
// ROUTE 18: BILLING PAYMENTS LOG (/api/admin/billing/payments)
// =========================================================================
if ($route === 'admin/billing/payments') {
    $therapistId = $_GET['therapistId'] ?? null;
    $payments = getStoredBillingPayments();
    if (!empty($therapistId) && $therapistId !== 'all') {
        $payments = array_values(array_filter($payments, function($p) use ($therapistId) {
            return isset($p['therapistId']) && $p['therapistId'] === $therapistId;
        }));
    }
    echo json_encode(['payments' => $payments]);
    exit;
}

// =========================================================================
// ROUTE 19: CREATE CHECKOUT SESSION (/api/billing/create-checkout-session)
// =========================================================================
if ($route === 'billing/create-checkout-session') {
    $therapistId = $body['therapistId'] ?? 'th-101';
    $therapistName = $body['therapistName'] ?? 'Therapeut';
    $therapistEmail = $body['therapistEmail'] ?? '';
    $amountEur = max(1.0, (float)($body['amountEur'] ?? 20));
    $type = $body['type'] ?? 'manual_reload';

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'homeopilot360.com';
    $origin = "{$protocol}://{$host}";
    $successUrl = $body['successUrl'] ?? "{$origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&therapistId={$therapistId}";
    $cancelUrl = $body['cancelUrl'] ?? "{$origin}/?payment=cancelled&therapistId={$therapistId}";

    $cfg = getStoredStripeConfig();
    $secretKey = $cfg['secretKey'] ?? '';

    // If Stripe Live or Test Key is set, create real checkout session via Stripe API
    if (!empty($secretKey) && (strpos($secretKey, 'sk_') === 0 || strpos($secretKey, 'rk_') === 0)) {
        $postParams = [
            'payment_method_types[0]' => 'card',
            'line_items[0][price_data][currency]' => 'eur',
            'line_items[0][price_data][product_data][name]' => "HomöoPraxis Token-Guthaben (+" . number_format($amountEur, 2, '.', '') . " €)",
            'line_items[0][price_data][product_data][description]' => "Token-Aufladung für: " . ($therapistName ?: $therapistId),
            'line_items[0][price_data][unit_amount]' => (int)round($amountEur * 100),
            'line_items[0][quantity]' => 1,
            'mode' => 'payment',
            'client_reference_id' => $therapistId,
            'metadata[therapistId]' => $therapistId,
            'metadata[therapistName]' => $therapistName,
            'metadata[amountEur]' => (string)$amountEur,
            'metadata[type]' => $type,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl
        ];
        if (!empty($therapistEmail)) {
            $postParams['customer_email'] = $therapistEmail;
        }

        $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postParams));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $secretKey,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $stripeRaw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $stripeData = @json_decode($stripeRaw, true);
        if ($httpCode === 200 && !empty($stripeData['id']) && !empty($stripeData['url'])) {
            echo json_encode([
                'sessionId' => $stripeData['id'],
                'url' => $stripeData['url'],
                'mode' => 'stripe'
            ]);
            exit;
        }
    }

    // Safe Sandbox Fallback
    $mockSessionId = 'cs_sandbox_' . round(microtime(true) * 1000);
    if (strpos($successUrl, '{CHECKOUT_SESSION_ID}') !== false) {
        $returnUrl = str_replace('{CHECKOUT_SESSION_ID}', $mockSessionId, $successUrl);
    } else {
        $delim = (strpos($successUrl, '?') !== false) ? '&' : '?';
        $returnUrl = "{$successUrl}{$delim}session_id={$mockSessionId}";
    }
    if (strpos($returnUrl, 'amount=') === false) {
        $returnUrl .= "&amount={$amountEur}";
    }
    if (strpos($returnUrl, 'sandbox=') === false) {
        $returnUrl .= "&sandbox=true";
    }

    echo json_encode([
        'sessionId' => $mockSessionId,
        'url' => $returnUrl,
        'mode' => 'sandbox',
        'amountEur' => $amountEur,
        'message' => 'Sandbox-Modus: Weiterleitung zur Zahlungsbestätigung.'
    ]);
    exit;
}

// =========================================================================
// ROUTE 19b: VERIFY CHECKOUT SESSION (/api/billing/verify-session)
// =========================================================================
if ($route === 'billing/verify-session' || $route === 'verify-session' || $route === 'billing/verify_session' || $route === 'api/billing/verify-session') {
    $sessionId = $_GET['sessionId'] ?? ($_GET['session_id'] ?? '');
    $therapistId = $_GET['therapistId'] ?? ($_GET['therapist_id'] ?? 'th-101');
    $amountEur = isset($_GET['amount']) ? (float)$_GET['amount'] : (isset($_GET['amountEur']) ? (float)$_GET['amountEur'] : 20.0);

    if (empty($sessionId) || $sessionId === '{CHECKOUT_SESSION_ID}' || strpos($sessionId, 'CHECKOUT_SESSION_ID') !== false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ungültige oder fehlende Session-ID']);
        exit;
    }

    // Check if already credited
    $payments = getStoredBillingPayments();
    foreach ($payments as $p) {
        if (!empty($p['stripeSessionId']) && $p['stripeSessionId'] === $sessionId) {
            echo json_encode([
                'success' => true,
                'status' => 'already_credited',
                'credited' => true,
                'amountEur' => $p['amountEur'],
                'therapistId' => $p['therapistId']
            ]);
            exit;
        }
    }

    $cfg = getStoredStripeConfig();
    $secretKey = $cfg['secretKey'] ?? '';

    // Verify with Stripe API if live/test Stripe session
    if (!empty($secretKey) && strpos($sessionId, 'cs_sandbox_') === false && strpos($sessionId, 'cs_offline_') === false) {
        $ch = curl_init('https://api.stripe.com/v1/checkout/sessions/' . urlencode($sessionId));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $secretKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $stripeRaw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $sessionData = @json_decode($stripeRaw, true);
        if ($httpCode === 200 && !empty($sessionData['id']) && ($sessionData['payment_status'] ?? '') === 'paid') {
            $sessTherapistId = $sessionData['metadata']['therapistId'] ?? ($sessionData['client_reference_id'] ?? $therapistId);
            $sessAmount = isset($sessionData['metadata']['amountEur'])
                ? (float)$sessionData['metadata']['amountEur']
                : (((float)($sessionData['amount_total'] ?? 0)) / 100);
            $sessType = $sessionData['metadata']['type'] ?? 'manual_reload';
            $targetTariffId = $sessionData['metadata']['targetTariffId'] ?? null;

            if ($sessType === 'package_purchase') {
                recordTariffUpgradePaymentPhp([
                    'therapistId' => $sessTherapistId,
                    'therapistName' => $sessionData['metadata']['therapistName'] ?? 'Therapeut',
                    'therapistEmail' => $sessionData['customer_details']['email'] ?? ($sessionData['customer_email'] ?? ''),
                    'amountEur' => $sessAmount,
                    'targetTariffId' => $targetTariffId,
                    'stripeSessionId' => $sessionData['id'],
                    'stripePaymentIntentId' => $sessionData['payment_intent'] ?? null,
                    'note' => 'Stripe Tarif-Upgrade bezahlt: ' . number_format($sessAmount, 2, '.', '') . ' €'
                ]);

                echo json_encode([
                    'success' => true,
                    'status' => 'paid',
                    'credited' => false,
                    'upgraded' => true,
                    'amountEur' => $sessAmount,
                    'therapistId' => $sessTherapistId,
                    'targetTariffId' => $targetTariffId,
                    'type' => 'package_purchase',
                    'message' => 'Tarif-Upgrade erfolgreich bezahlt und freigeschaltet.'
                ]);
                exit;
            } else {
                creditDepositPhp([
                    'therapistId' => $sessTherapistId,
                    'therapistName' => $sessionData['metadata']['therapistName'] ?? 'Therapeut',
                    'therapistEmail' => $sessionData['customer_details']['email'] ?? ($sessionData['customer_email'] ?? ''),
                    'amountEur' => $sessAmount,
                    'type' => $sessType,
                    'stripeSessionId' => $sessionData['id'],
                    'stripePaymentIntentId' => $sessionData['payment_intent'] ?? null,
                    'note' => 'Stripe Zahlung bestätigt: +' . number_format($sessAmount, 2, '.', '') . ' €'
                ]);

                echo json_encode([
                    'success' => true,
                    'status' => 'paid',
                    'credited' => true,
                    'upgraded' => false,
                    'amountEur' => $sessAmount,
                    'therapistId' => $sessTherapistId,
                    'targetTariffId' => null,
                    'type' => $sessType
                ]);
                exit;
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'status' => $sessionData['payment_status'] ?? 'unpaid',
                'error' => 'Zahlung noch nicht eingegangen oder abgelehnt.'
            ]);
            exit;
        }
    }

    // Sandbox / Internal Confirmation
    if (strpos($sessionId, 'cs_sandbox_') === 0 || strpos($sessionId, 'cs_offline_') === 0) {
        $reqType = $_GET['type'] ?? '';
        $targetTariffId = $_GET['targetTariffId'] ?? ($_GET['target_tariff_id'] ?? null);
        $isUpgrade = ($reqType === 'package_purchase' || !empty($targetTariffId));

        if ($isUpgrade) {
            recordTariffUpgradePaymentPhp([
                'therapistId' => $therapistId,
                'amountEur' => $amountEur,
                'targetTariffId' => $targetTariffId ?? 'pro_monthly',
                'stripeSessionId' => $sessionId,
                'paymentMethod' => $_GET['paymentMethod'] ?? 'card',
                'note' => 'Tarif-Upgrade bestätigt: ' . number_format($amountEur, 2, '.', '') . ' €'
            ]);

            echo json_encode([
                'success' => true,
                'status' => 'paid',
                'credited' => false,
                'upgraded' => true,
                'amountEur' => $amountEur,
                'therapistId' => $therapistId,
                'targetTariffId' => $targetTariffId,
                'type' => 'package_purchase',
                'message' => 'Tarif-Upgrade erfolgreich autorisiert und aktiviert.'
            ]);
            exit;
        } else {
            creditDepositPhp([
                'therapistId' => $therapistId,
                'amountEur' => $amountEur,
                'type' => 'manual_reload',
                'stripeSessionId' => $sessionId,
                'note' => 'Guthaben-Aufladung bestätigt: +' . number_format($amountEur, 2, '.', '') . ' €'
            ]);

            echo json_encode([
                'success' => true,
                'status' => 'paid',
                'credited' => true,
                'upgraded' => false,
                'amountEur' => $amountEur,
                'therapistId' => $therapistId,
                'type' => 'manual_reload'
            ]);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültige Session-ID']);
    exit;
}

// =========================================================================
// ROUTE 20: STRIPE WEBHOOK (/api/billing/webhook)
// =========================================================================
if ($route === 'billing/webhook') {
    $event = $body;
    if ($event && isset($event['type']) && $event['type'] === 'checkout.session.completed') {
        $session = $event['data']['object'] ?? [];
        $therapistId = $session['metadata']['therapistId'] ?? ($session['client_reference_id'] ?? null);
        $amountEur = isset($session['metadata']['amountEur'])
            ? (float)$session['metadata']['amountEur']
            : (((float)($session['amount_total'] ?? 0)) / 100);
        $type = $session['metadata']['type'] ?? 'manual_reload';

        if ($therapistId && $amountEur > 0) {
            creditDepositPhp([
                'therapistId' => $therapistId,
                'therapistName' => $session['metadata']['therapistName'] ?? 'Therapeut',
                'therapistEmail' => $session['customer_details']['email'] ?? ($session['customer_email'] ?? ''),
                'amountEur' => $amountEur,
                'type' => $type,
                'stripeSessionId' => $session['id'] ?? '',
                'stripePaymentIntentId' => $session['payment_intent'] ?? null,
                'note' => 'Stripe Webhook: checkout.session.completed'
            ]);
        }
    }
    echo json_encode(['received' => true]);
    exit;
}

// =========================================================================
// ROUTE 21: THERAPIST TOP-UP DIRECT (/api/therapist/billing/top-up)
// =========================================================================
if ($route === 'therapist/billing/top-up') {
    $therapistId = $body['therapistId'] ?? 'th-101';
    $amountEur = max(1.0, (float)($body['amountEur'] ?? 20));
    $type = $body['type'] ?? 'manual_reload';
    $note = $body['note'] ?? ("Guthaben-Aufladung (+" . number_format($amountEur, 2, '.', '') . " €)");

    $updated = creditDepositPhp([
        'therapistId' => $therapistId,
        'therapistName' => $body['therapistName'] ?? 'Therapeut',
        'therapistEmail' => $body['therapistEmail'] ?? '',
        'amountEur' => $amountEur,
        'type' => $type,
        'note' => $note
    ]);

    echo json_encode(['success' => true, 'balance' => $updated]);
    exit;
}

// =========================================================================
// ROUTE 22: THERAPIST BILLING SETTINGS (/api/therapist/billing/settings)
// =========================================================================
if ($route === 'therapist/billing/settings') {
    $therapistId = $body['therapistId'] ?? 'th-101';
    $balances = getStoredTherapistBalances();
    if (!isset($balances[$therapistId])) {
        $balances[$therapistId] = [
            'therapistId' => $therapistId,
            'balanceEur' => 20.00,
            'totalDepositedEur' => 20.00,
            'lowBalanceThreshold' => 5.00,
            'autoReloadEnabled' => false,
            'autoReloadAmount' => 20.00,
            'lastDepositAt' => date('c'),
            'updatedAt' => date('c')
        ];
    }
    if (isset($body['lowBalanceThreshold'])) {
        $balances[$therapistId]['lowBalanceThreshold'] = max(0.0, (float)$body['lowBalanceThreshold']);
    }
    if (isset($body['autoReloadEnabled'])) {
        $balances[$therapistId]['autoReloadEnabled'] = (bool)$body['autoReloadEnabled'];
    }
    if (isset($body['autoReloadAmount'])) {
        $balances[$therapistId]['autoReloadAmount'] = max(5.0, (float)$body['autoReloadAmount']);
    }
    $balances[$therapistId]['updatedAt'] = date('c');
    saveStoredTherapistBalances($balances);

    echo json_encode(['success' => true, 'balance' => $balances[$therapistId]]);
    exit;
}

// =========================================================================
// ROUTE 23: ADMIN BALANCE ADJUST (/api/admin/billing/balance/adjust)
// =========================================================================
if ($route === 'admin/billing/balance/adjust') {
    $therapistId = $body['therapistId'] ?? 'th-101';
    $amountEur = (float)($body['amountEur'] ?? 0);
    $note = $body['note'] ?? ('Admin-Anpassung: ' . ($amountEur >= 0 ? '+' : '') . number_format($amountEur, 2, '.', '') . ' €');

    $balances = getStoredTherapistBalances();
    if (!isset($balances[$therapistId])) {
        $balances[$therapistId] = [
            'therapistId' => $therapistId,
            'balanceEur' => 20.00,
            'totalDepositedEur' => 20.00,
            'lowBalanceThreshold' => 5.00,
            'autoReloadEnabled' => false,
            'autoReloadAmount' => 20.00,
            'lastDepositAt' => date('c'),
            'updatedAt' => date('c')
        ];
    }

    $balances[$therapistId]['balanceEur'] = round(max(0.0, $balances[$therapistId]['balanceEur'] + $amountEur), 2);
    if ($amountEur > 0) {
        $balances[$therapistId]['totalDepositedEur'] = round($balances[$therapistId]['totalDepositedEur'] + $amountEur, 2);
        $balances[$therapistId]['lastDepositAt'] = date('c');
    }
    $balances[$therapistId]['updatedAt'] = date('c');
    saveStoredTherapistBalances($balances);

    // Record adjustment payment log
    $payments = getStoredBillingPayments();
    array_unshift($payments, [
        'id' => 'pay-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid()), 0, 5),
        'therapistId' => $therapistId,
        'therapistName' => $body['therapistName'] ?? $therapistId,
        'therapistEmail' => $body['therapistEmail'] ?? '',
        'amountEur' => $amountEur,
        'type' => 'manual_reload',
        'status' => 'succeeded',
        'createdAt' => date('c'),
        'month' => date('Y-m'),
        'note' => $note
    ]);
    saveStoredBillingPayments(array_slice($payments, 0, 100));

    echo json_encode(['success' => true, 'balance' => $balances[$therapistId]['balanceEur']]);
    exit;
}

// =========================================================================
// ROUTE 24: THERAPIST BILLING STATUS (/api/therapist/billing/:id)
// =========================================================================
if (preg_match('#^therapist/billing/([^/]+)$#', $route, $matches)) {
    $thId = $matches[1];
    $balances = getStoredTherapistBalances();
    if (!isset($balances[$thId])) {
        $balances[$thId] = [
            'therapistId' => $thId,
            'balanceEur' => 20.00,
            'totalDepositedEur' => 20.00,
            'lowBalanceThreshold' => 5.00,
            'autoReloadEnabled' => false,
            'autoReloadAmount' => 20.00,
            'lastDepositAt' => date('c'),
            'updatedAt' => date('c')
        ];
        saveStoredTherapistBalances($balances);
    }
    $bal = $balances[$thId];
    $bal['isLowBalance'] = ($bal['balanceEur'] <= $bal['lowBalanceThreshold']);

    $allPayments = getStoredBillingPayments();
    $thPayments = array_values(array_filter($allPayments, function($p) use ($thId) {
        return isset($p['therapistId']) && $p['therapistId'] === $thId;
    }));
    $bal['recentPayments'] = array_slice($thPayments, 0, 10);

    echo json_encode($bal);
    exit;
}

// =========================================================================
// DEFAULT: Route nicht gefunden
// =========================================================================
sendJsonResponse(['error' => 'Endpoint not found', 'requestedRoute' => $route], 404);


