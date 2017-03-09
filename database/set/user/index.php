<?php 
error_reporting( E_ALL );

// all set queries here
// Insert, Update, Drop queries use this
function sql_set_query($sql) {
	// prepare connection to database
	require "../../db-config.php";
	echo $sql;
	// connect to database
	mysqli_connect( $dbservername, $dbusername, $dbpassword );
	// make the query
	$response = $conn->query($sql);
	// close connection
	mysqli_close();
	return $response;
}


function sql_set_user($userid, $posts, $followers, $following) {
	return "INSERT INTO  `instagram_users` (  `userid`, `posts`, `followers`, `following` )
		VALUES('".$userid."', '".$posts."' , '".$followers."' , '".$following."')
		ON DUPLICATE KEY UPDATE `posts` = VALUES('".$posts."'), `followers` = VALUES('".$followers."'), `following` = VALUES('".$following."');";
}

if( $_GET['userid'] ) {
	$userid = $_GET['userid'];
	$posts = "NULL";
	$followers = "NULL";
	$following = "NULL";
	if( isset( $_GET['posts'] ) )
		$posts = $_GET['posts'];
	if( isset( $_GET['followers'] ) )
		$followers = $_GET['followers'];
	if( isset( $_GET['following'] ) )
		$following = $_GET['following'];

	echo json_encode( sql_set_query( sql_set_user( $_GET['userid'], $_GET['posts'], $_GET['followers'], $_GET['following'] ) ) );
}
else
	echo "Error: Get values not set correctly. Needs at least a userid. Format: userid=USER&posts=NUM&followers=NUM&following=NUM";

?>