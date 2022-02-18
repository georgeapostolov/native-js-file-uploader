<?

	global $C;
	if (!empty($_FILES)) {
		$tempFile = $_FILES['Filedata']['tmp_name'];
		$exp = explode('.', $_FILES['Filedata']['name']);
		$file_name = date('YmdHis') . '_' . substr(rand(0, 999999), 0, 5) . '.' . end($exp);
		echo json_encode(array('client' => $_FILES['Filedata']['name'], 'server' => $file_name, 'size' => $_FILES['Filedata']['size']));
	} elseif (isset($_GET['type'], $_GET['name']) && ('cancel' == $_GET['type']) && $_GET['name']) {
		// unlink
	}
