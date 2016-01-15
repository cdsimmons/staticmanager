app.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
  $scope.ok = function () {
    //modalInstance.close($scope.selected.item);
    modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});