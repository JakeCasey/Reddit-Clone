var app = angular.module('news', ['ui.router']);



app.config([
			'$stateProvider',
			'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['posts', function(posts){
					return posts.getAll();
				}]
			}

		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts){

					return posts.get($stateParams.id);
				}]
			}
			
		});
	$urlRouterProvider.otherwise('home');

}]);

app.factory('posts', ['$http', function($http){
	var o = {
		posts: []
	};

	o.getAll = function(){
	return $http.get('/posts').success(function(data){
		angular.copy(data, o.posts);
	});
	};
	o.create = function(post){
		return $http.post('/posts', post).success(function(data) {
			o.posts.push(data);
		});
	};
	o.upvote = function(post){
	return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data){
			post.upvotes += 1
		});
		};
	o.downvote = function(post){
	return $http.put('/posts/' + post._id + '/downvote')
		.success(function(data){
			post.upvotes -= 1

		});
		};
	o.get = function(id){
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	};

	o.addComment = function(id, comment){
		return $http.post('/posts/'+ id + '/comments', comment);
	};

	o.upvoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data){
			comment.upvotes += 1;
		});
	};

	return o;
}]);

app.controller('PostsCtrl', [
	'$scope',
	'post',
	'posts',
	function($scope, post, posts){

		$scope.post = post;
		$scope.addComment = function(){
			if($scope.body === ''){return;}
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user',
			}).success(function(comment){
				$scope.post.comments.push(comment);
			});
			$scope.body= '';
		};

		$scope.incrementUpvotes = function(comment){
			posts.upvoteComment(post, comment);
		};
		
	}


	]);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	function($scope, posts){

		$scope.test = 'Hello World!';
		$scope.posts = posts.posts;

		$scope.addPost = function(){
			if(!$scope.title || $scope.title === '') { return;}
			//On click push posts to our posts object
			posts.create({
				title: $scope.title,
				content: $scope.content,
			});
			//after click clear text boxes for new posts.
			$scope.title = '';
			$scope.content = '';

		}
		$scope.incrementUpvotes = function (post) {
			posts.upvote(post);
		};
		$scope.decrementUpvotes = function (post) {
			posts.downvote(post);
		};
		
		
	}
]);