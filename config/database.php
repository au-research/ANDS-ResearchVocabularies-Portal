<?php
return [
    'default' => [
        'hostname' => env('DB_HOSTNAME', 'localhost'),
        'port'     => env('DB_PORT',     3306),
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
        'database' => env('DB_DATABASE_ROLES', 'dbs_roles'),
        'hostname' => env('DB_HOSTNAME_ROLES', null),
        'port'     => env('DB_PORT_ROLES',     null),
        'username' => env('DB_USERNAME_ROLES', null),
        'password' => env('DB_PASSWORD_ROLES', null)
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
