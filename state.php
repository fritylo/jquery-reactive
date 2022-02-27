<?php
$state = (object)[
   'indicators' => [
      ['title' => 'DDS', 'value' => 1120, 'last_refresh' => '13:12:01', 'refresh_rate' => '3',   ],
      ['title' => 'CDA', 'value' => 3201, 'last_refresh' => '01:12:20', 'refresh_rate' => '5',   ],
      ['title' => 'HEL', 'value' => 5283, 'last_refresh' => '09:38:11', 'refresh_rate' => '0.5', ],
      ['title' => 'AOI', 'value' => 7298, 'last_refresh' => '15:01:33', 'refresh_rate' => '1',   ],
      ['title' => 'SUS', 'value' => 5375, 'last_refresh' => '03:39:59', 'refresh_rate' => '8',   ],
      ['title' => 'VAW', 'value' => 2201, 'last_refresh' => '23:28:08', 'refresh_rate' => '0.75',],
      ['title' => 'REC', 'value' => 4851, 'last_refresh' => '00:03:16', 'refresh_rate' => '2',   ],
   ]
];

to_objects($state->indicators);

function to_objects(&$array) {
   foreach ($array as $key => $item) {
      $array[$key] = (object)$item;
   }
}