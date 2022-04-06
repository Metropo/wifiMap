<?php
/* wifiMap
// Client per a l'�s de la llibreria class_unifi.php
------------------------------------------------------------------------------------

The MIT License (MIT)

Copyright (c) 2016, jsirera

this Unifi API client for wifiMap tool is based on the Unifi-API-browser by Slooffmaster https://github.com/malle-pietje/Unifi-API-browser 

*/

$action         = '';
$site_name      = '';
$selection      = '';
$data           = '';


include('../config.php');

/*
load the Unifi API connection class and log in to the controller
- if an error occurs during the login process, an alert is displayed on the page
*/
require('class.unifi.php');

header('Content-Type: application/json; charset=utf-8');
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}
    


if(!$useDummyData)
{


    $unifidata        = new unifiapi($controlleruser, $controllerpassword, $controllerurl, $site_id, $controllerversion);
    $unifidata->debug = false;
    $loginresults     = $unifidata->login();
    $data 			  = "";

    if($loginresults === 400) {
        $data = 'Login error';
    }

    switch ($action) {
        case 'list_clients':
            $selection  = 'list online clients';
            $data       = $unifidata->list_clients();
            break;
        case 'stat_allusers':
            $selection  = 'stat all users';
            $data       = $unifidata->stat_allusers();
            break;
        case 'stat_auths':
            $selection  = 'stat active authorisations';
            $data       = $unifidata->stat_auths();
            break;
        case 'list_guests':
            $selection  = 'list guests';
            $data       = $unifidata->list_guests();
            break;
    	case 'list_devices':
            $selection  = 'list devices';
            $data       = $unifidata->list_aps();
            break;
        case 'list_users':
            $selection  = 'list users';
            $data       = $unifidata->list_users();
            break;
        default:
            break;
    }
    /*
        log off from the Unifi controller API
    */

    $logout_results = $unifidata->logout();
 
    echo json_encode($data);
}
else
{
    if ($action == 'list_clients')
    	echo file_get_contents('list_clients.json');
    elseif ($action == 'list_devices')
    	echo file_get_contents('list_devices.json');
}