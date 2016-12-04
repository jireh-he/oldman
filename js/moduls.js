var MedicalFacility=function(facilityrow){
		return {
			FacilityName:facilityrow[0],
			FacilityAddress:facilityrow[1],
			FacilityType:facilityrow[2],
			QualityClass:facilityrow[3],
			AdminArea:facilityrow[4],
			Affiliation:facilityrow[5],
			Beds:facilityrow[6],
			StaffNum:facilityrow[7],
			Floorspace:facilityrow[8],
			Latitude:(facilityrow[9])?facilityrow[9]:null,
			Longitude:(facilityrow[10])?facilityrow[10]:null,
		    GpsLat:null,
		    GpsLng:null
		}
}
var MedicalLevels=['top','AdminArea','FacilityType','QualityClass'];
var BusStation=function(poiResult){
	return {
		StationName:poiResult.title,
		Latitude:poiResult.point.lat,
		Longitude:poiResult.point.lng,
		BusLines:poiResult.address,
		Distance:0,
		Duration:0,
		Pathstr:'',
		GpsLat:null,
		GpsLng:null
	}
}
