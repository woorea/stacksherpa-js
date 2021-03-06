var storage = angular.module("storage",[]);
storage.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/object-store/:region/containers", {controller : "ContainerListCtrl", templateUrl : "app/storage/views/containers/list.html"})
		.when("/:tenant/object-store/:region/containers/:container", {controller : "ContainerShowCtrl", templateUrl : "app/storage/views/containers/show.html"})
		.when("/:tenant/object-store/:region", { redirectTo : function(routeParams, locationPath, locationSearch) {
			return locationPath + "/containers";
		}})
});
storage.controller("ContainerListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("object-store",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		
		OpenStack.ajax({
			method : "PUT",
			url : endpoint + "/" + $scope.name
		}).success(function(data, status, headers, config) {
			$scope.name = '';
			$scope.onRefresh(true);
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onDelete = function(container) {
		
		
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/" + container.name
		}).success(function(data, status, headers, config) {
			$scope.onRefresh();
		}).error(function(data, status, headers, config) {
			alert(status);
		});
		
	}
	
	$scope.onRefresh = function(sync) {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "?format=json",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.containers = data;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh(false);

});
storage.controller("ContainerShowCtrl",function($scope, $routeParams, $http, $location, OpenStack) {
	
	$scope.endpoint = OpenStack.endpoint("object-store",$routeParams.region, "publicURL");
	
	$scope.onDelete = function(object) {
		
		OpenStack.ajax({
			method : "DELETE",
			url : $scope.endpoint + "/" + $routeParams.container + "/" + object.name,
		}).success(function(data, status, headers, config) {
			$scope.onRefresh();
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	};
	
	$scope.onCreateDirectory = function() {
		
		var xuri = $scope.endpoint + "/" + $routeParams.container + "/"
		
		var qs = $location.search()
		
		if(qs.prefix) {
			
			xuri += qs.prefix + $scope.name;
			
		} else {
			xuri += $scope.name;
		}
		
		OpenStack.ajax({
			method : "PUT",
			url : xuri,
			data : "",
			processData: false,
			headers : {
				"Content-Type" : "application/directory"
			}
		}).success(function(data, status, headers, config) {
			$scope.onRefresh(true);
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
		
	};
	
	
	$scope.onUploadFile = function() {
		
		var xuri = $scope.endpoint + "/" + $routeParams.container + "/"
		
		var qs = $location.search()
		
		if(qs.prefix) {
			
			xuri += qs.prefix + $scope.file.name;
			
		} else {
			xuri += $scope.file.name;
		}
		
		OpenStack.ajax({
			method : "PUT",
			url : xuri,
			data : $scope.file,
			processData: false,
			headers : {
				"Content-Type" : $scope.file.type
			}
		}).success(function(data, status, headers, config) {
			$scope.onRefresh(true);
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	};
	
	$scope.onRefresh = function(sync) {
		
		var url = $scope.endpoint + "/" + $routeParams.container + "?format=json&delimiter=/";
		
		var qs = $location.search()
		
		if(qs.prefix) {
			url += "&prefix=" + qs.prefix;
			
			$scope.parent = qs.prefix.replace(/(.*\/)*(.*\/)+$/,"$1")
			
		}
		
		OpenStack.ajax({
			method : "GET",
			url : url,
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.objects = data.filter(function(o) {
				if(typeof o.hash != 'undefined') {
					if(qs.prefix) {
						o.display_name = o.name.replace(qs.prefix,"")
					} else {
						o.display_name = o.name
					}
					return true;
				} else {
					return false;
				}
			});
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh(false);
	
});

/*
TODO: Temp URLs

var method = 'GET'
var expires = (new Date).getTime() / 1000.0;
var path = '/v1/AUTH_account/container/object'
var hash = CryptoJS.HmacSHA1(method"\\n"+expires+"\\n"+path, 'mykey');
//.hexdigest()

*/