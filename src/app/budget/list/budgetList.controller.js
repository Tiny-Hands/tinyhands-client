export default class BudgetList {
  constructor($uibModal, BudgetListService, session, $scope) {
    'ngInject';

    this.$scope = $scope;
    this.$uibModal = $uibModal;
    this.service = BudgetListService;
    this.session = session;

    $scope.sortType = form.date_time_last_updated;
    $scope.sortReverse = false;
    $scope.searchForms = '';

    this.getBudgetList();
  }

  getBudgetList() {
    this.service.getBudgetList().then((response) => {
      this.listOfBudgets = response.data.results;
    });
  }

  removeBudget(array, budget) {
    if (budget.budgetRemoved) {
      this.service.deleteBorderStationBudget(budget.id).then((response) => {
        if (response.status === 204 || response.status === 200) {
          window.toastr.success("Form Successfully Deleted");
          var index = this.listOfBudgets.indexOf(budget);
          this.listOfBudgets.splice(index, 1);
        } else {
          window.toastr.error("Unable to Delete Budget Form");
        }
      });
    } else {
      budget.budgetRemoved = true;
    }
  }

}