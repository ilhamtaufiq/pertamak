<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PDF export image limit
    |--------------------------------------------------------------------------
    |
    | Photos are embedded in memory as base64. This caps how many are included
    | in one PDF export so a large period cannot exhaust memory. Images beyond
    | the limit are skipped and reported in the X-Export-Images-Skipped header.
    |
    */
    'pdf_max_images' => (int) env('KEGIATAN_PDF_MAX_IMAGES', 150),
];
