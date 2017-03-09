<?php 
$dbservername = "localhost";
$dbname = "social_media_info";
$dbusername = "mike_scott";
$dbpassword = "d1rt>str33t";
// Create connection
$conn = new mysqli($dbservername, $dbusername, $dbpassword, $dbname);
// // Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
?>