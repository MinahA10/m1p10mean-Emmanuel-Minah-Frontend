var app = angular.module('myApp', ['ngRoute']);

//Services
app.service('DataService', function($window,$http) {
    var token = $window.localStorage.getItem("token");
    var config = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };
    this.getServices = function() {
        return $http.get('http://localhost:3000/api/service/list');
    };

    this.getEmployees = function() {
        return $http.get('http://localhost:3000/api/employe/list');
    };

    this.getHistoriques =  function() {
        return $http.get('http://localhost:3000/api/appointment/find',config);
    }
});

app.service('AuthService', function($window) {
    this.isAuthenticated = function() {
        var token = $window.localStorage.getItem("token");
        return token !== null; 
    };
});

app.run(function($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        
        if (next && next.requireAuth && !AuthService.isAuthenticated()) {
            $location.path('/login'); 
        }
    });
});


//Controllers
app.controller('MainController', ['$scope', 'AuthService', function($scope, AuthService) {
    $scope.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };
}]);

app.controller('AccueilController',function($window,$scope,$http,$location,DataService){

    DataService.getServices().then(function(response) {
        $scope.services = response.data;
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des services : ', error);
    });

    DataService.getEmployees().then(function(response) {
        $scope.employees = response.data;
       
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des employés : ', error);
    });

    $scope.allerALogin = function() {
        $window.location.href = '/login'; 
    };

});

app.controller('loginController',function ($window,$scope,$http) {
    
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
                    $window.location.href = '/homepage';
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

app.controller('registerController',function ($window,$scope,$http) {
    
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

app.controller('HomeController', function($window,$scope,DataService,$http){
    
    $scope.selectedDateTime = new Date().toISOString();
    
    DataService.getServices().then(function(response) {
        $scope.services = response.data;
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des services : ', error);
    });

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

            const selectedDateTime = $scope.selectedDateTime;
           
            let formattedDate ='';
            
            if (selectedDateTime instanceof Date && !isNaN(selectedDateTime.getTime())) {
                const originalDate = selectedDateTime;
                const utcDate = new Date(originalDate.getTime() - originalDate.getTimezoneOffset() * 60000);
                formattedDate = utcDate.toISOString();
            } else {
                console.error("selectedDateTime n'est pas une instance valide de Date :", selectedDateTime);
                return; 
            }
            
            var verificationData = {
                employeeId: selectedEmployees.map(employee => employee._id),
                dateAppointment: formattedDate 
            };

        
            $http.post('http://localhost:3000/api/appointment/check-availability', verificationData).then(function(response) {
                    console.log(response);
                if (response.data.available) {

                        var requestData = {
                            datetimeStart: formattedDate,
                            services: selectedServices, 
                            employee: selectedEmployees
                        };
        
                        var token = $window.localStorage.getItem("token");
        
                        var config = {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            }
                        };
        
                        $http.post('http://localhost:3000/api/appointment/create', requestData, config)
                            .then(function(response) {

                                $scope.succesMessage = "Rendez vous enregistrer avec succès";
                                
                                console.log("Données enregistrées avec succès :", response.data);
                                
                            })
                            .catch(function(error) {
                                console.error("Erreur lors de l'enregistrement des données :", error);
                                
                            });
                } else {
                    $scope.errorMessage = "L'employé est occupé à ce moment.";   
                    console.error("L'employé est occupé à ce moment.");
                    
                }
            })
            .catch(function(error) {
                $scope.errorMessage = "L'employé est occupé à ce moment.";
                console.error("Erreur lors de la vérification de la disponibilité de l'employé :", error);
            });     
    };
          
});


app.controller('HistoriqueController', function($scope,DataService) {
    
    $scope.selectedDate = '';
    $scope.itemsPerPage = 2; 
    $scope.currentPage = 1; 
    $scope.historiques = [];

    DataService.getHistoriques().then(function(response) {
        if (response && response.data && response.data.length) {
            
            $scope.historiques = response.data.sort(function(a, b) {
                return new Date(b.datetimeStart) - new Date(a.datetimeStart);
            });
        }
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des historiques : ', error);
    });
    //Pagination

    $scope.openModal = function(historique) {
        $scope.selectedHistorique = historique;
        $('#modalCenter').modal('show');
    };

    $scope.isStartDateTodayOrTomorrow = function(startDate) {
        var currentDate = new Date();
        var startDateObj = new Date(startDate);
        var tomorrowDate = new Date(currentDate);
        tomorrowDate.setDate(currentDate.getDate() + 1); 
        return startDateObj.toDateString() === currentDate.toDateString() || startDateObj.toDateString() === tomorrowDate.toDateString();
    };

    $scope.isDateTimePassed = function(dateTime) {
        var currentDateTime = new Date();
        var targetDateTime = new Date(dateTime);
        return targetDateTime < currentDateTime;
    };

    $scope.getCardClasses = function(dateTime) {
        var classes = [];
        if ($scope.isDateTimePassed(dateTime)) {
            classes.push('bg-secondary'); 
        } else if ($scope.isStartDateTodayOrTomorrow(dateTime)) {
            classes.push('bg-warning'); 
        } else {
            classes.push(''); 
        }
        return classes;
    };

    $scope.dateFilter = function(historique) {
       
        if (!$scope.selectedDate) {
            return true; 
        }
        
        var selectedDate = new Date($scope.selectedDate);
       
        var historiqueDate = new Date(historique.datetimeStart);
        
        return selectedDate.toDateString() === historiqueDate.toDateString();
    };
});


app.controller('ServicesController', function($scope,$window,DataService) {
    DataService.getServices().then(function(response) {
        $scope.services = response.data;
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des services : ', error);
    });

    $scope.selectedService = {}; 

    $scope.openModal = function(service) {
   
    $scope.selectedService = service;
    
    $('#modalCenter').modal('show');
    };
});

//function

//Route
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        // .when('/', {
        //     templateUrl: 'accueil.html',
        //     controller: 'AccueilController',
        //     requireAuth: false // Route accessible aux utilisateurs non connectés
        // })
        // .when('/register', {
        //     templateUrl: 'register.html',
        //     controller: 'registerController'
        // })
        // .when('/login', {
        //     templateUrl: 'login.html',
        //     controller: 'loginController'
        // })
        .when('/', {
            templateUrl: 'dashboard.html', // Assurez-vous que cette route pointe vers la bonne page
            controller: 'HomeController',
            requireAuth: true // Route accessible uniquement aux utilisateurs connectés
        })
        .when('/services', {
            templateUrl: 'views/services.html',
            controller: 'ServicesController'         
        })     
        .when('/historiques', {
            templateUrl: 'views/historique.html',
            controller: 'HistoriqueController'
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.html5Mode(true);
}]);
