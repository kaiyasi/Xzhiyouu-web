<?php
if (!empty($_SERVER['HTTP_USER_AGENT']) && strpos($_SERVER['HTTP_USER_AGENT'], 'curl') === false) {
    header('Location: index.php');
    exit;
}
echo "Flag: NHISCCTF{curl_1s_the_b3st_t00l_for_th1s_t4sk}";
?>
