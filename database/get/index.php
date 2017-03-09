<?php 

// all the get queries for this project
// Get queries use this
function sql_get_query($sql) {
	
	// prepare connection to database
	// this file is hidden from Git as it has login information to database
	require "../dbconnect.php";
		
	// connect to database
	mysqli_connect( $dbservername, $dbusername, $dbpassword );
	
	// make the query
	$response = $conn->query($sql);
	
	// check for rows
	if($response->num_rows > 0) {
		// store rows in an array
		$rows = array();
		// push rows and return
		while( $row = $response->fetch_assoc() ) {
			array_push($rows, $row);
		}
		// close connection
		mysqli_close();
		return $rows;
	}
	else {
		// close connection
		mysqli_close();
		return false;
	}
	
}

?>