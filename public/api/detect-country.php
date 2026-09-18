<?php
/**
 * Standalone Country & Language Detection Endpoint for Hostinger / Apache
 * Accessible via /api/detect-country or /api/detect-country.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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
