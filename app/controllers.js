
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
                    $window.location.href = 'index.html';
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

app.config(['$routeProvider','$locationProvider', ($routeProvider, $locationProvider) => {
    $routeProvider
        .when('/', {
            templateUrl: 'index.html',
            controller: 'signin'
        })
        .when('/register',{
            templateUrl: 'register.html',
            controller: 'register'
        })
		// .otherwise({		
        //         redirectTo: '/helloworld.html'
        // })
         $locationProvider.html5Mode(true); 
}]);