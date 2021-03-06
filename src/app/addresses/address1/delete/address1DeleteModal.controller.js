class Address1DeleteModalController {
    constructor($uibModalInstance, address, $scope, address1Service, $state, toastr) {
        'ngInject';

        this.state = $state;
        this.service = address1Service;
        this.modalInstance = $uibModalInstance;
        this.toastr = toastr;
        this.scope = $scope;
        this.scope.address = angular.copy(address);
        this.confirmSwap = false;
        this.confirm = false;
        this.canDelete = false;
        this.limit = 5;

        this.address = angular.copy(address);

        this.getAddressRelatedItems();
        this.swapTooltip = 'Swapping with another Address 1 will associate all of the related items to the selected Address and delete the Address you have selected to delete.';
    }

    showMore(item) {
        item.limit += 10;
    }

    getAddressRelatedItems() {
        this.service.getRelatedItems(this.scope.address).then((promise) => {
            this.related_items = promise.data.related_items;
            this.updateCanDelete();
        });
    }

    updateCanDelete() {
        var count = 0;
        this.related_items.forEach((riCategory) => {
            riCategory.objects.forEach(() => {
                count += 1;
            });
        });
        this.canDelete = count === 0;
    }

    getHrefForIdAndType(obj, type) {
        let url;
        switch (type) {
            case "address2":
                url = this.state.href('address2', {deleteId: obj.id});
                break;
            case "victiminterview":
            case "victiminterviewlocationbox":
                url = this.state.href('vifList', {search: obj.name});
                break;
        }
        return url;
    }

    getPrettyTypeName(item) {
        let name = "";
        switch (item.type) {
            case "address2":
                name = "Address 2";
                break;
            case "person":
                name = "Person";
                break;
            case "victiminterview":
                name = "VIF";
                break;
            case "victiminterviewlocationbox":
                name = "Victim Interview Location Box";
        }
        return name;
    }

    cancel() {
        this.state.go('address1', {deleteId: null}, {notify: false});
        this.modalInstance.dismiss('close');
    }

    delete() {
        this.service.deleteAddress(this.address.id).then(() => {
            this.toastr.success("Address successfully deleted!");
            this.modalInstance.dismiss('close');
            this.state.go('address1', {deleteId: null});
        },
        () => {
            this.toastr.error("Address failed to be deleted!");
        });
    }

    swapAndDelete() {
        this.service.swapAddresses(this.address.id, this.addressToSwapWith.id).then(() => {
            this.modalInstance.dismiss('close');
            this.state.go('address1', {deleteId: null});
            this.toastr.success("Addresses successfully swapped and deleted!");
        },
        () => {
            this.toastr.error("Address swapping failed!");
        });
    }
}
export default Address1DeleteModalController;
