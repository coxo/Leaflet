import {LatLng} from '../LatLng';
import {Bounds} from '../../geometry/Bounds';
import {Point} from '../../geometry/Point';

/*
 * @namespace Projection
 * @projection L.Projection.SphericalMercator
 *
 * Spherical Mercator projection — the most common projection for online maps,
 * used by almost all free and commercial tile providers. Assumes that Earth is
 * a sphere. Used by the `EPSG:3857` CRS.
 */

var earthRadius = 6378137;
var pi = 3.14159265358979324; // 圆周率
var ee = 0.00669342162296594323; // WGS 偏心率的平方
var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
var pole = 20037508.34;
var a = 6378245.0 // WGS 长轴半径

export var SphericalMercator = {

	R: earthRadius,
	MAX_LATITUDE: 85.0511287798,
	
       /**
		 * 84->火星       
	     * @method transform (number lon, number lat)
         * @param {number} lon 经度 
         * @param {number} lat 纬度
         * @return {object} 火星坐标
         */
    transform:function(lon, lat) {
 	lon = parseFloat(lon);
 	lat = parseFloat(lat);
 	var localHashMap = {};
 	if (this.outofChina(lat, lon)) {
 		localHashMap.lon = lon;
 		localHashMap.lat = lat;
 		return localHashMap;
 	}
 	var dLat = this.transformLat(lon - 105.0, lat - 35.0);
 	var dLon = this.transformLon(lon - 105.0, lat - 35.0);
 	var radLat = lat / 180.0 * pi;
 	var magic = Math.sin(radLat);
 	magic = 1 - ee * magic * magic;
 	var sqrtMagic = Math.sqrt(magic);
 	dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
 	dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
 	var mgLat = lat + dLat;
 	var mgLon = lon + dLon;
 	localHashMap.lon = mgLon;
 	localHashMap.lat = mgLat;
 	return localHashMap;
 },
 outofChina:function(lat, lon) {
 	if (lon < 72.004 || lon > 137.8347)
 		return true;
 	if (lat < 0.8293 || lat > 55.8271)
 		return true;
 	return false;
 },

 transformLat: function(x, y) {
 	var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
 	ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
 	ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
 	ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
 	return ret;
 },
 
 transformLon: function(x, y) {
 	var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
 	ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
 	ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
 	ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
 	return ret;
 },
 gcj2wgs: function(gcj02lon, gcj02lat) {
 	var wgs84lon = gcj02lon, wgs84lat = gcj02lat;
 	var nIterCount = 0;
 	while (++nIterCount < 1000)
 	{
 		var lon0 = wgs84lon - 105.0;
 		var lat0 = wgs84lat - 35.0;
 		//generate an pair offset roughly in meters
 		var lon1 = 300.0 + lon0 + 2.0 * lat0 + 0.1 * lon0 * lon0 + 0.1 * lon0 * lat0 + 0.1 * Math.sqrt(Math.abs(lon0));
 		lon1 = lon1 + (20.0 * Math.sin(6.0 * lon0 * pi) + 20.0 * Math.sin(2.0 * lon0 * pi)) * 2.0 / 3.0;
 		lon1 = lon1 + (20.0 * Math.sin(lon0 * pi) + 40.0 * Math.sin(lon0 / 3.0 * pi)) * 2.0 / 3.0;
 		lon1 = lon1 + (150.0 * Math.sin(lon0 / 12.0 * pi) + 300.0 * Math.sin(lon0 * pi / 30.0)) * 2.0 / 3.0;
 		var lat1 = -100.0 + 2.0 * lon0 + 3.0 * lat0 + 0.2 * lat0 * lat0 + 0.1 * lon0 * lat0 + 0.2 * Math.sqrt(Math.abs(lon0));
 		lat1 = lat1 + (20.0 * Math.sin(6.0 * lon0 * pi) + 20.0 * Math.sin(2.0 * lon0 * pi)) * 2.0 / 3.0;
 		lat1 = lat1 + (20.0 * Math.sin(lat0 * pi) + 40.0 * Math.sin(lat0 / 3.0 * pi)) * 2.0 / 3.0;
 		lat1 = lat1 + (160.0 * Math.sin(lat0 / 12.0 * pi) + 320.0 * Math.sin(lat0 * pi / 30.0)) * 2.0 / 3.0;
 		var g_lon0 = 0;
 		if (lon0 > 0)
 			g_lon0 = 0.05 / Math.sqrt(lon0);
 		else
 			if (lon0 < 0)
 				g_lon0 = -0.05 / Math.sqrt(-lon0);
 			else
 				g_lon0 = 0;
 		var PIlon0 = pi * lon0, PIlat0 = pi * lat0;
 		var dlon1_dlonwgs = 1 + 0.2 * lon0 + 0.1 * lat0 + g_lon0
 			+ ((120 * pi * Math.cos(6 * PIlon0) + 40 * pi * Math.cos(2 * PIlon0))
 			+ (20 * pi * Math.cos(PIlon0) + 40 * pi / 3.0 * Math.cos(PIlon0 / 3.0))
 			+ (12.5 * pi * Math.cos(PIlon0 / 12.0) + 10 * pi * Math.cos(PIlon0 / 30.0))) * 2.0 / 3.0;
 		var dlon1_dlatwgs = 2 + 0.1 * lon0;
 		var dlat1_dlonwgs = 2 + 0.1 * lat0 + 2 * g_lon0
 			+ (120 * pi * Math.cos(6 * PIlon0) + 40 * pi * Math.cos(2 * PIlon0)) * 2.0 / 3.0;
 		var dlat1_dlatwgs = 3 + 0.4 * lat0 + 0.1 * lon0
 			+ ((20 * pi * Math.cos(PIlat0) + 40.0 * pi / 3.0 * Math.cos(PIlat0 / 3.0))
 			+ (40 * pi / 3.0 * Math.cos(PIlat0 / 12.0) + 32.0 * pi / 3.0 * Math.cos(PIlat0 / 30.0))) * 2.0 / 3.0;
 		var B = wgs84lat/180*pi;
 		var sinB = Math.sin(B), cosB = Math.cos(B);
 		var WSQ = 1 - ee * sinB * sinB;
 		var W = Math.sqrt(WSQ);
 		var N = a / W;
 
 		var dW_dlatwgs = -pi * ee * sinB * cosB / (180.0 * W);
 		var dN_dlatwgs = -a * dW_dlatwgs / WSQ;
 
 		var PIxNxCosB = pi * N * cosB;
 		var dlongcj_dlonwgs = 1.0 + 180.0 * dlon1_dlonwgs / PIxNxCosB;
 		var dlongcj_dlatwgs = 180 * dlon1_dlatwgs / PIxNxCosB -
 			180 * lon1 * pi * (dN_dlatwgs * cosB - pi * N * sinB / 180.0) / (PIxNxCosB * PIxNxCosB);
 
 		var PIxNxSubECCSQ = pi * N * (1 - ee);
 		var dlatgcj_dlonwgs = 180 * WSQ * dlat1_dlonwgs / PIxNxSubECCSQ;
 		var dlatgcj_dlatwgs = 1.0 + 180 * (N * (dlat1_dlatwgs * WSQ + 2.0 * lat1 * W * dW_dlatwgs) - lat1 * WSQ * dN_dlatwgs) /
 		(N * PIxNxSubECCSQ);
 		var gcj02 = this.transform(wgs84lon, wgs84lat);
 		var gcj02lonEst = gcj02.lon;
 		var gcj02latEst = gcj02.lat;
 		var l_lon = gcj02lon - gcj02lonEst;
 		var l_lat = gcj02lat - gcj02latEst;

 		var d_latwgs = (l_lon * dlatgcj_dlonwgs - l_lat * dlongcj_dlonwgs) /
 			(dlongcj_dlatwgs * dlatgcj_dlonwgs - dlatgcj_dlatwgs * dlongcj_dlonwgs);
 		var d_lonwgs = (l_lon - dlongcj_dlatwgs * d_latwgs) / dlongcj_dlonwgs;

 		if (Math.abs(d_latwgs) < 1.0e-9 && Math.abs(d_lonwgs) < 1.0e-9)
 			break;
 		wgs84lon = wgs84lon + d_lonwgs;
 		wgs84lat = wgs84lat + d_latwgs;
 	}
 	return {
 		lon:wgs84lon,
 		lat:wgs84lat
 	}
 },


	project: function (latlng) {
		var point = {lon:latlng.lng,lat:latlng.lat};
		if(L.ISWGS84){
			point = this.transform(latlng.lng,latlng.lat);
		}
		var d = Math.PI / 180,
		    max = this.MAX_LATITUDE,
		   // lat = Math.max(Math.min(max, latlng.lat), -max),
		    lat = Math.max(Math.min(max, point.lat), -max),
		    sin = Math.sin(lat * d);

		return new Point(
			// this.R * latlng.lng * d,
			this.R * point.lon * d,
			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
	},

	unproject: function (point) {
		var d = 180 / Math.PI;

		var lonlat = new LatLng(
			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
			point.x * d / this.R);
		if(L.ISWGS84){
			lonlat = this.gcj2wgs(lonlat.lng,lonlat.lat);
			return new LatLng(lonlat.lat,lonlat.lon);
		}else{
			return lonlat;
		}

		// return new LatLng(
		// 	(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
		// 	point.x * d / this.R);
	},

	bounds: (function () {
		var d = earthRadius * Math.PI;
		return new Bounds([-d, -d], [d, d]);
	})()
};
