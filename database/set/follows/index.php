<?php 

if( isset( $_GET["follower"] ) && isset( $_GET["follows"] ) ) {
	echo json_encode( sql_set_query( sql_set_follows( $_GET["follower"], $_GET["follows"] ) ) );
}

if( isset( $_GET["mass_follow"] ) ) {
	save_chunk( $_GET["mass_follow"] );
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

function save_chunk( $follows ) {
	if( count( $follows ) > 50 ) {
		// chunk of 50 follows and save to db
		$follows_chunk = array();
		for($i = 0; $i < 50; $i++) {
			array_push( $follows_chunk, array_pop( $follows ) );
		}
		if( !mass_follow( $follows_chunk ) )
			echo "Something went wrong with saving.";
		else
			save_chunk( $follows );
	}
	else {
		if( !mass_follow( $follows ) )
			echo "Something went wrong with saving.";
		else
			echo "All saved.";
	}
}

function mass_follow( $follows ) {
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