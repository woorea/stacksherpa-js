var compute = angular.module("compute",[]);
compute.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/compute/:region/servers", {controller : "ServerListCtrl", templateUrl : "app/compute/views/servers/list.html"})
		.when("/:tenant/compute/:region/servers/:id", {controller : "ServerShowCtrl", templateUrl : "app/compute/views/servers/show.html"})
		.when("/:tenant/compute/:region/images", {controller : "ImageListCtrl", templateUrl : "app/compute/views/images/list.html"})
		.when("/:tenant/compute/:region/images/:id", {controller : "ImageShowCtrl", templateUrl : "app/compute/views/images/show.html"})
		.when("/:tenant/compute/:region/flavors", {controller : "FlavorListCtrl", templateUrl : "app/compute/views/flavors/list.html"})
		.when("/:tenant/compute/:region/flavors/:id", {controller : "FlavorShowCtrl", templateUrl : "app/compute/views/flavors/show.html"})
		.when("/:tenant/compute/:region/floating-ips", {controller : "FloatingIpListCtrl", templateUrl : "app/compute/views/floatingips/list.html"})
		.when("/:tenant/compute/:region/volumes", {controller : "VolumeListCtrl", templateUrl : "app/compute/views/volumes/list.html"})
		.when("/:tenant/compute/:region/volumes/:id", {controller : "VolumeShowCtrl", templateUrl : "app/compute/views/volumes/show.html"})
		.when("/:tenant/compute/:region/snapshots", {controller : "SnapshotListCtrl", templateUrl : "app/compute/views/snapshots/list.html"})
		.when("/:tenant/compute/:region/snapshots/:id", {controller : "SnapshotShowCtrl", templateUrl : "app/compute/views/snapshots/show.html"})
		.when("/:tenant/compute/:region/key-pairs", {controller : "KeyPairListCtrl", templateUrl : "app/compute/views/keypairs/list.html"})
		.when("/:tenant/compute/:region/security-groups", {controller : "SecurityGroupListCtrl", templateUrl : "app/compute/views/securitygroups/list.html"})
		.when("/:tenant/compute/:region/security-groups/:id", {controller : "SecurityGroupShowCtrl", templateUrl : "app/compute/views/securitygroups/edit.html"})
});
compute.controller("ServerListCtrl",function($scope, $routeParams, Servers, Images, Flavors) {
	
	$scope.onLaunch = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/launch.html'});
	}

	$scope.onDelete = function(server) {
		
		if(typeof server != 'undefined') {
			Servers.delete($regionParams.region, server.id, function() {
				$scope.onRefresh();
			});
		} else {
			angular.forEach($scope.volumes, function(server) {
				if(server.checked) {
					Servers.delete($regionParams.region, server.id, function() {
					});
				}
			});
		}
		
	}

	$scope.onRefresh = function() {

		Servers.list($routeParams.region, function(servers) {
			angular.forEach(servers, function(server) {
				Images.show($routeParams.region, server.image.id, server);
				Flavors.show($routeParams.region, server.flavor.id, server);
			});
			$scope.servers = servers;
		});

	}
	
	$scope.$on('servers.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("ServerShowCtrl",function($scope, $routeParams, $location, OpenStack, Servers, Images, Flavors) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onPause = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { pause : {} }, function(data) {
			$scope.server.status = 'PAUSED';
		});
		
	}
	
	$scope.onUnpause = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { unpause : {} }, function(data) {
			$scope.server.status = 'ACTIVE';
		});
		
	}
	
	$scope.onSuspend = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { suspend : {} }, function(data) {
			$scope.server.status = 'SUSPENDED';
		});
		
	}
	
	$scope.onResume = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { resume : {} }, function(data) {
			$scope.server.status = 'ACTIVE';
		});
		
	}
	
	$scope.onLock = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { lock : {} }, function(data) {
			$scope.server.status = 'ACTIVE';
		});
		
	}
	
	$scope.onUnlock = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { unlock : {} }, function(data) {
			$scope.server.status = 'ACTIVE';
		});
		
	}
	
	$scope.onResizeConfirm = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { confirmResize : {} }, function(data) { });
		
	}
	
	$scope.onResizeRevert = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { revertResize : {} }, function(data) { });
		
	}
	
	$scope.onDelete = function() {
		
		Servers.delete($routeParams.region, $routeParams.id, function(data) { });
		
	}

	$scope.onRefresh = function() {
		Servers.show($routeParams.region, $routeParams.id, function(server) {
			Images.show($routeParams.region, server.image.id, server);
			Flavors.show($routeParams.region, server.flavor.id, server);
			$scope.server = server;
		});
	}

	$scope.onRefresh();

});
compute.controller("ServerRebootCtrl", function($scope, $routeParams, Servers) {
	
	$scope.onReboot = function() {
		Servers.action($routeParams.region, $routeParams.id, {
			reboot : {
				type : $scope.type
			}
		}, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
	}
	
});

compute.controller("ServerShowVncConsoleCtrl", function($scope, $routeParams, Servers) {
	
	Servers.action($routeParams.region, $routeParams.id, {
		"os-getVNCConsole" : {
			type : "novnc"
		}
	}, function(data) {
		$scope.$root.$broadcast('modal.hide');
	});
	
});

compute.controller("ServerShowConsoleOutputCtrl", function($scope, $routeParams, Servers) {
	
	$scope.onRefresh = function() {
		
		Servers.action($routeParams.region, $routeParams.id, {
			"os-getConsoleOutput" : {
				length : 100
			}
		}, function(data) {
			$scope.output = data.output;
		});
		
	}
	
	$scope.onRefresh();
	
});

compute.controller("ServerResizeCtrl", function($scope, $routeParams, Servers) {
	
	$scope.resize = {
		flavorRef : "",
		diskConfig : ""
	}
	
	$scope.onResize = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { "resize" : $scope.resize }, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});

compute.controller("ServerRebuildCtrl", function($scope, $routeParams, Servers) {
	
	var server_id = $scope.server.id
	
	$scope.server = {
		imageRef : "",
		name : $scope.server.name,
		adminPass : "",
		//accessIPv4 : "",
		//accessIPv6 : "",
		metadata : $scope.server.metadata,
		personality : [],
		diskConfig : 'AUTO'
	}
	
	var $steps = $('.step')
	
	var $footer = $('.modal-footer')
	var $previous = $footer.find('.btn-previous')
	var $next = $footer.find('.btn-next')
	var $finish = $footer.find('.btn-finish')
	
	var ui = function() {
		$previous.prop("disabled", $scope.step == 0)
		$next.hide();
		$finish.hide();
		if($scope.step == $steps.length - 1) {
			$next.hide();
			$finish.show();
		} else {
			$next.show();
			$finish.hide();
		}
	}
	
	$scope.show = function(step) {
		if(step >= 0 && step < $steps.length) {
			$scope.step = step;
			$steps.hide().filter(":eq("+step+")").show();
			ui();
		}
	}
	
	$scope.onCancel = function() {
		$scope.$root.$broadcast('modal.hide');
	}
	
	$scope.onPrevious = function() {
		$scope.show($scope.step - 1)
	}
	
	$scope.onNext = function() {
		$scope.show($scope.step + 1)
	}
	
	$scope.totalSteps = $steps.length;
	
	$scope.show(0);
	
	$scope.onRebuild = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { "rebuild" : $scope.server }, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});

compute.controller("ServerChangePasswordCtrl", function($scope, $routeParams, Servers) {
	
	$scope.onChangePassword = function() {
		
		Servers.action($routeParams.region, $routeParams.id, {
			"changePassword" : {
				adminPass : $scope.adminPass
			}
		}, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});

compute.controller("ServerCreateImageCtrl", function($scope, $routeParams, Servers) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.image = {
		name : $scope.server.name + " (Image)",
		metadata : {}
	}
	
	$scope.onCreateImage = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { "createImage" : $scope.image }, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
	$scope.onAddMetadata = function() {
		$scope.backup.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.backup.metadata[key]
	}
	
});

compute.controller("ServerBackupCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.backup = {
		name : "",
		backup_type : "",
		rotation : "",
		metadata : {
			"k" : "v"
		}
	}
	
	$scope.onCreateBackup = function() {
		
		Servers.action($routeParams.region, $routeParams.id, { "createBackup" : $scope.backup }, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
	$scope.onAddMetadata = function() {
		$scope.backup.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.backup.metadata[key]
	}
	
});

compute.controller("ServerLaunchCtrl", function($scope, Servers) {
	
	$scope.server = {
		metadata : {},
		personality : [],
		securityGroups : [],
		min : 1,
		max : 1,
		diskConfig : 'AUTO'
	}
	
	var $steps = $('.step')
	
	var $footer = $('.modal-footer')
	var $previous = $footer.find('.btn-previous')
	var $next = $footer.find('.btn-next')
	var $finish = $footer.find('.btn-finish')
	
	var ui = function() {
		$previous.prop("disabled", $scope.step == 0)
		$next.hide();
		$finish.hide();
		if($scope.step == $steps.length - 1) {
			$next.hide();
			$finish.show();
		} else {
			$next.show();
			$finish.hide();
		}
	}
	
	$scope.show = function(step) {
		if(step >= 0 && step < $steps.length) {
			$scope.step = step;
			$steps.hide().filter(":eq("+step+")").show();
			ui();
		}
	}
	
	$scope.onCancel = function() {
		$scope.$root.$broadcast('modal.hide');
	}
	
	$scope.onPrevious = function() {
		$scope.show($scope.step - 1)
	}
	
	$scope.onNext = function() {
		$scope.show($scope.step + 1)
	}
	
	$scope.onFinish = function() {
		Servers.create($routeParams.region, $routeParams.id, $scope.server, function(data) {
			$scope.$root.$broadcast('servers.refresh');
			$scope.$root.$broadcast('modal.hide');
		});
	}
	
	$scope.totalSteps = $steps.length;
	
	$scope.show(0);
	
});
compute.controller("LaunchServerSelectImageCtrl",function($scope, $routeParams, Images) {

	Images.list("compute", $routeParams.region, $scope);
	
	$scope.onSelectImage = function(image) {
		$scope.server.imageRef = image.id;
		$scope.onNext()
	}
	
});
compute.controller("LaunchServerConfigurationCtrl",function($scope, $routeParams, Flavors) {

	$scope.flavors = []
	
	Flavors.list($routeParams.region, $scope);
	
});
compute.controller("LaunchServerMetadataCtrl",function($scope) {
	
	$scope.onAddMetadata = function() {
		$scope.server.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.server.metadata[key]
	}
	
});
compute.controller("LaunchServerPersonalityCtrl",function($scope) {
	
	$scope.onAddPersonality = function() {
		$scope.server.personality.push({"path" : $scope.path, "contents" : $scope.contents});
		$scope.path = $scope.contents = ''
	}
	
	$scope.onRemovePersonality = function(path) {
		$scope.server.personality = $scope.server.personality.filter(function(item) {
			return !(item.path == path);
		})
	}
	
});
compute.controller("LaunchServerSecurityCtrl",function($scope, $routeParams, KeyPairs, SecurityGroups) {
	
	$scope.keyPairs = []
	$scope.securityGroups = []
		
	KeyPairs.list($routeParams.region, function(keypairs) {
		$scope.keyPairs = keypairs;
	});
	SecurityGroups.list($routeParams.region, function(security_groups) {
		$scope.securityGroups = $.map(security_groups, function(securityGroup) {
			return {"name" : securityGroup.name}
		});
	});
		
});
compute.controller("LaunchServerSummaryCtrl",function($scope) {
	
});
compute.controller("ImageListCtrl",function($scope, $routeParams, OpenStack, Images) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");// + "/v1";

	$scope.onDelete = function(image) {
		
		if(typeof image != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/images/" + image.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.images, function(image) {
				if(fip.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/images/" + image.id
					}).success(function(data, status, headers, config) {
						//$scope.floating_ips = data.floating_ips;
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
		
	}

	$scope.onRefresh = function() {
		
		Images.list("compute", $routeParams.region, $scope);

	}
	
	$scope.$on('images.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	if(typeof OpenStack.compute.images != 'undefined') {
		$scope.images = OpenStack.compute.images
	} else {
		$scope.onRefresh();
	}
	
});
compute.controller("ImageShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");// + "/v1";

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/images" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.image = data.image;
	}).error(function(data, status, headers, config) {
	
	});
	
});

