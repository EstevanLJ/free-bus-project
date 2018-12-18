<?php

$data = json_decode(file_get_contents('php://input'), true);

$fp = fopen('file.json', 'w');
fwrite($fp, json_encode($data['data']));
fclose($fp);

