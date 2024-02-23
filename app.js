var app = angular.module('myApp', ['ngRoute']);

//Services
app.service('DataService', function($http) {
    this.getServices = function() {
        return $http.get('http://localhost:3000/api/service/list');
    };

    this.getEmployees = function() {
        return $http.get('http://localhost:3000/api/employe/list');
    };
});

//Controllers
app.controller('signin',function ($window,$scope,$http) {
    
    $scope.log=function(client){
        
        $http({
            method:"POST",
            url:'http://localhost:3000/api/auth/login',
            data:client,
            dataType:'application/json'
        }).then(
            function (res){
                console.log(res);
                if (res.status==200){
                    console.log(res);
                    $window.localStorage.setItem("token",res.data.token);
                    $window.location.href = '/';
                }
                else{
                    alert('Login incorrect   '+res.data.message);
                }
            },
            function (res){
                alert('Login incorrect   '+res.data.message);
            }
        );
    }
});  

app.controller('register',function ($window,$scope,$http) {
    
    $scope.reg=function(client){
        
        $http({
            method:"POST",
            url:'http://localhost:3000/api/auth/register',
            data:client,
            dataType:'application/json'
        }).then(
            function (res){
                console.log(res);
                if (res.status==200){
                    console.log(res);
                    $window.localStorage.setItem("token",res.data.token);
                    $window.location.href = 'login.html';
                }
                else{
                    alert('Inscription incorrect   '+res.data.message);
                }
            },
            function (res){
                alert('Incription incorrect   '+res.data.message);
            }
        );
    }
});  

app.controller('MainController', function($window,$scope,DataService,$http,$filter){
    $scope.selectedDateTime = new Date();
    $scope.selectedDateTime = $scope.selectedDateTime.toISOString();
    
    DataService.getServices().then(function(response) {
        $scope.services = response.data;
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des services : ', error);
    });

    // Récupérer les employés
    DataService.getEmployees().then(function(response) {
        $scope.employees = response.data;
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des employés : ', error);
    });

    $scope.saveData = function() {

            var selectedEmployees = $scope.employees.filter(function(employee) {
                return employee.selected;
            });
            var selectedServices = $scope.services.filter(function(service) {
                return service.selected;
            });

            var selectedDateTime = $filter('date')($scope.selectedDateTime, 'yyyy-MM-ddTHH:mm:ss.sssZ');;

            var verificationData = {
                employeeId: selectedEmployees.map(employee => employee._id),
                dateAppointment: selectedDateTime 
            };
          
            if (selectedDateTime instanceof Date && !isNaN(selectedDateTime)) {
                // Si c'est le cas, vous pouvez appeler getTime() en toute sécurité
                var originalDate = selectedDateTime;
                var utcDate = new Date(originalDate.getTime() - originalDate.getTimezoneOffset() * 60000);
                var formattedDate = utcDate.toISOString();
                console.log(formattedDate);
            } else {
                // Gérer le cas où selectedDateTime n'est pas une instance valide de Date
                console.error("selectedDateTime n'est pas une instance valide de Date :", selectedDateTime);
                // Afficher un message d'erreur à l'utilisateur ou gérer l'erreur de manière appropriée
            }
            // Appel à la fonction de vérification de disponibilité de l'employé
            // $http.post('http://localhost:3000/api/appointment/check-availability', verificationData)
            //     .then(function(response) {
            //         if (response.data.available) {
                        
            //             var requestData = {
            //                 datetimeStart: selectedDateTime,
            //                 services: selectedServices.map(service => service._id), 
            //                 employee: selectedEmployees.map(employee => employee._id) 
            //             };
        
            //             var token = $window.localStorage.getItem("token");
        
            //             var config = {
            //                 headers: {
            //                     'Authorization': 'Bearer ' + token
            //                 }
            //             };
        
            //             $http.post('http://localhost:3000/api/appointment/create', requestData, config)
            //                 .then(function(response) {
            //                     console.log("Données enregistrées avec succès :", response.data);
                                
            //                 })
            //                 .catch(function(error) {
            //                     console.error("Erreur lors de l'enregistrement des données :", error);
                                
            //                 });
            //         } else {
                       
            //             console.error("L'employé est occupé à ce moment.");
                        
            //         }
            //     })
            //     .catch(function(error) {
            //         console.error("Erreur lors de la vérification de la disponibilité de l'employé :", error);
            //     });
    };
          
});

app.controller('HomeController', function($scope) {
    console.log("HomeController reached!");
    // HomeController logic goes here
});

app.controller('AboutController', function($scope) {
    console.log("AboutController reached!");
    // AboutController logic goes here
});

//function
function checkToken($window, $location) {
    var token = $window.localStorage.getItem("token");
    if (!token) {
        $location.path('/login');
    }
}

//Route
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/dashboard.html',
            controller: 'MainController',
            resolve: {
                checkToken: checkToken
            }
        })
        .when('/register',{
            templateUrl: 'register.html',
            controller: 'register'
        })
        .when('/login',{
            templateUrl: 'login.html',
            controller: 'register'
        })
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'HomeController',
            resolve: {
                checkToken: checkToken
            }
        })
        .when('/about', {
            templateUrl: 'views/about.html',
            controller: 'AboutController',
            resolve: {
                checkToken: checkToken
            }
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.html5Mode(true);
}]);
