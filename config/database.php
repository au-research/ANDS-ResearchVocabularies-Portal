<?php
return [
    'default' => [
        'hostname' => env('DB_HOSTNAME', 'localhost'),
        'username' => env('DB_USERNAME', 'webuser'),
        'password' => env('DB_PASSWORD', ''),
        'dbdriver' => 'mysqli'
    ],
// Even for vocabs, need to define this; sorry.
// This is because engine/config/database.php defines
// $active_group = 'registry'.
    'registry' => [
        'database' => 'dbs_vocabs'
    ],
    'roles' => [
        'database' => 'dbs_roles'
    ],
    'vocabs' => [
        'database' => 'dbs_vocabs'
    ],
    'statistics' => [
        'database' => 'dbs_statistics'
    ],
    'dois' => [
        'database' => 'dbs_dois'
    ],
    'portal' => [
        'database' => 'dbs_portal'
    ]
];