<?php 

if( isset( $_GET["follower"] ) && isset( $_GET["follows"] ) ) {
	echo json_encode( sql_set_query( sql_set_follows( $_GET["follower"], $_GET["follows"] ) ) );
}

if( isset( $_GET["mass_follow"] ) ) {
	echo mass_set_follows();
}

// all set queries here
// Insert, Update, Drop queries use this
function sql_set_query($sql) {
	// prepare connection to database
	require "../../db-config.php";
	// connect to database
	mysqli_connect( $dbservername, $dbusername, $dbpassword );
	// make the query
	$response = $conn->query($sql);
	// close connection
	mysqli_close();
	return $response;
}

function sql_set_follows($follower, $follows) {
	return "INSERT INTO  `instagram_follows` ( follower, follows )
		VALUES ('".$follower."', '".$follows."')
		ON DUPLICATE KEY UPDATE follows=follows";
}

function mass_set_follows() {
	$follows = json_decode(  $_GET["mass_follow"] );
	$mass_set = "INSERT INTO  `instagram_follows` ( follower, follows ) ";
	$first = true;
	foreach( $follows as $following) {
		if($first) {
			$mass_set .= "SELECT '".$following[0]."','".$following[1]."' ";			
			$first = false;
		}
		else 
			$mass_set .= "UNION ALL SELECT '".$following[0]."','".$following[1]."' ";	
	}
	$mass_set .= "ON DUPLICATE KEY UPDATE follows=follows;";
	return json_encode( sql_set_query($mass_set) );
}

?>