compute.controller("ImageCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("image", $routeParams.region, "publicURL");// + "/v1";
	
	$scope.image = {
		"X-Auth-Token" : OpenStack.access.token.id,
		"X-URI" : endpoint + "/images",
		"x-image-meta-name" : "",
		"x-image-meta-disk_format" : "raw",
		"x-image-meta-container_format" : "bare",
		"x-image-meta-min-ram" : 0,
		"x-image-meta-min-disk" : 0
	}
	
	$scope.onUpload = function() {
		
		$.ajax({
			crossDomain : true,
			type: "POST",
			url : OpenStack.proxy,
			headers : $scope.image,
	        data: $scope.file,
			dataType : "json",
	        processData: false,
	        contentType: "application/octet-stream",
	        success: function(data) {
				console.log(data);
	        },
	        error: function(data) {
	          console.log(data);
	        }
	      });
	}
	
});

compute.controller("FlavorListCtrl",function($scope, $routeParams, OpenStack, Flavors) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function(flavor) {
		
		if(typeof flavor != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/flavors/" + flavor.id
			}).success(function(data, status, headers, config) {
				//$scope.floating_ips = data.floating_ips;
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.flavors, function(flavor) {
				if(fip.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/flavors/" + flavor.id
					}).success(function(data, status, headers, config) {
						//$scope.floating_ips = data.floating_ips;
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	$scope.onRefresh = function() {
		
		Flavors.list($routeParams.region, $scope);
	}
	
	$scope.$on('flavors.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("FlavorShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/flavors/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.flavors = data.flavors;
	}).error(function(data, status, headers, config) {
	
	});
	
});
compute.controller("FlavorCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.flavor = {
		name : "flavor-12",
		ram : 1024,
		vcpus : 2,
		disk : 10,
		id : 12,
	}
	
	$scope.onCreate = function() {
		$scope.$root.$broadcast('modal.hide');
	}
	
});
compute.controller("FloatingIpListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onDisassociate = function(floatingIp) {
		
		if(floatingIp) {
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + floatingIp.instance_id + "/action",
				data : {
					removeFloatingIp : {
						address : floatingIp.ip
					}
				}
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.floating_ips, function(floatingIp) {
				OpenStack.ajax({
					method : "POST",
					url : endpoint + "/servers/" + floatingIp.instanceId + "/action",
					data : {
						removeFloatingIp : {
							address : floatingIp.address
						}
					}
				}).success(function(data, status, headers, config) {
					//$scope.onRefresh();
				}).error(function(data, status, headers, config) {

				});
			});
		}
	}

	$scope.onDeallocate = function(floatingIp) {
		
		if(floatingIp) {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-floating-ips/" + floatingIp.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.floating_ips, function(fip) {
				if(fip.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/os-floating-ips/" + fip.id
					}).success(function(data, status, headers, config) {
						//$scope.floating_ips = data.floating_ips;
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-floating-ips"
		}).success(function(data, status, headers, config) {
			$scope.floating_ips = data.floating_ips;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.$on('floating-ips.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("FloatingIpAllocateCtrl", function($scope, $routeParams, OpenStack) {
	
	
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/os-floating-ip-pools"
	}).success(function(data, status, headers, config) {
		$scope.pools = data.floating_ip_pools;
	}).error(function(data, status, headers, config) {

	});
	
	$scope.onAllocate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-floating-ips",
			data : {
				pool : $scope.pool
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('floating-ips.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

compute.controller("FloatingIpAssociateCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/servers/detail"
	}).success(function(data, status, headers, config) {
		$scope.servers = data.servers;
	}).error(function(data, status, headers, config) {

	});
	
	$scope.onAssociate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $scope.serverId + "/action",
			data : {
				addFloatingIp : {
					address : $scope.floating_ips[0].ip
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

compute.controller("VolumeListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onDelete = function(volume) {
		
		if(typeof volume != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-volumes/" + volume.id
			}).success(function(data, status, headers, config) {
				//$scope.floating_ips = data.floating_ips;
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.volumes, function(volume) {
				if(fip.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/os-volumes/" + volume.id
					}).success(function(data, status, headers, config) {
						//$scope.floating_ips = data.floating_ips;
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
		
	}
	
	$scope.onDetach = function(volume) {
		
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/servers/" + volume.attachments[0].serverId + "/os-volume_attachments/" + volume.id
		}).success(function(data, status, headers, config) {
			//$scope.floating_ips = data.floating_ips;
		}).error(function(data, status, headers, config) {

		});
		
	}

	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-volumes"
		}).success(function(data, status, headers, config) {
			$scope.volumes = data.volumes;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.$on('volumes.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();
	
});
compute.controller("VolumeShowCtrl",function($scope, $routeParams, OpenStack) {
	
});
compute.controller("VolumeCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	var snapshot_id;
	
	if(typeof $scope.snapshots != 'undefined') {
		snapshot_id = $scope.snapshots[0].id
	}
	
	$scope.volume = {
		snapshot_id : snapshot_id,
		"display_name": "vol-001",
		"display_description": "Another volume.",
		"size": 1
		//"volume_type": "289da7f8-6440-407c-9fb4-7db01ec49164",
		//"metadata": {"contents": "junk"},
		//"availability_zone": "us-east1"
	}
	
	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-volumes",
			data : { volume : $scope.volume }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
});
compute.controller("VolumeAttachCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.servers = OpenStack.compute.servers
	
	/*
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/servers/detail"
	}).success(function(data, status, headers, config) {
		$scope.servers = data.servers;
	}).error(function(data, status, headers, config) {

	});
	*/
	
	$scope.onAttach = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $scope.server_id + "/os-volume_attachments",
			data : {
				volumeAttachment : {
					volumeId : $scope.volumes[0].id,
					device : $scope.device
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
});
compute.controller("SnapshotListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function(snapshot) {
		
		if(typeof snapshot != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-snapshots/" + snapshot.id
			}).success(function(data, status, headers, config) {
				//$scope.floating_ips = data.floating_ips;
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.snapshots, function(snapshot) {
				if(fip.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/os-snapshots/" + snapshot.id
					}).success(function(data, status, headers, config) {
						//$scope.floating_ips = data.floating_ips;
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
		
	}

	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-snapshots"
		}).success(function(data, status, headers, config) {
			$scope.snapshots = data.snapshots;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.$on('snapshots.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

	
	
});
compute.controller("SnapshotShowCtrl",function($scope, $routeParams, OpenStack) {
});
compute.controller("SnapshotCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	var volume_id = ""
	if(typeof $scope.volumes != 'undefined') {
		volume_id = $scope.volumes[0].id
	}
	
	$scope.snapshot = {
		"volume_id": volume_id,
		"display_name": "snap-002",
		"display_description": "Daily backup",
		"force": true
	}
	
	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-snapshots",
			data : { snapshot : $scope.snapshot }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
});
compute.controller("KeyPairListCtrl",function($scope, $routeParams, OpenStack, KeyPairs) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function(keypair) {
		
		if(typeof keypair != 'undefined') {
			
			KeyPairs.delete($routeParams.region, keypair.name, function(data) {
				$scope.onRefresh();
			});
			
		} else {
			angular.forEach($scope.keypairs, function(keypair) {
				if(keypair.checked) {
					KeyPairs.delete($routeParams.region, keypair.name, function(data) {
						$scope.onRefresh();
					});
				}
			});
		}

	}

	$scope.onRefresh = function() {
		
		KeyPairs.list($routeParams.region, function(keypairs) {
			$scope.keyPairs = keypairs;
		});
		
	}
	
	$scope.$on('keypairs.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("KeyPairCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.import_keypair = {
		name: "testkeypair",
		"public key": "ssh-rsa  AAAB3NzaC1yc2EAAAADAQABAAAAgQDS75K9dCGNb8wUIqSRT8UZU1riwaMBXViZ6m7hvRi9adVJrNzUQVJEYotqGXpe4rwC7iCfwmVxWj/wu/h4OOoBqdkQcQMcuggMpNvnymhwUfj6vg+zEOpFcZg1mY3dvMoDnnUAClLB8/ELY1FtKTyTJyKJN7yyR4WkMN5H4BR/Lw== nova@az1-nv-schedule-0000"
	}
	
	$scope.create_keypair = {
		name: "testkeypair"
	}
	
	$scope.onImport = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-keypairs",
			data : {keypair : $scope.import_keypair}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onCreate = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-keypairs",
			data : {keypair : $scope.create_keypair}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});
compute.controller("SecurityGroupListCtrl",function($scope, $routeParams, OpenStack, SecurityGroups) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function(sg) {
		
		if(typeof sg != 'undefined') {
			
			SecurityGroups.delete($routeParams.region, sg.id, function(data) {
				$scope.onRefresh();
			});
			
		} else {
			angular.forEach($scope.security_groups, function(sg) {
				if(sg.checked) {
					SecurityGroups.delete($routeParams.region, sg.id, function(data) {
						$scope.onRefresh();
					});
				}
			});
		}
		
	}

	$scope.onRefresh = function() {
		
		SecurityGroups.list($routeParams.region, function(security_groups) {
			$scope.security_groups = security_groups;
		});
		
	}
	
	$scope.$on('security-groups.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("SecurityGroupShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	var resetAddRule = function() {
		$scope.rule = {
			"ip_protocol": "",
	        "from_port": "",
	        "to_port": "",
	        "cidr": "0.0.0.0/0",
	        "group_id": "",
	        "parent_group_id": $scope.security_group.id
		}
	}
	
	$scope.onAddRule = function(rule) {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-security-group-rules",
			data : { security_group_rule : $scope.rule }
		}).success(function(data, status, headers, config) {
			$scope.security_group.rules.push(data.security_group_rule);
			resetAddRule();
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRemoveRule = function(rule) {
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/os-security-group-rules/" + rule.id
		}).success(function(data, status, headers, config) {
			$scope.security_group.rules = $scope.security_group.rules.filter(function(sgr) {
				return sgr.id != rule.id;
			});
		}).error(function(data, status, headers, config) {

		});
	}
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/os-security-groups/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.security_group = data.security_group;
		resetAddRule();
	}).error(function(data, status, headers, config) {

	});
	
});
compute.controller("SecurityGroupCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.security_group = {
		name : "name",
		description : "description"
	}
	
	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-security-groups",
			data : { security_group : $scope.security_group }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('security-groups.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
});