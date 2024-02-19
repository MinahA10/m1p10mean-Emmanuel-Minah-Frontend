var app = angular.module('myApp', ['ngRoute']);


app.controller('signin',function ($window,$scope,$http) {
    
    $scope.log=function(client){
        
        $http({
            method:"POST",
            url:'http://localhost:9000/auth/login',
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
            url:'http://localhost:9000/auth/register',
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

app.controller('MainController', function($window,$scope){
    $scope.token = $window.localStorage.getItem("token");
    if(!$scope.token){
        $window.location.href = 'login.html';
    }
});

app.controller('HomeController', function($scope) {
    console.log("HomeController reached!");
    // HomeController logic goes here
});

app.controller('AboutController', function($scope) {
    console.log("AboutController reached!");
    // AboutController logic goes here
});

function checkToken($window, $location) {
    console.log('wawa');
    var token = $window.localStorage.getItem("token");
    if (!token) {
        $location.path('/login');
    }
}

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
